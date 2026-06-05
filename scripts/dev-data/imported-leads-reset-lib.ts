import type { PoolClient } from "pg";

import { sampleAmbiguousRecords } from "./imported-leads-reset-samples.js";
import {
  IMPORT_MARKER_PATTERNS,
  LEGACY_LABEL_PATTERNS,
  NOISY_ACTION_TYPES,
  type CountByLabel,
  type DateRange,
  type ImportedLeadsDiagnostics,
  type ImportedLeadsResetPlan,
  type TableCounts
} from "./imported-leads-reset-types.js";

export {
  applyImportedLeadsReset,
  printImportedLeadsDiagnostics,
  printImportedLeadsResetPlan
} from "./imported-leads-reset-output.js";

export async function collectImportedLeadsResetPlan(client: PoolClient): Promise<ImportedLeadsResetPlan> {
  const leadIds = await safeLeadIds(client);
  const contactIdsFromLeads = await ids(
    client,
    `select distinct contact_id as id from leads where id = any($1::uuid[])`,
    [leadIds]
  );
  const messageIds = await safeMessageIds(client, contactIdsFromLeads);
  const conversationIds = await safeConversationIds(client, contactIdsFromLeads, messageIds);
  const actionItemIds = await safeActionItemIds(client, leadIds, contactIdsFromLeads);
  const crmInteractionIds = await safeInteractionIds(client, leadIds, contactIdsFromLeads);
  const contactIds = await safeContactIds(client, contactIdsFromLeads, leadIds);
  const idsByTable = {
    contacts: contactIds,
    leads: leadIds,
    actionItems: actionItemIds,
    crmInteractions: crmInteractionIds,
    conversations: conversationIds,
    messages: messageIds
  };

  return {
    diagnostics: await collectImportedLeadsDiagnostics(client, idsByTable),
    ids: idsByTable
  };
}

export async function collectImportedLeadsDiagnostics(
  client: PoolClient, knownIds?: ImportedLeadsResetPlan["ids"]
): Promise<ImportedLeadsDiagnostics> {
  const leadIds = knownIds?.leads ?? (await safeLeadIds(client));
  const contactIdsFromLeads = await ids(
    client,
    `select distinct contact_id as id from leads where id = any($1::uuid[])`,
    [leadIds]
  );
  const contactIds = knownIds?.contacts ?? (await safeContactIds(client, contactIdsFromLeads, leadIds));
  const messageIds = knownIds?.messages ?? (await safeMessageIds(client, contactIdsFromLeads));
  const conversationIds =
    knownIds?.conversations ?? (await safeConversationIds(client, contactIdsFromLeads, messageIds));
  const actionItemIds =
    knownIds?.actionItems ?? (await safeActionItemIds(client, leadIds, contactIdsFromLeads));
  const crmInteractionIds =
    knownIds?.crmInteractions ?? (await safeInteractionIds(client, leadIds, contactIdsFromLeads));

  return {
    diagnosedAt: new Date().toISOString(),
    safeCandidates: {
      contacts: contactIds.length,
      leads: leadIds.length,
      actionItems: actionItemIds.length,
      crmInteractions: crmInteractionIds.length,
      conversations: conversationIds.length,
      messages: messageIds.length
    },
    ambiguous: await ambiguousCounts(client, leadIds, contactIdsFromLeads, actionItemIds),
    leadSourceGroups: await groups(client, leadIds, "leads", "source"),
    leadCampaignGroups: await groups(client, leadIds, "leads", "campaign"),
    leadStatusGroups: await groups(client, leadIds, "leads", "status::text"),
    actionTypeGroups: await groups(client, actionItemIds, "action_items", "type"),
    actionStatusGroups: await groups(client, actionItemIds, "action_items", "status::text"),
    interactionTypeGroups: await groups(client, crmInteractionIds, "crm_interactions", "interaction_type"),
    interactionResultGroups: await groups(client, crmInteractionIds, "crm_interactions", "result"),
    leadCreatedAt: await dateRange(client, leadIds, "leads", "created_at"),
    actionItemCreatedAt: await dateRange(client, actionItemIds, "action_items", "created_at"),
    samples: await sampleAmbiguousRecords(client, leadIds, contactIdsFromLeads, actionItemIds)
  };
}

async function safeLeadIds(client: PoolClient): Promise<string[]> {
  return ids(
    client,
    `select id
       from leads
      where ${importMarkerWhere(["source", "campaign", "final_conclusion", "loss_reason", "macro_reason", "micro_reason"])}
         or ${legacyWhere(["source", "campaign", "final_conclusion", "loss_reason", "macro_reason", "micro_reason"])}
         or id in (
              select lead_id
                from action_items
               where lead_id is not null
                 and (${importMarkerWhere(["type", "title", "reason", "recommended_action"])}
                      or ${legacyWhere(["type", "title", "reason", "recommended_action"])})
            )
         or id in (
              select lead_id
                from crm_interactions
               where lead_id is not null
                 and (${importMarkerWhere(["interaction_type", "result", "notes"])}
                      or ${legacyWhere(["interaction_type", "result", "notes"])})
            )`,
    [IMPORT_MARKER_PATTERNS, LEGACY_LABEL_PATTERNS]
  );
}

async function safeActionItemIds(client: PoolClient, leadIds: string[], contactIds: string[]): Promise<string[]> {
  return ids(
    client,
    `select id
       from action_items
      where lead_id = any($1::uuid[])
         or contact_id = any($2::uuid[])
         or ${importMarkerWhere(["type", "title", "reason", "recommended_action"], 3)}
         or (${noisyTypeWhere()} and ${importMarkerWhere(["title", "reason", "recommended_action"], 3)})`,
    [leadIds, contactIds, IMPORT_MARKER_PATTERNS]
  );
}

async function safeInteractionIds(client: PoolClient, leadIds: string[], contactIds: string[]): Promise<string[]> {
  return ids(
    client,
    `select id
       from crm_interactions
      where lead_id = any($1::uuid[])
         or contact_id = any($2::uuid[])
         or ${importMarkerWhere(["interaction_type", "result", "notes"], 3)}`,
    [leadIds, contactIds, IMPORT_MARKER_PATTERNS]
  );
}

async function safeMessageIds(client: PoolClient, contactIds: string[]): Promise<string[]> {
  return ids(
    client,
    `select id
       from messages
      where ${importMarkerWhere(["provider", "provider_message_id", "body"], 2)}
         or raw_payload::text ilike any($2::text[])
         or (contact_id = any($1::uuid[]) and raw_payload::text ilike any($2::text[]))`,
    [contactIds, IMPORT_MARKER_PATTERNS]
  );
}

async function safeConversationIds(client: PoolClient, contactIds: string[], messageIds: string[]): Promise<string[]> {
  return ids(
    client,
    `select c.id
       from conversations c
      where ${importMarkerWhere(["c.provider", "c.provider_conversation_id"], 3)}
         or (
              c.contact_id = any($1::uuid[])
              and not exists (
                select 1 from messages m
                 where m.conversation_id = c.id
                   and not (m.id = any($2::uuid[]))
              )
            )`,
    [contactIds, messageIds, IMPORT_MARKER_PATTERNS]
  );
}

async function safeContactIds(client: PoolClient, contactIds: string[], leadIds: string[]): Promise<string[]> {
  return ids(
    client,
    `select c.id
       from contacts c
      where c.id = any($1::uuid[])
        and not exists (select 1 from leads l where l.contact_id = c.id and not (l.id = any($2::uuid[])))
        and not exists (select 1 from conversations co where co.contact_id = c.id)
        and not exists (select 1 from messages m where m.contact_id = c.id)
        and not exists (select 1 from customers cu where cu.contact_id = c.id)
        and not exists (select 1 from pets p where p.contact_id = c.id)
        and not exists (select 1 from appointments a where a.contact_id = c.id)
        and not exists (select 1 from packages pk where pk.contact_id = c.id)`,
    [contactIds, leadIds]
  );
}

async function ambiguousCounts(
  client: PoolClient, leadIds: string[], contactIds: string[], actionItemIds: string[]
): Promise<TableCounts> {
  return {
    contacts: await count(
      client,
      `select count(*)::int as count
         from contacts c
        where c.id = any($1::uuid[])
          and (
            exists (select 1 from leads l where l.contact_id = c.id and not (l.id = any($2::uuid[])))
            or exists (select 1 from conversations co where co.contact_id = c.id)
            or exists (select 1 from messages m where m.contact_id = c.id)
            or exists (select 1 from customers cu where cu.contact_id = c.id)
            or exists (select 1 from pets p where p.contact_id = c.id)
          )`,
      [contactIds, leadIds]
    ),
    leads: await count(
      client,
      `select count(*)::int as count
         from leads
        where not (id = any($1::uuid[]))
          and (${legacyWhere(["source", "campaign", "final_conclusion", "loss_reason", "macro_reason", "micro_reason"], 2)})`,
      [leadIds, LEGACY_LABEL_PATTERNS]
    ),
    actionItems: await count(
      client,
      `select count(*)::int as count
         from action_items
        where not (id = any($1::uuid[]))
          and (type = any($2::text[]) or ${legacyWhere(["type", "title", "reason", "recommended_action"], 3)})`,
      [actionItemIds, NOISY_ACTION_TYPES, LEGACY_LABEL_PATTERNS]
    ),
    crmInteractions: 0,
    conversations: 0,
    messages: 0
  };
}

async function groups(
  client: PoolClient,
  tableIds: string[],
  tableName: "leads" | "action_items" | "crm_interactions",
  expression: string
): Promise<CountByLabel[]> {
  if (tableIds.length === 0) return [];
  const result = await client.query<CountByLabel>(
    `select coalesce(${expression}, '(null)') as label, count(*)::int as count
       from ${tableName}
      where id = any($1::uuid[])
      group by 1
      order by count desc, label asc
      limit 20`,
    [tableIds]
  );
  return result.rows;
}

async function dateRange(
  client: PoolClient,
  tableIds: string[],
  tableName: "leads" | "action_items",
  column: string
): Promise<DateRange> {
  if (tableIds.length === 0) return { min: null, max: null };
  const result = await client.query<{ min: Date | null; max: Date | null }>(
    `select min(${column}) as min, max(${column}) as max from ${tableName} where id = any($1::uuid[])`,
    [tableIds]
  );
  return { min: toIso(result.rows[0]?.min ?? null), max: toIso(result.rows[0]?.max ?? null) };
}

async function ids(client: PoolClient, queryText: string, params: unknown[]): Promise<string[]> {
  const result = await client.query<{ id: string }>(queryText, params);
  return [...new Set(result.rows.map((row) => row.id).filter(Boolean))];
}

async function count(client: PoolClient, queryText: string, params: unknown[]): Promise<number> {
  const result = await client.query<{ count: number }>(queryText, params);
  return Number(result.rows[0]?.count ?? 0);
}

function importMarkerWhere(columns: string[], paramIndex = 1): string {
  return columns
    .map((column) => `coalesce(${column}, '') ilike any($${paramIndex}::text[])`)
    .join(" or ");
}

function legacyWhere(columns: string[], paramIndex = 2): string {
  return columns
    .map((column) => `coalesce(${column}, '') ilike any($${paramIndex}::text[])`)
    .join(" or ");
}

function noisyTypeWhere(): string {
  return `type = any(array[${NOISY_ACTION_TYPES.map((value) => `'${value}'`).join(", ")}]::text[])`;
}

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}
