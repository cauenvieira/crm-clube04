import { createDbContext, assertLocalSafeEnvironment, closeDbContext } from "./dev-data-helpers.js";

export type OperationType =
  | "create_contact"
  | "link_existing_contact"
  | "create_lead"
  | "update_existing_lead"
  | "create_action_item"
  | "create_interaction_snapshot"
  | "reject_row"
  | "manual_review";

export type PlannedOperation = {
  type: OperationType;
  rowNumber?: number;
  normalizedPhone?: string;
  reason?: string;
};

type ExistingContact = { id: string; normalizedPhone: string };

export function addCount(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export async function readExistingData(phones: string[]) {
  const contactsByPhone = new Map<string, ExistingContact>();
  const leadCountByContactId = new Map<string, number>();
  if (phones.length === 0) return { contactsByPhone, leadCountByContactId, warning: "" };

  const ctx = createDbContext();
  try {
    await assertLocalSafeEnvironment(ctx);
    const contacts = await ctx.pool.query<{ id: string; normalized_phone: string }>(
      "select id, normalized_phone from contacts where normalized_phone = any($1::text[])",
      [phones]
    );

    for (const row of contacts.rows) {
      contactsByPhone.set(row.normalized_phone, { id: row.id, normalizedPhone: row.normalized_phone });
    }

    const contactIds = contacts.rows.map((row) => row.id);
    if (contactIds.length > 0) {
      const leads = await ctx.pool.query<{ id: string; contact_id: string }>(
        "select id, contact_id from leads where contact_id = any($1::uuid[])",
        [contactIds]
      );
      for (const lead of leads.rows) {
        leadCountByContactId.set(lead.contact_id, (leadCountByContactId.get(lead.contact_id) ?? 0) + 1);
      }
    }

    return { contactsByPhone, leadCountByContactId, warning: "" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { contactsByPhone, leadCountByContactId, warning: `Leitura do banco indisponivel: ${message}` };
  } finally {
    await closeDbContext(ctx);
  }
}

export function printSummary(input: {
  filePath: string;
  totalRows: number;
  validRows: number;
  rejectedRows: number;
  manualRows: number;
  uniquePhones: number;
  duplicatePhones: number;
  missingMethodCount: number;
  missingStatusCount: number;
  missingNextActionCount: number;
  invalidDateRowCount: number;
  leadershipRows: number;
  franchiseRows: number;
  operations: PlannedOperation[];
  rejectReasons: Map<string, number>;
  manualReasons: Map<string, number>;
  rejectedSamples: string[];
  manualSamples: string[];
  duplicateSamples: string[];
  unknownStatusSamples: string[];
  unknownActionSamples: string[];
  invalidDateSamples: string[];
  dbWarning: string;
}) {
  console.log("Lead spreadsheet import dry-run v1");
  console.log(`Arquivo: ${input.filePath}`);
  if (input.dbWarning) console.log(`Aviso: ${input.dbWarning}`);
  console.log(`Total de linhas lidas: ${input.totalRows}`);
  console.log(`Linhas consideradas validas para importacao: ${input.validRows}`);
  console.log(`Linhas rejeitadas: ${input.rejectedRows}`);
  console.log(`Linhas para revisao manual: ${input.manualRows}`);
  console.log(`Telefones unicos: ${input.uniquePhones}`);
  console.log(`Telefones duplicados: ${input.duplicatePhones}`);
  console.log(`Linhas ignoradas por falta de status: ${input.missingStatusCount}`);
  console.log(`Linhas ignoradas por falta de proxima acao: ${input.missingNextActionCount}`);
  console.log(`Linhas com metodo ausente (source=unknown): ${input.missingMethodCount}`);
  console.log(`Linhas com data invalida: ${input.invalidDateRowCount}`);
  console.log(`Linhas com analise de lideranca preenchida: ${input.leadershipRows}`);
  console.log(`Linhas com analise de franqueados preenchida: ${input.franchiseRows}`);
  printOperationCounts(input.operations);
  printTopReasons("Top motivos de rejeicao", input.rejectReasons);
  printTopReasons("Top motivos de revisao manual", input.manualReasons);
  printSamples("Amostras rejeitados", input.rejectedSamples);
  printSamples("Amostras revisao manual", input.manualSamples);
  printSamples("Amostras duplicidades de telefone", input.duplicateSamples);
  printSamples("Amostras status desconhecidos", input.unknownStatusSamples);
  printSamples("Amostras proximas acoes desconhecidas", input.unknownActionSamples);
  printSamples("Amostras datas invalidas", input.invalidDateSamples);
}

function printOperationCounts(operations: PlannedOperation[]) {
  const counters = new Map<OperationType, number>();
  for (const operation of operations) {
    counters.set(operation.type, (counters.get(operation.type) ?? 0) + 1);
  }

  console.log("Operacoes simuladas:");
  const ordered: OperationType[] = [
    "create_contact",
    "link_existing_contact",
    "create_lead",
    "update_existing_lead",
    "create_action_item",
    "create_interaction_snapshot",
    "reject_row",
    "manual_review"
  ];
  for (const item of ordered) console.log(`- ${item}: ${counters.get(item) ?? 0}`);
}

function printTopReasons(label: string, counts: Map<string, number>) {
  console.log(`${label}:`);
  const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);
  if (entries.length === 0) {
    console.log("- none");
    return;
  }
  for (const [reason, count] of entries) console.log(`- ${reason}: ${count}`);
}

function printSamples(label: string, samples: string[]) {
  console.log(`${label} (max 20):`);
  if (samples.length === 0) {
    console.log("- none");
    return;
  }
  for (const sample of samples.slice(0, 20)) console.log(`- ${sample}`);
}
