import type { PoolClient } from "pg";

import { postgresPool } from "../db/postgres.js";

const activeLeadStatuses = [
  "novo_lead",
  "em_atendimento",
  "aguardando_resposta",
  "em_negociacao",
  "agendado",
  "reativar_depois"
] as const;

const openActionItemStatuses = ["pendente", "em_andamento"] as const;

export type ContactRow = {
  id: string;
  name: string | null;
  phone: string | null;
  normalized_phone: string | null;
  source: string | null;
  created_at: Date | string;
  updated_at: Date | string;
};

export type LeadRow = {
  id: string;
  contact_id: string;
  status: string;
  source: string | null;
  campaign: string | null;
  assigned_to: string | null;
  next_action_at: Date | string | null;
  last_interaction_at: Date | string | null;
  created_at: Date | string;
};

export type ActionItemRow = {
  id: string;
  type: string;
  status: string;
  title: string;
  priority: number;
  due_at: Date | string | null;
  reason: string | null;
  lead_id: string | null;
};

type ContactCreateInput = {
  name: string;
  phone: string;
  normalizedPhone: string;
  source: string;
};

type LeadCreateInput = {
  contactId: string;
  source: string;
  campaign: string;
  assignedTo: string;
  petName?: string;
  petBreed?: string;
  petSize?: string;
  serviceInterest?: string;
  nextActionAtIso: string;
};

type ActionItemCreateInput = {
  type: string;
  priority: number;
  leadId: string;
  contactId: string;
  title: string;
  reason: string;
  dueAtIso: string;
  assignedTo: string;
};

type InteractionCreateInput = {
  contactId: string;
  leadId: string;
  responsible: string;
  result: string;
  notes: string;
  nextActionAtIso: string;
};

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

export async function findContactByNormalizedPhone(client: PoolClient, normalizedPhone: string) {
  const result = await client.query<ContactRow>(
    `select *
      from contacts
      where normalized_phone = $1
      limit 1`,
    [normalizedPhone]
  );
  return result.rows[0] ?? null;
}

export async function createContact(client: PoolClient, input: ContactCreateInput) {
  const result = await client.query<ContactRow>(
    `insert into contacts (name, phone, normalized_phone, source, type)
      values ($1, $2, $3, $4, 'lead')
      returning *`,
    [input.name, input.phone, input.normalizedPhone, input.source]
  );
  return result.rows[0];
}

export async function findLatestActiveLeadByContact(client: PoolClient, contactId: string) {
  const result = await client.query<LeadRow>(
    `select *
      from leads
      where contact_id = $1
        and status = any($2::lead_status[])
      order by coalesce(last_interaction_at, created_at) desc, created_at desc
      limit 1`,
    [contactId, activeLeadStatuses]
  );
  return result.rows[0] ?? null;
}

export async function createLead(client: PoolClient, input: LeadCreateInput) {
  const result = await client.query<LeadRow>(
    `insert into leads (
      contact_id, pet_name, pet_breed, pet_size, service_interest, source, campaign,
      status, assigned_to, next_action_at, last_interaction_at
    ) values (
      $1, $2, $3, $4, $5, $6, $7, 'novo_lead', $8, $9, $9
    )
    returning *`,
    [
      input.contactId,
      input.petName ?? null,
      input.petBreed ?? null,
      input.petSize ?? null,
      input.serviceInterest ?? null,
      input.source,
      input.campaign,
      input.assignedTo,
      input.nextActionAtIso
    ]
  );
  return result.rows[0];
}

export async function updateLeadAfterManualEntry(
  client: PoolClient,
  leadId: string,
  input: { assignedTo: string; nextActionAtIso: string }
) {
  const result = await client.query<LeadRow>(
    `update leads
      set assigned_to = coalesce(assigned_to, $2),
          last_interaction_at = greatest(coalesce(last_interaction_at, $3::timestamptz), $3::timestamptz),
          next_action_at = case
            when next_action_at is null then $3::timestamptz
            when next_action_at > $3::timestamptz then $3::timestamptz
            else next_action_at
          end,
          updated_at = now()
      where id = $1
      returning *`,
    [leadId, input.assignedTo, input.nextActionAtIso]
  );
  return result.rows[0] ?? null;
}

export async function findOpenActionItemByLeadTypeAndDue(
  client: PoolClient,
  leadId: string,
  type: string,
  dueAtIso: string
) {
  const result = await client.query<ActionItemRow>(
    `select *
      from action_items
      where lead_id = $1
        and type = $2
        and due_at = $3::timestamptz
        and status = any($4::action_item_status[])
      order by created_at desc
      limit 1`,
    [leadId, type, dueAtIso, openActionItemStatuses]
  );
  return result.rows[0] ?? null;
}

export async function createActionItem(client: PoolClient, input: ActionItemCreateInput) {
  const result = await client.query<ActionItemRow>(
    `insert into action_items (
      type, priority, lead_id, contact_id, title, reason, recommended_action, due_at, status, assigned_to
    ) values ($1, $2, $3, $4, $5, $6, 'manual_lead_entry', $7, 'pendente', $8)
    returning *`,
    [
      input.type,
      input.priority,
      input.leadId,
      input.contactId,
      input.title,
      input.reason,
      input.dueAtIso,
      input.assignedTo
    ]
  );
  return result.rows[0];
}

export async function createCrmInteraction(client: PoolClient, input: InteractionCreateInput) {
  const result = await client.query(
    `insert into crm_interactions (
      contact_id, lead_id, interaction_type, channel, responsible, result, notes, next_action_at
    ) values ($1, $2, 'manual_lead_entry', 'manual', $3, $4, $5, $6)
    returning *`,
    [input.contactId, input.leadId, input.responsible, input.result, input.notes, input.nextActionAtIso]
  );
  return result.rows[0];
}

export async function searchContactsByPhoneOrName(input: {
  normalizedPhone?: string;
  queryText?: string;
  limit: number;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (input.normalizedPhone) {
    values.push(`%${input.normalizedPhone}%`);
    conditions.push(`coalesce(normalized_phone, '') like $${values.length}`);
  }

  if (input.queryText) {
    values.push(`%${input.queryText}%`);
    conditions.push(`coalesce(name, '') ilike $${values.length}`);
  }

  values.push(input.limit);
  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

  const result = await postgresPool.query<ContactRow>(
    `select *
      from contacts
      ${where}
      order by updated_at desc
      limit $${values.length}`,
    values
  );

  return result.rows;
}

export async function listOpenActionItemsByLead(leadId: string, limit: number) {
  const result = await postgresPool.query<ActionItemRow>(
    `select id, type, status, title, priority, due_at, reason, lead_id
      from action_items
      where lead_id = $1
        and status = any($2::action_item_status[])
      order by due_at asc nulls last, priority desc, created_at desc
      limit $3`,
    [leadId, openActionItemStatuses, limit]
  );
  return result.rows;
}
