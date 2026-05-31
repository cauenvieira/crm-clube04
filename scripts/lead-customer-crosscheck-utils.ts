import { normalizeText, parseDateInput } from "./analyze-lead-spreadsheet-utils.js";
import type { ParsedSheetRow } from "./lead-spreadsheet-import-utils.js";
export type CanonicalLeadStatus =
  | "novo_lead"
  | "em_atendimento"
  | "agendado"
  | "validar_conversao"
  | "convertido_cliente"
  | "sem_retorno"
  | "revisao_lideranca"
  | "desqualificado"
  | "revisao_manual";

export type CanonicalNextAction =
  | "fazer_follow_up"
  | "revisar_lideranca"
  | "validar_conversao"
  | "retomar_atendimento"
  | "nenhuma"
  | "revisao_manual";

export type ConsolidatedLead = {
  phone: string;
  row: ParsedSheetRow;
  groupRows: ParsedSheetRow[];
  statusBase: CanonicalLeadStatus;
  actionBase: CanonicalNextAction;
  foundInPessoa: boolean;
  indicatesConversionBySheet: boolean;
  statusFinal: CanonicalLeadStatus;
  actionItemType: "fazer_follow_up" | "revisar_lideranca" | "validar_conversao" | "retomar_atendimento" | null;
  overdueNextAction: boolean;
  manualReviewReason: string | null;
  legacyAttemptCount: number | null;
};

export type DueBucket = "vencida" | "futura" | "sem_data";

export function mapStatusCrosscheck(row: ParsedSheetRow): CanonicalLeadStatus {
  const status = normalizeText(row.values.statusAtendimento);
  const action = normalizeText(row.values.proximaAcao);

  if (status.includes("em espera")) return "novo_lead";
  if (status.includes("em atendimento")) return "em_atendimento";
  if (status.includes("agendamento realizado")) return "agendado";
  if (status.includes("pagamento realizado")) return "validar_conversao";
  if (status.includes("jornada concluida")) return "validar_conversao";
  if (status.includes("sem retorno")) return "sem_retorno";
  if (status.includes("desqualificado")) return "desqualificado";
  if (status.includes("analise lideranca") || action.includes("analise lideranca")) return "revisao_lideranca";
  return status ? "revisao_manual" : "revisao_manual";
}

export function mapNextActionCrosscheck(row: ParsedSheetRow): CanonicalNextAction {
  const action = normalizeText(row.values.proximaAcao);
  if (!action) return "nenhuma";
  if (action.includes("continuar atendimento")) return "fazer_follow_up";
  if (action.includes("analise lideranca")) return "revisar_lideranca";
  if (action.includes("jornada concluida")) return "validar_conversao";
  if (action.includes("sem retorno")) return "retomar_atendimento";
  return "revisao_manual";
}

export function indicatesConversionBySheet(row: ParsedSheetRow): boolean {
  const status = normalizeText(row.values.statusAtendimento);
  const action = normalizeText(row.values.proximaAcao);
  return (
    status.includes("jornada concluida") ||
    status.includes("pagamento realizado") ||
    status.includes("agendamento realizado") ||
    action.includes("jornada concluida")
  );
}

export function hasStatusActionConflict(status: CanonicalLeadStatus, action: CanonicalNextAction): boolean {
  if (status === "revisao_manual" || action === "revisao_manual") return true;
  if (status === "convertido_cliente" && action !== "nenhuma") return true;
  if (status === "validar_conversao" && (action === "fazer_follow_up" || action === "retomar_atendimento")) {
    return true;
  }
  if (status === "sem_retorno" && action === "validar_conversao") return true;
  return false;
}

export function isLeadershipSignal(row: ParsedSheetRow): boolean {
  const status = normalizeText(row.values.statusAtendimento);
  const action = normalizeText(row.values.proximaAcao);
  return status.includes("analise lideranca") || action.includes("analise lideranca");
}

export function getSaoPauloBusinessDateYmd(now = new Date()): string {
  return formatDateInTimeZone(now, "America/Sao_Paulo");
}

export function getDueBucket(rawDate: string, referenceYmd: string): DueBucket {
  const parsed = parseDateInput(rawDate.trim());
  if (!parsed.date) return "sem_data";
  const dueYmd = toUtcYmd(parsed.date);
  if (dueYmd < referenceYmd) return "vencida";
  return "futura";
}

export function parseLegacyAttemptCount(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  const value = Number.parseInt(digits, 10);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value;
}

function toUtcYmd(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
}
