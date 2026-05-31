import type { PoolClient } from "pg";

import {
  assertLocalSafeEnvironment,
  closeDbContext,
  createDbContext,
  formatCount,
  parseCliFlags,
  printMode,
  requireApplyConfirmation
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
  "dev_seed_dashboard"
];

const explicitContactNamePatterns = [
  "Smoke Test%",
  "Smoke WhatsApp%",
  "Verify %",
  "Tutor Teste API%",
  "Dev Seed %"
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

type CleanupTargets = {
  contactIds: string[];
  leadIds: string[];
  conversationIds: string[];
  messageIds: string[];
  actionItemIds: string[];
  interactionIds: string[];
};

type AmbiguousReport = {
  contacts: number;
  leads: number;
  messages: number;
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
  const contactIds = await selectIds(
    client,
    `
      select id
      from contacts
      where source = any($1::text[])
         or name ilike any($2::text[])
    `,
    [explicitSourceMarkers, explicitContactNamePatterns]
  );

  const leadIds = await selectIds(
    client,
    `
      select id
      from leads
      where source = any($1::text[])
         or campaign = any($2::text[])
         or contact_id = any($3::uuid[])
    `,
    [explicitSourceMarkers, explicitCampaignMarkers, contactIds]
  );

  const conversationIds = await selectIds(
    client,
    `
      select id
      from conversations
      where provider_conversation_id ilike any($1::text[])
         or contact_id = any($2::uuid[])
    `,
    [explicitConversationPatterns, contactIds]
  );

  const messageIds = await selectIds(
    client,
    `
      select id
      from messages
      where provider_message_id ilike any($1::text[])
         or coalesce(raw_payload->>'source', '') = any($2::text[])
         or contact_id = any($3::uuid[])
         or conversation_id = any($4::uuid[])
    `,
    [explicitProviderMessagePatterns, explicitSourceMarkers, contactIds, conversationIds]
  );

  const actionItemIds = await selectIds(
    client,
    `
      select id
      from action_items
      where type like 'dev_seed_%'
         or lead_id = any($1::uuid[])
         or contact_id = any($2::uuid[])
         or title ilike 'Dev Seed %'
    `,
    [leadIds, contactIds]
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
    `,
    [leadIds, contactIds]
  );

  return { contactIds, leadIds, conversationIds, messageIds, actionItemIds, interactionIds };
}

async function collectAmbiguous(client: PoolClient, targets: CleanupTargets): Promise<AmbiguousReport> {
  const contacts = await countQuery(
    client,
    `
      select count(*)::int as count
      from contacts
      where (
        name ilike '%test%'
        or name ilike '%verify%'
        or coalesce(source, '') ilike '%test%'
        or coalesce(source, '') ilike '%verify%'
      )
      and id <> all($1::uuid[])
    `,
    [targets.contactIds]
  );

  const leads = await countQuery(
    client,
    `
      select count(*)::int as count
      from leads
      where (
        coalesce(source, '') ilike '%test%'
        or coalesce(source, '') ilike '%verify%'
        or coalesce(campaign, '') ilike '%test%'
        or coalesce(campaign, '') ilike '%verify%'
      )
      and id <> all($1::uuid[])
    `,
    [targets.leadIds]
  );

  const messages = await countQuery(
    client,
    `
      select count(*)::int as count
      from messages
      where (
        coalesce(provider_message_id, '') ilike '%test%'
        or coalesce(provider_message_id, '') ilike '%verify%'
        or coalesce(raw_payload->>'source', '') ilike '%test%'
        or coalesce(raw_payload->>'source', '') ilike '%verify%'
      )
      and id <> all($1::uuid[])
    `,
    [targets.messageIds]
  );

  return { contacts, leads, messages };
}

function printSummary(targets: CleanupTargets, ambiguous: AmbiguousReport) {
  console.log("Alvos explicitos de limpeza:");
  console.log(`- ${formatCount("messages", targets.messageIds.length)}`);
  console.log(`- ${formatCount("crm_interactions", targets.interactionIds.length)}`);
  console.log(`- ${formatCount("action_items", targets.actionItemIds.length)}`);
  console.log(`- ${formatCount("conversations", targets.conversationIds.length)}`);
  console.log(`- ${formatCount("leads", targets.leadIds.length)}`);
  console.log(`- ${formatCount("contacts", targets.contactIds.length)}`);
  console.log("");
  console.log("Registros ambiguos (somente reporte, sem apagar):");
  console.log(`- ${formatCount("contacts", ambiguous.contacts)}`);
  console.log(`- ${formatCount("leads", ambiguous.leads)}`);
  console.log(`- ${formatCount("messages", ambiguous.messages)}`);
}

async function deleteTargets(client: PoolClient, targets: CleanupTargets) {
  await client.query("delete from messages where id = any($1::uuid[])", [targets.messageIds]);
  await client.query("delete from crm_interactions where id = any($1::uuid[])", [targets.interactionIds]);
  await client.query("delete from action_items where id = any($1::uuid[])", [targets.actionItemIds]);
  await client.query("delete from conversations where id = any($1::uuid[])", [targets.conversationIds]);
  await client.query("delete from leads where id = any($1::uuid[])", [targets.leadIds]);
  await client.query("delete from contacts where id = any($1::uuid[])", [targets.contactIds]);
}

async function selectIds(client: PoolClient, queryText: string, params: unknown[]): Promise<string[]> {
  const result = await client.query<{ id: string }>(queryText, params);
  return result.rows.map((row) => row.id);
}

async function countQuery(client: PoolClient, queryText: string, params: unknown[]): Promise<number> {
  const result = await client.query<{ count: number }>(queryText, params);
  return Number(result.rows[0]?.count ?? 0);
}
