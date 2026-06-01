import type { PoolClient } from "pg";

import {
  type AmbiguousSample,
  assertLocalSafeEnvironment,
  closeDbContext,
  countQuery,
  createDbContext,
  formatCount,
  parseCliFlags,
  printAmbiguousSamples,
  printMode,
  requireApplyConfirmation,
  selectIds,
  uniqueIds
} from "./dev-data-helpers.js";

const explicitSourceMarkers = [
  "smoke-test",
  "smoke-api",
  "smoke_webhook",
  "verify-action-items",
  "verify-operational-summary",
  "verify-operational-worklist",
  "dev_seed_dashboard"
];

const explicitCampaignMarkers = [
  "smoke-api",
  "smoke_webhook",
  "verify-action-items",
  "verify-operational-summary",
  "verify-operational-worklist",
  "dev_seed_dashboard",
  "n8n_direct_test"
];

const explicitConversationPatterns = [
  "smoke-conv-%",
  "summary-conv-%",
  "worklist-conv-%",
  "wh-smoke-conv-%",
  "dev-seed-conv-%"
];

const explicitProviderMessagePatterns = [
  "smoke-msg-%",
  "wh-smoke-msg-%",
  "worklist-msg-%",
  "summary-msg-%",
  "dev-seed-msg-%",
  "n8n_test_%"
];

const explicitPayloadSourceMarkers = [
  ...explicitSourceMarkers,
  "powershell-direct-test",
  "n8n_direct_test"
];

const dynamicTestPrefix = "test_run:%";
const dynamicRunLike = "%crm_test_%";
const dynamicTutorPrefix = "TESTE_CRM_%";
const legacySmokeTutorPrefix = "Smoke Manual Lead%";
const dynamicNotePattern = "%TEST_RUN_ID=%";
const dynamicAttendantPrefix = "TESTE_AUTOMACAO_%";

type CleanupTargets = {
  contactIds: string[];
  leadIds: string[];
  conversationIds: string[];
  messageIds: string[];
  actionItemIds: string[];
  interactionIds: string[];
  blockedContactIds: string[];
};

type AmbiguousReport = {
  contacts: number;
  leads: number;
  messages: number;
  samples: {
    contacts: AmbiguousSample[];
    leads: AmbiguousSample[];
    messages: AmbiguousSample[];
  };
};

const { apply, confirmLocalDev } = parseCliFlags(process.argv);
const db = createDbContext();

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  requireApplyConfirmation(apply, confirmLocalDev);
  await assertLocalSafeEnvironment(db);
  printMode(apply);

  const client = await db.pool.connect();
  try {
    const targets = await collectTargets(client);
    const ambiguous = await collectAmbiguous(client, targets);
    printSummary(targets, ambiguous);

    if (!apply) {
      console.log("Dry-run finalizado. Nenhum dado foi apagado.");
      return;
    }

    await client.query("begin");
    await deleteTargets(client, targets);
    await client.query("commit");
    console.log("Cleanup aplicado com sucesso.");
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await closeDbContext(db);
  }
}

async function collectTargets(client: PoolClient): Promise<CleanupTargets> {
  const markerContactIds = await selectIds(
    client,
    `
      select id
      from contacts
      where source = any($1::text[])
         or source like $2
         or name like $3
         or name like $4
    `,
    [explicitSourceMarkers, dynamicTestPrefix, dynamicTutorPrefix, legacySmokeTutorPrefix]
  );

  const leadIds = await selectIds(
    client,
    `
      select id
      from leads
      where source = any($1::text[])
         or campaign = any($2::text[])
         or source like $3
         or campaign like $3
         or contact_id = any($4::uuid[])
    `,
    [explicitSourceMarkers, explicitCampaignMarkers, dynamicTestPrefix, markerContactIds]
  );

  const candidateContactIds = uniqueIds([
    ...markerContactIds,
    ...(await selectIds(
      client,
      "select distinct contact_id as id from leads where id = any($1::uuid[]) and contact_id is not null",
      [leadIds]
    ))
  ]);

  const safeContactIds = await selectIds(
    client,
    `
      select c.id
      from contacts c
      where c.id = any($1::uuid[])
        and not exists (
          select 1
          from leads l
          where l.contact_id = c.id
            and l.id <> all($2::uuid[])
        )
    `,
    [candidateContactIds, leadIds]
  );

  const conversationIds = uniqueIds([
    ...(await selectIds(
      client,
      `
        select id
        from conversations
        where provider_conversation_id ilike any($1::text[])
      `,
      [explicitConversationPatterns]
    )),
    ...(await selectIds(
      client,
      "select id from conversations where contact_id = any($1::uuid[])",
      [safeContactIds]
    ))
  ]);

  const messageIds = uniqueIds([
    ...(await selectIds(
      client,
      `
        select id
        from messages
      where provider_message_id ilike any($1::text[])
         or coalesce(raw_payload->>'source', '') = any($2::text[])
         or coalesce(raw_payload->>'testRunId', '') <> ''
         or coalesce(provider_message_id, '') ilike $3
      `,
      [explicitProviderMessagePatterns, explicitPayloadSourceMarkers, dynamicRunLike]
    )),
    ...(await selectIds(
      client,
      "select id from messages where conversation_id = any($1::uuid[])",
      [conversationIds]
    ))
  ]);

  const actionItemIds = await selectIds(
    client,
    `
      select id
      from action_items
      where type like 'dev_seed_%'
         or lead_id = any($1::uuid[])
         or (contact_id = any($2::uuid[]) and title ilike 'Dev Seed %')
         or (contact_id = any($2::uuid[]) and coalesce(reason, '') like 'manual_lead_entry:%')
         or coalesce(reason, '') like $3
         or coalesce(title, '') like $4
    `,
    [leadIds, safeContactIds, dynamicTestPrefix, dynamicTutorPrefix]
  );

  const interactionIds = await selectIds(
    client,
    `
      select id
      from crm_interactions
      where interaction_type in ('smoke_test', 'verify_action_items', 'dev_seed_dashboard')
         or responsible in ('smoke', 'verify-script', 'dev-seed')
         or lead_id = any($1::uuid[])
         or contact_id = any($2::uuid[])
         or responsible like $3
         or notes like $4
    `,
    [leadIds, safeContactIds, dynamicAttendantPrefix, dynamicNotePattern]
  );

  const deletableContactIds = await selectIds(
    client,
    `
      select c.id
      from contacts c
      where c.id = any($1::uuid[])
        and not exists (select 1 from leads l where l.contact_id = c.id and l.id <> all($2::uuid[]))
        and not exists (select 1 from conversations cv where cv.contact_id = c.id and cv.id <> all($3::uuid[]))
        and not exists (select 1 from messages m where m.contact_id = c.id and m.id <> all($4::uuid[]))
        and not exists (select 1 from action_items ai where ai.contact_id = c.id and ai.id <> all($5::uuid[]))
        and not exists (select 1 from crm_interactions ci where ci.contact_id = c.id and ci.id <> all($6::uuid[]))
    `,
    [candidateContactIds, leadIds, conversationIds, messageIds, actionItemIds, interactionIds]
  );

  return {
    contactIds: deletableContactIds,
    leadIds,
    conversationIds,
    messageIds,
    actionItemIds,
    interactionIds,
    blockedContactIds: candidateContactIds.filter((id) => !deletableContactIds.includes(id))
  };
}

async function collectAmbiguous(client: PoolClient, targets: CleanupTargets): Promise<AmbiguousReport> {
  const contacts = await countQuery(
    client,
    `
      select count(*)::int as count
      from contacts c
      where (
        c.name ilike '%teste%' or c.name ilike '%verify%'
        or c.source ilike '%test%' or c.source ilike '%verify%'
      )
      and c.id <> all($1::uuid[])
    `,
    [targets.contactIds]
  );

  const leads = await countQuery(
    client,
    `
      select count(*)::int as count
      from leads l
      where (
        l.campaign ilike '%test%' or l.campaign ilike '%verify%'
        or l.source ilike '%test%' or l.source ilike '%verify%'
      )
      and l.id <> all($1::uuid[])
    `,
    [targets.leadIds]
  );

  const messages = await countQuery(
    client,
    `
      select count(*)::int as count
      from messages m
      where (
        coalesce(m.provider_message_id, '') ilike '%test%'
        or coalesce(m.provider_message_id, '') ilike '%verify%'
        or coalesce(m.raw_payload->>'source', '') ilike '%test%'
        or coalesce(m.raw_payload->>'source', '') ilike '%verify%'
      )
      and m.id <> all($1::uuid[])
    `,
    [targets.messageIds]
  );

  const samples = {
    contacts: await selectContactAmbiguousSamples(client, targets.contactIds),
    leads: await selectLeadAmbiguousSamples(client, targets.leadIds),
    messages: await selectMessageAmbiguousSamples(client, targets.messageIds)
  };

  return { contacts, leads, messages, samples };
}

function printSummary(targets: CleanupTargets, ambiguous: AmbiguousReport) {
  console.log("Alvos explicitos de limpeza:");
  console.log(`- ${formatCount("messages", targets.messageIds.length)}`);
  console.log(`- ${formatCount("crm_interactions", targets.interactionIds.length)}`);
  console.log(`- ${formatCount("action_items", targets.actionItemIds.length)}`);
  console.log(`- ${formatCount("conversations", targets.conversationIds.length)}`);
  console.log(`- ${formatCount("leads", targets.leadIds.length)}`);
  console.log(`- ${formatCount("contacts", targets.contactIds.length)}`);
  console.log(`- ${formatCount("contacts_blocked_non_test_dependencies", targets.blockedContactIds.length)}`);
  console.log("");
  console.log("Registros ambiguos (somente reporte, sem apagar):");
  console.log(`- ${formatCount("contacts", ambiguous.contacts)}`);
  console.log(`- ${formatCount("leads", ambiguous.leads)}`);
  console.log(`- ${formatCount("messages", ambiguous.messages)}`);
  printAmbiguousSamples("contacts", ambiguous.samples.contacts);
  printAmbiguousSamples("leads", ambiguous.samples.leads);
  printAmbiguousSamples("messages", ambiguous.samples.messages);
}

async function deleteTargets(client: PoolClient, targets: CleanupTargets) {
  await client.query("delete from messages where id = any($1::uuid[])", [targets.messageIds]);
  await client.query("delete from crm_interactions where id = any($1::uuid[])", [targets.interactionIds]);
  await client.query("delete from action_items where id = any($1::uuid[])", [targets.actionItemIds]);
  await client.query("delete from conversations where id = any($1::uuid[])", [targets.conversationIds]);
  await client.query("delete from leads where id = any($1::uuid[])", [targets.leadIds]);
  await client.query("delete from contacts where id = any($1::uuid[])", [targets.contactIds]);
}

async function selectContactAmbiguousSamples(
  client: PoolClient,
  excludedIds: string[]
): Promise<AmbiguousSample[]> {
  const result = await client.query<{
    id: string;
    name: string | null;
    normalized_phone: string | null;
    source: string | null;
  }>(
    `
      select id, name, normalized_phone, source
      from contacts
      where (
        name ilike '%teste%' or name ilike '%verify%'
        or source ilike '%test%' or source ilike '%verify%'
      )
      and id <> all($1::uuid[])
      order by created_at desc
      limit 10
    `,
    [excludedIds]
  );
  return result.rows.map((row) => ({
    table: "contacts",
    id: row.id,
    name: row.name,
    phone: row.normalized_phone,
    source: row.source,
    reason: "name/source parece teste mas sem marcador explicito de remocao",
    suggestion: "review marker before deleting"
  }));
}

async function selectLeadAmbiguousSamples(
  client: PoolClient,
  excludedIds: string[]
): Promise<AmbiguousSample[]> {
  const result = await client.query<{
    id: string;
    source: string | null;
    campaign: string | null;
  }>(
    `
      select id, source, campaign
      from leads
      where (
        campaign ilike '%test%' or campaign ilike '%verify%'
        or source ilike '%test%' or source ilike '%verify%'
      )
      and id <> all($1::uuid[])
      order by created_at desc
      limit 10
    `,
    [excludedIds]
  );
  return result.rows.map((row) => ({
    table: "leads",
    id: row.id,
    source: row.source,
    campaign: row.campaign,
    reason: "source/campaign parece teste mas sem marcador explicito de remocao",
    suggestion: "review marker before deleting"
  }));
}

async function selectMessageAmbiguousSamples(
  client: PoolClient,
  excludedIds: string[]
): Promise<AmbiguousSample[]> {
  const result = await client.query<{
    id: string;
    provider: string | null;
    provider_message_id: string | null;
  }>(
    `
      select id, provider, provider_message_id
      from messages
      where (
        coalesce(provider_message_id, '') ilike '%test%'
        or coalesce(provider_message_id, '') ilike '%verify%'
        or coalesce(raw_payload->>'source', '') ilike '%test%'
        or coalesce(raw_payload->>'source', '') ilike '%verify%'
      )
      and id <> all($1::uuid[])
      order by created_at desc
      limit 10
    `,
    [excludedIds]
  );
  return result.rows.map((row) => ({
    table: "messages",
    id: row.id,
    provider: row.provider,
    providerMessageId: row.provider_message_id,
    reason: "provider_message_id/raw_payload parece teste mas sem marcador explicito de remocao",
    suggestion: "review marker before deleting"
  }));
}
