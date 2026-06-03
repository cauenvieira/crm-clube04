import { postgresPool } from "../db/postgres.js";
import { buildUpdateSet, compactObject } from "../utils/sql.js";
import type { LeadCreateInput, LeadListQuery, LeadPatchInput } from "../validation/lead-schemas.js";

const activeLeadStatuses = [
  "novo_lead",
  "em_atendimento",
  "aguardando_resposta",
  "em_negociacao",
  "agendado",
  "reativar_depois"
];

const openActionItemStatuses = ["pendente", "em_andamento", "reagendado"];

export type OperationalLeadSearchRow = {
  lead_id: string;
  lead_status: string;
  lead_source: string | null;
  lead_campaign: string | null;
  lead_assigned_to: string | null;
  lead_first_message_at: Date | string | null;
  lead_next_action_at: Date | string | null;
  lead_last_interaction_at: Date | string | null;
  lead_attempts_count: number;
  lead_pet_name: string | null;
  lead_created_at: Date | string;
  lead_updated_at: Date | string;
  contact_id: string;
  contact_name: string | null;
  contact_phone: string | null;
  contact_normalized_phone: string | null;
  contact_source: string | null;
  next_action_id: string | null;
  next_action_type: string | null;
  next_action_status: string | null;
  next_action_title: string | null;
  next_action_due_at: Date | string | null;
  last_outcome: string | null;
  last_note: string | null;
};

export async function createLead(input: Omit<LeadCreateInput, "contact"> & { contact_id: string }) {
  const result = await postgresPool.query(
    `insert into leads (
      contact_id, pet_name, pet_breed, pet_size, service_interest, source, campaign,
      status, assigned_to, first_message_at, last_interaction_at, next_action_at,
      attempts_count, qualified, macro_reason, micro_reason, loss_reason, final_conclusion
    ) values (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
    ) returning *`,
    [
      input.contact_id,
      input.pet_name ?? null,
      input.pet_breed ?? null,
      input.pet_size ?? null,
      input.service_interest ?? null,
      input.source ?? null,
      input.campaign ?? null,
      input.status,
      input.assigned_to ?? null,
      input.first_message_at ?? null,
      input.last_interaction_at ?? null,
      input.next_action_at ?? null,
      input.attempts_count ?? 0,
      input.qualified ?? false,
      input.macro_reason ?? null,
      input.micro_reason ?? null,
      input.loss_reason ?? null,
      input.final_conclusion ?? null
    ]
  );

  return result.rows[0];
}

export async function findLeadById(id: string) {
  const result = await postgresPool.query("select * from leads where id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function listLeads(query: LeadListQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  for (const key of ["status", "assigned_to", "source", "campaign"] as const) {
    if (query[key]) {
      values.push(query[key]);
      conditions.push(`${key} = $${values.length}`);
    }
  }

  if (query.next_action_before) {
    values.push(query.next_action_before);
    conditions.push(`next_action_at <= $${values.length}`);
  }

  values.push(query.limit, query.offset);
  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
  const result = await postgresPool.query(
    `select * from leads ${where} order by created_at desc limit $${values.length - 1} offset $${values.length}`,
    values
  );

  return result.rows;
}

export async function updateLead(id: string, input: LeadPatchInput) {
  const data = compactObject({
    pet_name: input.pet_name,
    pet_breed: input.pet_breed,
    pet_size: input.pet_size,
    service_interest: input.service_interest,
    source: input.source,
    campaign: input.campaign,
    status: input.status,
    assigned_to: input.assigned_to,
    first_message_at: input.first_message_at,
    last_interaction_at: input.last_interaction_at,
    next_action_at: input.next_action_at,
    attempts_count: input.attempts_count,
    qualified: input.qualified,
    macro_reason: input.macro_reason,
    micro_reason: input.micro_reason,
    loss_reason: input.loss_reason,
    final_conclusion: input.final_conclusion
  });

  const { assignments, values, nextIndex } = buildUpdateSet(data);
  const result = await postgresPool.query(
    `update leads set ${assignments} where id = $${nextIndex} returning *`,
    [...values, id]
  );

  return result.rows[0] ?? null;
}

export async function touchActiveLeadsByContact(contactId: string, interactionAt: string) {
  const result = await postgresPool.query(
    `update leads
      set last_interaction_at = greatest(coalesce(last_interaction_at, $2), $2)
      where contact_id = $1 and status = any($3::lead_status[])
      returning *`,
    [contactId, interactionAt, activeLeadStatuses]
  );

  return result.rows;
}

export async function updateLeadAfterInteraction(
  id: string,
  input: { next_action_at?: string; increment_attempts?: boolean }
) {
  const result = await postgresPool.query(
    `update leads
      set next_action_at = coalesce($2, next_action_at),
          attempts_count = attempts_count + case when $3 then 1 else 0 end
      where id = $1
      returning *`,
    [id, input.next_action_at ?? null, input.increment_attempts ?? false]
  );

  return result.rows[0] ?? null;
}

export async function findLatestActiveLeadByContact(contactId: string) {
  const result = await postgresPool.query(
    `select * from leads
      where contact_id = $1 and status = any($2::lead_status[])
      order by coalesce(last_interaction_at, created_at) desc, created_at desc
      limit 1`,
    [contactId, activeLeadStatuses]
  );

  return result.rows[0] ?? null;
}

export async function searchLeadsOperational(input: {
  normalizedPhone?: string;
  queryText?: string;
  status?: string;
  source?: string;
  campaign?: string;
  limit: number;
}) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (input.normalizedPhone) {
    values.push(`%${input.normalizedPhone}%`);
    conditions.push(`coalesce(c.normalized_phone, '') like $${values.length}`);
  }

  if (input.queryText) {
    values.push(`%${input.queryText}%`);
    conditions.push(
      `(coalesce(c.name, '') ilike $${values.length} or coalesce(l.pet_name, '') ilike $${values.length})`
    );
  }

  if (input.status) {
    values.push(input.status);
    conditions.push(`l.status = $${values.length}`);
  }

  if (input.source) {
    values.push(input.source);
    conditions.push(`coalesce(l.source, c.source, '') = $${values.length}`);
  }

  if (input.campaign) {
    values.push(input.campaign);
    conditions.push(`coalesce(l.campaign, '') = $${values.length}`);
  }

  values.push(openActionItemStatuses);
  const openStatusesParam = `$${values.length}`;

  values.push(input.limit);
  const limitParam = `$${values.length}`;
  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";

  const result = await postgresPool.query<OperationalLeadSearchRow>(
    `select
      l.id as lead_id,
      l.status as lead_status,
      l.source as lead_source,
      l.campaign as lead_campaign,
      l.assigned_to as lead_assigned_to,
      l.first_message_at as lead_first_message_at,
      l.next_action_at as lead_next_action_at,
      l.last_interaction_at as lead_last_interaction_at,
      l.attempts_count as lead_attempts_count,
      l.pet_name as lead_pet_name,
      l.created_at as lead_created_at,
      l.updated_at as lead_updated_at,
      c.id as contact_id,
      c.name as contact_name,
      c.phone as contact_phone,
      c.normalized_phone as contact_normalized_phone,
      c.source as contact_source,
      next_item.id as next_action_id,
      next_item.type as next_action_type,
      next_item.status as next_action_status,
      next_item.title as next_action_title,
      next_item.due_at as next_action_due_at,
      last_interaction.result as last_outcome,
      last_interaction.notes as last_note
    from leads l
    inner join contacts c on c.id = l.contact_id
    left join lateral (
      select ai.id, ai.type, ai.status, ai.title, ai.due_at
      from action_items ai
      where ai.lead_id = l.id
        and ai.status = any(${openStatusesParam}::action_item_status[])
      order by ai.due_at asc nulls last, ai.priority desc, ai.created_at desc
      limit 1
    ) next_item on true
    left join lateral (
      select ci.result, ci.notes
      from crm_interactions ci
      where ci.lead_id = l.id
      order by ci.created_at desc
      limit 1
    ) last_interaction on true
    ${where}
    order by l.updated_at desc
    limit ${limitParam}`,
    values
  );

  return result.rows;
}
