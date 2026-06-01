import { postgresPool } from "../db/postgres.js";
import type { ActionItemStatus } from "../validation/action-item-schemas.js";

export type LeadForActionItemGeneration = {
  id: string;
  contact_id: string | null;
  status: string;
  next_action_at: Date | string | null;
  last_interaction_at: Date | string | null;
  first_message_at: Date | string | null;
  created_at: Date | string;
  assigned_to: string | null;
};

type CreateActionItemInput = {
  type: string;
  priority: number;
  contact_id: string | null;
  lead_id: string;
  title: string;
  reason: string;
  recommended_action: string;
  due_at: Date | string;
  assigned_to: string | null;
};

const leadColumns = `
  id, contact_id, status, next_action_at, last_interaction_at, first_message_at, created_at, assigned_to
`;

export async function listLeadsByStatus(status: string): Promise<LeadForActionItemGeneration[]> {
  const result = await postgresPool.query<LeadForActionItemGeneration>(
    `select ${leadColumns}
      from leads
      where status = $1
        and coalesce(source, '') <> 'spreadsheet_import'`,
    [status]
  );
  return result.rows;
}

export async function listLeadsByStatuses(
  statuses: readonly string[]
): Promise<LeadForActionItemGeneration[]> {
  const result = await postgresPool.query<LeadForActionItemGeneration>(
    `select ${leadColumns}
      from leads
      where status = any($1::lead_status[])
        and coalesce(source, '') <> 'spreadsheet_import'`,
    [statuses]
  );
  return result.rows;
}

export async function createActionItemIfNotOpen(
  input: CreateActionItemInput,
  openStatuses: readonly ActionItemStatus[]
) {
  const result = await postgresPool.query(
    `insert into action_items (
      type, priority, contact_id, lead_id, title, reason, recommended_action, due_at, status, assigned_to
    )
    select $1, $2, $3, $4, $5, $6, $7, $8, 'pendente', $9
    where not exists (
      select 1 from action_items
      where lead_id = $4 and type = $1 and status = any($10::action_item_status[])
    )
    returning *`,
    [
      input.type,
      input.priority,
      input.contact_id,
      input.lead_id,
      input.title,
      input.reason,
      input.recommended_action,
      input.due_at,
      input.assigned_to,
      openStatuses
    ]
  );

  return result.rows[0] ?? null;
}
