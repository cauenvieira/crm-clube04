import { postgresPool } from "../db/postgres.js";
import type { ActionItemStatus } from "../validation/action-item-schemas.js";

const activeLeadStatuses = [
  "novo_lead",
  "em_atendimento",
  "aguardando_resposta",
  "em_negociacao",
  "agendado",
  "reativar_depois"
] as const;

const overdueActionItemStatuses: readonly ActionItemStatus[] = ["pendente", "em_andamento"];
const openActionItemStatuses: readonly ActionItemStatus[] = [
  "pendente",
  "em_andamento",
  "reagendado"
];

export async function getOperationalDayWindow(timezone: string) {
  const result = await postgresPool.query(
    `select
      to_char((now() at time zone $1)::date, 'YYYY-MM-DD') as business_date,
      (((now() at time zone $1)::date)::timestamp at time zone $1) as window_start,
      ((((now() at time zone $1)::date + 1)::timestamp) at time zone $1) as window_end`,
    [timezone]
  );
  return result.rows[0];
}

export async function listPendingActionItems(limit: number) {
  const result = await postgresPool.query(
    `select
      ai.id,
      ai.type,
      ai.priority,
      ai.status,
      ai.title,
      ai.due_at,
      ai.lead_id,
      ai.contact_id,
      c.name as contact_name,
      c.normalized_phone,
      l.status as lead_status,
      l.source as lead_source,
      l.campaign as lead_campaign,
      l.assigned_to as lead_assigned_to,
      l.pet_name as lead_pet_name,
      l.attempts_count,
      latest_interaction.notes as last_interaction_note,
      ai.created_at
    from action_items ai
    left join contacts c on c.id = ai.contact_id
    left join leads l on l.id = ai.lead_id
    left join lateral (
      select notes
      from crm_interactions ci
      where ci.lead_id = ai.lead_id
      order by ci.created_at desc
      limit 1
    ) latest_interaction on true
    where ai.status = 'pendente'
    order by ai.priority desc, ai.due_at asc nulls last, ai.created_at asc
    limit $1`,
    [limit]
  );
  return result.rows;
}

export async function listOverdueActionItems(limit: number) {
  const result = await postgresPool.query(
    `select
      ai.id,
      ai.type,
      ai.priority,
      ai.status,
      ai.title,
      ai.due_at,
      ai.lead_id,
      ai.contact_id,
      c.name as contact_name,
      c.normalized_phone,
      l.status as lead_status,
      l.source as lead_source,
      l.campaign as lead_campaign,
      l.assigned_to as lead_assigned_to,
      l.pet_name as lead_pet_name,
      l.attempts_count,
      latest_interaction.notes as last_interaction_note,
      ai.created_at
    from action_items ai
    left join contacts c on c.id = ai.contact_id
    left join leads l on l.id = ai.lead_id
    left join lateral (
      select notes
      from crm_interactions ci
      where ci.lead_id = ai.lead_id
      order by ci.created_at desc
      limit 1
    ) latest_interaction on true
    where ai.status = any($1::action_item_status[])
      and ai.due_at is not null
      and ai.due_at < now()
    order by ai.due_at asc, ai.priority desc, ai.created_at asc
    limit $2`,
    [overdueActionItemStatuses, limit]
  );
  return result.rows;
}

export async function listOpenActionItemsByTypes(limit: number, types: readonly string[]) {
  const result = await postgresPool.query(
    `select
      ai.id,
      ai.type,
      ai.priority,
      ai.status,
      ai.title,
      ai.due_at,
      ai.lead_id,
      ai.contact_id,
      c.name as contact_name,
      c.normalized_phone,
      l.status as lead_status,
      l.source as lead_source,
      l.campaign as lead_campaign,
      l.assigned_to as lead_assigned_to,
      l.pet_name as lead_pet_name,
      l.attempts_count,
      ai.reason,
      latest_interaction.notes as last_interaction_note,
      ai.created_at
    from action_items ai
    left join contacts c on c.id = ai.contact_id
    left join leads l on l.id = ai.lead_id
    left join lateral (
      select notes
      from crm_interactions ci
      where ci.lead_id = ai.lead_id
      order by ci.created_at desc
      limit 1
    ) latest_interaction on true
    where ai.status = any($1::action_item_status[])
      and ai.type = any($2::text[])
    order by ai.due_at asc nulls last, ai.priority desc, ai.created_at asc
    limit $3`,
    [openActionItemStatuses, types, limit]
  );
  return result.rows;
}

export async function listLeadsWithOverdueFollowUp(limit: number) {
  const result = await postgresPool.query(
    `select
      l.id,
      l.status,
      l.source,
      l.campaign,
      l.assigned_to,
      l.pet_name,
      l.next_action_at,
      l.last_interaction_at,
      l.contact_id,
      c.name as contact_name,
      c.normalized_phone
    from leads l
    left join contacts c on c.id = l.contact_id
    where l.status = any($1::lead_status[])
      and l.next_action_at is not null
      and l.next_action_at < now()
    order by l.next_action_at asc, l.created_at asc
    limit $2`,
    [activeLeadStatuses, limit]
  );
  return result.rows;
}

export async function listLeadsWithoutInteraction24h(limit: number) {
  const result = await postgresPool.query(
    `select
      l.id,
      l.status,
      l.source,
      l.campaign,
      l.assigned_to,
      l.pet_name,
      l.next_action_at,
      l.last_interaction_at,
      l.contact_id,
      c.name as contact_name,
      c.normalized_phone
    from leads l
    left join contacts c on c.id = l.contact_id
    where l.status = any($1::lead_status[])
      and (l.last_interaction_at is null or l.last_interaction_at < now() - interval '24 hours')
    order by l.last_interaction_at asc nulls first, l.created_at asc
    limit $2`,
    [activeLeadStatuses, limit]
  );
  return result.rows;
}

export async function listLeadsWithoutNextAction(limit: number) {
  const result = await postgresPool.query(
    `select
      l.id,
      l.status,
      l.source,
      l.campaign,
      l.assigned_to,
      l.pet_name,
      l.next_action_at,
      l.last_interaction_at,
      l.contact_id,
      c.name as contact_name,
      c.normalized_phone
    from leads l
    left join contacts c on c.id = l.contact_id
    where l.status = any($1::lead_status[])
      and l.next_action_at is null
    order by l.created_at desc
    limit $2`,
    [activeLeadStatuses, limit]
  );
  return result.rows;
}

export async function listConcludedActionItemsByWindow(
  limit: number,
  dayStartIso: string,
  dayEndIso: string
) {
  const result = await postgresPool.query(
    `select
      ai.id,
      ai.type,
      ai.priority,
      ai.status,
      ai.title,
      ai.due_at,
      ai.lead_id,
      ai.contact_id,
      c.name as contact_name,
      c.normalized_phone,
      l.status as lead_status,
      l.source as lead_source,
      l.campaign as lead_campaign,
      l.assigned_to as lead_assigned_to,
      l.pet_name as lead_pet_name,
      l.attempts_count,
      ai.reason,
      latest_interaction.notes as last_interaction_note,
      ai.created_at
    from action_items ai
    left join contacts c on c.id = ai.contact_id
    left join leads l on l.id = ai.lead_id
    left join lateral (
      select notes
      from crm_interactions ci
      where ci.lead_id = ai.lead_id
      order by ci.created_at desc
      limit 1
    ) latest_interaction on true
    where ai.status = 'concluido'
      and ai.completed_at is not null
      and ai.completed_at >= $1::timestamptz
      and ai.completed_at < $2::timestamptz
    order by ai.completed_at desc
    limit $3`,
    [dayStartIso, dayEndIso, limit]
  );
  return result.rows;
}

export async function listLatestInboundMessages(limit: number) {
  const result = await postgresPool.query(
    `select
      m.id,
      m.provider,
      m.provider_message_id,
      m.body,
      m.created_at,
      m.conversation_id,
      m.contact_id,
      c.name as contact_name,
      c.normalized_phone
    from messages m
    left join contacts c on c.id = m.contact_id
    where m.direction = 'inbound'
    order by m.created_at desc
    limit $1`,
    [limit]
  );
  return result.rows;
}
