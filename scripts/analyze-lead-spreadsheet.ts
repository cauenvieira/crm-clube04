import { existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  addCounter,
  canonicalFromHeaderFactory,
  createCounter,
  createDateStats,
  normalizePhone,
  normalizeText,
  toIndexMap,
  topCounter,
  type DateStats,
  updateDateStats
} from "./analyze-lead-spreadsheet-utils.js";
import { readFirstSheet, type SpreadsheetRow } from "./xlsx-first-sheet-reader.js";

type CanonicalField =
  | "tutor"
  | "telefone"
  | "metodoEntrada"
  | "entradaLead"
  | "atendente"
  | "statusAtendimento"
  | "dataAtendimento"
  | "tentativaNumero"
  | "proximaAcao"
  | "dataProxAcao"
  | "observacao"
  | "dataAnalise"
  | "qualificado"
  | "contatoEstabelecido"
  | "motivoMacro"
  | "motivoMicro"
  | "obsAnalise"
  | "conclusaoAnalise"
  | "excluirContato"
  | "observacaoFinal";

type ParsedRow = {
  rowNumber: number;
  cellsByIndex: Record<number, string>;
};

const requiredHeaders: CanonicalField[] = [
  "tutor",
  "telefone",
  "metodoEntrada",
  "entradaLead",
  "atendente",
  "statusAtendimento",
  "dataAtendimento",
  "tentativaNumero",
  "proximaAcao",
  "dataProxAcao",
  "observacao"
];

const headerAliases: Record<CanonicalField, string[]> = {
  tutor: ["tutor"],
  telefone: ["telefone", "tel", "celular"],
  metodoEntrada: ["metodo entrada", "metodo de entrada", "origem lead", "origem"],
  entradaLead: ["entrada lead", "data entrada lead", "entrada"],
  atendente: ["atendente", "responsavel"],
  statusAtendimento: ["status atendimento", "status", "status do atendimento"],
  dataAtendimento: ["data atendimento", "data do atendimento"],
  tentativaNumero: ["tentativa numero", "tentativa", "numero tentativa", "tentativa n", "tentativa no"],
  proximaAcao: ["proxima acao", "proxima acao?"],
  dataProxAcao: ["data prox acao", "data proxima acao", "data prox. acao"],
  observacao: ["observacao", "observacoes"],
  dataAnalise: ["data da analise", "data analise"],
  qualificado: ["qualificado", "qualificado?"],
  contatoEstabelecido: ["contato estabelecido", "contato estabelecido?"],
  motivoMacro: ["motivo macro", "macro motivo"],
  motivoMicro: ["motivo micro", "micro motivo"],
  obsAnalise: ["obs:", "obs", "obs analise"],
  conclusaoAnalise: ["conclusao da analise", "conclusao analise"],
  excluirContato: ["excluir contato"],
  observacaoFinal: ["observacao final", "obs final"]
};
const canonicalFromHeader = canonicalFromHeaderFactory(headerAliases);

function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error(
      'Uso: npm run analyze:lead-spreadsheet -- ".tmp\\\\imports\\\\02 - Controle - Jornada do Lead Whatsapp.xlsx"'
    );
  }

  const absolutePath = resolve(inputPath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Arquivo nao encontrado: ${absolutePath}`);
  }

  const workbook = readFirstSheet(absolutePath);
  if (normalizeText(workbook.firstSheetName) !== normalizeText("Jornada do Lead")) {
    throw new Error(
      `A primeira aba deve ser "Jornada do Lead". Encontrado: "${workbook.firstSheetName}".`
    );
  }

  const headerRow = detectHeaderRow(workbook.rows);
  const columnMap = buildColumnMap(headerRow);
  const missingRequired = requiredHeaders.filter((field) => !columnMap[field] || columnMap[field].length === 0);

  const dataRows = workbook.rows
    .filter((row) => row.rowNumber > headerRow.rowNumber)
    .map((row) => mapRow(row, headerRow))
    .filter((row) => Object.values(row.cellsByIndex).some((value) => value.trim().length > 0));

  const report = buildReport(dataRows, columnMap);
  printReport({
    filePath: absolutePath,
    sheetNames: workbook.sheetNames,
    headerRowNumber: headerRow.rowNumber,
    missingRequired,
    report
  });
}

type HeaderRow = { rowNumber: number; headersByIndex: Record<number, string> };

function detectHeaderRow(rows: SpreadsheetRow[]): HeaderRow {
  const candidates = rows
    .filter((row) => row.rowNumber <= 100)
    .map((row) => {
      const headersByIndex = toIndexMap(row.cells);
      const score = Object.values(headersByIndex).reduce((acc, value) => {
        return acc + (canonicalFromHeader(value) ? 1 : 0);
      }, 0);
      return { rowNumber: row.rowNumber, headersByIndex, score };
    });

  const best = candidates.sort((a, b) => b.score - a.score || a.rowNumber - b.rowNumber)[0];
  if (!best || best.score < 5) {
    throw new Error("Nao foi possivel identificar a linha de cabecalho com confianca.");
  }
  return { rowNumber: best.rowNumber, headersByIndex: best.headersByIndex };
}

function buildColumnMap(headerRow: HeaderRow): Record<CanonicalField, number[]> {
  const map = {} as Record<CanonicalField, number[]>;
  for (const field of Object.keys(headerAliases) as CanonicalField[]) map[field] = [];

  for (const [indexText, header] of Object.entries(headerRow.headersByIndex)) {
    const index = Number(indexText);
    const canonical = canonicalFromHeader(header);
    if (canonical) map[canonical].push(index);
  }
  return map;
}

function mapRow(row: SpreadsheetRow, headerRow: HeaderRow): ParsedRow {
  const rowCells = toIndexMap(row.cells);
  const cellsByIndex: Record<number, string> = {};

  for (const [indexText] of Object.entries(headerRow.headersByIndex)) {
    const index = Number(indexText);
    cellsByIndex[index] = rowCells[index] ?? "";
  }
  return { rowNumber: row.rowNumber, cellsByIndex };
}

function buildReport(rows: ParsedRow[], columns: Record<CanonicalField, number[]>) {
  const total = rows.length;
  const issues: Array<{ rowNumber: number; reasons: string[]; tutor: string; telefone: string }> = [];
  const phoneCount = new Map<string, number>();

  const counterMetodo = createCounter();
  const counterAtendente = createCounter();
  const counterStatus = createCounter();
  const counterProximaAcao = createCounter();

  let semTelefone = 0;
  let semTutor = 0;
  let semMetodo = 0;
  let semStatus = 0;
  let semProximaAcao = 0;
  let validRows = 0;
  let leadershipFilled = 0;
  let franchiseFilled = 0;

  const entradaLeadDates = createDateStats();
  const dataAtendimentoDates = createDateStats();
  const dataProxAcaoDates = createDateStats();

  for (const row of rows) {
    const tutor = getFirst(row, columns, "tutor");
    const telefone = getFirst(row, columns, "telefone");
    const metodo = getFirst(row, columns, "metodoEntrada");
    const status = getFirst(row, columns, "statusAtendimento");
    const proximaAcao = getFirst(row, columns, "proximaAcao");
    const normalPhone = normalizePhone(telefone);

    const reasons: string[] = [];
    if (!normalPhone) {
      semTelefone++;
      reasons.push("sem telefone");
    }
    if (!tutor.trim()) {
      semTutor++;
      reasons.push("sem tutor");
    }
    if (!metodo.trim()) {
      semMetodo++;
      reasons.push("sem metodo de entrada");
    }
    if (!status.trim()) {
      semStatus++;
      reasons.push("sem status atendimento");
    }
    if (!proximaAcao.trim()) {
      semProximaAcao++;
      reasons.push("sem proxima acao");
    }

    if (reasons.length === 0) validRows++;
    if (reasons.length > 0 && issues.length < 20) {
      issues.push({ rowNumber: row.rowNumber, reasons, tutor, telefone });
    }

    if (normalPhone) phoneCount.set(normalPhone, (phoneCount.get(normalPhone) ?? 0) + 1);
    addCounter(counterMetodo, metodo);
    addCounter(counterAtendente, getFirst(row, columns, "atendente"));
    addCounter(counterStatus, status);
    addCounter(counterProximaAcao, proximaAcao);

    updateDateStats(entradaLeadDates, getFirst(row, columns, "entradaLead"));
    updateDateStats(dataAtendimentoDates, getFirst(row, columns, "dataAtendimento"));
    updateDateStats(dataProxAcaoDates, getFirst(row, columns, "dataProxAcao"));

    if (hasAny(row, columns, ["dataAnalise", "qualificado", "contatoEstabelecido", "motivoMacro", "motivoMicro", "obsAnalise"])) leadershipFilled++;
    if (hasAny(row, columns, ["conclusaoAnalise", "excluirContato", "observacaoFinal"])) franchiseFilled++;
  }

  const duplicatedPhones = Array.from(phoneCount.values()).filter((count) => count > 1).length;
  return {
    totalRows: total,
    validRows,
    semTelefone,
    semTutor,
    semMetodo,
    semStatus,
    semProximaAcao,
    uniquePhones: phoneCount.size,
    duplicatedPhones,
    topMetodo: topCounter(counterMetodo, 20),
    topAtendente: topCounter(counterAtendente, 20),
    topStatus: topCounter(counterStatus, 20),
    topProximaAcao: topCounter(counterProximaAcao, 20),
    leadershipFilled,
    franchiseFilled,
    entradaLeadDates,
    dataAtendimentoDates,
    dataProxAcaoDates,
    issues
  };
}

function printReport(input: {
  filePath: string;
  sheetNames: string[];
  headerRowNumber: number;
  missingRequired: CanonicalField[];
  report: ReturnType<typeof buildReport>;
}) {
  const { report } = input;
  console.log("Lead spreadsheet diagnostics v1");
  console.log(`Arquivo: ${input.filePath}`);
  console.log(`Abas detectadas: ${input.sheetNames.join(" | ")}`);
  console.log(`Aba usada: ${input.sheetNames[0]}`);
  console.log(`Linha de header detectada: ${input.headerRowNumber}`);
  console.log(`Headers obrigatorios ausentes: ${input.missingRequired.length === 0 ? "nenhum" : input.missingRequired.join(", ")}`);
  console.log(`Total de linhas de dados: ${report.totalRows}`);
  console.log(`Linhas validas: ${report.validRows}`);
  console.log(`Linhas sem telefone: ${report.semTelefone}`);
  console.log(`Linhas sem tutor: ${report.semTutor}`);
  console.log(`Linhas sem metodo de entrada: ${report.semMetodo}`);
  console.log(`Linhas sem status: ${report.semStatus}`);
  console.log(`Linhas sem proxima acao: ${report.semProximaAcao}`);
  console.log(`Telefones unicos: ${report.uniquePhones}`);
  console.log(`Telefones duplicados: ${report.duplicatedPhones}`);
  printTop("Top 20 metodos de entrada", report.topMetodo);
  printTop("Top 20 atendentes", report.topAtendente);
  printTop("Top 20 status atendimento", report.topStatus);
  printTop("Top 20 proximas acoes", report.topProximaAcao);
  console.log(`Linhas com analise de lideranca preenchida: ${report.leadershipFilled}`);
  console.log(`Linhas com analise de franqueados preenchida: ${report.franchiseFilled}`);
  printDateStats("Entrada lead", report.entradaLeadDates);
  printDateStats("Data atendimento", report.dataAtendimentoDates);
  printDateStats("Data Prox Acao", report.dataProxAcaoDates);
  console.log("Amostras de linhas problematicas (max 20):");
  if (report.issues.length === 0) console.log("- nenhuma");
  for (const issue of report.issues) {
    console.log(`- row ${issue.rowNumber}: ${issue.reasons.join(", ")} | tutor="${issue.tutor}" | telefone="${issue.telefone}"`);
  }
}

const getFirst = (row: ParsedRow, columns: Record<CanonicalField, number[]>, field: CanonicalField) => {
  const index = columns[field]?.[0];
  if (index === undefined) return "";
  return row.cellsByIndex[index] ?? "";
};

const hasAny = (row: ParsedRow, columns: Record<CanonicalField, number[]>, fields: CanonicalField[]) => fields.some((field) => getFirst(row, columns, field).trim().length > 0);

function printTop(label: string, entries: Array<{ count: number; sample: string }>) {
  console.log(label + ":");
  if (entries.length === 0) {
    console.log("- nenhum");
    return;
  }
  entries.forEach((item) => console.log(`- ${item.sample}: ${item.count}`));
}

function printDateStats(label: string, stats: DateStats) {
  const min = stats.min ? stats.min.toISOString() : "n/a";
  const max = stats.max ? stats.max.toISOString() : "n/a";
  console.log(`${label} min/max: ${min} | ${max}`);
  console.log(`${label} datas invalidas: ${stats.invalidCount} | suspeitas: ${stats.suspectCount}`);
  if (stats.invalidSamples.length > 0) console.log(`${label} invalid samples: ${stats.invalidSamples.join(" | ")}`);
  if (stats.suspectSamples.length > 0) console.log(`${label} suspect samples: ${stats.suspectSamples.join(" | ")}`);
}

main();
