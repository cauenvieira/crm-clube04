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
