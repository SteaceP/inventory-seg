import { verifyAuth } from "../auth";
import { createResponse } from "../helpers";

import type { Env } from "../types";

/**
 * Handle dashboard stats - calculates today's stock in/out
 */
export async function handleDashboardStats(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();

    const { results } = await env.DB.prepare(
      `SELECT action, changes FROM inventory_activity WHERE created_at >= ?`
    )
      .bind(startDate)
      .all();

    let stockIn = 0;
    let stockOut = 0;

    const getNumber = (obj: Record<string, unknown>, key: string) => {
      const val = obj[key];
      return typeof val === "number" ? val : 0;
    };

    results.forEach((row) => {
      const action = row.action as string;
      const changes = JSON.parse(row.changes as string) as Record<
        string,
        unknown
      >;

      if (action === "created") {
        stockIn += getNumber(changes, "stock");
      } else if (action === "deleted") {
        stockOut += getNumber(changes, "stock");
      } else if (action === "updated") {
        const diff =
          getNumber(changes, "stock") - getNumber(changes, "old_stock");
        if (diff > 0) stockIn += diff;
        else if (diff < 0) stockOut += Math.abs(diff);
      }
    });

    return createResponse({ in: stockIn, out: stockOut }, 200, env, request);
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}

/**
 * Handle report stats - aggregates stock removal by item
 */
export async function handleReportStats(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const location = url.searchParams.get("location");

    if (!startDate || !endDate) {
      return createResponse(
        { error: "Missing startDate or endDate" },
        400,
        env,
        request
      );
    }

    let query = `SELECT item_name, changes FROM inventory_activity 
                 WHERE created_at >= ? AND created_at < ? 
                 AND json_extract(changes, '$.action_type') = 'remove'`;
    const params: unknown[] = [startDate, endDate];

    if (location && location !== "all") {
      query += ` AND json_extract(changes, '$.destination_location') = ?`;
      params.push(location);
    }

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    const aggregation: Record<string, number> = {};

    results.forEach((row) => {
      const changes = JSON.parse(row.changes as string) as {
        old_stock?: unknown;
        stock?: unknown;
      };
      const oldStock = Number(changes.old_stock) || 0;
      const newStock = Number(changes.stock) || 0;
      const count = Math.abs(newStock - oldStock);

      const itemName = (row.item_name as string) || "Unknown Item";
      aggregation[itemName] = (aggregation[itemName] || 0) + count;
    });

    const result = Object.entries(aggregation)
      .map(([itemName, total]) => ({ itemName, total }))
      .sort((a, b) => b.total - a.total);

    return createResponse(result, 200, env, request);
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}
