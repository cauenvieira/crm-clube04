import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { assertLocalSafeEnvironment, closeDbContext, createDbContext } from "../dev-data/dev-data-helpers.js";
import { normalizeText } from "../imports/lead-spreadsheet/analyze-lead-spreadsheet-utils.js";
import {
  buildColumnMap,
  detectHeaderRow,
  missingRequiredColumns,
  parseRows,
  pickMostRecentRow
} from "../imports/lead-spreadsheet/lead-spreadsheet-import-utils.js";
import { readPessoaCsv } from "../imports/lead-spreadsheet/pessoa-csv-utils.js";
import { readFirstSheet } from "../imports/lead-spreadsheet/xlsx-first-sheet-reader.js";
import {
  buildBacklogSchedule,
  buildPhonePlans,
  getNextOperationalDateYmd
} from "./remediate-lead-import-classification.js";
import {
  applyRemediation,
  loadOpenActionItemsByLead,
  loadSpreadsheetImportLeads
} from "./remediate-lead-import-db.js";

const DEFAULT_LEADS_PATH = ".tmp/imports/02 - Controle - Jornada do Lead Whatsapp.xlsx";
const DEFAULT_PESSOA_PATH = ".tmp/imports/Pessoa.csv";
const DEFAULT_DAILY_LIMIT = 30;

type CliInput = {
  apply: boolean;
  confirmLocalDev: boolean;
  dailyLimit: number;
  startDate: string | null;
  leadsPath: string;
  pessoaPath: string;
};

async function main() {
  const cli = parseCli(process.argv.slice(2));
  const leadsAbsolute = resolve(cli.leadsPath);
  const pessoaAbsolute = resolve(cli.pessoaPath);

  if (!existsSync(leadsAbsolute)) throw new Error(`Arquivo nao encontrado: ${leadsAbsolute}`);
  if (!existsSync(pessoaAbsolute)) throw new Error(`Arquivo nao encontrado: ${pessoaAbsolute}`);
  if (cli.apply && !cli.confirmLocalDev) throw new Error("Modo APPLY exige --apply --confirm-local-dev.");

  const workbook = readFirstSheet(leadsAbsolute);
  if (normalizeText(workbook.firstSheetName) !== normalizeText("Jornada do Lead")) {
    throw new Error(`A primeira aba deve ser Jornada do Lead. Encontrado: ${workbook.firstSheetName}`);
  }

  const header = detectHeaderRow(workbook.rows);
  const columnMap = buildColumnMap(header.headersByIndex);
  const missing = missingRequiredColumns(columnMap);
  if (missing.length > 0) throw new Error(`Headers obrigatorios ausentes: ${missing.join(", ")}`);

  const allRows = parseRows(workbook.rows, header.rowNumber, columnMap);
  const rowsWithPhone = allRows.filter((row) => row.normalizedPhone);
  const grouped = new Map<string, typeof rowsWithPhone>();
  for (const row of rowsWithPhone) {
    if (!grouped.has(row.normalizedPhone)) grouped.set(row.normalizedPhone, []);
    grouped.get(row.normalizedPhone)?.push(row);
  }

  const byPhone = new Map<string, typeof rowsWithPhone>();
  for (const [phone, rows] of grouped.entries()) {
    const latest = pickMostRecentRow(rows);
    if (!latest) continue;
    byPhone.set(phone, [latest, ...rows.filter((row) => row.rowNumber !== latest.rowNumber)]);
  }

  const pessoa = readPessoaCsv(pessoaAbsolute);
  const phonePlans = buildPhonePlans(byPhone, pessoa);
  const startDateYmd = cli.startDate ?? getNextOperationalDateYmd();
  const backlog = buildBacklogSchedule(phonePlans, startDateYmd, cli.dailyLimit);

  const ctx = createDbContext();
  try {
    await assertLocalSafeEnvironment(ctx);
    const leads = await loadSpreadsheetImportLeads(ctx.pool);
    const openItemsByLead = await loadOpenActionItemsByLead(
      ctx.pool,
      leads.map((lead) => lead.id)
    );
    const remediationContext = {
      phonePlans,
      leadRows: leads,
      openActionItemsByLead: openItemsByLead,
      backlogScheduleByPhone: backlog.byPhone,
      backlogDistribution: backlog.distribution
    };

    const beforeCounts = await queryActionItemCounts(ctx.pool);
    const preview = await applyRemediation(ctx.pool, remediationContext, false);
    printSummary({
      mode: cli.apply ? "APPLY" : "DRY-RUN",
      leadsFile: leadsAbsolute,
      pessoaFile: pessoaAbsolute,
      dailyLimit: cli.dailyLimit,
      startDate: startDateYmd,
      rowsTotal: allRows.length,
      rowsWithPhone: rowsWithPhone.length,
      phonePlans: phonePlans.size,
      dbLeads: leads.length,
      summary: preview,
      beforeCounts
    });

    if (!cli.apply) return;

    const client = await ctx.pool.connect();
    try {
      await client.query("begin");
      await applyRemediation(client, remediationContext, true);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }

    const afterCounts = await queryActionItemCounts(ctx.pool);
    printCounts("Action items apos remediacao", afterCounts);
  } finally {
    await closeDbContext(ctx);
  }
}

function parseCli(argv: string[]): CliInput {
  const flags = new Set<string>();
  let dailyLimitRaw: string | null = null;
  let startDate: string | null = null;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i] ?? "";
    if (arg === "--apply" || arg === "--confirm-local-dev") {
      flags.add(arg);
      continue;
    }
    if (arg.startsWith("--daily-limit=")) {
      dailyLimitRaw = arg.slice("--daily-limit=".length);
      continue;
    }
    if (arg === "--daily-limit") {
      dailyLimitRaw = argv[i + 1] ?? null;
      i++;
      continue;
    }
    if (arg.startsWith("--start-date=")) {
      startDate = arg.slice("--start-date=".length);
      continue;
    }
    if (arg === "--start-date") {
      startDate = argv[i + 1] ?? null;
      i++;
      continue;
    }
  }

  const dailyLimit = dailyLimitRaw ? Number.parseInt(dailyLimitRaw, 10) : DEFAULT_DAILY_LIMIT;
  if (!Number.isFinite(dailyLimit) || dailyLimit <= 0) throw new Error("--daily-limit deve ser inteiro > 0.");
  if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
    throw new Error("--start-date deve usar formato YYYY-MM-DD.");
  }

  return {
    apply: flags.has("--apply"),
    confirmLocalDev: flags.has("--confirm-local-dev"),
    dailyLimit,
    startDate,
    leadsPath: DEFAULT_LEADS_PATH,
    pessoaPath: DEFAULT_PESSOA_PATH
  };
}

async function queryActionItemCounts(pool: { query: (query: string) => Promise<{ rows: Array<{ type: string; status: string; count: string }> }> }) {
  const result = await pool.query(
    `select type, status, count(*)::text as count
      from action_items
      group by type, status
      order by count(*) desc, type asc`
  );
  return result.rows.map((row) => ({ type: row.type, status: row.status, count: Number(row.count) }));
}

function printSummary(input: {
  mode: "DRY-RUN" | "APPLY";
  leadsFile: string;
  pessoaFile: string;
  dailyLimit: number;
  startDate: string;
  rowsTotal: number;
  rowsWithPhone: number;
  phonePlans: number;
  dbLeads: number;
  summary: Awaited<ReturnType<typeof applyRemediation>>;
  beforeCounts: Array<{ type: string; status: string; count: number }>;
}) {
  console.log("Lead import worklist remediation v1");
  console.log(`Modo: ${input.mode}`);
  console.log(`Leads file: ${input.leadsFile}`);
  console.log(`Pessoa file: ${input.pessoaFile}`);
  console.log(`Daily limit: ${input.dailyLimit}`);
  console.log(`Backlog start date: ${input.startDate}`);
  console.log(`Planilha linhas total: ${input.rowsTotal}`);
  console.log(`Planilha linhas com telefone: ${input.rowsWithPhone}`);
  console.log(`Planilha telefones unicos: ${input.phonePlans}`);
  console.log(`Leads spreadsheet_import no banco: ${input.dbLeads}`);
  console.log("Resumo remediacao (simulado):");
  console.log(`- leads alvo: ${input.summary.leadsTargeted}`);
  console.log(`- convertidos por Pessoa.csv: ${input.summary.leadsConvertedByPessoa}`);
  console.log(`- backlog retomar_atendimento: ${input.summary.leadsBacklogRetomar}`);
  console.log(`- follow-up agendado junho/2026: ${input.summary.leadsFollowUpJune}`);
  console.log(`- revisao_lideranca: ${input.summary.leadsRevisaoLideranca}`);
  console.log(`- action_items genericos ignorados: ${input.summary.ignoredGeneric}`);
  console.log(`- action_items especificos ignorados por conflito: ${input.summary.ignoredSpecificConflict}`);
  console.log(`- action_items criados retomar/follow/revisao: ${formatMapTotals(input.summary.actionCreatedByType)}`);
  console.log(`- action_items atualizados retomar/follow/revisao: ${formatMapTotals(input.summary.actionUpdatedByType)}`);
  console.log(`- leads com status atualizado: ${input.summary.leadStatusUpdated}`);
  console.log(`- leads com next_action_at atualizado: ${input.summary.leadNextActionUpdated}`);
  console.log("Distribuicao backlog (30 por dia por padrao):");
  for (const [date, count] of input.summary.backlogDistribution.entries()) {
    console.log(`- ${date}: ${count}`);
  }
  printCounts("Action items antes da remediacao", input.beforeCounts);
}

function printCounts(label: string, rows: Array<{ type: string; status: string; count: number }>) {
  console.log(label + ":");
  for (const row of rows) {
    console.log(`- ${row.type} | ${row.status}: ${row.count}`);
  }
}

function formatMapTotals(map: Map<string, number>) {
  return `retomar=${map.get("retomar_atendimento") ?? 0}, follow=${map.get("fazer_follow_up") ?? 0}, revisao=${map.get("revisar_lideranca") ?? 0}`;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
