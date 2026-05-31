import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { normalizeText } from "./analyze-lead-spreadsheet-utils.js";
import {
  mapStatusCrosscheck,
  mapNextActionCrosscheck,
  indicatesConversionBySheet,
  hasStatusActionConflict,
  isLeadershipSignal,
  getDueBucket,
  getSaoPauloBusinessDateYmd,
  parseLegacyAttemptCount,
} from "./lead-customer-crosscheck-utils.js";
import { printCrosscheckSummary, pushSample } from "./lead-crosscheck-report.js";
import {
  detectHeaderRow,
  buildColumnMap,
  missingRequiredColumns,
  parseRows,
  pickMostRecentRow,
  hasConflictingTutor
} from "./lead-spreadsheet-import-utils.js";
import { readPessoaCsv, maskName, maskPhone, truncateSafe } from "./pessoa-csv-utils.js";
import { readFirstSheet } from "./xlsx-first-sheet-reader.js";

const OPERATIONAL_TIMEZONE = "America/Sao_Paulo";

function main() {
  const leadSheetPath = process.argv[2];
  const pessoaCsvPath = process.argv[3];
  if (!leadSheetPath || !pessoaCsvPath) {
    throw new Error(
      'Uso: npm run import:lead-spreadsheet:crosscheck-dry-run -- ".tmp\\\\imports\\\\02 - Controle - Jornada do Lead Whatsapp.xlsx" ".tmp\\\\imports\\\\Pessoa.csv"'
    );
  }

  const leadsAbsolute = resolve(leadSheetPath);
  const pessoaAbsolute = resolve(pessoaCsvPath);
  if (!existsSync(leadsAbsolute)) throw new Error(`Arquivo nao encontrado: ${leadsAbsolute}`);
  if (!existsSync(pessoaAbsolute)) throw new Error(`Arquivo nao encontrado: ${pessoaAbsolute}`);

  const workbook = readFirstSheet(leadsAbsolute);
  if (normalizeText(workbook.firstSheetName) !== normalizeText("Jornada do Lead")) {
    throw new Error(`A primeira aba deve ser Jornada do Lead. Encontrado: ${workbook.firstSheetName}`);
  }

  const header = detectHeaderRow(workbook.rows);
  const columnMap = buildColumnMap(header.headersByIndex);
  const missing = missingRequiredColumns(columnMap);
  if (missing.length > 0) throw new Error(`Headers obrigatorios ausentes: ${missing.join(", ")}`);

  const rows = parseRows(workbook.rows, header.rowNumber, columnMap);
  const pessoa = readPessoaCsv(pessoaAbsolute);
  const businessDateYmd = getSaoPauloBusinessDateYmd();

  const rejectedByPhone = rows.filter((row) => !row.normalizedPhone);
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!row.normalizedPhone) continue;
    if (!grouped.has(row.normalizedPhone)) grouped.set(row.normalizedPhone, []);
    grouped.get(row.normalizedPhone)?.push(row);
  }

  const samplesJornadaSemCliente: string[] = [];
  const samplesPagamentoSemCliente: string[] = [];
  const samplesVencidosSemConversao: string[] = [];
  const samplesAnaliseLideranca: string[] = [];
  const samplesTelefoneConflito: string[] = [];
  const samplesNomeConflitoLeadVsPessoa: string[] = [];
  const samplesRetomarAtendimento: string[] = [];

  let leadsFoundInPessoa = 0;
  let jornadaConcluidaAndFound = 0;
  let jornadaConcluidaWithoutPessoa = 0;
  let pagamentoSemPessoa = 0;
  let leadsValidarConversao = 0;
  let leadsRetomarAtendimento = 0;
  let leadsRevisarLideranca = 0;
  let leadsRevisaoManual = 0;
  let retomarAtendimentoTotal = 0;
  let legacyAttemptCountFilled = 0;

  const actionItemCounts = new Map<string, number>([
    ["fazer_follow_up", 0],
    ["revisar_lideranca", 0],
    ["validar_conversao", 0],
    ["retomar_atendimento", 0]
  ]);
  const retomarByStatus = new Map<string, number>();
  const retomarByAtendente = new Map<string, number>();
  const revisarLiderancaBreakdown: Record<
    "total" | "vencida" | "sem_data" | "futura" | "com_cliente_encontrado" | "sem_cliente_encontrado",
    number
  > = {
    total: 0,
    vencida: 0,
    sem_data: 0,
    futura: 0,
    com_cliente_encontrado: 0,
    sem_cliente_encontrado: 0
  };

  for (const [phone, groupRows] of grouped.entries()) {
    const latest = pickMostRecentRow(groupRows);
    if (!latest) continue;

    const foundInPessoa = pessoa.phonesIndex.has(phone);
    if (foundInPessoa) leadsFoundInPessoa++;

    const statusBase = mapStatusCrosscheck(latest);
    const actionBase = mapNextActionCrosscheck(latest);
    const conversionBySheet = indicatesConversionBySheet(latest);
    const dueBucket = getDueBucket(latest.values.dataProxAcao, businessDateYmd);
    const overdue = dueBucket === "vencida";
    const conflictingTutor = hasConflictingTutor(groupRows);
    const leadershipSignal = isLeadershipSignal(latest);

    let statusFinal = statusBase;
    let actionItem: "fazer_follow_up" | "revisar_lideranca" | "validar_conversao" | "retomar_atendimento" | null =
      null;

    const hasConflict =
      conflictingTutor ||
      hasStatusActionConflict(statusBase, actionBase) ||
      statusBase === "revisao_manual" ||
      actionBase === "revisao_manual";

    if (hasConflict) {
      statusFinal = "revisao_manual";
    } else if (foundInPessoa && conversionBySheet) {
      statusFinal = "convertido_cliente";
      actionItem = null;
    } else if (!foundInPessoa && conversionBySheet) {
      statusFinal = "validar_conversao";
      actionItem = "validar_conversao";
    } else if (leadershipSignal || statusBase === "revisao_lideranca" || actionBase === "revisar_lideranca") {
      statusFinal = "revisao_lideranca";
      actionItem = "revisar_lideranca";
    } else if (overdue) {
      statusFinal = statusBase;
      actionItem = "retomar_atendimento";
    } else if (actionBase === "fazer_follow_up") {
      statusFinal = statusBase;
      actionItem = "fazer_follow_up";
    }

    if (statusFinal === "validar_conversao") leadsValidarConversao++;
    if (actionItem === "retomar_atendimento") leadsRetomarAtendimento++;
    if (actionItem === "revisar_lideranca") leadsRevisarLideranca++;
    if (statusFinal === "revisao_manual") leadsRevisaoManual++;
    if (actionItem) actionItemCounts.set(actionItem, (actionItemCounts.get(actionItem) ?? 0) + 1);
    if (actionItem === "retomar_atendimento") {
      retomarAtendimentoTotal++;
      addCount(retomarByStatus, statusFinal);
      const atendente = normalizeAttendant(latest.values.atendente);
      addCount(retomarByAtendente, atendente);
      pushSample(
        samplesRetomarAtendimento,
        `row ${latest.rowNumber} phone ${maskPhone(phone)} status ${statusFinal} atd ${truncateSafe(atendente, 14)}`
      );
    }
    if (actionItem === "revisar_lideranca") {
      revisarLiderancaBreakdown.total++;
      if (dueBucket === "vencida") revisarLiderancaBreakdown.vencida++;
      if (dueBucket === "sem_data") revisarLiderancaBreakdown.sem_data++;
      if (dueBucket === "futura") revisarLiderancaBreakdown.futura++;
      if (foundInPessoa) revisarLiderancaBreakdown.com_cliente_encontrado++;
      if (!foundInPessoa) revisarLiderancaBreakdown.sem_cliente_encontrado++;
    }

    const statusText = normalizeText(latest.values.statusAtendimento);
    if (statusText.includes("jornada concluida") && foundInPessoa) jornadaConcluidaAndFound++;
    if (statusText.includes("jornada concluida") && !foundInPessoa) {
      jornadaConcluidaWithoutPessoa++;
      pushSample(
        samplesJornadaSemCliente,
        `row ${latest.rowNumber} phone ${maskPhone(phone)} name ${maskName(latest.values.tutor)}`
      );
    }
    if (statusText.includes("pagamento realizado") && !foundInPessoa) {
      pagamentoSemPessoa++;
      pushSample(
        samplesPagamentoSemCliente,
        `row ${latest.rowNumber} phone ${maskPhone(phone)} name ${maskName(latest.values.tutor)}`
      );
    }
    if (!foundInPessoa && overdue) {
      pushSample(
        samplesVencidosSemConversao,
        `row ${latest.rowNumber} phone ${maskPhone(phone)} next ${truncateSafe(latest.values.dataProxAcao, 12)}`
      );
    }
    if (actionItem === "revisar_lideranca") {
      pushSample(
        samplesAnaliseLideranca,
        `row ${latest.rowNumber} phone ${maskPhone(phone)} due ${dueBucket} status ${truncateSafe(
          latest.values.statusAtendimento,
          16
        )}`
      );
    }
    if (conflictingTutor) {
      pushSample(
        samplesTelefoneConflito,
        `phone ${maskPhone(phone)} rows ${groupRows.map((item) => item.rowNumber).join(",")}`
      );
    }

    if (foundInPessoa) {
      const pessoaInfo = pessoa.phonesIndex.get(phone);
      const leadNameNorm = normalizeText(latest.values.tutor);
      const hasNameMatch = Array.from(pessoaInfo?.names ?? []).some((name) => {
        return name === leadNameNorm || name.includes(leadNameNorm) || leadNameNorm.includes(name);
      });
      if (leadNameNorm && !hasNameMatch) {
        pushSample(
          samplesNomeConflitoLeadVsPessoa,
          `phone ${maskPhone(phone)} lead ${maskName(latest.values.tutor)} pessoa ${maskName(pessoaInfo?.sampleName ?? "")}`
        );
      }
    }

    if (parseLegacyAttemptCount(latest.values.tentativaNumero) !== null) legacyAttemptCountFilled++;
  }

  printCrosscheckSummary({
    leadsSheetPath: leadsAbsolute,
    pessoaCsvPath: pessoaAbsolute,
    totalLeadRows: rows.length,
    leadUniquePhones: grouped.size,
    rejectedNoPhone: rejectedByPhone.length,
    pessoaTotalLines: pessoa.totalLines,
    pessoaUniquePhones: pessoa.uniquePhones,
    pessoaLinesWithoutPhone: pessoa.linesWithoutPhone,
    pessoaPhonesWithMultiplePets: pessoa.phonesWithMultiplePets,
    pessoaPhonesWithConflictingNames: pessoa.phonesWithConflictingNames,
    leadsFoundInPessoa,
    jornadaConcluidaAndFound,
    jornadaConcluidaWithoutPessoa,
    pagamentoSemPessoa,
    leadsValidarConversao,
    leadsRetomarAtendimento,
    leadsRevisarLideranca,
    leadsRevisaoManual,
    legacyAttemptCountFilled,
    referenceTimezone: OPERATIONAL_TIMEZONE,
    referenceBusinessDate: businessDateYmd,
    retomarAtendimentoTotal,
    retomarByStatus,
    retomarByAtendente,
    revisarLiderancaBreakdown,
    actionItemCounts,
    samplesJornadaSemCliente,
    samplesPagamentoSemCliente,
    samplesVencidosSemConversao,
    samplesRetomarAtendimento,
    samplesAnaliseLideranca,
    samplesTelefoneConflito,
    samplesNomeConflitoLeadVsPessoa,
    pessoaConflictingPhones: pessoa.conflictingPhoneSamples
  });
}

function addCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function normalizeAttendant(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "sem_atendente";
  return trimmed;
}

main();
