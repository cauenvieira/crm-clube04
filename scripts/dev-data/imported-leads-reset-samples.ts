import type { PoolClient } from "pg";

import {
  LEGACY_LABEL_PATTERNS,
  NOISY_ACTION_TYPES,
  type Sample
} from "./imported-leads-reset-types.js";

export async function sampleAmbiguousRecords(
  client: PoolClient,
  leadIds: string[],
  contactIds: string[],
  actionItemIds: string[]
): Promise<Sample[]> {
  const contactSamples = await sampleRows(
    client,
    `select 'contacts' as "table", c.id::text as id, null::text as source, null::text as campaign,
            null::text as status, null::text as type, null::text as outcome,
            null::text as provider, null::text as provider_message_id,
            'linked import contact has non-import dependency' as reason
       from contacts c
      where c.id = any($1::uuid[])
        and (
          exists (select 1 from leads l where l.contact_id = c.id and not (l.id = any($2::uuid[])))
          or exists (select 1 from conversations co where co.contact_id = c.id)
          or exists (select 1 from messages m where m.contact_id = c.id)
          or exists (select 1 from customers cu where cu.contact_id = c.id)
          or exists (select 1 from pets p where p.contact_id = c.id)
        )
      limit 10`,
    [contactIds, leadIds]
  );
  const leadSamples = await sampleRows(
    client,
    `select 'leads' as "table", id::text, source, campaign, status::text, null::text as type,
            final_conclusion as outcome, null::text as provider, null::text as provider_message_id,
            'legacy/import label needs review before deleting' as reason
       from leads
      where not (id = any($1::uuid[]))
        and (${legacyWhere(["source", "campaign", "final_conclusion", "loss_reason", "macro_reason", "micro_reason"], 2)})
      limit 10`,
    [leadIds, LEGACY_LABEL_PATTERNS]
  );
  const actionSamples = await sampleRows(
    client,
    `select 'action_items' as "table", id::text, null::text as source, null::text as campaign,
            status::text, type, recommended_action as outcome, null::text as provider,
            null::text as provider_message_id,
            'noisy action item not selected by explicit import marker' as reason
       from action_items
      where not (id = any($1::uuid[]))
        and (type = any($2::text[]) or ${legacyWhere(["type", "title", "reason", "recommended_action"], 3)})
      limit 10`,
    [actionItemIds, NOISY_ACTION_TYPES, LEGACY_LABEL_PATTERNS]
  );

  return [...contactSamples, ...leadSamples, ...actionSamples].slice(0, 20);
}

function legacyWhere(columns: string[], paramIndex: number): string {
  return columns
    .map((column) => `coalesce(${column}, '') ilike any($${paramIndex}::text[])`)
    .join(" or ");
}

async function sampleRows(client: PoolClient, queryText: string, params: unknown[]): Promise<Sample[]> {
  const result = await client.query<{
    table: string;
    id: string;
    reason: string;
    source: string | null;
    campaign: string | null;
    status: string | null;
    type: string | null;
    outcome: string | null;
    provider: string | null;
    provider_message_id: string | null;
  }>(queryText, params);

  return result.rows.map((row) => ({
    table: row.table,
    id: row.id.slice(0, 8),
    reason: row.reason,
    source: row.source,
    campaign: row.campaign,
    status: row.status,
    type: row.type,
    outcome: row.outcome,
    provider: row.provider,
    providerMessageId: row.provider_message_id ? shortText(row.provider_message_id) : null
  }));
}

function shortText(value: string): string {
  return value.length > 16 ? `${value.slice(0, 16)}...` : value;
}
