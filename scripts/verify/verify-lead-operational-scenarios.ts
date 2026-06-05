import {
  asArray,
  asRecord,
  assert,
  asString
} from "../smoke/smoke-api-helpers.js";
import { cleanupByRunId } from "../test-support/test-cleanup.js";
import {
  addDays,
  assertLeadInList,
  createScenarioManualLead,
  findActionItem,
  getLead,
  getLeadOperationalContext,
  getOperationalWorklist,
  listLeadActionItems,
  registerLeadOutcome,
  todayYmd,
  ymdToOperationalIso
} from "../test-support/lead-operational-test-api.js";
import { clearLeadNextAction, setLeadAttempts } from "../test-support/lead-operational-test-db.js";
import { buildRunPayloadSource, buildTestNote } from "../test-support/test-data.js";
import { createTestRunContext } from "../test-support/test-run.js";

const run = createTestRunContext("verify:lead-operational-scenarios");
const sourceMarker = buildRunPayloadSource(run);
const gaps: string[] = [];

type Step = [string, () => Promise<void>];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

async function main() {
  const steps: Step[] = [
    ["lead novo de trafego pago entra em fila", verifyPaidTrafficNewLead],
    ["primeiro atendimento registra historico e follow-up", verifyFirstContact],
    ["sem_resposta move para aguardando_resposta", verifyWaitingResponse],
    ["follow-up programado para hoje aparece na worklist", verifyFollowUpToday],
    ["lead atrasado aparece em vencidos/follow-up vencido", verifyOverdueLead],
    ["lead ativo sem proxima acao gera alerta", verifyMissingNextAction],
    ["limite de tentativas envia para lideranca", verifyAttemptLimitReview],
    ["envio manual para analise da lideranca cria revisao", verifySendToLeadership],
    ["leadership decision gap fica explicita", verifyLeadershipDecisionGap],
    ["decisao final suportada encerra fila", verifySupportedFinalDecision],
    ["lead agendado sai da fila aberta", verifyScheduledLead],
    ["lead convertido sai da jornada do lead", verifyConvertedLead],
    ["backlog e ciclo longo permanecem lacunas", verifyBacklogAndLongCycleGaps]
  ];

  let passed = 0;
  try {
    for (const [name, fn] of steps) {
      await fn();
      passed += 1;
      console.log(`OK - ${name}`);
    }
    console.log("");
    console.log(`Resumo verify:lead-operational-scenarios: ${passed}/${steps.length} cenarios OK`);
    if (gaps.length > 0) {
      console.log("Lacunas registradas:");
      for (const gap of gaps) console.log(`- ${gap}`);
    }
  } finally {
    const summary = await cleanupByRunId(run.runId);
    console.log(
      `Cleanup runId ${summary.runId}: messages=${summary.messages}, interactions=${summary.interactions}, action_items=${summary.actionItems}, conversations=${summary.conversations}, leads=${summary.leads}, contacts=${summary.contacts}`
    );
  }
}

async function verifyPaidTrafficNewLead() {
  const lead = await createScenarioManualLead(run, "paid_traffic_new", {
    entryMethod: "trafego_pago",
    campaign: `${sourceMarker}:trafego_pago`,
    nextAction: "novo_lead",
    nextActionAt: todayYmd()
  });

  const leadData = await getLead(run, lead.leadId);
  assert(leadData.status === "novo_lead", "lead novo deveria iniciar como novo_lead");
  assert(leadData.source === "manual_entry", "lead manual deve preservar source tecnica manual_entry");

  const actionItems = await listLeadActionItems(run, lead.leadId);
  const item = findActionItem(actionItems, { id: lead.actionItemId, type: "novo_lead", status: "pendente" });
  assert(Boolean(item), "lead novo deveria ter action_item novo_lead pendente");
  assert(String(item?.reason ?? "").includes("trafego_pago"), "origem de trafego pago deveria aparecer no action item");
}

async function verifyFirstContact() {
  const lead = await createScenarioManualLead(run, "first_contact", { nextActionAt: todayYmd() });
  const dueYmd = addDays(todayYmd(), 1);
  await registerLeadOutcome(run, lead.leadId, {
    actionItemId: lead.actionItemId,
    outcome: "continuar_atendimento",
    nextActionAt: dueYmd,
    summary: buildTestNote(run, "primeiro_atendimento")
  });

  const leadData = await getLead(run, lead.leadId);
  assert(leadData.status === "em_atendimento", "primeiro atendimento deveria mover para em_atendimento");
  assert(matchesYmd(leadData.next_action_at, dueYmd), "primeiro atendimento deveria definir proxima acao");

  const context = await getLeadOperationalContext(run, lead.leadId);
  const interactions = asArray(context.recentInteractions).map((item) => asRecord(item));
  assert(interactions.some((item) => item.result === "continuar_atendimento"), "historico nao registrou atendimento");
}

async function verifyWaitingResponse() {
  const lead = await createScenarioManualLead(run, "waiting_response", { nextActionAt: todayYmd() });
  const result = await registerLeadOutcome(run, lead.leadId, {
    actionItemId: lead.actionItemId,
    outcome: "sem_resposta",
    summary: buildTestNote(run, "sem_resposta")
  });
  asString(result.nextActionItemId, "sem_resposta.nextActionItemId");

  const leadData = await getLead(run, lead.leadId);
  assert(leadData.status === "aguardando_resposta", "sem_resposta deveria mover para aguardando_resposta");
  assert(leadData.attempts_count === 1, "sem_resposta deveria incrementar tentativa");

  const actionItems = await listLeadActionItems(run, lead.leadId);
  assert(Boolean(findActionItem(actionItems, { type: "retomar_atendimento", status: "pendente" })), "faltou retomar_atendimento");
}

async function verifyFollowUpToday() {
  const lead = await createScenarioManualLead(run, "follow_up_today", {
    nextAction: "fazer_follow_up",
    nextActionAt: todayYmd()
  });
  const worklist = await getOperationalWorklist(run, 50);
  const actionItems = asRecord(worklist.actionItems);
  assertLeadInList(actionItems.followUpsAgendados, lead.leadId, "followUpsAgendados");
}

async function verifyOverdueLead() {
  const lead = await createScenarioManualLead(run, "overdue", {
    nextAction: "retomar_atendimento",
    nextActionAt: addDays(todayYmd(), -1)
  });
  const worklist = await getOperationalWorklist(run, 50);
  const actionItems = asRecord(worklist.actionItems);
  const leads = asRecord(worklist.leads);
  assertLeadInList(actionItems.vencidos, lead.leadId, "actionItems.vencidos");
  assertLeadInList(leads.followUpVencido, lead.leadId, "leads.followUpVencido");
}

async function verifyMissingNextAction() {
  const lead = await createScenarioManualLead(run, "missing_next_action");
  await clearLeadNextAction(lead.leadId);
  const worklist = await getOperationalWorklist(run, 50);
  const leads = asRecord(worklist.leads);
  assertLeadInList(leads.semProximaAcao, lead.leadId, "leads.semProximaAcao");
}

async function verifyAttemptLimitReview() {
  const lead = await createScenarioManualLead(run, "attempt_limit", { nextActionAt: todayYmd() });
  await setLeadAttempts(lead.leadId, 11);
  const result = await registerLeadOutcome(run, lead.leadId, {
    actionItemId: lead.actionItemId,
    outcome: "sem_resposta",
    summary: buildTestNote(run, "attempt_limit")
  });
  assert(result.nextRecommendedAction === "revisar_lideranca", "limite deveria recomendar revisar_lideranca");

  const leadData = await getLead(run, lead.leadId);
  assert(leadData.attempts_count === 12, "limite deveria chegar em 12 tentativas");
  const actionItems = await listLeadActionItems(run, lead.leadId);
  assert(Boolean(findActionItem(actionItems, { type: "revisar_lideranca", status: "pendente" })), "faltou revisao aberta");
}

async function verifySendToLeadership() {
  const lead = await createScenarioManualLead(run, "send_leadership", { nextActionAt: todayYmd() });
  await registerLeadOutcome(run, lead.leadId, {
    actionItemId: lead.actionItemId,
    outcome: "enviar_analise_lideranca",
    reason: "outro",
    summary: buildTestNote(run, "send_leadership")
  });
  const actionItems = await listLeadActionItems(run, lead.leadId);
  assert(Boolean(findActionItem(actionItems, { type: "revisar_lideranca", status: "pendente" })), "faltou revisar_lideranca");
}

async function verifyLeadershipDecisionGap() {
  gaps.push("LOR-020/LOR-021: nao ha endpoint especifico para checklist/decisao formal da lideranca.");
}

async function verifySupportedFinalDecision() {
  const lead = await createScenarioManualLead(run, "leadership_final", { nextActionAt: todayYmd() });
  const review = await registerLeadOutcome(run, lead.leadId, {
    actionItemId: lead.actionItemId,
    outcome: "enviar_analise_lideranca",
    reason: "outro",
    summary: buildTestNote(run, "leadership_review")
  });
  await registerLeadOutcome(run, lead.leadId, {
    actionItemId: asString(review.nextActionItemId, "review.nextActionItemId"),
    outcome: "perdido",
    reason: "preco",
    summary: buildTestNote(run, "leadership_lost")
  });
  const leadData = await getLead(run, lead.leadId);
  assert(leadData.status === "perdido", "decisao final suportada deveria encerrar como perdido");
  await assertNoOpenActionItems(lead.leadId);
}

async function verifyScheduledLead() {
  const lead = await createScenarioManualLead(run, "scheduled", { nextActionAt: todayYmd() });
  await registerLeadOutcome(run, lead.leadId, {
    actionItemId: lead.actionItemId,
    outcome: "agendamento_realizado",
    scheduledAt: addDays(todayYmd(), 1)
  });
  const leadData = await getLead(run, lead.leadId);
  assert(leadData.status === "agendado", "agendamento_realizado deveria mover para agendado");
  await assertNoOpenActionItems(lead.leadId);
}

async function verifyConvertedLead() {
  const lead = await createScenarioManualLead(run, "converted", { nextActionAt: todayYmd() });
  await registerLeadOutcome(run, lead.leadId, {
    actionItemId: lead.actionItemId,
    outcome: "cliente_convertido",
    summary: buildTestNote(run, "converted")
  });
  const leadData = await getLead(run, lead.leadId);
  assert(leadData.status === "compareceu", "cliente_convertido usa compareceu por compatibilidade de schema");
  assert(leadData.qualified === true, "cliente_convertido deveria marcar qualified=true");
  await assertNoOpenActionItems(lead.leadId);
}

async function verifyBacklogAndLongCycleGaps() {
  gaps.push("LOR-042: backlog acima de 7 dias ainda nao tem bucket/endpoint dedicado; hoje aparece como vencido.");
  gaps.push("LOR-043: ciclo longo acima de 60 dias ainda nao tem bucket/endpoint dedicado.");
}

async function assertNoOpenActionItems(leadId: string) {
  const items = await listLeadActionItems(run, leadId);
  const open = items.filter((item) => ["pendente", "em_andamento", "reagendado"].includes(String(item.status)));
  assert(open.length === 0, "lead encerrado nao deveria manter action_item aberta");
}

function matchesYmd(rawValue: unknown, expectedYmd: string) {
  if (!rawValue) return false;
  return new Date(String(rawValue)).toISOString() === ymdToOperationalIso(expectedYmd);
}
