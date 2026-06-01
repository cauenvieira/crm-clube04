import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { assertLocalSafeEnvironment, closeDbContext, createDbContext } from "../../dev-data/dev-data-helpers.js";
import { normalizeText } from "./analyze-lead-spreadsheet-utils.js";
import { buildPlannedLeadImport, getBusinessDateSaoPaulo } from "./lead-import-apply-utils.js";
import {
  detectHeaderRow,
  buildColumnMap,
  missingRequiredColumns,
  parseRows,
  pickMostRecentRow,
  hasConflictingTutor
} from "./lead-spreadsheet-import-utils.js";
import { readPessoaCsv, maskPhone, maskName } from "./pessoa-csv-utils.js";
import { readFirstSheet } from "./xlsx-first-sheet-reader.js";
import {
  applyPlan,
  loadExistingContactsByPhone,
  type ApplySummary
} from "./import-lead-spreadsheet-apply-support.js";

type CliInput = {
  leadsPath: string;
  pessoaPath: string;
  apply: boolean;
  confirmLocalDev: boolean;
};

async function main() {
  const cli = parseCli(process.argv.slice(2));
  const leadsAbsolute = resolve(cli.leadsPath);
  const pessoaAbsolute = resolve(cli.pessoaPath);
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
  const businessDate = getBusinessDateSaoPaulo();

  const rejectedRows = rows.filter((row) => !row.normalizedPhone);
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    if (!row.normalizedPhone) continue;
    if (!grouped.has(row.normalizedPhone)) grouped.set(row.normalizedPhone, []);
    grouped.get(row.normalizedPhone)?.push(row);
  }

  const plan = Array.from(grouped.entries()).flatMap(([phone, groupRows]) => {
    const latest = pickMostRecentRow(groupRows);
    if (!latest) return [];
    return [
      buildPlannedLeadImport({
        row: latest,
        phone,
        foundInPessoa: pessoa.phonesIndex.has(phone),
        conflictingTutor: hasConflictingTutor(groupRows),
        businessDateYmd: businessDate
      })
    ];
  });

  const ctx = createDbContext();
  try {
    await assertLocalSafeEnvironment(ctx);
    const existingContacts = await loadExistingContactsByPhone(ctx.pool, plan.map((item) => item.phone));
    const dryClient = await ctx.pool.connect();
    const drySummary = await applyPlan(dryClient, plan, { apply: false, existingContacts });
    dryClient.release();
    drySummary.rejected = rejectedRows.length;
    printDryRunSummary({
      mode: cli.apply ? "APPLY" : "DRY-RUN",
      leadsPath: leadsAbsolute,
      pessoaPath: pessoaAbsolute,
      businessDate,
      totalRows: rows.length,
      uniquePhones: grouped.size,
      rejectedRows: rejectedRows.length,
      pessoaRows: pessoa.totalLines,
      pessoaUniquePhones: pessoa.uniquePhones,
      existingContacts: existingContacts.size,
      summary: drySummary,
      samples: {
        rejected: rejectedRows.slice(0, 20).map((row) => `row ${row.rowNumber} phone ${maskPhone(row.values.telefone)}`),
        manual: plan
          .filter((item) => item.statusFinal === "revisao_manual")
          .slice(0, 20)
          .map((item) => `row ${item.row.rowNumber} phone ${maskPhone(item.phone)} name ${maskName(item.row.values.tutor)}`)
      }
    });

    if (!cli.apply) return;
    if (!cli.confirmLocalDev) {
      throw new Error("Modo APPLY exige --apply --confirm-local-dev.");
    }

    const client = await ctx.pool.connect();
    try {
      await client.query("begin");
      const applySummary = await applyPlan(client, plan, { apply: true, existingContacts });
      applySummary.rejected = rejectedRows.length;
      await client.query("commit");
      printApplySummary(applySummary);
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await closeDbContext(ctx);
  }
}

function parseCli(argv: string[]): CliInput {
  const paths: string[] = [];
  const flags = new Set<string>();
  for (const item of argv) {
    if (item.startsWith("--")) flags.add(item);
    else paths.push(item);
  }
  if (paths.length < 2) {
    throw new Error(
      'Uso: npm run import:lead-spreadsheet:apply -- ".tmp\\\\imports\\\\02 - Controle - Jornada do Lead Whatsapp.xlsx" ".tmp\\\\imports\\\\Pessoa.csv" [-- --apply --confirm-local-dev]'
    );
  }
  return {
    leadsPath: paths[0] ?? "",
    pessoaPath: paths[1] ?? "",
    apply: flags.has("--apply"),
    confirmLocalDev: flags.has("--confirm-local-dev")
  };
}

function printDryRunSummary(input: {
  mode: "DRY-RUN" | "APPLY";
  leadsPath: string;
  pessoaPath: string;
  businessDate: string;
  totalRows: number;
  uniquePhones: number;
  rejectedRows: number;
  pessoaRows: number;
  pessoaUniquePhones: number;
  existingContacts: number;
  summary: ApplySummary;
  samples: { rejected: string[]; manual: string[] };
}) {
  console.log("Lead spreadsheet import apply v1");
  console.log(`Modo: ${input.mode}`);
  console.log(`Leads file: ${input.leadsPath}`);
  console.log(`Pessoa file: ${input.pessoaPath}`);
  console.log("Timezone operacional: America/Sao_Paulo");
  console.log(`Data operacional: ${input.businessDate}`);
  console.log(`Total linhas planilha: ${input.totalRows}`);
  console.log(`Telefones unicos planilha: ${input.uniquePhones}`);
  console.log(`Linhas rejeitadas (sem telefone valido): ${input.rejectedRows}`);
  console.log(`Pessoa.csv linhas: ${input.pessoaRows}`);
  console.log(`Pessoa.csv telefones unicos: ${input.pessoaUniquePhones}`);
  console.log(`Contacts existentes vinculaveis: ${input.existingContacts}`);
  printApplySummary(input.summary);
  printSamples("Amostras rejeitados", input.samples.rejected);
  printSamples("Amostras revisao manual", input.samples.manual);
}

function printApplySummary(summary: ApplySummary) {
  console.log("Resumo:");
  console.log(`- contacts criados: ${summary.contactsCreated}`);
  console.log(`- contacts vinculados: ${summary.contactsLinked}`);
  console.log(`- leads criados: ${summary.leadsCreated}`);
  console.log(`- leads existentes vinculados: ${summary.leadsLinkedExisting}`);
  console.log(`- snapshots criados: ${summary.snapshotsCreated}`);
  console.log(`- rejeitados: ${summary.rejected}`);
  console.log(`- revisao manual: ${summary.manualReview}`);
  console.log(`- validar_conversao: ${summary.validarConversao}`);
  console.log(`- retomar_atendimento: ${summary.retomarAtendimento}`);
  console.log(`- conflitos: ${summary.conflicts}`);
  console.log("Action_items por tipo:");
  console.log(`  - fazer_follow_up: ${summary.actionItemsCreatedByType.get("fazer_follow_up") ?? 0}`);
  console.log(`  - retomar_atendimento: ${summary.actionItemsCreatedByType.get("retomar_atendimento") ?? 0}`);
  console.log(`  - revisar_lideranca: ${summary.actionItemsCreatedByType.get("revisar_lideranca") ?? 0}`);
  console.log(`  - validar_conversao: ${summary.actionItemsCreatedByType.get("validar_conversao") ?? 0}`);
}

function printSamples(label: string, samples: string[]) {
  console.log(`${label} (max 20):`);
  if (samples.length === 0) {
    console.log("- none");
    return;
  }
  for (const sample of samples.slice(0, 20)) console.log(`- ${sample}`);
}

main();
