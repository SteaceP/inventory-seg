import { verifyAuth } from "../auth";
import { createResponse } from "../helpers";

import type { Env } from "../types";

/**
 * Handle activity log POST - creates a new activity entry
 */
export async function handleActivityLogPost(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const body: {
      inventory_id: string;
      user_id: string;
      action: string;
      item_name: string;
      changes: unknown;
    } = await request.json();

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO inventory_activity (id, inventory_id, user_id, action, item_name, changes)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        body.inventory_id,
        body.user_id,
        body.action,
        body.item_name,
        JSON.stringify(body.changes)
      )
      .run();

    return createResponse({ success: true, id }, 201, env, request);
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}

/**
 * Handle activity log GET - retrieves filtered activity entries
 */
export async function handleActivityLogGet(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    if (!(await verifyAuth(request, env))) {
      return createResponse({ error: "Unauthorized" }, 401, env, request);
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "0");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const actionFilter = url.searchParams.get("actionFilter") || "all";
    const searchTerm = url.searchParams.get("searchTerm") || "";
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const location = url.searchParams.get("location");
    const actionType = url.searchParams.get("actionType");

    let query = `SELECT * FROM inventory_activity WHERE 1=1`;
    const params: unknown[] = [];

    if (actionFilter !== "all" && actionFilter !== "stock") {
      query += ` AND action = ?`;
      params.push(actionFilter);
    } else if (actionFilter === "stock") {
      query += ` AND json_extract(changes, '$.action_type') IS NOT NULL`;
    }

    if (searchTerm) {
      query += ` AND (item_name LIKE ? OR user_id LIKE ?)`;
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (startDate) {
      query += ` AND created_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND created_at < ?`;
      params.push(endDate);
    }

    if (location && location !== "all") {
      query += ` AND json_extract(changes, '$.destination_location') = ?`;
      params.push(location);
    }

    if (actionType) {
      query += ` AND json_extract(changes, '$.action_type') = ?`;
      params.push(actionType);
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, page * pageSize);

    const { results } = await env.DB.prepare(query)
      .bind(...params)
      .all();

    // Parse JSON changes
    const formattedResults = results.map((r) => ({
      ...r,
      changes: JSON.parse(r.changes as string) as Record<string, unknown>,
    }));

    return createResponse(formattedResults, 200, env, request);
  } catch (err) {
    return createResponse({ error: (err as Error).message }, 500, env, request);
  }
}
