import {
  asArray,
  asRecord,
  asString,
  assert,
  assertOneOfStatus,
  assertStatus,
  loadDotEnv,
  request,
  required
} from "./smoke-api-helpers.js";

type TestContext = {
  contactId?: string;
  leadId?: string;
  conversationId?: string;
  providerMessageId?: string;
  webhookContactId?: string;
  webhookLeadId?: string;
  webhookProviderConversationId?: string;
  webhookFromNumber?: string;
};

loadDotEnv();

const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const apiSecret = process.env.CRM_API_SECRET?.trim();
const context: TestContext = {};
const results: { name: string; ok: boolean; error?: string }[] = [];

const tests: Array<[string, () => Promise<void>]> = [
  ["GET /health sem header retorna 200", testHealth],
  ["GET /api/contacts sem header respeita protecao", testContactsWithoutHeader],
  ["POST /api/contacts com API key cria ou retorna contato", testCreateContact],
  ["POST /api/leads cria lead ligado ao contato", testCreateLead],
  ["GET /api/leads?status=novo_lead lista o lead criado", testListLeadByStatus],
  ["POST /api/conversations cria conversa", testCreateConversation],
  ["POST /api/messages cria mensagem", testCreateMessage],
  ["POST /api/messages repetido nao duplica", testMessageIdempotency],
  ["GET /api/conversations/:id/messages retorna uma mensagem", testConversationMessages],
  ["POST /api/crm-interactions registra interacao", testCreateCrmInteraction],
  ["GET /api/action-items retorna lista", testActionItems],
  ["POST /api/webhooks/whatsapp/inbound cria fluxo inbound", testWhatsappInboundCreate],
  ["POST /api/webhooks/whatsapp/inbound repetido e idempotente", testWhatsappInboundIdempotency]
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  for (const [name, test] of tests) {
    try {
      await test();
      results.push({ name, ok: true });
      console.log(`OK - ${name}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ name, ok: false, error: message });
      console.error(`ERRO - ${name}`);
      console.error(`  ${message}`);
    }
  }

  const failed = results.filter((result) => !result.ok);
  console.log("");
  console.log(`Resumo: ${results.length - failed.length}/${results.length} testes OK`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

async function testHealth() {
  const response = await request(apiBaseUrl, apiSecret, "GET", "/health", { auth: false });
  assertStatus(response, 200);
}

async function testContactsWithoutHeader() {
  const response = await request(apiBaseUrl, apiSecret, "GET", "/api/contacts", { auth: false });
  if (apiSecret) {
    assertStatus(response, 401);
  } else {
    assertStatus(response, 200);
  }
}

async function testCreateContact() {
  const stamp = Date.now();
  const response = await request(apiBaseUrl, apiSecret, "POST", "/api/contacts", {
    body: {
      name: "Smoke Test Tutor",
      phone: `1198888${stamp}`,
      source: "smoke-test",
      type: "lead"
    }
  });

  assertOneOfStatus(response, [200, 201]);
  const body = asRecord(response.body);
  const contact = asRecord(body.contact);
  context.contactId = asString(contact.id, "contact.id");
}

async function testCreateLead() {
  const response = await request(apiBaseUrl, apiSecret, "POST", "/api/leads", {
    body: {
      contact_id: required(context.contactId, "contactId"),
      pet_name: "Smoke",
      service_interest: "banho",
      source: "smoke-test",
      campaign: "smoke-api",
      status: "novo_lead"
    }
  });

  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  context.leadId = asString(data.id, "lead.id");
}

async function testListLeadByStatus() {
  const response = await request(apiBaseUrl, apiSecret, "GET", "/api/leads?status=novo_lead");
  assertStatus(response, 200);
  const data = asArray(asRecord(response.body).data);
  const found = data.some((item) => asRecord(item).id === context.leadId);
  assert(found, "Lead criado nao apareceu na listagem filtrada por status");
}

async function testCreateConversation() {
  const stamp = Date.now();
  const response = await request(apiBaseUrl, apiSecret, "POST", "/api/conversations", {
    body: {
      contact_id: required(context.contactId, "contactId"),
      channel: "whatsapp",
      provider: "manual",
      provider_conversation_id: `smoke-conv-${stamp}`
    }
  });

  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  context.conversationId = asString(data.id, "conversation.id");
}

async function testCreateMessage() {
  context.providerMessageId = `smoke-msg-${Date.now()}`;
  const response = await createSmokeMessage();
  assertStatus(response, 201);
  const body = asRecord(response.body);
  assert(body.created === true, "Primeira mensagem deveria retornar created:true");
}

async function testMessageIdempotency() {
  const response = await createSmokeMessage();
  assertStatus(response, 200);
  const body = asRecord(response.body);
  assert(body.created === false, "Mensagem repetida deveria retornar created:false");
}

async function testConversationMessages() {
  const response = await request(
    apiBaseUrl,
    apiSecret,
    "GET",
    `/api/conversations/${required(context.conversationId, "conversationId")}/messages`
  );
  assertStatus(response, 200);
  const messages = asArray(asRecord(response.body).data);
  const matching = messages.filter(
    (message) => asRecord(message).provider_message_id === context.providerMessageId
  );
  assert(matching.length === 1, `Esperava 1 mensagem idempotente, encontrou ${matching.length}`);
}

async function testCreateCrmInteraction() {
  const response = await request(apiBaseUrl, apiSecret, "POST", "/api/crm-interactions", {
    body: {
      contact_id: required(context.contactId, "contactId"),
      lead_id: required(context.leadId, "leadId"),
      interaction_type: "smoke_test",
      channel: "manual",
      responsible: "smoke",
      result: "ok",
      notes: "Smoke test automatizado",
      next_action_at: new Date(Date.now() + 86_400_000).toISOString(),
      increment_attempts: true
    }
  });

  assertStatus(response, 201);
}

async function testActionItems() {
  const response = await request(apiBaseUrl, apiSecret, "GET", "/api/action-items");
  assertStatus(response, 200);
  asArray(asRecord(response.body).data);
}

async function testWhatsappInboundCreate() {
  const stamp = Date.now();
  const payload = {
    provider: "waha",
    providerMessageId: `wh-smoke-msg-${stamp}`,
    providerConversationId: `55119999${stamp}`,
    fromNumber: `55119999${stamp}`,
    toNumber: "5511470000000",
    contactName: "Smoke WhatsApp",
    body: "Ola, gostaria de saber valores de banho",
    messageType: "text",
    direction: "inbound",
    timestamp: new Date().toISOString(),
    source: "whatsapp",
    campaign: "smoke_webhook",
    rawPayload: { source: "smoke-api-webhook" }
  };

  const response = await request(
    apiBaseUrl,
    apiSecret,
    "POST",
    "/api/webhooks/whatsapp/inbound",
    { body: payload }
  );
  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  const created = asRecord(data.created);

  assert(created.message === true, "Webhook inbound inicial deveria criar mensagem");
  assert(created.lead === true, "Webhook inbound inicial deveria criar lead");

  context.webhookContactId = asString(asRecord(data.contact).id, "webhook.contact.id");
  context.webhookLeadId = asString(asRecord(data.lead).id, "webhook.lead.id");
  context.webhookProviderConversationId = payload.providerConversationId;
  context.webhookFromNumber = payload.fromNumber;

  context.providerMessageId = payload.providerMessageId;
  context.conversationId = asString(asRecord(data.conversation).id, "webhook.conversation.id");
}

async function testWhatsappInboundIdempotency() {
  const providerMessageId = required(context.providerMessageId, "providerMessageId");
  const fromNumber = required(context.webhookFromNumber, "webhookFromNumber");

  const payload = {
    provider: "waha",
    providerMessageId,
    providerConversationId: required(
      context.webhookProviderConversationId,
      "webhookProviderConversationId"
    ),
    fromNumber,
    toNumber: "5511470000000",
    contactName: "Smoke WhatsApp",
    body: "Mensagem repetida",
    messageType: "text",
    direction: "inbound",
    timestamp: new Date().toISOString(),
    source: "whatsapp",
    campaign: "smoke_webhook",
    rawPayload: { source: "smoke-api-webhook-repeat" }
  };

  const response = await request(
    apiBaseUrl,
    apiSecret,
    "POST",
    "/api/webhooks/whatsapp/inbound",
    { body: payload }
  );
  assertStatus(response, 200);

  const data = asRecord(asRecord(response.body).data);
  const created = asRecord(data.created);
  assert(created.message === false, "Webhook inbound repetido nao deveria duplicar mensagem");
  assert(created.lead === false, "Webhook inbound repetido nao deveria criar novo lead ativo");

  const activeStatuses = [
    "novo_lead",
    "em_atendimento",
    "aguardando_resposta",
    "em_negociacao",
    "agendado",
    "reativar_depois"
  ];

  let activeLeadsForContact = 0;
  for (const status of activeStatuses) {
    const list = await request(apiBaseUrl, apiSecret, "GET", `/api/leads?status=${status}`);
    assertStatus(list, 200);
    const leads = asArray(asRecord(list.body).data);
    activeLeadsForContact += leads.filter(
      (lead) => asRecord(lead).contact_id === context.webhookContactId
    ).length;
  }

  assert(
    activeLeadsForContact <= 1,
    `Esperava no maximo 1 lead ativo para o contato do webhook, encontrou ${activeLeadsForContact}`
  );
}

async function createSmokeMessage() {
  return request(apiBaseUrl, apiSecret, "POST", "/api/messages", {
    body: {
      conversation_id: required(context.conversationId, "conversationId"),
      provider: "manual",
      provider_message_id: required(context.providerMessageId, "providerMessageId"),
      direction: "inbound",
      message_type: "text",
      from_number: "11999990001",
      to_number: "1140000000",
      body: "Smoke test mensagem",
      timestamp: new Date().toISOString(),
      raw_payload: { source: "smoke-api" }
    }
  });
}
