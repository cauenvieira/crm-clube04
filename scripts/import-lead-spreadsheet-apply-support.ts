import type { PoolClient } from "pg";

import type { PlannedLeadImport, CanonicalAction } from "./lead-import-apply-utils.js";
import {
  buildSnapshotNotes,
  dueAtForAction,
  mapCanonicalToDbLeadStatus,
  parseSpreadsheetDate,
  priorityForAction,
  reasonForAction,
  sanitizeMethodSource,
  titleForAction,
  truncateText
} from "./lead-import-apply-utils.js";
import { parseLegacyAttemptCount } from "./lead-customer-crosscheck-utils.js";

type ContactRow = { id: string; normalized_phone: string; name: string | null; source: string | null };
type LeadRow = { id: string; contact_id: string; status: string; source: string | null; updated_at: string | Date };

export type ApplySummary = {
  contactsCreated: number;
  contactsLinked: number;
  leadsCreated: number;
  leadsLinkedExisting: number;
  actionItemsCreatedByType: Map<string, number>;
  snapshotsCreated: number;
  rejected: number;
  manualReview: number;
  validarConversao: number;
  retomarAtendimento: number;
  conflicts: number;
};

const OPEN_ACTION_STATUSES = ["pendente", "em_andamento", "reagendado"];

export async function loadExistingContactsByPhone(client: PoolClient, phones: string[]) {
  const map = new Map<string, ContactRow>();
  if (phones.length === 0) return map;
  const result = await client.query<ContactRow>(
    "select id, normalized_phone, name, source from contacts where normalized_phone = any($1::text[])",
    [phones]
  );
  for (const row of result.rows) map.set(row.normalized_phone, row);
  return map;
}

export async function loadExistingLeadsByContactIds(client: PoolClient, contactIds: string[]) {
  const map = new Map<string, LeadRow[]>();
  if (contactIds.length === 0) return map;
  const result = await client.query<LeadRow>(
    "select id, contact_id, status, source, updated_at from leads where contact_id = any($1::uuid[])",
    [contactIds]
  );
  for (const row of result.rows) {
    if (!map.has(row.contact_id)) map.set(row.contact_id, []);
    map.get(row.contact_id)?.push(row);
  }
  return map;
}

export function createEmptySummary(): ApplySummary {
  return {
    contactsCreated: 0,
    contactsLinked: 0,
    leadsCreated: 0,
    leadsLinkedExisting: 0,
    actionItemsCreatedByType: new Map([
      ["fazer_follow_up", 0],
      ["retomar_atendimento", 0],
      ["revisar_lideranca", 0],
      ["validar_conversao", 0]
    ]),
    snapshotsCreated: 0,
    rejected: 0,
    manualReview: 0,
    validarConversao: 0,
    retomarAtendimento: 0,
    conflicts: 0
  };
}

export async function applyPlan(
  client: PoolClient,
  plan: PlannedLeadImport[],
  options: { apply: boolean; existingContacts: Map<string, ContactRow> }
) {
  const summary = createEmptySummary();
  const leadsByContact = new Map<string, LeadRow[]>();
  const contactCache = new Map(options.existingContacts);

  for (const item of plan) {
    if (item.warning === "conflicting_tutor" || item.warning === "status_action_conflict") {
      summary.manualReview++;
      summary.conflicts++;
    }
    if (item.statusFinal === "validar_conversao") summary.validarConversao++;
    if (item.actionFinal === "retomar_atendimento") summary.retomarAtendimento++;

    const contact = contactCache.get(item.phone);
    let contactId = contact?.id ?? "";
    if (!contactId) {
      if (options.apply) {
        const created = await createContact(client, item);
        contactId = created.id;
        contactCache.set(item.phone, created);
      } else {
        contactId = `dry-${item.phone}`;
      }
      summary.contactsCreated++;
    } else {
      summary.contactsLinked++;
    }

    if (!contactId) continue;
    const contactLeads =
      leadsByContact.get(contactId) ??
      (contactId.startsWith("dry-") ? ([] as LeadRow[]) : await loadLeadsByContact(client, contactId));
    leadsByContact.set(contactId, contactLeads);
    const activeLead = contactLeads.find((lead) => isDbLeadActive(lead.status));
    const spreadsheetLead = pickLatestSpreadsheetLead(contactLeads);

    let leadId = activeLead?.id ?? spreadsheetLead?.id ?? "";
    if (!leadId) {
      if (options.apply) {
        const createdLead = await createLead(client, contactId, item);
        leadId = createdLead.id;
        contactLeads.push(createdLead);
      } else {
        leadId = `dry-lead-${item.phone}`;
        contactLeads.push({
          id: leadId,
          contact_id: contactId,
          status: mapCanonicalToDbLeadStatus(item.statusFinal),
          source: "spreadsheet_import",
          updated_at: new Date().toISOString()
        });
      }
      summary.leadsCreated++;
    } else {
      summary.leadsLinkedExisting++;
    }

    if (!leadId) continue;
    if (item.actionFinal) {
      const created = await createActionItemIfMissing(
        client,
        leadId,
        contactId,
        item.actionFinal,
        item,
        options.apply
      );
      if (created) incrementMap(summary.actionItemsCreatedByType, item.actionFinal);
    }

    const createdSnapshot = await createSnapshotIfMissing(client, leadId, contactId, item, options.apply);
    if (createdSnapshot) summary.snapshotsCreated++;
  }

  return summary;
}

async function createContact(client: PoolClient, item: PlannedLeadImport): Promise<ContactRow> {
  const existing = await client.query<ContactRow>(
    "select id, normalized_phone, name, source from contacts where normalized_phone = $1 limit 1",
    [item.phone]
  );
  if (existing.rows[0]) return existing.rows[0];

  try {
    const result = await client.query<ContactRow>(
      `insert into contacts (name, phone, normalized_phone, source, type, notes)
        values ($1, $2, $3, $4, 'lead', $5)
        returning id, normalized_phone, name, source`,
      [
        truncateText(item.row.values.tutor, 120) || null,
        item.row.values.telefone || null,
        item.phone,
        sanitizeMethodSource(item.row.values.metodoEntrada),
        "spreadsheet_import"
      ]
    );
    return result.rows[0];
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== "23505") throw error;
    const retry = await client.query<ContactRow>(
      "select id, normalized_phone, name, source from contacts where normalized_phone = $1 limit 1",
      [item.phone]
    );
    if (!retry.rows[0]) throw error;
    return retry.rows[0];
  }
}

async function loadLeadsByContact(client: PoolClient, contactId: string) {
  const result = await client.query<LeadRow>(
    "select id, contact_id, status, source, updated_at from leads where contact_id = $1",
    [contactId]
  );
  return result.rows;
}

async function createLead(client: PoolClient, contactId: string, item: PlannedLeadImport): Promise<LeadRow> {
  const statusDb = mapCanonicalToDbLeadStatus(item.statusFinal);
  const result = await client.query<LeadRow>(
    `insert into leads (
      contact_id, source, campaign, status, assigned_to, last_interaction_at, next_action_at,
      attempts_count, macro_reason, final_conclusion
    ) values ($1, $2, $3, $4::lead_status, $5, $6, $7, 0, $8, $9)
    returning id, contact_id, status, source, updated_at`,
    [
      contactId,
      "spreadsheet_import",
      sanitizeMethodSource(item.row.values.metodoEntrada),
      statusDb,
      truncateText(item.row.values.atendente, 80) || null,
      parseSpreadsheetDate(item.row.values.dataAtendimento),
      parseSpreadsheetDate(item.row.values.dataProxAcao),
      `canonical=${item.statusFinal}`,
      `conversion_found=${item.foundInPessoa ? "yes" : "no"}`
    ]
  );
  return result.rows[0];
}

async function createActionItemIfMissing(
  client: PoolClient,
  leadId: string,
  contactId: string,
  action: Exclude<CanonicalAction, null>,
  item: PlannedLeadImport,
  apply: boolean
) {
  const exists = await client.query<{ id: string }>(
    `select id from action_items
      where lead_id = $1
        and type = $2
        and status = any($3::action_item_status[])
        and reason like 'spreadsheet_import:%'
      limit 1`,
    [leadId, action, OPEN_ACTION_STATUSES]
  );
  if (exists.rows[0]) return false;

  if (!apply) return true;

  await client.query(
    `insert into action_items (
      type, priority, contact_id, lead_id, title, reason, recommended_action, due_at, status, assigned_to
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'pendente', $9)`,
    [
      action,
      priorityForAction(action),
      contactId,
      leadId,
      titleForAction(action),
      reasonForAction(action),
      "spreadsheet_import",
      dueAtForAction(item.row, action),
      truncateText(item.row.values.atendente, 80) || null
    ]
  );
  return true;
}

async function createSnapshotIfMissing(
  client: PoolClient,
  leadId: string,
  contactId: string,
  item: PlannedLeadImport,
  apply: boolean
) {
  const exists = await client.query<{ id: string }>(
    `select id from crm_interactions
      where lead_id = $1
        and interaction_type = 'spreadsheet_import_snapshot'
        and channel = 'spreadsheet_import'
      limit 1`,
    [leadId]
  );
  if (exists.rows[0]) return false;

  if (!apply) return true;

  await client.query(
    `insert into crm_interactions (
      contact_id, lead_id, interaction_type, channel, responsible, result, notes, next_action_at
    ) values ($1, $2, 'spreadsheet_import_snapshot', 'spreadsheet_import', $3, $4, $5, $6)`,
    [
      contactId,
      leadId,
      truncateText(item.row.values.atendente, 80) || null,
      item.statusFinal,
      buildSnapshotNotes({
        row: item.row,
        statusFinal: item.statusFinal,
        actionFinal: item.actionFinal,
        legacyAttemptCount: parseLegacyAttemptCount(item.row.values.tentativaNumero)
      }),
      parseSpreadsheetDate(item.row.values.dataProxAcao)
    ]
  );
  return true;
}

function isDbLeadActive(status: string) {
  return [
    "novo_lead",
    "em_atendimento",
    "aguardando_resposta",
    "em_negociacao",
    "agendado",
    "reativar_depois"
  ].includes(status);
}

function incrementMap(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function pickLatestSpreadsheetLead(leads: LeadRow[]) {
  return leads
    .filter((lead) => lead.source === "spreadsheet_import")
    .sort((a, b) => {
      const aMs = new Date(a.updated_at).getTime();
      const bMs = new Date(b.updated_at).getTime();
      return bMs - aMs;
    })[0];
}
