import {
  asArray,
  asRecord,
  asString,
  assert,
  assertOneOfStatus,
  assertStatus,
  request
} from "./smoke-api-helpers.js";
import { buildRunPayloadSource, buildTestPhone, buildTestTutorName } from "./test-support/test-data.js";
import { cleanupByRunId } from "./test-support/test-cleanup.js";
import { createTestRunContext } from "./test-support/test-run.js";

type VerifyContext = {
  apiBaseUrl: string;
  apiSecret: string;
};

const run = createTestRunContext("verify:operational-summary");
const sourceMarker = buildRunPayloadSource(run);
const results: Array<{ step: string; ok: boolean; error?: string }> = [];
let phoneIndex = 0;

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  const ctx: VerifyContext = { apiBaseUrl: run.apiBaseUrl, apiSecret: run.apiSecret };

  try {
    const completeSeed = await runStep("Criar lead para item concluido", () =>
      createLeadSeed(ctx, "SUMMARY_COMPLETE")
    );

    await runStep("Gerar e concluir um action_item", async () => {
      await generateActionItems(ctx);
      const pending = await findActionItem(ctx, completeSeed.leadId, "follow_up_lead", "pendente");
      await completeActionItem(ctx, pending.id);
    });

    const pendingSeed = await runStep("Criar lead para item pendente", () =>
      createLeadSeed(ctx, "SUMMARY_PENDING")
    );

    await runStep("Gerar um action_item pendente", async () => {
      await generateActionItems(ctx);
      await findActionItem(ctx, pendingSeed.leadId, "follow_up_lead", "pendente");
    });

    await runStep("Criar mensagem inbound de hoje", async () => {
      const conversation = await createConversation(
        ctx,
        pendingSeed.contactId,
        `summary-conv-${run.runId}-${Date.now()}`
      );
      await createInboundMessage(ctx, conversation.id);
    });

    await runStep("Validar payload do resumo operacional", async () => {
      const summary = await getOperationalSummary(ctx);
      validateSummaryShape(summary);
    });

    const failed = results.filter((result) => !result.ok);
    console.log("");
    console.log(`Resumo verify:operational-summary: ${results.length - failed.length}/${results.length} passos OK`);
    if (failed.length > 0) process.exitCode = 1;
  } finally {
    const summary = await cleanupByRunId(run.runId);
    console.log(
      `Cleanup runId ${summary.runId}: messages=${summary.messages}, interactions=${summary.interactions}, action_items=${summary.actionItems}, conversations=${summary.conversations}, leads=${summary.leads}, contacts=${summary.contacts}`
    );
  }
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

async function createLeadSeed(ctx: VerifyContext, label: string) {
  const contactResponse = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/contacts", {
    body: {
      name: buildTestTutorName(run, label),
      phone: nextPhone(),
      source: sourceMarker,
      type: "lead"
    }
  });
  assertOneOfStatus(contactResponse, [200, 201]);
  const contact = asRecord(asRecord(contactResponse.body).contact);
  const contactId = asString(contact.id, "contact.id");

  const leadResponse = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/leads", {
    body: {
      contact_id: contactId,
      pet_name: `Pet ${label}`,
      service_interest: "banho",
      source: sourceMarker,
      campaign: sourceMarker,
      assigned_to: run.attendantMarker,
      status: "novo_lead"
    }
  });
  assertStatus(leadResponse, 201);
  const lead = asRecord(asRecord(leadResponse.body).data);
  const leadId = asString(lead.id, "lead.id");
  return { contactId, leadId };
}

async function generateActionItems(ctx: VerifyContext) {
  const response = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/action-items/generate", {
    body: {}
  });
  assertStatus(response, 200);
}

async function findActionItem(
  ctx: VerifyContext,
  leadId: string,
  type: string,
  status: "pendente" | "concluido"
) {
  const response = await request(
    ctx.apiBaseUrl,
    ctx.apiSecret,
    "GET",
    `/api/action-items?lead_id=${leadId}&type=${type}&status=${status}&limit=100`
  );
  assertStatus(response, 200);
  const items = asArray(asRecord(response.body).data);
  assert(items.length > 0, `Nenhum action_item encontrado para lead=${leadId} status=${status}`);
  return asRecord(items[0]);
}

async function completeActionItem(ctx: VerifyContext, actionItemId: string) {
  const response = await request(
    ctx.apiBaseUrl,
    ctx.apiSecret,
    "POST",
    `/api/action-items/${actionItemId}/complete`,
    { body: {} }
  );
  assertStatus(response, 200);
  const item = asRecord(asRecord(response.body).data);
  assert(item.status === "concluido", "Action item nao ficou concluido");
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
      provider_message_id: `summary-msg-${run.runId}-${Date.now()}`,
      direction: "inbound",
      message_type: "text",
      from_number: "11999990001",
      to_number: "1140000000",
      body: "verify operational summary inbound",
      timestamp: new Date().toISOString(),
      raw_payload: { source: sourceMarker, testRunId: run.runId }
    }
  });
  assertStatus(response, 201);
}

async function getOperationalSummary(ctx: VerifyContext) {
  const response = await request(ctx.apiBaseUrl, ctx.apiSecret, "GET", "/api/operational-summary");
  assertStatus(response, 200);
  return asRecord(response.body);
}

function validateSummaryShape(summary: Record<string, unknown>) {
  const generatedAt = asString(summary.generatedAt, "generatedAt");
  assert(!Number.isNaN(new Date(generatedAt).getTime()), "generatedAt nao e ISO valido");
  assert(summary.timezone === "America/Sao_Paulo", "timezone deveria ser America/Sao_Paulo");

  const businessDate = asString(summary.businessDate, "businessDate");
  assert(/^\d{4}-\d{2}-\d{2}$/.test(businessDate), "businessDate nao esta em YYYY-MM-DD");

  const window = asRecord(summary.window);
  const windowStart = asString(window.start, "window.start");
  const windowEnd = asString(window.end, "window.end");
  const windowStartTime = new Date(windowStart).getTime();
  const windowEndTime = new Date(windowEnd).getTime();
  assert(!Number.isNaN(windowStartTime), "window.start nao e ISO valido");
  assert(!Number.isNaN(windowEndTime), "window.end nao e ISO valido");
  assert(windowStartTime < windowEndTime, "window.start deveria ser menor que window.end");

  const actionItems = asRecord(summary.actionItems);
  const leads = asRecord(summary.leads);
  const messages = asRecord(summary.messages);

  for (const [label, value] of Object.entries({
    "actionItems.pendente": actionItems.pendente,
    "actionItems.emAndamento": actionItems.emAndamento,
    "actionItems.concluidoHoje": actionItems.concluidoHoje,
    "actionItems.ignoradoHoje": actionItems.ignoradoHoje,
    "actionItems.vencidos": actionItems.vencidos,
    "leads.novoLead": leads.novoLead,
    "leads.comFollowUpVencido": leads.comFollowUpVencido,
    "leads.semInteracao24h": leads.semInteracao24h,
    "messages.inboundHoje": messages.inboundHoje
  })) {
    assert(typeof value === "number" && Number.isFinite(value), `${label} nao e numerico`);
  }

  const ultimaInboundEm = messages.ultimaInboundEm;
  if (ultimaInboundEm !== null) {
    assert(typeof ultimaInboundEm === "string", "messages.ultimaInboundEm deveria ser string ou null");
    assert(!Number.isNaN(new Date(ultimaInboundEm).getTime()), "messages.ultimaInboundEm nao e ISO valido");
  }
}

function nextPhone() {
  phoneIndex += 1;
  return buildTestPhone(run, phoneIndex);
}
