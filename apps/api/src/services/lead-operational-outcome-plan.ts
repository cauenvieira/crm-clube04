import { ApiError } from "../utils/api-error.js";
import type { LeadOperationalLeadRow } from "../repositories/lead-operational-repository.js";
import type { ActionItemStatus } from "../validation/action-item-schemas.js";
import type { LeadContactOutcomeCreateInput } from "../validation/lead-operational-schemas.js";

export const operationalTimezone = "America/Sao_Paulo";

export type OutcomePlan = {
  leadStatus: string;
  closeAllOpenActionItemsStatus: ActionItemStatus | null;
  closeAllOpenActionItemsCompleted: boolean;
  nextActionItem: {
    type: string;
    title: string;
    priority: number;
    dueAtIso: string | null;
    reason: string;
    recommendedAction: string;
  } | null;
  nextLeadActionAtIso: string | null;
  attemptCount: number;
  lossReason: string | null | undefined;
  finalConclusion: string | null | undefined;
  qualified: boolean | undefined;
  nextRecommendedAction: string;
};

export function buildOutcomePlan(
  lead: LeadOperationalLeadRow,
  input: LeadContactOutcomeCreateInput,
  nowIso: string
): OutcomePlan {
  const nextActionAtIso = input.nextActionAt ? ymdToOperationalIso(input.nextActionAt) : null;
  const scheduledAtIso = input.scheduledAt ? ymdToOperationalIso(input.scheduledAt) : null;
  const currentAttempt = Number.isFinite(lead.attempts_count) ? lead.attempts_count : 0;

  if (input.outcome === "sem_resposta") {
    return buildNoResponsePlan(input.outcome, currentAttempt, nowIso);
  }

  if (input.outcome === "continuar_atendimento") {
    return {
      leadStatus: "em_atendimento",
      closeAllOpenActionItemsStatus: null,
      closeAllOpenActionItemsCompleted: false,
      nextActionItem: {
        type: "fazer_follow_up",
        title: "Realizar follow-up agendado",
        priority: 80,
        dueAtIso: nextActionAtIso,
        reason: `outcome:${input.outcome}`,
        recommendedAction: "fazer_follow_up"
      },
      nextLeadActionAtIso: nextActionAtIso,
      attemptCount: currentAttempt,
      lossReason: undefined,
      finalConclusion: undefined,
      qualified: undefined,
      nextRecommendedAction: "fazer_follow_up"
    };
  }

  if (input.outcome === "agendamento_realizado") {
    return {
      leadStatus: "agendado",
      closeAllOpenActionItemsStatus: "concluido",
      closeAllOpenActionItemsCompleted: true,
      nextActionItem: null,
      nextLeadActionAtIso: scheduledAtIso,
      attemptCount: currentAttempt,
      lossReason: undefined,
      finalConclusion: undefined,
      qualified: undefined,
      nextRecommendedAction: "aguardar_agendamento"
    };
  }

  if (input.outcome === "perdido") {
    return {
      leadStatus: "perdido",
      closeAllOpenActionItemsStatus: "ignorado",
      closeAllOpenActionItemsCompleted: false,
      nextActionItem: null,
      nextLeadActionAtIso: null,
      attemptCount: currentAttempt,
      lossReason: sanitizeOptionalString(input.reason) ?? null,
      finalConclusion: sanitizeOptionalString(input.summary) ?? "encerrado_perdido",
      qualified: false,
      nextRecommendedAction: "encerrado"
    };
  }

  if (input.outcome === "desqualificado") {
    return {
      leadStatus: "desqualificado",
      closeAllOpenActionItemsStatus: "ignorado",
      closeAllOpenActionItemsCompleted: false,
      nextActionItem: null,
      nextLeadActionAtIso: null,
      attemptCount: currentAttempt,
      lossReason: sanitizeOptionalString(input.reason) ?? "desqualificado",
      finalConclusion: sanitizeOptionalString(input.summary) ?? "encerrado_desqualificado",
      qualified: false,
      nextRecommendedAction: "encerrado"
    };
  }

  if (input.outcome === "enviar_analise_lideranca") {
    const reviewDue = ymdToOperationalIso(getSaoPauloTodayYmd(nowIso));
    return {
      leadStatus: "em_atendimento",
      closeAllOpenActionItemsStatus: "concluido",
      closeAllOpenActionItemsCompleted: true,
      nextActionItem: {
        type: "revisar_lideranca",
        title: "Revisar lead com lideranca",
        priority: 85,
        dueAtIso: reviewDue,
        reason: `outcome:${input.outcome}`,
        recommendedAction: "revisar_lideranca"
      },
      nextLeadActionAtIso: reviewDue,
      attemptCount: currentAttempt,
      lossReason: undefined,
      finalConclusion: undefined,
      qualified: undefined,
      nextRecommendedAction: "revisar_lideranca"
    };
  }

  if (input.outcome === "nutricao_campanha") {
    const nutritionDue = nextActionAtIso ?? ymdToOperationalIso(addDaysToYmd(getSaoPauloTodayYmd(nowIso), 30));
    return {
      leadStatus: "reativar_depois",
      closeAllOpenActionItemsStatus: "ignorado",
      closeAllOpenActionItemsCompleted: false,
      nextActionItem: null,
      nextLeadActionAtIso: nutritionDue,
      attemptCount: currentAttempt,
      lossReason: undefined,
      finalConclusion: sanitizeOptionalString(input.summary) ?? "nutricao_campanha",
      qualified: undefined,
      nextRecommendedAction: "nutricao_campanha"
    };
  }

  return {
    leadStatus: "compareceu",
    closeAllOpenActionItemsStatus: "concluido",
    closeAllOpenActionItemsCompleted: true,
    nextActionItem: null,
    nextLeadActionAtIso: null,
    attemptCount: currentAttempt,
    lossReason: undefined,
    finalConclusion: sanitizeOptionalString(input.summary) ?? "cliente_convertido_manual",
    qualified: true,
    nextRecommendedAction: "lead_convertido"
  };
}

function buildNoResponsePlan(outcome: string, currentAttempt: number, nowIso: string): OutcomePlan {
  const nextAttempt = currentAttempt + 1;
  if (nextAttempt >= 12) {
    const reviewDue = ymdToOperationalIso(getSaoPauloTodayYmd(nowIso));
    return {
      leadStatus: "em_atendimento",
      closeAllOpenActionItemsStatus: "concluido",
      closeAllOpenActionItemsCompleted: true,
      nextActionItem: {
        type: "revisar_lideranca",
        title: "Revisar lead com lideranca",
        priority: 85,
        dueAtIso: reviewDue,
        reason: `outcome:${outcome}`,
        recommendedAction: "revisar_lideranca"
      },
      nextLeadActionAtIso: reviewDue,
      attemptCount: nextAttempt,
      lossReason: undefined,
      finalConclusion: undefined,
      qualified: undefined,
      nextRecommendedAction: "revisar_lideranca"
    };
  }

  const cadenceDays = getCadenceDays(nextAttempt);
  const followUpDue = ymdToOperationalIso(addDaysToYmd(getSaoPauloTodayYmd(nowIso), cadenceDays));
  return {
    leadStatus: "aguardando_resposta",
    closeAllOpenActionItemsStatus: null,
    closeAllOpenActionItemsCompleted: false,
    nextActionItem: {
      type: "retomar_atendimento",
      title: "Retomar atendimento com lead sem resposta",
      priority: 90,
      dueAtIso: followUpDue,
      reason: `outcome:${outcome}:tentativa_${nextAttempt}`,
      recommendedAction: "retomar_atendimento"
    },
    nextLeadActionAtIso: followUpDue,
    attemptCount: nextAttempt,
    lossReason: undefined,
    finalConclusion: undefined,
    qualified: undefined,
    nextRecommendedAction: "retomar_atendimento"
  };
}

function getCadenceDays(nextAttempt: number) {
  if (nextAttempt <= 1) return 1;
  if (nextAttempt === 2) return 2;
  if (nextAttempt === 3) return 3;
  if (nextAttempt >= 4 && nextAttempt <= 6) return 5;
  return 7;
}

function getSaoPauloTodayYmd(referenceIso?: string) {
  const ref = referenceIso ? new Date(referenceIso) : new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: operationalTimezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(ref);
}

function addDaysToYmd(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map((part) => Number.parseInt(part, 10));
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + days);
  const yyyy = base.getUTCFullYear();
  const mm = String(base.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(base.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ymdToOperationalIso(ymd: string) {
  const candidate = `${ymd}T03:00:00.000Z`;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "Data invalida, use YYYY-MM-DD");
  }
  return parsed.toISOString();
}

function sanitizeOptionalString(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
