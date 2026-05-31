import {
  canonicalFromHeaderFactory,
  normalizePhone,
  normalizeText,
  parseDateInput,
  toIndexMap
} from "./analyze-lead-spreadsheet-utils.js";
import type { SpreadsheetRow } from "./xlsx-first-sheet-reader.js";

export type CanonicalField =
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

export type ParsedSheetRow = {
  rowNumber: number;
  values: Record<CanonicalField, string>;
  normalizedPhone: string;
  statusCanonical: string | null;
  nextActionCanonical: string | null;
  nextActionCreatesItem: boolean;
  hasLeadershipAnalysis: boolean;
  hasFranchiseAnalysis: boolean;
};

export type DateFieldName = "entradaLead" | "dataAtendimento" | "dataProxAcao";

export type ParsedDate = {
  field: DateFieldName;
  raw: string;
  date: Date | null;
  invalid: boolean;
};

const aliases: Record<CanonicalField, string[]> = {
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

const canonicalHeader = canonicalFromHeaderFactory(aliases);

export const requiredHeaders: CanonicalField[] = [
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

export function detectHeaderRow(rows: SpreadsheetRow[]) {
  const candidates = rows
    .filter((row) => row.rowNumber <= 100)
    .map((row) => {
      const headersByIndex = toIndexMap(row.cells);
      const score = Object.values(headersByIndex).reduce(
        (acc, header) => acc + (canonicalHeader(header) ? 1 : 0),
        0
      );
      return { rowNumber: row.rowNumber, headersByIndex, score };
    });

  const best = candidates.sort((a, b) => b.score - a.score || a.rowNumber - b.rowNumber)[0];
  if (!best || best.score < 5) throw new Error("Nao foi possivel identificar cabecalho com confianca.");
  return best;
}

export function buildColumnMap(headerByIndex: Record<number, string>) {
  const map = {} as Record<CanonicalField, number[]>;
  for (const field of Object.keys(aliases) as CanonicalField[]) map[field] = [];
  for (const [indexText, header] of Object.entries(headerByIndex)) {
    const canonical = canonicalHeader(header);
    if (!canonical) continue;
    map[canonical].push(Number(indexText));
  }
  return map;
}

export function missingRequiredColumns(columnMap: Record<CanonicalField, number[]>) {
  return requiredHeaders.filter((field) => !columnMap[field] || columnMap[field].length === 0);
}

export function parseRows(rows: SpreadsheetRow[], headerRowNumber: number, columnMap: Record<CanonicalField, number[]>) {
  const parsed: ParsedSheetRow[] = [];

  for (const row of rows) {
    if (row.rowNumber <= headerRowNumber) continue;
    const rowByIndex = toIndexMap(row.cells);
    const values = {} as Record<CanonicalField, string>;
    for (const field of Object.keys(columnMap) as CanonicalField[]) {
      const index = columnMap[field][0];
      values[field] = index === undefined ? "" : (rowByIndex[index] ?? "");
    }
    if (!Object.values(values).some((value) => value.trim().length > 0)) continue;

    const normalizedPhone = normalizePhone(values.telefone);
    const statusCanonical = mapStatus(values.statusAtendimento);
    const action = mapNextAction(values.proximaAcao);

    parsed.push({
      rowNumber: row.rowNumber,
      values,
      normalizedPhone,
      statusCanonical,
      nextActionCanonical: action.canonical,
      nextActionCreatesItem: action.createsItem,
      hasLeadershipAnalysis: hasAny(values, [
        "dataAnalise",
        "qualificado",
        "contatoEstabelecido",
        "motivoMacro",
        "motivoMicro",
        "obsAnalise"
      ]),
      hasFranchiseAnalysis: hasAny(values, [
        "conclusaoAnalise",
        "excluirContato",
        "observacaoFinal"
      ])
    });
  }

  return parsed;
}

export function mapStatus(raw: string) {
  const normalized = normalizeText(raw);
  if (!normalized) return null;
  if (normalized.includes("em espera")) return "novo_lead";
  if (normalized.includes("em atendimento")) return "em_atendimento";
  if (normalized.includes("agendamento realizado")) return "agendado";
  if (normalized.includes("pagamento realizado")) return "pagamento_realizado";
  if (normalized.includes("jornada concluida")) return "convertido_cliente";
  if (normalized.includes("sem retorno")) return "sem_retorno";
  return null;
}

export function mapNextAction(raw: string) {
  const normalized = normalizeText(raw);
  if (!normalized) return { canonical: null, createsItem: false };
  if (normalized.includes("continuar atendimento")) return { canonical: "follow_up_lead", createsItem: true };
  if (normalized.includes("analise lideranca")) return { canonical: "revisao_lideranca", createsItem: true };
  if (normalized.includes("jornada concluida")) return { canonical: "nenhuma", createsItem: false };
  if (normalized.includes("sem retorno")) return { canonical: "follow_up_ou_revisao", createsItem: true };
  return { canonical: null, createsItem: false };
}

export function parseDateField(field: DateFieldName, raw: string): ParsedDate {
  const trimmed = raw.trim();
  if (!trimmed) return { field, raw: "", date: null, invalid: false };
  const parsed = parseDateInput(trimmed);
  if (!parsed.date) return { field, raw: trimmed, date: null, invalid: true };
  return { field, raw: trimmed, date: parsed.date, invalid: false };
}

export function pickMostRecentRow(rows: ParsedSheetRow[]) {
  const withScores = rows.map((row) => ({
    row,
    dateAtendimento: parseDateField("dataAtendimento", row.values.dataAtendimento).date?.getTime() ?? Number.NEGATIVE_INFINITY,
    dateProxAcao: parseDateField("dataProxAcao", row.values.dataProxAcao).date?.getTime() ?? Number.NEGATIVE_INFINITY,
    entradaLead: parseDateField("entradaLead", row.values.entradaLead).date?.getTime() ?? Number.NEGATIVE_INFINITY
  }));

  return withScores.sort((a, b) => {
    if (b.dateAtendimento !== a.dateAtendimento) return b.dateAtendimento - a.dateAtendimento;
    if (b.dateProxAcao !== a.dateProxAcao) return b.dateProxAcao - a.dateProxAcao;
    if (b.entradaLead !== a.entradaLead) return b.entradaLead - a.entradaLead;
    return b.row.rowNumber - a.row.rowNumber;
  })[0]?.row;
}

export function hasConflictingTutor(rows: ParsedSheetRow[]) {
  const names = new Set(rows.map((row) => normalizeText(row.values.tutor)).filter(Boolean));
  return names.size > 1;
}

export function maskPhone(phone: string) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
}

export function truncateSample(text: string, size = 50) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= size) return compact;
  return `${compact.slice(0, size)}...`;
}

function hasAny(values: Record<CanonicalField, string>, fields: CanonicalField[]) {
  return fields.some((field) => values[field].trim().length > 0);
}
