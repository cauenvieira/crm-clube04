import { asArray, asRecord, asString, assert, assertStatus, request } from "./smoke-api-helpers.js";

type InboundCreateParams = {
  apiBaseUrl: string;
  apiSecret: string | undefined;
  runId: string;
  sourceMarker: string;
  contactName: string;
};

export type InboundCreateResult = {
  contactId: string;
  leadId: string;
  providerConversationId: string;
  fromNumber: string;
  providerMessageId: string;
  conversationId: string;
};

type InboundIdempotencyParams = {
  apiBaseUrl: string;
  apiSecret: string | undefined;
  providerMessageId: string;
  providerConversationId: string;
  fromNumber: string;
  contactId: string;
  runId: string;
  sourceMarker: string;
  contactName: string;
};

export async function runWhatsappInboundCreate(
  params: InboundCreateParams
): Promise<InboundCreateResult> {
  const stamp = Date.now();
  const conversationToken = `${String(stamp).slice(-6)}${Math.floor(Math.random() * 1000)}`;
  const payload = {
    provider: "waha",
    providerMessageId: `wh-smoke-msg-${params.runId}-${stamp}`,
    providerConversationId: `55119999${conversationToken}`,
    fromNumber: `55119999${conversationToken}`,
    toNumber: "5511470000000",
    contactName: params.contactName,
    body: "Ola, gostaria de saber valores de banho",
    messageType: "text",
    direction: "inbound",
    timestamp: new Date().toISOString(),
    source: "whatsapp",
    campaign: params.sourceMarker,
    rawPayload: { source: params.sourceMarker, testRunId: params.runId }
  };

  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
    "POST",
    "/api/webhooks/whatsapp/inbound",
    { body: payload }
  );
  assertStatus(response, 201);

  const data = asRecord(asRecord(response.body).data);
  const created = asRecord(data.created);

  assert(created.message === true, "Webhook inbound inicial deveria criar mensagem");
  assert(created.lead === true, "Webhook inbound inicial deveria criar lead");

  return {
    contactId: asString(asRecord(data.contact).id, "webhook.contact.id"),
    leadId: asString(asRecord(data.lead).id, "webhook.lead.id"),
    providerConversationId: payload.providerConversationId,
    fromNumber: payload.fromNumber,
    providerMessageId: payload.providerMessageId,
    conversationId: asString(asRecord(data.conversation).id, "webhook.conversation.id")
  };
}

export async function runWhatsappInboundIdempotency(
  params: InboundIdempotencyParams
): Promise<void> {
  const payload = {
    provider: "waha",
    providerMessageId: params.providerMessageId,
    providerConversationId: params.providerConversationId,
    fromNumber: params.fromNumber,
    toNumber: "5511470000000",
    contactName: params.contactName,
    body: "Mensagem repetida",
    messageType: "text",
    direction: "inbound",
    timestamp: new Date().toISOString(),
    source: "whatsapp",
    campaign: params.sourceMarker,
    rawPayload: { source: params.sourceMarker, testRunId: params.runId }
  };

  const response = await request(
    params.apiBaseUrl,
    params.apiSecret,
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
    const list = await request(params.apiBaseUrl, params.apiSecret, "GET", `/api/leads?status=${status}`);
    assertStatus(list, 200);
    const leads = asArray(asRecord(list.body).data);
    activeLeadsForContact += leads.filter((lead) => asRecord(lead).contact_id === params.contactId).length;
  }

  assert(
    activeLeadsForContact <= 1,
    `Esperava no maximo 1 lead ativo para o contato do webhook, encontrou ${activeLeadsForContact}`
  );
}
