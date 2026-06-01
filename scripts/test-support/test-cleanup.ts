import type { PoolClient } from "pg";

import {
  assertLocalSafeEnvironment,
  closeDbContext,
  createDbContext,
  selectIds,
  uniqueIds
} from "../dev-data-helpers.js";

type CleanupSummary = {
  runId: string;
  messages: number;
  interactions: number;
  actionItems: number;
  conversations: number;
  leads: number;
  contacts: number;
};

type CleanupTargets = {
  contactIds: string[];
  leadIds: string[];
  conversationIds: string[];
  messageIds: string[];
  actionItemIds: string[];
  interactionIds: string[];
};

export async function cleanupByRunId(runId: string): Promise<CleanupSummary> {
  const db = createDbContext();
  await assertLocalSafeEnvironment(db);

  const client = await db.pool.connect();
  try {
    const targets = await collectTargets(client, runId);
    await client.query("begin");
    await deleteTargets(client, targets);
    await client.query("commit");

    return {
      runId,
      messages: targets.messageIds.length,
      interactions: targets.interactionIds.length,
      actionItems: targets.actionItemIds.length,
      conversations: targets.conversationIds.length,
      leads: targets.leadIds.length,
      contacts: targets.contactIds.length
    };
  } catch (error) {
    await client.query("rollback").catch(() => undefined);
    throw error;
  } finally {
    client.release();
    await closeDbContext(db);
  }
}

function buildMarkers(runId: string) {
  return {
    sourceMarker: `test_run:${runId}`,
    namePattern: `TESTE_CRM_${runId}%`,
    notePattern: `%TEST_RUN_ID=${runId}%`,
    runLikePattern: `%${runId}%`,
    attendantMarker: `TESTE_AUTOMACAO_${runId}`
  };
}

async function collectTargets(client: PoolClient, runId: string): Promise<CleanupTargets> {
  const markers = buildMarkers(runId);

  const explicitContactIds = await selectIds(
    client,
    `
      select id
      from contacts
      where source = $1
         or name ilike $2
    `,
    [markers.sourceMarker, markers.namePattern]
  );

  const leadIds = uniqueIds([
    ...(await selectIds(
      client,
      `
        select id
        from leads
        where source = $1
           or campaign = $1
           or assigned_to = $2
           or contact_id = any($3::uuid[])
      `,
      [markers.sourceMarker, markers.attendantMarker, explicitContactIds]
    )),
    ...(await selectIds(
      client,
      `
        select distinct lead_id as id
        from crm_interactions
        where lead_id is not null
          and (
            notes ilike $1
            or responsible = $2
          )
      `,
      [markers.notePattern, markers.attendantMarker]
    ))
  ]);

  const contactIds = uniqueIds([
    ...explicitContactIds,
    ...(await selectIds(
      client,
      `
        select distinct contact_id as id
        from leads
        where contact_id is not null
          and id = any($1::uuid[])
      `,
      [leadIds]
    )),
    ...(await selectIds(
      client,
      `
        select distinct contact_id as id
        from crm_interactions
        where contact_id is not null
          and (
            notes ilike $1
            or responsible = $2
          )
      `,
      [markers.notePattern, markers.attendantMarker]
    ))
  ]);

  const conversationIds = uniqueIds([
    ...(await selectIds(
      client,
      `
        select id
        from conversations
        where provider_conversation_id ilike $1
           or contact_id = any($2::uuid[])
      `,
      [markers.runLikePattern, contactIds]
    ))
  ]);

  const messageIds = uniqueIds([
    ...(await selectIds(
      client,
      `
        select id
        from messages
        where provider_message_id ilike $1
           or coalesce(raw_payload->>'testRunId', '') = $2
           or coalesce(raw_payload->>'source', '') = $3
           or conversation_id = any($4::uuid[])
           or contact_id = any($5::uuid[])
      `,
      [markers.runLikePattern, runId, markers.sourceMarker, conversationIds, contactIds]
    ))
  ]);

  const actionItemIds = uniqueIds([
    ...(await selectIds(
      client,
      `
        select id
        from action_items
        where lead_id = any($1::uuid[])
           or contact_id = any($2::uuid[])
           or coalesce(reason, '') ilike $3
           or coalesce(title, '') ilike $4
      `,
      [leadIds, contactIds, markers.runLikePattern, markers.namePattern]
    ))
  ]);

  const interactionIds = uniqueIds([
    ...(await selectIds(
      client,
      `
        select id
        from crm_interactions
        where lead_id = any($1::uuid[])
           or contact_id = any($2::uuid[])
           or notes ilike $3
           or responsible = $4
      `,
      [leadIds, contactIds, markers.notePattern, markers.attendantMarker]
    ))
  ]);

  const deletableContactIds = await selectIds(
    client,
    `
      select c.id
      from contacts c
      where c.id = any($1::uuid[])
        and not exists (
          select 1 from leads l where l.contact_id = c.id and l.id <> all($2::uuid[])
        )
        and not exists (
          select 1 from conversations cv where cv.contact_id = c.id and cv.id <> all($3::uuid[])
        )
        and not exists (
          select 1 from messages m where m.contact_id = c.id and m.id <> all($4::uuid[])
        )
        and not exists (
          select 1 from action_items ai where ai.contact_id = c.id and ai.id <> all($5::uuid[])
        )
        and not exists (
          select 1 from crm_interactions ci where ci.contact_id = c.id and ci.id <> all($6::uuid[])
        )
    `,
    [contactIds, leadIds, conversationIds, messageIds, actionItemIds, interactionIds]
  );

  return {
    contactIds: deletableContactIds,
    leadIds,
    conversationIds,
    messageIds,
    actionItemIds,
    interactionIds
  };
}

async function deleteTargets(client: PoolClient, targets: CleanupTargets) {
  await client.query("delete from messages where id = any($1::uuid[])", [targets.messageIds]);
  await client.query("delete from crm_interactions where id = any($1::uuid[])", [targets.interactionIds]);
  await client.query("delete from action_items where id = any($1::uuid[])", [targets.actionItemIds]);
  await client.query("delete from conversations where id = any($1::uuid[])", [targets.conversationIds]);
  await client.query("delete from leads where id = any($1::uuid[])", [targets.leadIds]);
  await client.query("delete from contacts where id = any($1::uuid[])", [targets.contactIds]);
}
