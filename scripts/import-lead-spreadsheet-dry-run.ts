import { existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  detectHeaderRow,
  buildColumnMap,
  missingRequiredColumns,
  parseRows,
  parseDateField,
  pickMostRecentRow,
  hasConflictingTutor,
  maskPhone,
  truncateSample,
  type ParsedSheetRow
} from "./lead-spreadsheet-import-utils.js";
import {
  addCount,
  printSummary,
  readExistingData,
  type PlannedOperation
} from "./lead-spreadsheet-dry-run-support.js";
import { readFirstSheet } from "./xlsx-first-sheet-reader.js";

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error(
      'Uso: npm run import:lead-spreadsheet:dry-run -- ".tmp\\\\imports\\\\02 - Controle - Jornada do Lead Whatsapp.xlsx"'
    );
  }

  const absolutePath = resolve(inputPath);
  if (!existsSync(absolutePath)) throw new Error(`Arquivo nao encontrado: ${absolutePath}`);

  const workbook = readFirstSheet(absolutePath);
  if (workbook.firstSheetName.trim().toLowerCase() !== "jornada do lead") {
    throw new Error(`A primeira aba deve ser "Jornada do Lead". Encontrado: "${workbook.firstSheetName}".`);
  }

  const header = detectHeaderRow(workbook.rows);
  const columnMap = buildColumnMap(header.headersByIndex);
  const missing = missingRequiredColumns(columnMap);
  if (missing.length > 0) throw new Error(`Headers obrigatorios ausentes: ${missing.join(", ")}`);

  const rows = parseRows(workbook.rows, header.rowNumber, columnMap);
  const operations: PlannedOperation[] = [];
  const rejectReasons = new Map<string, number>();
  const manualReasons = new Map<string, number>();

  const rejectedSamples: string[] = [];
  const manualSamples: string[] = [];
  const unknownStatusSamples: string[] = [];
  const unknownActionSamples: string[] = [];
  const invalidDateSamples: string[] = [];
  const duplicateSamples: string[] = [];

  let missingMethodCount = 0;
  let missingStatusCount = 0;
  let missingNextActionCount = 0;
  let invalidDateRowCount = 0;
  let leadershipRows = 0;
  let franchiseRows = 0;

  const rejectedRows = new Set<number>();
  const manualRows = new Set<number>();
  const groupedByPhone = new Map<string, ParsedSheetRow[]>();

  for (const row of rows) {
    if (row.hasLeadershipAnalysis) leadershipRows++;
    if (row.hasFranchiseAnalysis) franchiseRows++;

    const rowRejectReasons: string[] = [];
    const rowManualReasons: string[] = [];

    if (!row.values.metodoEntrada.trim()) missingMethodCount++;
    if (!row.values.statusAtendimento.trim()) missingStatusCount++;
    if (!row.values.proximaAcao.trim()) missingNextActionCount++;

    if (!row.values.telefone.trim()) rowRejectReasons.push("missing_phone");
    else if (!row.normalizedPhone) rowRejectReasons.push("invalid_phone");

    if (!row.values.tutor.trim()) rowManualReasons.push("missing_tutor");
    if (!row.values.statusAtendimento.trim()) rowManualReasons.push("missing_status");
    else if (!row.statusCanonical) rowManualReasons.push("unknown_status");
    if (row.values.proximaAcao.trim() && !row.nextActionCanonical) rowManualReasons.push("unknown_next_action");

    const parsedDates = [
      parseDateField("entradaLead", row.values.entradaLead),
      parseDateField("dataAtendimento", row.values.dataAtendimento),
      parseDateField("dataProxAcao", row.values.dataProxAcao)
    ];
    if (parsedDates.some((item) => item.invalid)) {
      invalidDateRowCount++;
      if (invalidDateSamples.length < 20) {
        const detail = parsedDates
          .filter((item) => item.invalid)
          .map((item) => `${item.field}=${truncateSample(item.raw, 18)}`)
          .join(", ");
        invalidDateSamples.push(`row ${row.rowNumber} phone ${maskPhone(row.values.telefone)} ${detail}`);
      }
    }

    if (rowRejectReasons.length > 0) {
      rejectedRows.add(row.rowNumber);
      rowRejectReasons.forEach((reason) => addCount(rejectReasons, reason));
      operations.push({
        type: "reject_row",
        rowNumber: row.rowNumber,
        normalizedPhone: row.normalizedPhone,
        reason: rowRejectReasons.join(",")
      });
      if (rejectedSamples.length < 20) {
        rejectedSamples.push(
          `row ${row.rowNumber} phone ${maskPhone(row.values.telefone)} reason ${rowRejectReasons.join("|")}`
        );
      }
      continue;
    }

    if (!groupedByPhone.has(row.normalizedPhone)) groupedByPhone.set(row.normalizedPhone, []);
    groupedByPhone.get(row.normalizedPhone)?.push(row);

    if (rowManualReasons.length > 0) {
      manualRows.add(row.rowNumber);
      rowManualReasons.forEach((reason) => addCount(manualReasons, reason));
      operations.push({
        type: "manual_review",
        rowNumber: row.rowNumber,
        normalizedPhone: row.normalizedPhone,
        reason: rowManualReasons.join(",")
      });
      if (manualSamples.length < 20) {
        manualSamples.push(
          `row ${row.rowNumber} phone ${maskPhone(row.normalizedPhone)} reason ${rowManualReasons.join("|")}`
        );
      }
      if (rowManualReasons.includes("unknown_status") && unknownStatusSamples.length < 20) {
        unknownStatusSamples.push(
          `row ${row.rowNumber} status "${truncateSample(row.values.statusAtendimento, 28)}"`
        );
      }
      if (rowManualReasons.includes("unknown_next_action") && unknownActionSamples.length < 20) {
        unknownActionSamples.push(
          `row ${row.rowNumber} action "${truncateSample(row.values.proximaAcao, 28)}"`
        );
      }
    }
  }

  const duplicatePhones = Array.from(groupedByPhone.values()).filter((group) => group.length > 1);
  for (const group of duplicatePhones.slice(0, 20)) {
    const phone = group[0]?.normalizedPhone ?? "";
    duplicateSamples.push(`phone ${maskPhone(phone)} rows ${group.map((row) => row.rowNumber).join(",")}`);
  }

  const existing = await readExistingData(Array.from(groupedByPhone.keys()));
  for (const [phone, group] of groupedByPhone.entries()) {
    const latest = pickMostRecentRow(group);
    if (!latest) continue;

    if (hasConflictingTutor(group)) {
      addCount(manualReasons, "conflicting_tutor_for_phone");
      for (const row of group) manualRows.add(row.rowNumber);
      operations.push({ type: "manual_review", normalizedPhone: phone, reason: "conflicting_tutor_for_phone" });
    }

    const contact = existing.contactsByPhone.get(phone);
    if (contact) {
      operations.push({ type: "link_existing_contact", rowNumber: latest.rowNumber, normalizedPhone: phone });
    } else {
      operations.push({ type: "create_contact", rowNumber: latest.rowNumber, normalizedPhone: phone });
    }

    const hasLead = contact ? (existing.leadCountByContactId.get(contact.id) ?? 0) > 0 : false;
    if (latest.statusCanonical) {
      operations.push({
        type: hasLead ? "update_existing_lead" : "create_lead",
        rowNumber: latest.rowNumber,
        normalizedPhone: phone
      });
    }

    const dueDate = parseDateField("dataProxAcao", latest.values.dataProxAcao);
    const canCreateSemRetorno = latest.nextActionCanonical !== "follow_up_ou_revisao" || Boolean(dueDate.date);
    if (latest.nextActionCreatesItem && latest.nextActionCanonical && canCreateSemRetorno) {
      operations.push({ type: "create_action_item", rowNumber: latest.rowNumber, normalizedPhone: phone });
    }

    if (shouldCreateInteractionSnapshot(latest)) {
      operations.push({
        type: "create_interaction_snapshot",
        rowNumber: latest.rowNumber,
        normalizedPhone: phone
      });
    }
  }

  const validRows = rows.length - rejectedRows.size - manualRows.size;
  printSummary({
    filePath: absolutePath,
    totalRows: rows.length,
    validRows,
    rejectedRows: rejectedRows.size,
    manualRows: manualRows.size,
    uniquePhones: groupedByPhone.size,
    duplicatePhones: duplicatePhones.length,
    missingMethodCount,
    missingStatusCount,
    missingNextActionCount,
    invalidDateRowCount,
    leadershipRows,
    franchiseRows,
    operations,
    rejectReasons,
    manualReasons,
    rejectedSamples,
    manualSamples,
    duplicateSamples,
    unknownStatusSamples,
    unknownActionSamples,
    invalidDateSamples,
    dbWarning: existing.warning
  });
}

function shouldCreateInteractionSnapshot(row: ParsedSheetRow) {
  return Boolean(
    row.values.observacao.trim() ||
      row.values.dataAtendimento.trim() ||
      row.values.tentativaNumero.trim()
  );
}

main();
