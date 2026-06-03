import type { PoolClient } from "pg";

import { postgresPool } from "../db/postgres.js";
import type { ActionItemStatus } from "../validation/action-item-schemas.js";
import type { LeadContactChannel, LeadContactOutcome } from "../validation/lead-operational-schemas.js";

export type LeadOperationalLeadRow = {
  id: string;
  contact_id: string;
  status: string;
  source: string | null;
  campaign: string | null;
  assigned_to: string | null;
  first_message_at: Date | string | null;
  next_action_at: Date | string | null;
  last_interaction_at: Date | string | null;
  attempts_count: number;
  pet_name: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type LeadOperationalContactRow = {
  id: string;
  name: string | null;
  phone: string | null;
  normalized_phone: string | null;
  source: string | null;
  notes: string | null;
};

export type LeadOperationalActionItemRow = {
  id: string;
  type: string;
  status: string;
  title: string;
  priority: number;
  lead_id: string | null;
  contact_id: string | null;
  due_at: Date | string | null;
  reason: string | null;
  created_at: Date | string;
  completed_at: Date | string | null;
};

export type LeadOperationalInteractionRow = {
  id: string;
  lead_id: string | null;
  contact_id: string | null;
  interaction_type: string;
  channel: string | null;
  responsible: string | null;
  result: string | null;
  notes: string | null;
  next_action_at: Date | string | null;
  created_at: Date | string;
};

export type CreateLeadInteractionInput = {
  leadId: string;
  contactId: string;
  channel: LeadContactChannel;
  attendant: string | null;
  outcome: LeadContactOutcome;
  notes: string;
  nextActionAtIso: string | null;
};

export type LeadLifecycleUpdateInput = {
  status?: string;
  attemptsCount?: number;
  nextActionAtIso?: string | null;
  lastInteractionAtIso?: string;
  assignedTo?: string | null;
  lossReason?: string | null;
  finalConclusion?: string | null;
  qualified?: boolean;
};

export type CreateActionItemInput = {
  type: string;
  priority: number;
  leadId: string;
  contactId: string;
  title: string;
  reason: string;
  recommendedAction: string;
  dueAtIso: string | null;
  assignedTo: string | null;
};

const openStatuses: readonly ActionItemStatus[] = [
  "pendente",
  "em_andamento",
  "reagendado"
];

export async function withTransaction<T>(handler: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await postgresPool.connect();
  try {
    await client.query("begin");
    const result = await handler(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export async function findLeadById(client: PoolClient, leadId: string) {
  const result = await client.query<LeadOperationalLeadRow>(
    "select * from leads where id = $1 limit 1",
    [leadId]
  );
  return result.rows[0] ?? null;
}

export async function findContactById(client: PoolClient, contactId: string) {
  const result = await client.query<LeadOperationalContactRow>(
    "select id, name, phone, normalized_phone, source, notes from contacts where id = $1 limit 1",
    [contactId]
  );
  return result.rows[0] ?? null;
}

export async function findActionItemById(client: PoolClient, actionItemId: string) {
  const result = await client.query<LeadOperationalActionItemRow>(
    "select * from action_items where id = $1 limit 1",
    [actionItemId]
  );
  return result.rows[0] ?? null;
}

export async function createLeadInteraction(client: PoolClient, input: CreateLeadInteractionInput) {
  const result = await client.query<LeadOperationalInteractionRow>(
    `insert into crm_interactions (
      contact_id, lead_id, interaction_type, channel, responsible, result, notes, next_action_at
    ) values ($1, $2, 'lead_contact_outcome', $3, $4, $5, $6, $7)
    returning *`,
    [
      input.contactId,
      input.leadId,
      input.channel,
      input.attendant,
      input.outcome,
      input.notes,
      input.nextActionAtIso
    ]
  );
  return result.rows[0];
}

export async function updateLeadLifecycle(client: PoolClient, leadId: string, input: LeadLifecycleUpdateInput) {
  const result = await client.query<LeadOperationalLeadRow>(
    `update leads
      set status = coalesce($2, status),
          attempts_count = coalesce($3, attempts_count),
          next_action_at = case
            when $4::text = '__KEEP__' then next_action_at
            else $4::timestamptz
          end,
          last_interaction_at = coalesce($5::timestamptz, last_interaction_at),
          assigned_to = coalesce($6, assigned_to),
          loss_reason = case
            when $7::text = '__KEEP__' then loss_reason
            else $7
          end,
          final_conclusion = case
            when $8::text = '__KEEP__' then final_conclusion
            else $8
          end,
          qualified = coalesce($9, qualified),
          updated_at = now()
      where id = $1
      returning *`,
    [
      leadId,
      input.status ?? null,
      input.attemptsCount ?? null,
      input.nextActionAtIso === undefined ? "__KEEP__" : input.nextActionAtIso,
      input.lastInteractionAtIso ?? null,
      input.assignedTo ?? null,
      input.lossReason === undefined ? "__KEEP__" : input.lossReason,
      input.finalConclusion === undefined ? "__KEEP__" : input.finalConclusion,
      input.qualified ?? null
    ]
  );
  return result.rows[0] ?? null;
}

export async function listOpenActionItemsByLead(client: PoolClient, leadId: string) {
  const result = await client.query<LeadOperationalActionItemRow>(
    `select *
      from action_items
      where lead_id = $1 and status = any($2::action_item_status[])
      order by due_at asc nulls last, priority desc, created_at desc`,
    [leadId, openStatuses]
  );
  return result.rows;
}

export async function updateActionItemStatus(
  client: PoolClient,
  actionItemId: string,
  status: ActionItemStatus,
  markCompleted: boolean
) {
  const result = await client.query<LeadOperationalActionItemRow>(
    `update action_items
      set status = $2,
          completed_at = case when $3 then coalesce(completed_at, now()) else completed_at end,
          updated_at = now()
      where id = $1
      returning *`,
    [actionItemId, status, markCompleted]
  );
  return result.rows[0] ?? null;
}

export async function updateActionItemsStatusByLead(
  client: PoolClient,
  leadId: string,
  targetStatus: ActionItemStatus,
  markCompleted: boolean
) {
  const result = await client.query<LeadOperationalActionItemRow>(
    `update action_items
      set status = $2,
          completed_at = case when $3 then coalesce(completed_at, now()) else completed_at end,
          updated_at = now()
      where lead_id = $1
        and status = any($4::action_item_status[])
      returning *`,
    [leadId, targetStatus, markCompleted, openStatuses]
  );
  return result.rows;
}

export async function findOpenActionItemByLeadTypeAndDue(
  client: PoolClient,
  leadId: string,
  type: string,
  dueAtIso: string | null
) {
  if (dueAtIso) {
    const result = await client.query<LeadOperationalActionItemRow>(
      `select *
        from action_items
        where lead_id = $1
          and type = $2
          and due_at = $3::timestamptz
          and status = any($4::action_item_status[])
        order by created_at desc
        limit 1`,
      [leadId, type, dueAtIso, openStatuses]
    );
    return result.rows[0] ?? null;
  }

  const result = await client.query<LeadOperationalActionItemRow>(
    `select *
      from action_items
      where lead_id = $1
        and type = $2
        and due_at is null
        and status = any($3::action_item_status[])
      order by created_at desc
      limit 1`,
    [leadId, type, openStatuses]
  );
  return result.rows[0] ?? null;
}

export async function createActionItem(client: PoolClient, input: CreateActionItemInput) {
  const result = await client.query<LeadOperationalActionItemRow>(
    `insert into action_items (
      type, priority, lead_id, contact_id, title, reason, recommended_action, due_at, status, assigned_to
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'pendente', $9)
    returning *`,
    [
      input.type,
      input.priority,
      input.leadId,
      input.contactId,
      input.title,
      input.reason,
      input.recommendedAction,
      input.dueAtIso,
      input.assignedTo
    ]
  );
  return result.rows[0];
}

export async function listRecentLeadInteractions(leadId: string, limit: number) {
  const result = await postgresPool.query<LeadOperationalInteractionRow>(
    `select *
      from crm_interactions
      where lead_id = $1
      order by created_at desc
      limit $2`,
    [leadId, limit]
  );
  return result.rows;
}
