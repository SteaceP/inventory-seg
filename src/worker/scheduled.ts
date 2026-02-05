import postgres from "postgres"; // Using Hyperdrive connection
import webpush from "web-push";

import { reportError } from "./errorReporting";

import type { Env, PushSubscriptionRow } from "./types";

interface PostgresChanges extends Record<string, unknown> {
  stock?: unknown;
  old_stock?: unknown;
}

interface ActivityRow {
  inventory_id: string;
  item_name: string;
  category: string;
  created_at: string;
  changes: string | PostgresChanges;
  action: string;
}

interface InventoryItemRow {
  id: string;
  name: string;
  category: string;
  stock: number;
  low_stock_threshold: number | null;
  category_threshold: number | null;
}

interface HistoryEvent {
  date: string;
  name: string;
  stock_left_before: number;
  qty_ordered: number;
}

interface SupplierData {
  current: InventoryItemRow[];
  history: HistoryEvent[];
}

export function handleScheduled(
  _event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
): void {
  ctx.waitUntil(processScheduledTask(env));
}

// ... (skipping context match for brevity if possible, keeping it simpler)

async function processScheduledTask(env: Env) {
  let sql: ReturnType<typeof postgres> | undefined;

  try {
    if (!env.HYPERDRIVE) {
      reportError(new Error("Hyperdrive not configured"));
      return;
    }

    sql = postgres(env.HYPERDRIVE.connectionString);

    // 1. Fetch History of "Stock Added" (stock increase) - Last 6 months
    // We look for 'updated' actions where stock increased, OR 'created' actions
    // And we need to join with inventory to get the category (if not in activity item_name snapshot)
    // Actually activity snapshot has item_name. But we need category for the rules.
    // The activity table doesn't have category. We must join or query inventory.
    // Since inventory items might be deleted, a LEFT JOIN is safer, but we only care about active items for reorder.

    // Complex query: Get all stock increases in last 6 months
    const history = await sql<ActivityRow[]>`
      SELECT 
        a.inventory_id,
        a.item_name,
        COALESCE(i.category, '') as category,
        a.created_at,
        a.changes,
        a.action
      FROM inventory_activity a
      LEFT JOIN inventory i ON a.inventory_id = i.id
      WHERE a.created_at > NOW() - INTERVAL '6 months'
      AND (
        a.action = 'updated' AND (a.changes->>'stock')::int > (a.changes->>'old_stock')::int
      )
      ORDER BY a.created_at ASC
    `;

    // 2. Fetch Current Low Stock Items
    // We check against item threshold or category threshold or global threshold (complex logic).
    // For simplicity efficiently in SQL:
    // We'll fetch ALL items and filter in JS, or write a smart query.
    // Let's fetch all items to be safe and use same logic as app.
    const allItems = await sql<InventoryItemRow[]>`
      SELECT 
        i.id, 
        i.name, 
        COALESCE(i.category, '') as category, 
        i.stock, 
        i.low_stock_threshold,
        c.low_stock_threshold as category_threshold
      FROM inventory i
      LEFT JOIN inventory_categories c ON i.category = c.name
    `;

    // We also need global threshold. It's user specific...
    // But this is a background job. We should probably pick a "default" admin user or just rely on item/category.
    // Let's pick the "admin" user settings or a fallback.
    // Simplifying: Use 10 as fallback if no thresholds set.
    const GLOBAL_THRESHOLD = 5;

    // Filter for low stock
    const lowStockItems = allItems.filter((item) => {
      const itemThresh = item.low_stock_threshold;
      const catThresh = item.category_threshold;
      const effective = itemThresh ?? catThresh ?? GLOBAL_THRESHOLD;
      return (item.stock || 0) <= effective;
    });

    if (lowStockItems.length === 0) return;

    // 3. Group by Supplier
    const grouped = groupItemsBySupplier(lowStockItems, history);

    // 4. AI Analysis & Notification
    for (const [supplier, data] of Object.entries(grouped)) {
      await analyzeAndNotify(supplier, data, env, sql);
    }
  } catch (err) {
    reportError(err);
  } finally {
    if (sql) await sql.end();
  }
}

function groupItemsBySupplier(
  currentItems: InventoryItemRow[],
  history: ActivityRow[]
) {
  const suppliers: Record<string, SupplierData> = {
    Amazon: { current: [], history: [] },
    BOD: { current: [], history: [] },
    Staples: { current: [], history: [] },
    CIUSS: { current: [], history: [] },
  };

  const getSupplier = (name: string, category: string) => {
    if (category === "Entretien" && name.startsWith("#")) return "BOD";
    if (category === "Papeterie") return "Staples";
    if (category === "Infirmerie") return "CIUSS";
    return "Amazon";
  };

  for (const item of currentItems) {
    // Handle postgres.js Row object properties
    const name = item.name || "";
    const cat = item.category || "";
    const sup = getSupplier(name, cat);
    if (suppliers[sup]) suppliers[sup].current.push(item);
  }

  for (const event of history) {
    const name = event.item_name || "";
    const cat = event.category || "";
    const sup = getSupplier(name, cat);

    // Parse changes to get quantities
    const changes = event.changes; // Postgres returns JSONB as object automatically usually?
    // If it's string, parse it.
    const data = (
      typeof changes === "string" ? JSON.parse(changes) : changes
    ) as PostgresChanges;

    const oldStock = Number(data.old_stock ?? 0);
    const newStock = Number(data.stock ?? 0);
    const qty = newStock - oldStock;

    if (suppliers[sup]) {
      suppliers[sup].history.push({
        date: event.created_at,
        name: name,
        stock_left_before: oldStock,
        qty_ordered: qty,
      });
    }
  }

  return suppliers;
}

async function analyzeAndNotify(
  supplier: string,
  data: SupplierData,
  env: Env,
  sql: ReturnType<typeof postgres>
) {
  if (data.current.length === 0) return;

  // Amazon: Order anytime.
  if (supplier === "Amazon") {
    // Just notify once for the batch
    await sendNotification(
      supplier,
      env,
      sql,
      `Amazon items (${data.current.length}) can be ordered anytime.`
    );
    return;
  }

  // Restricted: AI Check
  // We verify if the 'current proposed order' matches historical patterns
  const prompt = `
    Supplier: ${supplier}
    Goal: Determine if we should place a bulk order now based on historical rules.
    
    History of RESTOCKS (When we actually received orders):
    ${JSON.stringify(data.history.slice(-20))} 
    
    Current Low Stock Items (Proposed Order):
    ${JSON.stringify(data.current.map((i) => ({ name: i.name, stock: i.stock })))}
    
    Task: 
    1. Analyze the history. How many items do we usually order at once from ${supplier}? What is the total volume?
    2. Look at the Proposed Order. Does it meet that "minimum viable order" threshold implied by history?
    3. IMPORTANT: Look at "stock_left_before" in history. Do we usually wait until we are this low?
    
    Return JSON: { "should_order": boolean, "reason": "string (short explanation for user)" }
    `;

  try {
    const response = await env.AI_SERVICE.run("@cf/meta/llama-3-8b-instruct", {
      messages: [{ role: "user", content: prompt }],
    });

    const aiResponse = response as { response: string };
    const jsonMatch = aiResponse.response?.match(/\{[\s\S]*\}/); // grab json
    const jsonStr = jsonMatch ? jsonMatch[0] : "{}";

    let result = { should_order: false, reason: "" };
    try {
      result = JSON.parse(jsonStr) as {
        should_order: boolean;
        reason: string;
      };
    } catch {
      reportError(new Error("AI Parse Fail"), {
        response: aiResponse.response,
      });
    }

    if (result.should_order) {
      await sendNotification(supplier, env, sql, result.reason);
    }
  } catch (e) {
    reportError(e, { context: "AI Analysis" });
  }
}

async function sendNotification(
  supplier: string,
  env: Env,
  sql: ReturnType<typeof postgres>,
  reason?: string
) {
  // We need to fetch ALL users or just Admin users?
  // Let's notify all users with 'notifications' enabled or just the first admin found.
  // For simplicity, let's notify the user ID from the 'user_settings' if available, otherwise broadcast.
  // Logic: Fetch all push subscriptions.

  try {
    const subs = await sql<PushSubscriptionRow[]>`
        SELECT * FROM push_subscriptions
    `;

    if (subs.length === 0) return;
    if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return;

    const options = {
      vapidDetails: {
        subject: "mailto:admin@coderage.pro",
        publicKey: env.VAPID_PUBLIC_KEY,
        privateKey: env.VAPID_PRIVATE_KEY,
      },
    };

    const title = `Reorder Needed: ${supplier}`;
    const body = reason || `Items from ${supplier} are low and ready to order.`;

    // Payload
    const payload = JSON.stringify({
      title,
      body,
      icon: "/icons/icon.svg",
      data: { url: "/inventory" },
      tag: `reorder-${supplier}-${Date.now()}`,
    });

    await Promise.allSettled(
      subs.map((sub) =>
        webpush
          .sendNotification(sub.subscription, payload, options)
          .catch((err: unknown) => {
            const status = (err as { statusCode?: number }).statusCode;
            if (status === 410 || status === 404) {
              // cleanup
              void sql`DELETE FROM push_subscriptions WHERE id = ${sub.id}`.catch(
                (e: unknown) => reportError(e)
              );
            }
          })
      )
    );

    // Also Send Email? (Optional, skipping for brevity unless requested, consistent with existing low stock alert)
  } catch (err) {
    reportError(err, { context: "Notification failed" });
  }
}
