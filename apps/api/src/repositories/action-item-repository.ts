import { postgresPool } from "../db/postgres.js";
import type { ActionItemListQuery } from "../validation/action-item-schemas.js";

export async function listActionItems(query: ActionItemListQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  for (const key of ["status", "type"] as const) {
    if (query[key]) {
      values.push(query[key]);
      conditions.push(`${key} = $${values.length}`);
    }
  }

  values.push(query.limit, query.offset);
  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
  const result = await postgresPool.query(
    `select * from action_items ${where} order by priority desc, due_at asc nulls last, created_at desc limit $${values.length - 1} offset $${values.length}`,
    values
  );

  return result.rows;
}
