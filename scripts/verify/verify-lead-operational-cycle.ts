import {
  asArray,
  asRecord,
  asString,
  assert,
  assertStatus,
  request
} from "../smoke/smoke-api-helpers.js";
import { cleanupByRunId } from "../test-support/test-cleanup.js";
import { buildRunPayloadSource, buildTestNote, buildTestTutorName } from "../test-support/test-data.js";
import { createTestRunContext } from "../test-support/test-run.js";

type CreatedManualLead = {
  contactId: string;
  leadId: string;
  actionItemId: string;
  phone: string;
};

const run = createTestRunContext("verify:lead-operational-cycle");
const sourceMarker = buildRunPayloadSource(run);
let phoneIndex = 0;

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  const steps: Array<[string, () => Promise<void>]> = [
    ["sem_resposta cria retomar_atendimento", verifySemRespostaFlow],
    ["continuar_atendimento cria follow-up na data escolhida", verifyContinuarAtendimentoDataFlow],
    ["continuar_atendimento cria follow-up", verifyContinuarAtendimentoFlow],
    ["perdido encerra fila aberta", verifyPerdidoFlow],
    ["desqualificado encerra fila aberta", verifyDesqualificadoFlow],
    ["enviar_analise_lideranca cria revisar_lideranca", verifyEnviarAnaliseLiderancaFlow],
    ["agendamento_realizado encerra fila e marca lead", verifyAgendamentoRealizadoFlow],
    ["cliente_convertido encerra fila e marca lead", verifyClienteConvertidoFlow],
    ["nutricao_campanha sai da fila diaria", verifyNutricaoCampanhaFlow],
    ["actionItemId de outro lead e rejeitado", verifyActionItemOwnershipGuard],
    ["nao duplica action_item aberta para mesmo lead/type/due", verifyOpenActionItemDedupe],
    ["outcome exige campos obrigatorios", verifyOutcomeValidation]
  ];

  let passed = 0;
  try {
    for (const [name, fn] of steps) {
      await fn();
      passed += 1;
      console.log(`OK - ${name}`);
    }
    console.log("");
    console.log(`Resumo verify:lead-operational-cycle: ${passed}/${steps.length} passos OK`);
  } finally {
    const summary = await cleanupByRunId(run.runId);
    console.log(
      `Cleanup runId ${summary.runId}: messages=${summary.messages}, interactions=${summary.interactions}, action_items=${summary.actionItems}, conversations=${summary.conversations}, leads=${summary.leads}, contacts=${summary.contacts}`
    );
  }
}

async function verifySemRespostaFlow() {
  const lead = await createManualLead("sem_resposta");
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "sem_resposta",
      channel: "whatsapp",
      summary: buildTestNote(run, "sem_resposta")
    }
  });
  assertStatus(response, 201);

  const created = asRecord(asRecord(response.body).data);
  const nextActionItemId = asString(created.nextActionItemId, "sem_resposta.nextActionItemId");
  const actionItems = await listLeadActionItems(lead.leadId);
  const nextItem = actionItems.find((item) => asRecord(item).id === nextActionItemId);
  assert(Boolean(nextItem), "sem_resposta nao criou action item esperado");
  assert(asRecord(nextItem).type === "retomar_atendimento", "sem_resposta deveria criar retomar_atendimento");
}

async function verifyContinuarAtendimentoDataFlow() {
  const lead = await createManualLead("continuar_data");
  const dueYmd = addDays(todayYmd(), 3);

  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "continuar_atendimento",
      channel: "whatsapp",
      nextActionAt: dueYmd
    }
  });
  assertStatus(response, 201);

  const data = asRecord(asRecord(response.body).data);
  const nextActionItemId = asString(data.nextActionItemId, "continuar_atendimento.nextActionItemId");
  const actionItems = await listLeadActionItems(lead.leadId);
  const nextItem = actionItems.find((item) => asRecord(item).id === nextActionItemId);
  assert(Boolean(nextItem), "continuar_atendimento nao criou action item");
  assert(asRecord(nextItem).type === "fazer_follow_up", "continuar_atendimento deveria criar fazer_follow_up");
  assert(matchesDueYmd(asRecord(nextItem).due_at, dueYmd), "continuar_atendimento deveria respeitar due_at escolhido");
}

async function verifyContinuarAtendimentoFlow() {
  const lead = await createManualLead("continuar_atendimento");
  const dueYmd = addDays(todayYmd(), 2);

  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "continuar_atendimento",
      channel: "telefone",
      nextActionAt: dueYmd,
      summary: buildTestNote(run, "continuar")
    }
  });
  assertStatus(response, 201);

  const data = asRecord(asRecord(response.body).data);
  const nextActionItemId = asString(data.nextActionItemId, "continuar_atendimento.nextActionItemId");
  const actionItems = await listLeadActionItems(lead.leadId);
  const nextItem = actionItems.find((item) => asRecord(item).id === nextActionItemId);
  assert(Boolean(nextItem), "continuar_atendimento nao criou action item");
  assert(asRecord(nextItem).type === "fazer_follow_up", "continuar_atendimento deveria criar fazer_follow_up");
}

async function verifyPerdidoFlow() {
  const lead = await createManualLead("perdido");
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "perdido",
      channel: "whatsapp",
      reason: "preco"
    }
  });
  assertStatus(response, 201);

  const leadData = await getLead(lead.leadId);
  assert(leadData.status === "perdido", "perdido deveria mover lead para perdido");

  const actionItems = await listLeadActionItems(lead.leadId);
  const open = actionItems.filter((item) => ["pendente", "em_andamento", "reagendado"].includes(String(asRecord(item).status)));
  assert(open.length === 0, "perdido deveria fechar action_items abertas");
}

async function verifyDesqualificadoFlow() {
  const lead = await createManualLead("desqualificado");
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "desqualificado",
      channel: "whatsapp",
      reason: "telefone_invalido"
    }
  });
  assertStatus(response, 201);

  const leadData = await getLead(lead.leadId);
  assert(leadData.status === "desqualificado", "desqualificado deveria mover lead para desqualificado");

  const actionItems = await listLeadActionItems(lead.leadId);
  const open = actionItems.filter((item) => ["pendente", "em_andamento", "reagendado"].includes(String(asRecord(item).status)));
  assert(open.length === 0, "desqualificado deveria fechar action_items abertas");
}

async function verifyEnviarAnaliseLiderancaFlow() {
  const lead = await createManualLead("enviar_analise_lideranca");
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "enviar_analise_lideranca",
      channel: "whatsapp",
      reason: "outro",
      summary: buildTestNote(run, "enviar_analise")
    }
  });
  assertStatus(response, 201);

  const actionItems = await listLeadActionItems(lead.leadId);
  const openReview = actionItems.find((item) => {
    const record = asRecord(item);
    return record.type === "revisar_lideranca" && ["pendente", "em_andamento", "reagendado"].includes(String(record.status));
  });
  assert(Boolean(openReview), "enviar_analise_lideranca deveria criar revisar_lideranca aberta");
}

async function verifyAgendamentoRealizadoFlow() {
  const lead = await createManualLead("agendamento_realizado");
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "agendamento_realizado",
      channel: "whatsapp",
      scheduledAt: addDays(todayYmd(), 1)
    }
  });
  assertStatus(response, 201);

  const leadData = await getLead(lead.leadId);
  assert(leadData.status === "agendado", "agendamento_realizado deveria mover lead para agendado");

  const actionItems = await listLeadActionItems(lead.leadId);
  const open = actionItems.filter((item) => ["pendente", "em_andamento", "reagendado"].includes(String(asRecord(item).status)));
  assert(open.length === 0, "agendamento_realizado deveria encerrar fila aberta");
}

async function verifyClienteConvertidoFlow() {
  const lead = await createManualLead("cliente_convertido");
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "cliente_convertido",
      channel: "whatsapp",
      summary: buildTestNote(run, "cliente_convertido")
    }
  });
  assertStatus(response, 201);

  const leadData = await getLead(lead.leadId);
  assert(leadData.status === "compareceu", "cliente_convertido deveria usar status compareceu no schema atual");

  const actionItems = await listLeadActionItems(lead.leadId);
  const open = actionItems.filter((item) => ["pendente", "em_andamento", "reagendado"].includes(String(asRecord(item).status)));
  assert(open.length === 0, "cliente_convertido deveria encerrar fila aberta");
}

async function verifyNutricaoCampanhaFlow() {
  const lead = await createManualLead("nutricao_campanha");
  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "nutricao_campanha",
      channel: "whatsapp",
      summary: buildTestNote(run, "nutricao_campanha")
    }
  });
  assertStatus(response, 201);

  const leadData = await getLead(lead.leadId);
  assert(leadData.status === "reativar_depois", "nutricao_campanha deveria usar status reativar_depois no schema atual");

  const actionItems = await listLeadActionItems(lead.leadId);
  const open = actionItems.filter((item) => ["pendente", "em_andamento", "reagendado"].includes(String(asRecord(item).status)));
  assert(open.length === 0, "nutricao_campanha deveria encerrar fila aberta");
}

async function verifyActionItemOwnershipGuard() {
  const leadA = await createManualLead("ownership_a");
  const leadB = await createManualLead("ownership_b");

  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${leadA.leadId}/contact-outcomes`, {
    body: {
      actionItemId: leadB.actionItemId,
      outcome: "continuar_atendimento",
      channel: "whatsapp",
      nextActionAt: addDays(todayYmd(), 1)
    }
  });
  assertStatus(response, 400);
}

async function verifyOpenActionItemDedupe() {
  const lead = await createManualLead("dedupe");
  const dueYmd = addDays(todayYmd(), 4);

  const first = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      actionItemId: lead.actionItemId,
      outcome: "continuar_atendimento",
      channel: "whatsapp",
      nextActionAt: dueYmd
    }
  });
  assertStatus(first, 201);

  const second = await request(run.apiBaseUrl, run.apiSecret, "POST", `/api/leads/${lead.leadId}/contact-outcomes`, {
    body: {
      outcome: "continuar_atendimento",
      channel: "whatsapp",
      nextActionAt: dueYmd
    }
  });
  assertStatus(second, 201);

  const firstNextId = asString(asRecord(asRecord(first.body).data).nextActionItemId, "firstNextId");
  const secondNextId = asString(asRecord(asRecord(second.body).data).nextActionItemId, "secondNextId");
  assert(firstNextId === secondNextId, "deveria reutilizar action_item aberta no dedupe");
}

async function verifyOutcomeValidation() {
  const lead = await createManualLead("validation");

  const missingNextAction = await request(
    run.apiBaseUrl,
    run.apiSecret,
    "POST",
    `/api/leads/${lead.leadId}/contact-outcomes`,
    {
      body: {
        actionItemId: lead.actionItemId,
        outcome: "continuar_atendimento",
        channel: "whatsapp"
      }
    }
  );
  assertStatus(missingNextAction, 400);

  const missingReason = await request(
    run.apiBaseUrl,
    run.apiSecret,
    "POST",
    `/api/leads/${lead.leadId}/contact-outcomes`,
    {
      body: {
        actionItemId: lead.actionItemId,
        outcome: "perdido",
        channel: "whatsapp"
      }
    }
  );
  assertStatus(missingReason, 400);

  const missingSummary = await request(
    run.apiBaseUrl,
    run.apiSecret,
    "POST",
    `/api/leads/${lead.leadId}/contact-outcomes`,
    {
      body: {
        actionItemId: lead.actionItemId,
        outcome: "cliente_convertido",
        channel: "whatsapp"
      }
    }
  );
  assertStatus(missingSummary, 400);
}

async function createManualLead(suffix: string): Promise<CreatedManualLead> {
  phoneIndex += 1;
  const phone = buildUniquePhone();
  const nextActionAt = addDays(todayYmd(), 1);

  const response = await request(run.apiBaseUrl, run.apiSecret, "POST", "/api/manual-leads", {
    body: {
      tutorName: buildTestTutorName(run, suffix),
      phone,
      entryMethod: sourceMarker,
      attendant: run.attendantMarker,
      nextAction: "fazer_follow_up",
      nextActionAt,
      initialNote: buildTestNote(run, `lead-${suffix}`)
    }
  });
  assertStatus(response, 201);
  const data = asRecord(asRecord(response.body).data);
  return {
    contactId: asString(data.contact_id, "manual.contact_id"),
    leadId: asString(data.lead_id, "manual.lead_id"),
    actionItemId: asString(data.action_item_id, "manual.action_item_id"),
    phone
  };
}

async function listLeadActionItems(leadId: string) {
  const response = await request(run.apiBaseUrl, run.apiSecret, "GET", `/api/action-items?lead_id=${leadId}&limit=100`);
  assertStatus(response, 200);
  const body = asRecord(response.body);
  return asArray(body.data);
}

async function getLead(leadId: string) {
  const response = await request(run.apiBaseUrl, run.apiSecret, "GET", `/api/leads/${leadId}`);
  assertStatus(response, 200);
  const data = asRecord(asRecord(response.body).data);
  return {
    status: asString(data.status, "lead.status")
  };
}

function todayYmd() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildUniquePhone() {
  const digits = `${Date.now()}${Math.floor(Math.random() * 1_000_000)}${phoneIndex}`.replace(/\D/g, "");
  const suffix = digits.slice(-8).padStart(8, "0");
  return `119${suffix}`;
}

function addDays(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map((part) => Number.parseInt(part, 10));
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + days);
  const yyyy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function matchesDueYmd(rawValue: unknown, expectedYmd: string) {
  if (!rawValue) return false;
  const parsed = new Date(String(rawValue));
  if (Number.isNaN(parsed.getTime())) return false;
  const yyyy = parsed.getUTCFullYear();
  const mm = String(parsed.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}` === expectedYmd;
}
