import {
  asArray,
  asRecord,
  asString,
  assert,
  assertOneOfStatus,
  assertStatus,
  request,
  required
} from "./smoke-api-helpers.js";
import {
  assertActionItemsLifecycleStatuses,
  assertActionItemStatus,
  cancelActionItem,
  cancelActionItemIdempotency,
  completeActionItem,
  completeActionItemIdempotency,
  createCancelableActionItemForLead,
  createOpenFollowUpLeadActionItem,
  generateActionItemsCreate,
  generateActionItemsIdempotency
} from "./smoke-action-items.js";
import { runWhatsappInboundCreate, runWhatsappInboundIdempotency } from "./smoke-whatsapp-inbound.js";
import { buildRunPayloadSource, buildTestNote, buildTestPhone, buildTestTutorName } from "./test-support/test-data.js";
import { cleanupByRunId } from "./test-support/test-cleanup.js";
import { createTestRunContext } from "./test-support/test-run.js";

type TestContext = {
  contactId?: string;
  leadId?: string;
  manualLeadPhone?: string;
  manualLeadContactId?: string;
  manualLeadLeadId?: string;
  manualLeadActionItemId?: string;
  leadActionItemId?: string;
  cancelActionItemId?: string;
  autoCloseActionItemId?: string;
  conversationId?: string;
  providerMessageId?: string;
  webhookContactId?: string;
  webhookLeadId?: string;
  webhookProviderConversationId?: string;
  webhookFromNumber?: string;
};

const run = createTestRunContext("smoke:api", { requireApiSecret: false });
const apiBaseUrl = run.apiBaseUrl;
const apiSecret = run.apiSecret || undefined;
const sourceMarker = buildRunPayloadSource(run);

const context: TestContext = {};
const results: { name: string; ok: boolean; error?: string }[] = [];
let phoneIndex = 0;

const tests: Array<[string, () => Promise<void>]> = [
  ["GET /health sem header retorna 200", testHealth],
  ["GET /api/contacts sem header respeita protecao", testContactsWithoutHeader],
  ["POST /api/contacts com API key cria ou retorna contato", testCreateContact],
  ["POST /api/manual-leads cria lead manual", testCreateManualLead],
  ["POST /api/manual-leads repetido nao duplica lead ativo", testCreateManualLeadIdempotency],
  ["GET /api/leads/search encontra lead manual por telefone", testLeadSearch],
  ["POST /api/leads cria lead ligado ao contato", testCreateLead],
  ["POST /api/action-items/generate cria acao para novo lead", testGenerateActionItemsCreate],
  ["POST /api/action-items/generate repetido nao duplica acao aberta", testGenerateActionItemsIdempotency],
  ["POST /api/action-items/:id/complete conclui item", testCompleteActionItem],
  ["POST /api/action-items/:id/complete repetido e idempotente", testCompleteActionItemIdempotency],
  ["POST /api/action-items/:id/cancel cancela item", testCancelActionItem],
  ["POST /api/action-items/:id/cancel repetido e idempotente", testCancelActionItemIdempotency],
  ["GET /api/leads?status=novo_lead lista o lead criado", testListLeadByStatus],
  ["POST /api/conversations cria conversa", testCreateConversation],
  ["POST /api/messages cria mensagem", testCreateMessage],
  ["POST /api/messages repetido nao duplica", testMessageIdempotency],
  ["GET /api/conversations/:id/messages retorna uma mensagem", testConversationMessages],
  ["POST /api/crm-interactions fecha follow-up aberto do lead", testCreateCrmInteraction],
  ["GET /api/action-items retorna lista", testActionItems],
  ["POST /api/webhooks/whatsapp/inbound cria fluxo inbound", testWhatsappInboundCreate],
  ["POST /api/webhooks/whatsapp/inbound repetido e idempotente", testWhatsappInboundIdempotency]
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  try {
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
    if (failed.length > 0) process.exitCode = 1;
  } finally {
    const summary = await cleanupByRunId(run.runId);
    console.log(
      `Cleanup runId ${summary.runId}: messages=${summary.messages}, interactions=${summary.interactions}, action_items=${summary.actionItems}, conversations=${summary.conversations}, leads=${summary.leads}, contacts=${summary.contacts}`
    );
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
  const response = await request(apiBaseUrl, apiSecret, "POST", "/api/contacts", {
    body: {
      name: buildTestTutorName(run, "CONTACT"),
      phone: nextPhone(),
      source: sourceMarker,
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
      source: sourceMarker,
      campaign: sourceMarker,
      assigned_to: run.attendantMarker,
      status: "novo_lead"
    }
  });

  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  context.leadId = asString(data.id, "lead.id");
}

async function testCreateManualLead() {
  context.manualLeadPhone = nextPhone();
  const nextActionAt = getTomorrowYmd();

  const response = await request(apiBaseUrl, apiSecret, "POST", "/api/manual-leads", {
    body: {
      tutorName: buildTestTutorName(run, "MANUAL"),
      phone: required(context.manualLeadPhone, "manualLeadPhone"),
      entryMethod: sourceMarker,
      attendant: run.attendantMarker,
      nextAction: "fazer_follow_up",
      nextActionAt,
      serviceInterest: "banho",
      initialNote: buildTestNote(run, "smoke-manual-create")
    }
  });

  assertOneOfStatus(response, [200, 201]);
  const data = asRecord(asRecord(response.body).data);
  const created = asRecord(data.created);
  assert(created.lead === true, "Primeiro cadastro manual deveria criar lead");
  context.manualLeadContactId = asString(data.contact_id, "manual_lead.contact_id");
  context.manualLeadLeadId = asString(data.lead_id, "manual_lead.lead_id");
  context.manualLeadActionItemId = asString(data.action_item_id, "manual_lead.action_item_id");
}

async function testCreateManualLeadIdempotency() {
  const nextActionAt = getTomorrowYmd();

  const response = await request(apiBaseUrl, apiSecret, "POST", "/api/manual-leads", {
    body: {
      tutorName: buildTestTutorName(run, "MANUAL"),
      phone: required(context.manualLeadPhone, "manualLeadPhone"),
      entryMethod: sourceMarker,
      attendant: run.attendantMarker,
      nextAction: "fazer_follow_up",
      nextActionAt,
      serviceInterest: "banho",
      initialNote: buildTestNote(run, "smoke-manual-repeat")
    }
  });

  assertStatus(response, 200);
  const data = asRecord(asRecord(response.body).data);
  const duplicate = asRecord(data.duplicate);
  assert(
    duplicate.active_lead === true,
    "Cadastro manual repetido deveria sinalizar duplicate.active_lead=true"
  );
  assert(
    asString(data.lead_id, "manual_lead_repeat.lead_id") === required(context.manualLeadLeadId, "manualLeadLeadId"),
    "Cadastro manual repetido nao deveria criar novo lead_id"
  );
}

async function testLeadSearch() {
  const response = await request(
    apiBaseUrl,
    apiSecret,
    "GET",
    `/api/leads/search?phone=${required(context.manualLeadPhone, "manualLeadPhone")}`
  );
  assertStatus(response, 200);
  const data = asArray(asRecord(response.body).data);
  assert(data.length > 0, "Busca de lead manual deveria retornar ao menos 1 resultado");
  const first = asRecord(data[0]);
  const contact = asRecord(first.contact);
  assert(
    asString(contact.id, "lead_search.contact.id") === required(context.manualLeadContactId, "manualLeadContactId"),
    "Busca deveria incluir o contato manual recem-criado"
  );
}

async function testGenerateActionItemsCreate() {
  const result = await generateActionItemsCreate({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId")
  });
  context.leadActionItemId = result.actionItemId;
}

async function testGenerateActionItemsIdempotency() {
  await generateActionItemsIdempotency({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId")
  });
}

async function testCompleteActionItem() {
  await completeActionItem({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId"),
    actionItemId: required(context.leadActionItemId, "leadActionItemId")
  });
}

async function testCompleteActionItemIdempotency() {
  await completeActionItemIdempotency({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId"),
    actionItemId: required(context.leadActionItemId, "leadActionItemId")
  });
}

async function testCancelActionItem() {
  const cancelable = await createCancelableActionItemForLead({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId")
  });

  context.cancelActionItemId = cancelable.actionItemId;

  await cancelActionItem({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId"),
    actionItemId: required(context.cancelActionItemId, "cancelActionItemId")
  });
}

async function testCancelActionItemIdempotency() {
  await cancelActionItemIdempotency({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId"),
    actionItemId: required(context.cancelActionItemId, "cancelActionItemId")
  });

  const openForAutoClose = await createOpenFollowUpLeadActionItem({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId")
  });

  context.autoCloseActionItemId = openForAutoClose.actionItemId;
}

async function testListLeadByStatus() {
  const response = await request(apiBaseUrl, apiSecret, "GET", "/api/leads?status=novo_lead");
  assertStatus(response, 200);
  const data = asArray(asRecord(response.body).data);
  const found = data.some((item) => asRecord(item).id === context.leadId);
  assert(found, "Lead criado nao apareceu na listagem filtrada por status");
}

async function testCreateConversation() {
  const response = await request(apiBaseUrl, apiSecret, "POST", "/api/conversations", {
    body: {
      contact_id: required(context.contactId, "contactId"),
      channel: "whatsapp",
      provider: "manual",
      provider_conversation_id: `smoke-conv-${run.runId}-${Date.now()}`
    }
  });

  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  context.conversationId = asString(data.id, "conversation.id");
}

async function testCreateMessage() {
  context.providerMessageId = `smoke-msg-${run.runId}-${Date.now()}`;
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
      responsible: run.attendantMarker,
      result: "ok",
      notes: buildTestNote(run, "smoke-crm-interaction"),
      next_action_at: new Date(Date.now() + 86_400_000).toISOString(),
      increment_attempts: true
    }
  });

  assertStatus(response, 201);

  await assertActionItemStatus({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId"),
    actionItemId: required(context.autoCloseActionItemId, "autoCloseActionItemId"),
    expectedStatus: "concluido"
  });
}

async function testActionItems() {
  await assertActionItemsLifecycleStatuses({
    apiBaseUrl,
    apiSecret,
    leadId: required(context.leadId, "leadId"),
    completedFollowUpLeadIds: [
      required(context.leadActionItemId, "leadActionItemId"),
      required(context.autoCloseActionItemId, "autoCloseActionItemId")
    ],
    ignoredFollowUpScheduledId: required(context.cancelActionItemId, "cancelActionItemId")
  });
}

async function testWhatsappInboundCreate() {
  const result = await runWhatsappInboundCreate({
    apiBaseUrl,
    apiSecret,
    runId: run.runId,
    sourceMarker,
    contactName: buildTestTutorName(run, "WHATSAPP")
  });
  context.webhookContactId = result.contactId;
  context.webhookLeadId = result.leadId;
  context.webhookProviderConversationId = result.providerConversationId;
  context.webhookFromNumber = result.fromNumber;
  context.providerMessageId = result.providerMessageId;
  context.conversationId = result.conversationId;
}

async function testWhatsappInboundIdempotency() {
  await runWhatsappInboundIdempotency({
    apiBaseUrl,
    apiSecret,
    providerMessageId: required(context.providerMessageId, "providerMessageId"),
    providerConversationId: required(
      context.webhookProviderConversationId,
      "webhookProviderConversationId"
    ),
    fromNumber: required(context.webhookFromNumber, "webhookFromNumber"),
    contactId: required(context.webhookContactId, "webhookContactId"),
    runId: run.runId,
    sourceMarker,
    contactName: buildTestTutorName(run, "WHATSAPP")
  });
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
      raw_payload: { source: sourceMarker, testRunId: run.runId }
    }
  });
}

function nextPhone() {
  phoneIndex += 1;
  return buildTestPhone(run, phoneIndex);
}

function getTomorrowYmd() {
  const nextActionAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const yyyy = nextActionAt.getFullYear();
  const mm = String(nextActionAt.getMonth() + 1).padStart(2, "0");
  const dd = String(nextActionAt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
