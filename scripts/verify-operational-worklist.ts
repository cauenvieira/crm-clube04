import {
  asArray,
  asRecord,
  asString,
  assert,
  assertOneOfStatus,
  assertStatus,
  loadDotEnv,
  request
} from "./smoke-api-helpers.js";

loadDotEnv();

const apiBaseUrl = (process.env.API_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const apiSecret = process.env.CRM_API_SECRET?.trim();

type VerifyContext = {
  apiBaseUrl: string;
  apiSecret: string;
};

const results: Array<{ step: string; ok: boolean; error?: string }> = [];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  assert(apiSecret, "CRM_API_SECRET nao definido no ambiente/.env para verify:operational-worklist");
  const ctx: VerifyContext = { apiBaseUrl, apiSecret };

  const seed = await runStep("Criar contato e lead de teste", () => createLeadSeed(ctx));

  await runStep("Gerar action items para o lead de teste", async () => {
    const response = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/action-items/generate", {
      body: {}
    });
    assertStatus(response, 200);
  });

  await runStep("Criar conversa e mensagem inbound de teste", async () => {
    const conversation = await createConversation(ctx, seed.contactId, `worklist-conv-${Date.now()}`);
    await createInboundMessage(ctx, conversation.id);
  });

  await runStep("Validar payload base do operational-worklist", async () => {
    const payload = await getOperationalWorklist(ctx, 10);
    validateWorklistShape(payload, 10);
  });

  await runStep("Validar query limit=1", async () => {
    const payload = await getOperationalWorklist(ctx, 1);
    validateWorklistShape(payload, 1);
    ensureArraysRespectLimit(payload, 1);
  });

  const failed = results.filter((result) => !result.ok);
  console.log("");
  console.log(`Resumo verify:operational-worklist: ${results.length - failed.length}/${results.length} passos OK`);
  if (failed.length > 0) process.exitCode = 1;
}

async function runStep<T>(step: string, fn: () => Promise<T>): Promise<T> {
  try {
    const value = await fn();
    results.push({ step, ok: true });
    console.log(`OK - ${step}`);
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ step, ok: false, error: message });
    console.error(`ERRO - ${step}`);
    console.error(`  ${message}`);
    throw error;
  }
}

async function createLeadSeed(ctx: VerifyContext) {
  const stamp = Date.now();
  const contactResponse = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/contacts", {
    body: {
      name: "Verify Worklist",
      phone: `11955${Math.floor(Math.random() * 10_000)}${String(stamp).slice(-4)}`,
      source: "verify-operational-worklist",
      type: "lead"
    }
  });
  assertOneOfStatus(contactResponse, [200, 201]);
  const contact = asRecord(asRecord(contactResponse.body).contact);
  const contactId = asString(contact.id, "contact.id");

  const leadResponse = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/leads", {
    body: {
      contact_id: contactId,
      pet_name: "Pet Worklist",
      service_interest: "banho",
      source: "verify-operational-worklist",
      campaign: "verify-operational-worklist",
      status: "novo_lead"
    }
  });
  assertStatus(leadResponse, 201);
  const lead = asRecord(asRecord(leadResponse.body).data);
  const leadId = asString(lead.id, "lead.id");

  return { contactId, leadId };
}

async function createConversation(ctx: VerifyContext, contactId: string, providerConversationId: string) {
  const response = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/conversations", {
    body: {
      contact_id: contactId,
      channel: "whatsapp",
      provider: "manual",
      provider_conversation_id: providerConversationId
    }
  });
  assertStatus(response, 201);
  return asRecord(asRecord(response.body).data);
}

async function createInboundMessage(ctx: VerifyContext, conversationId: string) {
  const response = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/messages", {
    body: {
      conversation_id: conversationId,
      provider: "manual",
      provider_message_id: `worklist-msg-${Date.now()}`,
      direction: "inbound",
      message_type: "text",
      from_number: "11999990001",
      to_number: "1140000000",
      body: "verify worklist inbound",
      timestamp: new Date().toISOString(),
      raw_payload: { source: "verify-operational-worklist" }
    }
  });
  assertStatus(response, 201);
}

async function getOperationalWorklist(ctx: VerifyContext, limit: number) {
  const response = await request(
    ctx.apiBaseUrl,
    ctx.apiSecret,
    "GET",
    `/api/operational-worklist?limit=${limit}`
  );
  assertStatus(response, 200);
  return asRecord(response.body);
}

function validateWorklistShape(payload: Record<string, unknown>, expectedLimit: number) {
  const generatedAt = asString(payload.generatedAt, "generatedAt");
  assert(!Number.isNaN(new Date(generatedAt).getTime()), "generatedAt nao e ISO valido");
  assert(payload.timezone === "America/Sao_Paulo", "timezone deveria ser America/Sao_Paulo");

  const businessDate = asString(payload.businessDate, "businessDate");
  assert(/^\d{4}-\d{2}-\d{2}$/.test(businessDate), "businessDate nao esta em YYYY-MM-DD");
  assert(payload.limit === expectedLimit, `limit deveria ser ${expectedLimit}`);

  const actionItems = asRecord(payload.actionItems);
  const leads = asRecord(payload.leads);
  const messages = asRecord(payload.messages);

  asArray(actionItems.pendentes);
  asArray(actionItems.vencidos);
  asArray(leads.followUpVencido);
  asArray(leads.semInteracao24h);
  asArray(messages.ultimasInbound);
}

function ensureArraysRespectLimit(payload: Record<string, unknown>, limit: number) {
  const actionItems = asRecord(payload.actionItems);
  const leads = asRecord(payload.leads);
  const messages = asRecord(payload.messages);

  const arrays = [
    asArray(actionItems.pendentes),
    asArray(actionItems.vencidos),
    asArray(leads.followUpVencido),
    asArray(leads.semInteracao24h),
    asArray(messages.ultimasInbound)
  ];

  for (const list of arrays) {
    assert(list.length <= limit, `Lista retornou ${list.length} itens com limit=${limit}`);
  }
}
