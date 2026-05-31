import { postgresPool } from "../db/postgres.js";
import type { ActionItemListQuery, ActionItemStatus } from "../validation/action-item-schemas.js";

export async function listActionItems(query: ActionItemListQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  for (const key of ["status", "priority", "type", "lead_id"] as const) {
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

export async function findActionItemById(id: string) {
  const result = await postgresPool.query("select * from action_items where id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function updateActionItemStatus(
  id: string,
  status: ActionItemStatus,
  options: { markCompleted: boolean }
) {
  const result = await postgresPool.query(
    `update action_items
      set status = $2,
          completed_at = case
            when $3 then coalesce(completed_at, now())
            else null
          end,
          updated_at = now()
      where id = $1
      returning *`,
    [id, status, options.markCompleted]
  );

  return result.rows[0] ?? null;
}

export async function closeOpenActionItemsByLeadAndTypes(
  leadId: string,
  types: readonly string[],
  openStatuses: readonly ActionItemStatus[]
) {
  const result = await postgresPool.query(
    `update action_items
      set status = 'concluido',
          completed_at = coalesce(completed_at, now()),
          updated_at = now()
      where lead_id = $1
        and type = any($2::text[])
        and status = any($3::action_item_status[])
      returning *`,
    [leadId, types, openStatuses]
  );

  return result.rows;
}
