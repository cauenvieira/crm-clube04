import type { PoolClient } from "pg";

import type { ActionType, PhonePlan, SheetBucket } from "./remediate-lead-import-classification.js";
import {
  findItemsToIgnore,
  increment,
  isSpreadsheetActionItem,
  noisyGenericTypes,
  pickExistingDesiredItem,
  priorityForAction,
  specificTypes,
  titleForAction,
  toDueIso
} from "./remediate-lead-import-action-utils.js";

const OPEN_STATUSES = ["pendente", "em_andamento", "reagendado"] as const;

type LeadRow = {
  id: string;
  contact_id: string;
  normalized_phone: string;
  lead_status: string;
  contact_name: string | null;
};

type ActionItemRow = {
  id: string;
  lead_id: string | null;
  type: string;
  status: string;
  priority: number;
  title: string;
  reason: string | null;
  due_at: string | Date | null;
};

export type RemediationSummary = {
  leadsTargeted: number;
  leadsConvertedByPessoa: number;
  leadsBacklogRetomar: number;
  leadsFollowUpJune: number;
  leadsRevisaoLideranca: number;
  ignoredGeneric: number;
  ignoredSpecificConflict: number;
  actionCreatedByType: Map<string, number>;
  actionUpdatedByType: Map<string, number>;
  leadStatusUpdated: number;
  leadNextActionUpdated: number;
  backlogDistribution: Map<string, number>;
};

export type RemediationContext = {
  phonePlans: Map<string, PhonePlan>;
  leadRows: LeadRow[];
  openActionItemsByLead: Map<string, ActionItemRow[]>;
  backlogScheduleByPhone: Map<string, string>;
  backlogDistribution: Map<string, number>;
};

export function createEmptySummary(): RemediationSummary {
  return {
    leadsTargeted: 0,
    leadsConvertedByPessoa: 0,
    leadsBacklogRetomar: 0,
    leadsFollowUpJune: 0,
    leadsRevisaoLideranca: 0,
    ignoredGeneric: 0,
    ignoredSpecificConflict: 0,
    actionCreatedByType: new Map([
      ["retomar_atendimento", 0],
      ["fazer_follow_up", 0],
      ["revisar_lideranca", 0]
    ]),
    actionUpdatedByType: new Map([
      ["retomar_atendimento", 0],
      ["fazer_follow_up", 0],
      ["revisar_lideranca", 0]
    ]),
    leadStatusUpdated: 0,
    leadNextActionUpdated: 0,
    backlogDistribution: new Map()
  };
}

export async function loadSpreadsheetImportLeads(client: PoolClient): Promise<LeadRow[]> {
  const result = await client.query<LeadRow>(
    `select
      l.id,
      l.contact_id,
      l.status as lead_status,
      c.normalized_phone,
      c.name as contact_name
    from leads l
    inner join contacts c on c.id = l.contact_id
    where l.source = 'spreadsheet_import'
      and c.normalized_phone is not null`
  );
  return result.rows;
}

export async function loadOpenActionItemsByLead(client: PoolClient, leadIds: string[]) {
  const map = new Map<string, ActionItemRow[]>();
  if (leadIds.length === 0) return map;
  const result = await client.query<ActionItemRow>(
    `select id, lead_id, type, status, priority, title, reason, due_at
    from action_items
    where lead_id = any($1::uuid[])
      and status = any($2::action_item_status[])`,
    [leadIds, OPEN_STATUSES]
  );
  for (const row of result.rows) {
    if (!row.lead_id) continue;
    if (!map.has(row.lead_id)) map.set(row.lead_id, []);
    map.get(row.lead_id)?.push(row);
  }
  return map;
}

export async function applyRemediation(client: PoolClient, context: RemediationContext, apply: boolean) {
  const summary = createEmptySummary();
  summary.backlogDistribution = context.backlogDistribution;

  for (const lead of context.leadRows) {
    const plan = context.phonePlans.get(lead.normalized_phone);
    if (!plan) continue;
    summary.leadsTargeted++;

    if (plan.foundInPessoa) summary.leadsConvertedByPessoa++;
    if (plan.desiredActionType === "retomar_atendimento") summary.leadsBacklogRetomar++;
    if (plan.desiredActionType === "fazer_follow_up") summary.leadsFollowUpJune++;
    if (plan.desiredActionType === "revisar_lideranca") summary.leadsRevisaoLideranca++;

    const openItems = context.openActionItemsByLead.get(lead.id) ?? [];
    const toIgnore = findItemsToIgnore(openItems, plan.desiredActionType);
    if (toIgnore.length > 0) {
      summary.ignoredGeneric += toIgnore.filter((item) => noisyGenericTypes.includes(item.type)).length;
      summary.ignoredSpecificConflict += toIgnore.filter((item) => specificTypes.includes(item.type)).length;
      if (apply) await markActionItemsIgnored(client, toIgnore.map((item) => item.id));
    }

    const desiredDueYmd = resolveDesiredDueYmd(plan, context.backlogScheduleByPhone);
    const desiredDueIso = desiredDueYmd ? toDueIso(desiredDueYmd) : null;
    const desiredStatus = mapBucketToLeadStatus(plan.bucket);

    if (apply) {
      const updated = await updateLeadStateIfNeeded(client, lead.id, desiredStatus, desiredDueIso);
      if (updated.statusUpdated) summary.leadStatusUpdated++;
      if (updated.nextActionUpdated) summary.leadNextActionUpdated++;
    }

    if (!plan.desiredActionType) continue;
    const existingDesired = pickExistingDesiredItem(openItems, plan.desiredActionType);
    if (!existingDesired) {
      increment(summary.actionCreatedByType, plan.desiredActionType);
      if (apply) {
        await createSpecificActionItem(client, {
          leadId: lead.id,
          contactId: lead.contact_id,
          type: plan.desiredActionType,
          dueAtIso: desiredDueIso,
          assignedTo: null
        });
      }
      continue;
    }

    const canUpdate = isSpreadsheetActionItem(existingDesired.reason);
    if (!canUpdate) continue;
    const needsUpdate =
      existingDesired.priority !== priorityForAction(plan.desiredActionType) ||
      toYmdOrNull(existingDesired.due_at) !== desiredDueYmd ||
      existingDesired.title !== titleForAction(plan.desiredActionType);
    if (!needsUpdate) continue;
    increment(summary.actionUpdatedByType, plan.desiredActionType);
    if (apply) {
      await updateSpecificActionItem(client, existingDesired.id, {
        type: plan.desiredActionType,
        dueAtIso: desiredDueIso
      });
    }
  }

  return summary;
}

async function markActionItemsIgnored(client: PoolClient, ids: string[]) {
  if (ids.length === 0) return;
  await client.query(
    `update action_items
    set status = 'ignorado',
        completed_at = coalesce(completed_at, now()),
        updated_at = now(),
        reason = case
          when reason is null or reason = '' then 'spreadsheet_import:remediation_v1:ignored'
          else reason || ' | spreadsheet_import:remediation_v1:ignored'
        end
    where id = any($1::uuid[])`,
    [ids]
  );
}

async function createSpecificActionItem(
  client: PoolClient,
  input: { leadId: string; contactId: string; type: ActionType; dueAtIso: string | null; assignedTo: string | null }
) {
  await client.query(
    `insert into action_items (
      type, priority, contact_id, lead_id, title, reason, recommended_action, due_at, status, assigned_to
    ) values ($1, $2, $3, $4, $5, $6, 'spreadsheet_import_remediation', $7, 'pendente', $8)`,
    [
      input.type,
      priorityForAction(input.type),
      input.contactId,
      input.leadId,
      titleForAction(input.type),
      `spreadsheet_import:remediation_v1:${input.type}`,
      input.dueAtIso,
      input.assignedTo
    ]
  );
}

async function updateSpecificActionItem(
  client: PoolClient,
  actionItemId: string,
  input: { type: ActionType; dueAtIso: string | null }
) {
  await client.query(
    `update action_items
    set priority = $2,
        title = $3,
        reason = $4,
        recommended_action = 'spreadsheet_import_remediation',
        due_at = $5,
        updated_at = now()
    where id = $1`,
    [
      actionItemId,
      priorityForAction(input.type),
      titleForAction(input.type),
      `spreadsheet_import:remediation_v1:${input.type}`,
      input.dueAtIso
    ]
  );
}

async function updateLeadStateIfNeeded(client: PoolClient, leadId: string, status: string, nextActionAt: string | null) {
  const result = await client.query(
    `update leads
    set status = $2::lead_status,
        next_action_at = $3::timestamptz,
        updated_at = now()
    where id = $1
      and (status <> $2::lead_status or coalesce(next_action_at::text, '') <> coalesce(($3::timestamptz)::text, ''))`,
    [leadId, status, nextActionAt]
  );
  if (result.rowCount === 0) return { statusUpdated: false, nextActionUpdated: false };
  return { statusUpdated: true, nextActionUpdated: true };
}

function resolveDesiredDueYmd(plan: PhonePlan, backlogScheduleByPhone: Map<string, string>) {
  if (plan.desiredActionType === "retomar_atendimento") {
    return backlogScheduleByPhone.get(plan.phone) ?? plan.desiredDueYmd ?? null;
  }
  return plan.desiredDueYmd ?? null;
}

function mapBucketToLeadStatus(bucket: SheetBucket) {
  if (bucket === "convertido") return "compareceu";
  if (bucket === "revisar_lideranca") return "em_negociacao";
  return "em_atendimento";
}

function toYmdOrNull(value: string | Date | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}
