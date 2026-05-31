import type { PoolClient } from "pg";

const marker = "dev_seed_dashboard";
const toNumber = "5511470000000";

type SeedContact = { id: string; phone: string };
type SeedLead = { id: string };
type SeedConversation = { id: string };

export async function cleanupDashboardSeed(client: PoolClient) {
  const contacts = await selectIds(
    client,
    `
      select id from contacts
      where source = $1 or name ilike 'Dev Seed %'
    `,
    [marker]
  );

  const leads = await selectIds(
    client,
    `
      select id from leads
      where source = $1 or campaign = $1 or contact_id = any($2::uuid[])
    `,
    [marker, contacts]
  );

  const conversations = await selectIds(
    client,
    `
      select id from conversations
      where provider_conversation_id like 'dev-seed-conv-%' or contact_id = any($1::uuid[])
    `,
    [contacts]
  );

  const messages = await selectIds(
    client,
    `
      select id from messages
      where provider_message_id like 'dev-seed-msg-%'
         or conversation_id = any($1::uuid[])
         or contact_id = any($2::uuid[])
    `,
    [conversations, contacts]
  );

  const actionItems = await selectIds(
    client,
    `
      select id from action_items
      where type like 'dev_seed_%' or lead_id = any($1::uuid[]) or contact_id = any($2::uuid[])
    `,
    [leads, contacts]
  );

  const interactions = await selectIds(
    client,
    `
      select id from crm_interactions
      where interaction_type = 'dev_seed_dashboard'
         or lead_id = any($1::uuid[])
         or contact_id = any($2::uuid[])
    `,
    [leads, contacts]
  );

  await client.query("delete from messages where id = any($1::uuid[])", [messages]);
  await client.query("delete from crm_interactions where id = any($1::uuid[])", [interactions]);
  await client.query("delete from action_items where id = any($1::uuid[])", [actionItems]);
  await client.query("delete from conversations where id = any($1::uuid[])", [conversations]);
  await client.query("delete from leads where id = any($1::uuid[])", [leads]);
  await client.query("delete from contacts where id = any($1::uuid[])", [contacts]);
}

export async function createDashboardSeed(client: PoolClient) {
  const now = Date.now();
  const plusMinutes = (value: number) => new Date(now + value * 60 * 1000).toISOString();
  const minusMinutes = (value: number) => new Date(now - value * 60 * 1000).toISOString();
  const minusHours = (value: number) => new Date(now - value * 60 * 60 * 1000).toISOString();

  const contactA = await insertContact(client, "Dev Seed A", `551199000${String(now).slice(-6)}`);
  const contactB = await insertContact(client, "Dev Seed B", `551199100${String(now).slice(-6)}`);
  const contactC = await insertContact(client, "Dev Seed C", `551199200${String(now).slice(-6)}`);

  const leadA = await insertLead(client, contactA.id, "novo_lead", null, null);
  const leadB = await insertLead(
    client,
    contactB.id,
    "em_atendimento",
    minusHours(12),
    minusMinutes(45)
  );
  const leadC = await insertLead(client, contactC.id, "aguardando_resposta", minusHours(30), null);

  const conversationA = await insertConversation(client, contactA.id, "dev-seed-conv-a");
  const conversationB = await insertConversation(client, contactB.id, "dev-seed-conv-b");

  await insertInboundMessage(
    client,
    conversationA.id,
    contactA.id,
    contactA.phone,
    "dev-seed-msg-a",
    "Dev seed inbound mensagem A",
    minusMinutes(10)
  );
  await insertInboundMessage(
    client,
    conversationB.id,
    contactB.id,
    contactB.phone,
    "dev-seed-msg-b",
    "Dev seed inbound mensagem B",
    minusMinutes(5)
  );

  await insertActionItem(
    client,
    "dev_seed_follow_up_lead",
    3,
    leadA.id,
    contactA.id,
    "Dev Seed responder novo lead",
    "lead novo",
    minusMinutes(2),
    "pendente",
    null
  );
  await insertActionItem(
    client,
    "dev_seed_follow_up_agendado",
    2,
    leadB.id,
    contactB.id,
    "Dev Seed follow up vencido",
    "next_action_at vencido",
    minusMinutes(30),
    "pendente",
    null
  );
  await insertActionItem(
    client,
    "dev_seed_lead_sem_interacao",
    2,
    leadC.id,
    contactC.id,
    "Dev Seed retomar lead sem interacao",
    "sem interacao 24h",
    plusMinutes(30),
    "pendente",
    null
  );
  await insertActionItem(
    client,
    "dev_seed_concluido",
    1,
    leadB.id,
    contactB.id,
    "Dev Seed acao concluida hoje",
    "status concluido para card",
    minusMinutes(90),
    "concluido",
    minusMinutes(20)
  );
  await insertActionItem(
    client,
    "dev_seed_ignorado",
    1,
    leadC.id,
    contactC.id,
    "Dev Seed acao ignorada hoje",
    "status ignorado para card",
    minusMinutes(120),
    "ignorado",
    minusMinutes(15)
  );

  return { contacts: 3, leads: 3, conversations: 2, messages: 2, actionItems: 5 };
}

async function insertContact(client: PoolClient, name: string, normalizedPhone: string): Promise<SeedContact> {
  const result = await client.query<{ id: string; normalized_phone: string }>(
    `
      insert into contacts (name, phone, normalized_phone, source, type)
      values ($1, $2, $3, $4, 'lead')
      returning id, normalized_phone
    `,
    [name, normalizedPhone, normalizedPhone, marker]
  );
  return { id: result.rows[0].id, phone: result.rows[0].normalized_phone };
}

async function insertLead(
  client: PoolClient,
  contactId: string,
  status: "novo_lead" | "em_atendimento" | "aguardando_resposta",
  lastInteractionAt: string | null,
  nextActionAt: string | null
): Promise<SeedLead> {
  const result = await client.query<{ id: string }>(
    `
      insert into leads (
        contact_id,
        pet_name,
        service_interest,
        source,
        campaign,
        status,
        last_interaction_at,
        next_action_at
      )
      values ($1, 'Dev Seed Pet', 'banho', $2, $3, $4, $5, $6)
      returning id
    `,
    [contactId, marker, marker, status, lastInteractionAt, nextActionAt]
  );
  return { id: result.rows[0].id };
}

async function insertConversation(
  client: PoolClient,
  contactId: string,
  providerConversationId: string
): Promise<SeedConversation> {
  const result = await client.query<{ id: string }>(
    `
      insert into conversations (
        contact_id,
        channel,
        provider,
        provider_conversation_id,
        status,
        started_at,
        last_message_at
      )
      values ($1, 'whatsapp', 'manual', $2, 'open', now(), now())
      returning id
    `,
    [contactId, providerConversationId]
  );
  return { id: result.rows[0].id };
}

async function insertInboundMessage(
  client: PoolClient,
  conversationId: string,
  contactId: string,
  fromNumber: string,
  providerMessageId: string,
  body: string,
  timestamp: string
) {
  await client.query(
    `
      insert into messages (
        conversation_id,
        contact_id,
        provider,
        provider_message_id,
        direction,
        message_type,
        from_number,
        to_number,
        body,
        "timestamp",
        raw_payload
      )
      values ($1, $2, 'manual', $3, 'inbound', 'text', $4, $5, $6, $7, $8::jsonb)
    `,
    [
      conversationId,
      contactId,
      providerMessageId,
      fromNumber,
      toNumber,
      body,
      timestamp,
      JSON.stringify({ source: marker })
    ]
  );
}

async function insertActionItem(
  client: PoolClient,
  type: string,
  priority: number,
  leadId: string,
  contactId: string,
  title: string,
  reason: string,
  dueAt: string,
  status: "pendente" | "concluido" | "ignorado",
  completedAt: string | null
) {
  await client.query(
    `
      insert into action_items (
        type,
        priority,
        lead_id,
        contact_id,
        title,
        reason,
        due_at,
        status,
        completed_at
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [type, priority, leadId, contactId, title, reason, dueAt, status, completedAt]
  );
}

async function selectIds(client: PoolClient, sql: string, values: unknown[]): Promise<string[]> {
  const result = await client.query<{ id: string }>(sql, values);
  return result.rows.map((row) => row.id);
}
