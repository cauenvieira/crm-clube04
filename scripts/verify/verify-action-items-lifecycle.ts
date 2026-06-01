import {
  asArray,
  asRecord,
  asString,
  assert,
  assertOneOfStatus,
  assertStatus,
  request
} from "../smoke/smoke-api-helpers.js";
import { buildRunPayloadSource, buildTestNote, buildTestPhone, buildTestTutorName } from "../test-support/test-data.js";
import { cleanupByRunId } from "../test-support/test-cleanup.js";
import { createTestRunContext } from "../test-support/test-run.js";

type VerifyContext = {
  apiBaseUrl: string;
  apiSecret: string;
};

type LeadSeed = {
  contactId: string;
  leadId: string;
};

const run = createTestRunContext("verify:action-items");
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
    const leadComplete = await runStep("Criar lead para fluxo complete", () =>
      createLeadSeed(ctx, "complete", "novo_lead")
    );

    await runStep("Gerar action_item pendente para fluxo complete", async () => {
      await generateActionItems(ctx);
      const item = await findActionItem(ctx, leadComplete.leadId, "follow_up_lead", "pendente");
      const completed = await completeActionItem(ctx, item.id);
      assert(completed.status === "concluido", "Complete nao retornou status concluido");
    });

    await runStep("Validar idempotencia de complete", async () => {
      const item = await findActionItem(ctx, leadComplete.leadId, "follow_up_lead", "concluido");
      const completedAgain = await completeActionItem(ctx, item.id);
      assert(completedAgain.status === "concluido", "Complete repetido nao manteve status concluido");
      await ensureActionItemListed(ctx, leadComplete.leadId, "concluido", item.id);
    });

    const leadCancel = await runStep("Criar lead para fluxo cancel", () =>
      createLeadSeed(ctx, "cancel", "em_atendimento", new Date(Date.now() - 10 * 60 * 1000).toISOString())
    );

    await runStep("Gerar action_item pendente para fluxo cancel", async () => {
      await generateActionItems(ctx);
      const item = await findActionItem(ctx, leadCancel.leadId, "follow_up_agendado", "pendente");
      const cancelled = await cancelActionItem(ctx, item.id);
      assert(cancelled.status === "ignorado", "Cancel nao retornou status ignorado");
    });

    await runStep("Validar idempotencia de cancel", async () => {
      const item = await findActionItem(ctx, leadCancel.leadId, "follow_up_agendado", "ignorado");
      const cancelledAgain = await cancelActionItem(ctx, item.id);
      assert(cancelledAgain.status === "ignorado", "Cancel repetido nao manteve status ignorado");
      await ensureActionItemListed(ctx, leadCancel.leadId, "ignorado", item.id);
    });

    const leadAutoClose = await runStep("Criar lead para auto fechamento por crm-interaction", () =>
      createLeadSeed(ctx, "autoclose", "novo_lead")
    );

    await runStep("Gerar action_item aberto para auto fechamento", async () => {
      await generateActionItems(ctx);
      const openItem = await findActionItem(ctx, leadAutoClose.leadId, "follow_up_lead", "pendente");
      await createCrmInteraction(ctx, leadAutoClose.contactId, leadAutoClose.leadId);
      await ensureActionItemListed(ctx, leadAutoClose.leadId, "concluido", openItem.id);
    });

    const failed = results.filter((result) => !result.ok);
    console.log("");
    console.log(`Resumo verify:action-items: ${results.length - failed.length}/${results.length} passos OK`);
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

async function createLeadSeed(
  ctx: VerifyContext,
  label: string,
  status: "novo_lead" | "em_atendimento",
  nextActionAt?: string
): Promise<LeadSeed> {
  const contactResponse = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/contacts", {
    body: {
      name: buildTestTutorName(run, label.toUpperCase()),
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
      status,
      next_action_at: nextActionAt
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

async function completeActionItem(ctx: VerifyContext, actionItemId: string) {
  const response = await request(
    ctx.apiBaseUrl,
    ctx.apiSecret,
    "POST",
    `/api/action-items/${actionItemId}/complete`,
    { body: {} }
  );
  assertStatus(response, 200);
  return asRecord(asRecord(response.body).data);
}

async function cancelActionItem(ctx: VerifyContext, actionItemId: string) {
  const response = await request(
    ctx.apiBaseUrl,
    ctx.apiSecret,
    "POST",
    `/api/action-items/${actionItemId}/cancel`,
    { body: {} }
  );
  assertStatus(response, 200);
  return asRecord(asRecord(response.body).data);
}

async function createCrmInteraction(ctx: VerifyContext, contactId: string, leadId: string) {
  const response = await request(ctx.apiBaseUrl, ctx.apiSecret, "POST", "/api/crm-interactions", {
    body: {
      contact_id: contactId,
      lead_id: leadId,
      interaction_type: "verify_action_items",
      channel: "manual",
      responsible: run.attendantMarker,
      result: "ok",
      notes: buildTestNote(run, "verify action items lifecycle"),
      increment_attempts: true
    }
  });
  assertStatus(response, 201);
}

async function findActionItem(
  ctx: VerifyContext,
  leadId: string,
  type: string,
  status: "pendente" | "concluido" | "ignorado"
) {
  const response = await request(
    ctx.apiBaseUrl,
    ctx.apiSecret,
    "GET",
    `/api/action-items?lead_id=${leadId}&type=${type}&status=${status}&limit=100`
  );
  assertStatus(response, 200);
  const items = asArray(asRecord(response.body).data);
  assert(items.length > 0, `Nenhum action_item encontrado para lead=${leadId}, type=${type}, status=${status}`);
  return asRecord(items[0]);
}

async function ensureActionItemListed(
  ctx: VerifyContext,
  leadId: string,
  status: "concluido" | "ignorado",
  actionItemId: string
) {
  const response = await request(
    ctx.apiBaseUrl,
    ctx.apiSecret,
    "GET",
    `/api/action-items?lead_id=${leadId}&status=${status}&limit=100`
  );
  assertStatus(response, 200);

  const items = asArray(asRecord(response.body).data);
  const found = items.some((item) => asRecord(item).id === actionItemId);
  assert(found, `Action item ${actionItemId} nao encontrado com status ${status}`);
}

function nextPhone() {
  phoneIndex += 1;
  return buildTestPhone(run, phoneIndex);
}
