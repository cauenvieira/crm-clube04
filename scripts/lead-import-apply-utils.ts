import type { ParsedSheetRow } from "./lead-spreadsheet-import-utils.js";
import {
  getDueBucket,
  getSaoPauloBusinessDateYmd,
  hasStatusActionConflict,
  indicatesConversionBySheet,
  isLeadershipSignal,
  mapNextActionCrosscheck,
  mapStatusCrosscheck
} from "./lead-customer-crosscheck-utils.js";
import { normalizeText, parseDateInput } from "./analyze-lead-spreadsheet-utils.js";

export type CanonicalAction = "fazer_follow_up" | "retomar_atendimento" | "revisar_lideranca" | "validar_conversao" | null;

export type CanonicalStatus =
  | "novo_lead"
  | "em_atendimento"
  | "agendado"
  | "validar_conversao"
  | "convertido_cliente"
  | "sem_retorno"
  | "revisao_lideranca"
  | "revisao_manual"
  | "desqualificado";

export type PlannedLeadImport = {
  phone: string;
  row: ParsedSheetRow;
  statusFinal: CanonicalStatus;
  actionFinal: CanonicalAction;
  foundInPessoa: boolean;
  dueBucket: "vencida" | "futura" | "sem_data";
  warning: string | null;
};

export function buildPlannedLeadImport(params: {
  row: ParsedSheetRow;
  phone: string;
  foundInPessoa: boolean;
  conflictingTutor: boolean;
  businessDateYmd: string;
}): PlannedLeadImport {
  const { row, phone, foundInPessoa, conflictingTutor, businessDateYmd } = params;
  const statusBase = mapStatusCrosscheck(row);
  const actionBase = mapNextActionCrosscheck(row);
  const conversionBySheet = indicatesConversionBySheet(row);
  const leadershipSignal = isLeadershipSignal(row);
  const dueBucket = getDueBucket(row.values.dataProxAcao, businessDateYmd);

  const hasConflict =
    conflictingTutor ||
    hasStatusActionConflict(statusBase, actionBase) ||
    statusBase === "revisao_manual" ||
    actionBase === "revisao_manual";

  let statusFinal: CanonicalStatus = statusBase;
  let actionFinal: CanonicalAction = null;
  let warning: string | null = null;

  if (hasConflict) {
    statusFinal = "revisao_manual";
    actionFinal = null;
    warning = conflictingTutor ? "conflicting_tutor" : "status_action_conflict";
  } else if (foundInPessoa && conversionBySheet) {
    statusFinal = "convertido_cliente";
    actionFinal = null;
  } else if (!foundInPessoa && conversionBySheet) {
    statusFinal = "validar_conversao";
    actionFinal = "validar_conversao";
  } else if (leadershipSignal || statusBase === "revisao_lideranca" || actionBase === "revisar_lideranca") {
    statusFinal = "revisao_lideranca";
    actionFinal = "revisar_lideranca";
  } else if (dueBucket === "vencida") {
    statusFinal = statusBase;
    actionFinal = "retomar_atendimento";
  } else if (actionBase === "fazer_follow_up") {
    statusFinal = statusBase;
    actionFinal = "fazer_follow_up";
  }

  return {
    phone,
    row,
    statusFinal,
    actionFinal,
    foundInPessoa,
    dueBucket,
    warning
  };
}

export function mapCanonicalToDbLeadStatus(status: CanonicalStatus): string {
  const mapping: Record<CanonicalStatus, string> = {
    novo_lead: "novo_lead",
    em_atendimento: "em_atendimento",
    agendado: "agendado",
    validar_conversao: "em_negociacao",
    convertido_cliente: "compareceu",
    sem_retorno: "aguardando_resposta",
    revisao_lideranca: "em_negociacao",
    revisao_manual: "reativar_depois",
    desqualificado: "desqualificado"
  };
  return mapping[status];
}

export function isLeadStatusActive(dbStatus: string): boolean {
  return [
    "novo_lead",
    "em_atendimento",
    "aguardando_resposta",
    "em_negociacao",
    "agendado",
    "reativar_depois"
  ].includes(dbStatus);
}

export function sanitizeMethodSource(rawMethod: string): string {
  const normalized = normalizeText(rawMethod);
  if (!normalized) return "unknown";
  if (normalized.length > 40) return normalized.slice(0, 40);
  return normalized;
}

export function priorityForAction(type: Exclude<CanonicalAction, null>): number {
  const mapping: Record<Exclude<CanonicalAction, null>, number> = {
    retomar_atendimento: 90,
    validar_conversao: 80,
    revisar_lideranca: 70,
    fazer_follow_up: 60
  };
  return mapping[type];
}

export function titleForAction(type: Exclude<CanonicalAction, null>): string {
  const mapping: Record<Exclude<CanonicalAction, null>, string> = {
    retomar_atendimento: "Retomar atendimento pendente",
    validar_conversao: "Validar conversao de lead",
    revisar_lideranca: "Revisar lead com lideranca",
    fazer_follow_up: "Fazer follow-up de lead"
  };
  return mapping[type];
}

export function reasonForAction(type: Exclude<CanonicalAction, null>): string {
  return `spreadsheet_import:${type}`;
}

export function dueAtForAction(row: ParsedSheetRow, type: Exclude<CanonicalAction, null>): string | null {
  const dateYmd = parseSpreadsheetDate(row.values.dataProxAcao);
  if (type === "retomar_atendimento" || type === "validar_conversao") return dateYmd ?? new Date().toISOString();
  if (type === "fazer_follow_up") return dateYmd ?? null;
  if (type === "revisar_lideranca") return dateYmd ?? null;
  return null;
}

export function truncateText(text: string, max: number): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max)}...`;
}

export function buildSnapshotNotes(input: {
  row: ParsedSheetRow;
  statusFinal: CanonicalStatus;
  actionFinal: CanonicalAction;
  legacyAttemptCount: number | null;
}): string {
  const parts: string[] = [];
  parts.push("spreadsheet_import_snapshot");
  parts.push(`status_original=${truncateText(input.row.values.statusAtendimento, 32) || "none"}`);
  parts.push(`acao_original=${truncateText(input.row.values.proximaAcao, 32) || "none"}`);
  parts.push(`status_final=${input.statusFinal}`);
  parts.push(`action_final=${input.actionFinal ?? "none"}`);
  if (input.legacyAttemptCount !== null) parts.push(`legacy_attempt_count=${input.legacyAttemptCount}`);
  if (input.row.values.observacao.trim()) {
    parts.push(`obs=${truncateText(input.row.values.observacao, 160)}`);
  }
  return parts.join(" | ");
}

export function getBusinessDateSaoPaulo() {
  return getSaoPauloBusinessDateYmd();
}

export function parseSpreadsheetDate(raw: string): string | null {
  const parsed = parseDateInput(raw.trim());
  if (!parsed.date) return null;
  return parsed.date.toISOString();
}
