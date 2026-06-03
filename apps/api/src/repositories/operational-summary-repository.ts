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

export async function getActionItemsSummary(dayStartIso: string, dayEndIso: string) {
  const result = await postgresPool.query(
    `select
      count(*) filter (where status = 'pendente')::int as pendente,
      count(*) filter (where status = 'em_andamento')::int as em_andamento,
      count(*) filter (
        where status = 'concluido'
          and completed_at is not null
          and completed_at >= $1::timestamptz
          and completed_at < $2::timestamptz
      )::int as concluido_hoje,
      count(*) filter (
        where status = 'ignorado'
          and coalesce(completed_at, updated_at) >= $1::timestamptz
          and coalesce(completed_at, updated_at) < $2::timestamptz
      )::int as ignorado_hoje,
      count(*) filter (
        where status = any($3::action_item_status[])
          and due_at is not null
          and due_at < now()
      )::int as vencidos,
      count(*) filter (
        where status = any($3::action_item_status[])
          and type = 'revisar_lideranca'
      )::int as escalados_lideranca
    from action_items`,
    [dayStartIso, dayEndIso, overdueActionItemStatuses]
  );

  return result.rows[0];
}

export async function getLeadsSummary(dayStartIso: string, dayEndIso: string) {
  const result = await postgresPool.query(
    `select
      count(*) filter (where status = 'novo_lead')::int as novo_lead,
      count(*) filter (
        where created_at >= $2::timestamptz
          and created_at < $3::timestamptz
      )::int as novos_hoje,
      count(*) filter (
        where status = any($1::lead_status[])
          and next_action_at is not null
          and next_action_at < now()
      )::int as com_follow_up_vencido,
      count(*) filter (
        where status = any($1::lead_status[])
          and next_action_at is null
      )::int as sem_proxima_acao,
      count(*) filter (
        where status = any($1::lead_status[])
          and (last_interaction_at is null or last_interaction_at < now() - interval '24 hours')
      )::int as sem_interacao_24h
    from leads`,
    [activeLeadStatuses, dayStartIso, dayEndIso]
  );

  return result.rows[0];
}

export async function getMessagesSummary(dayStartIso: string, dayEndIso: string) {
  const result = await postgresPool.query(
    `select
      count(*) filter (
        where direction = 'inbound'
          and created_at >= $1::timestamptz
          and created_at < $2::timestamptz
      )::int as inbound_hoje,
      max(created_at) filter (where direction = 'inbound') as ultima_inbound_em
    from messages`,
    [dayStartIso, dayEndIso]
  );

  return result.rows[0];
}
