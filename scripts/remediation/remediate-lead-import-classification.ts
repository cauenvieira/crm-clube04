import { normalizeText, parseDateInput } from "../imports/lead-spreadsheet/analyze-lead-spreadsheet-utils.js";
import {
  hasStatusActionConflict,
  indicatesConversionBySheet,
  isLeadershipSignal,
  mapNextActionCrosscheck,
  mapStatusCrosscheck,
  parseLegacyAttemptCount
} from "../imports/lead-spreadsheet/lead-customer-crosscheck-utils.js";
import type { ParsedSheetRow } from "../imports/lead-spreadsheet/lead-spreadsheet-import-utils.js";
import type { PessoaCsvData } from "../imports/lead-spreadsheet/pessoa-csv-utils.js";

const JUNE_START = "2026-06-01";
const JUNE_END = "2026-06-30";
const SENSITIVE_OBS_PATTERNS = [
  "reclam",
  "problema",
  "desqualific",
  "devolu",
  "trafeg",
  "lead ruim"
];

export type ActionType = "retomar_atendimento" | "fazer_follow_up" | "revisar_lideranca";
export type SheetBucket = "convertido" | "retomar" | "fazer_follow_up" | "revisar_lideranca";

export type PhonePlan = {
  phone: string;
  row: ParsedSheetRow;
  foundInPessoa: boolean;
  bucket: SheetBucket;
  desiredActionType: ActionType | null;
  desiredDueYmd: string | null;
  backlogCandidate: boolean;
  sortDateProxMs: number;
  sortDataAtendimentoMs: number;
  sortEntradaMs: number;
  criticalReasons: string[];
  notes: string[];
};

export function buildPhonePlans(rowsByPhone: Map<string, ParsedSheetRow[]>, pessoa: PessoaCsvData) {
  const plans = new Map<string, PhonePlan>();

  for (const [phone, groupRows] of rowsByPhone.entries()) {
    const row = groupRows[0];
    if (!row) continue;
    const foundInPessoa = pessoa.phonesIndex.has(phone);
    const conflictingTutor = hasConflictingTutor(groupRows);
    const pessoaNameConflict = foundInPessoa ? hasPessoaNameConflict(row, pessoa, phone) : false;
    const statusBase = mapStatusCrosscheck(row);
    const actionBase = mapNextActionCrosscheck(row);
    const conversionBySheet = indicatesConversionBySheet(row);
    const leadershipBySheet = isLeadershipSignal(row);
    const attemptCount = parseLegacyAttemptCount(row.values.tentativaNumero) ?? 0;
    const hasSensitiveObs = hasSensitiveObservation(row.values.observacao);
    const statusConflict = hasStatusActionConflict(statusBase, actionBase);
    const impossibleToClassify = statusBase === "revisao_manual" || actionBase === "revisao_manual";

    const criticalReasons: string[] = [];
    if (conflictingTutor) criticalReasons.push("duplicate_phone_conflicting_tutor");
    if (pessoaNameConflict) criticalReasons.push("name_conflict_with_pessoa");
    if (attemptCount >= 12 && !foundInPessoa) criticalReasons.push("attempt_count_gte_12");
    if (hasSensitiveObs && !foundInPessoa) criticalReasons.push("sensitive_observation");
    if (statusConflict || impossibleToClassify) criticalReasons.push("impossible_safe_classification");

    const dataProx = parseDateYmd(row.values.dataProxAcao);
    const dataAtendimento = parseDateYmd(row.values.dataAtendimento);
    const entradaLead = parseDateYmd(row.values.entradaLead);
    const validJuneFollowUp =
      !!dataProx &&
      dataProx >= JUNE_START &&
      dataProx <= JUNE_END &&
      (!entradaLead || dataProx >= entradaLead) &&
      criticalReasons.length === 0;

    let bucket: SheetBucket = "retomar";
    let desiredActionType: ActionType | null = "retomar_atendimento";
    let desiredDueYmd: string | null = dataProx;
    let backlogCandidate = true;
    const notes: string[] = [];

    if (foundInPessoa) {
      bucket = "convertido";
      desiredActionType = null;
      desiredDueYmd = null;
      backlogCandidate = false;
    } else if (criticalReasons.length > 0) {
      bucket = "revisar_lideranca";
      desiredActionType = "revisar_lideranca";
      desiredDueYmd = dataProx;
      backlogCandidate = false;
    } else if (conversionBySheet) {
      bucket = "retomar";
      desiredActionType = "retomar_atendimento";
      notes.push("sheet_conversion_without_pessoa_reclassified_to_retomar");
    } else if (leadershipBySheet) {
      bucket = "retomar";
      desiredActionType = "retomar_atendimento";
      notes.push("sheet_analise_lideranca_reclassified_to_retomar");
    } else if (validJuneFollowUp) {
      bucket = "fazer_follow_up";
      desiredActionType = "fazer_follow_up";
      desiredDueYmd = dataProx;
      backlogCandidate = false;
    }

    plans.set(phone, {
      phone,
      row,
      foundInPessoa,
      bucket,
      desiredActionType,
      desiredDueYmd,
      backlogCandidate,
      sortDateProxMs: toSortMs(dataProx),
      sortDataAtendimentoMs: toSortMs(dataAtendimento),
      sortEntradaMs: toSortMs(entradaLead),
      criticalReasons,
      notes
    });
  }

  return plans;
}

export function buildBacklogSchedule(
  plans: Map<string, PhonePlan>,
  startDateYmd: string,
  dailyLimit: number
) {
  const backlogPlans = Array.from(plans.values())
    .filter((plan) => plan.desiredActionType === "retomar_atendimento" && plan.backlogCandidate)
    .sort((a, b) => {
      if (b.sortDateProxMs !== a.sortDateProxMs) return b.sortDateProxMs - a.sortDateProxMs;
      if (b.sortDataAtendimentoMs !== a.sortDataAtendimentoMs) return b.sortDataAtendimentoMs - a.sortDataAtendimentoMs;
      if (b.sortEntradaMs !== a.sortEntradaMs) return b.sortEntradaMs - a.sortEntradaMs;
      return b.row.rowNumber - a.row.rowNumber;
    });

  const byPhone = new Map<string, string>();
  const distribution = new Map<string, number>();

  for (let i = 0; i < backlogPlans.length; i++) {
    const slot = Math.floor(i / dailyLimit);
    const dayYmd = addOperationalDays(startDateYmd, slot);
    byPhone.set(backlogPlans[i]?.phone ?? "", dayYmd);
    distribution.set(dayYmd, (distribution.get(dayYmd) ?? 0) + 1);
  }

  return { byPhone, distribution };
}

export function getNextOperationalDateYmd(now = new Date()) {
  let date = new Date(`${now.toISOString().slice(0, 10)}T12:00:00.000-03:00`);
  do {
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  } while (!isOperationalDay(date));
  return date.toISOString().slice(0, 10);
}

function hasConflictingTutor(groupRows: ParsedSheetRow[]) {
  const names = new Set(groupRows.map((row) => normalizeText(row.values.tutor)).filter(Boolean));
  return names.size > 1;
}

function hasPessoaNameConflict(row: ParsedSheetRow, pessoa: PessoaCsvData, phone: string) {
  const info = pessoa.phonesIndex.get(phone);
  const leadName = normalizeText(row.values.tutor);
  if (!info || !leadName) return false;
  return !Array.from(info.names).some((name) => name === leadName || name.includes(leadName) || leadName.includes(name));
}

function hasSensitiveObservation(raw: string) {
  const text = normalizeText(raw);
  if (!text) return false;
  return SENSITIVE_OBS_PATTERNS.some((pattern) => text.includes(pattern));
}

function parseDateYmd(raw: string): string | null {
  const parsed = parseDateInput(raw.trim());
  if (!parsed.date) return null;
  return parsed.date.toISOString().slice(0, 10);
}

function toSortMs(ymd: string | null) {
  if (!ymd) return Number.NEGATIVE_INFINITY;
  return Date.parse(`${ymd}T12:00:00.000Z`);
}

function addOperationalDays(startYmd: string, offset: number): string {
  let date = new Date(`${startYmd}T12:00:00.000-03:00`);
  let steps = 0;
  while (steps < offset) {
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    if (isOperationalDay(date)) steps++;
  }
  while (!isOperationalDay(date)) {
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }
  return date.toISOString().slice(0, 10);
}

function isOperationalDay(date: Date) {
  const day = date.getUTCDay();
  return day >= 2 && day <= 6;
}

