import type { PoolClient } from "pg";

import type {
  CountByLabel,
  DateRange,
  ImportedLeadsDiagnostics,
  ImportedLeadsResetPlan,
  Sample,
  TableCounts
} from "./imported-leads-reset-types.js";

export async function applyImportedLeadsReset(
  client: PoolClient,
  plan: ImportedLeadsResetPlan
): Promise<TableCounts> {
  const counts: TableCounts = {
    contacts: 0,
    leads: 0,
    actionItems: 0,
    crmInteractions: 0,
    conversations: 0,
    messages: 0
  };

  counts.messages = await deleteByIds(client, "messages", plan.ids.messages);
  counts.conversations = await deleteByIds(client, "conversations", plan.ids.conversations);
  counts.crmInteractions = await deleteByIds(client, "crm_interactions", plan.ids.crmInteractions);
  counts.actionItems = await deleteByIds(client, "action_items", plan.ids.actionItems);
  counts.leads = await deleteByIds(client, "leads", plan.ids.leads);
  counts.contacts = await deleteByIds(client, "contacts", plan.ids.contacts);

  return counts;
}

export function printImportedLeadsDiagnostics(report: ImportedLeadsDiagnostics): void {
  console.log(`Diagnosed at: ${report.diagnosedAt}`);
  printCounts("Safe cleanup candidates", report.safeCandidates);
  printCounts("Ambiguous records", report.ambiguous);
  printGroups("Lead sources", report.leadSourceGroups);
  printGroups("Lead campaigns", report.leadCampaignGroups);
  printGroups("Lead statuses", report.leadStatusGroups);
  printGroups("Action item types", report.actionTypeGroups);
  printGroups("Action item statuses", report.actionStatusGroups);
  printGroups("Interaction types", report.interactionTypeGroups);
  printGroups("Interaction results", report.interactionResultGroups);
  console.log("");
  console.log(`Lead created_at range: ${formatRange(report.leadCreatedAt)}`);
  console.log(`Action item created_at range: ${formatRange(report.actionItemCreatedAt)}`);
  printSamples(report.samples);
}

export function printImportedLeadsResetPlan(plan: ImportedLeadsResetPlan): void {
  printImportedLeadsDiagnostics(plan.diagnostics);
  console.log("");
  console.log("Delete order if apply is confirmed:");
  console.log(`- messages: ${plan.ids.messages.length}`);
  console.log(`- conversations: ${plan.ids.conversations.length}`);
  console.log(`- crm_interactions: ${plan.ids.crmInteractions.length}`);
  console.log(`- action_items: ${plan.ids.actionItems.length}`);
  console.log(`- leads: ${plan.ids.leads.length}`);
  console.log(`- contacts: ${plan.ids.contacts.length}`);
}

async function deleteByIds(client: PoolClient, table: string, tableIds: string[]): Promise<number> {
  if (tableIds.length === 0) return 0;
  const result = await client.query(`delete from ${table} where id = any($1::uuid[])`, [tableIds]);
  return result.rowCount ?? 0;
}

function printCounts(title: string, counts: TableCounts): void {
  console.log("");
  console.log(`${title}:`);
  console.log(`- contacts: ${counts.contacts}`);
  console.log(`- leads: ${counts.leads}`);
  console.log(`- action_items: ${counts.actionItems}`);
  console.log(`- crm_interactions: ${counts.crmInteractions}`);
  console.log(`- conversations: ${counts.conversations}`);
  console.log(`- messages: ${counts.messages}`);
}

function printGroups(title: string, rows: CountByLabel[]): void {
  console.log("");
  console.log(`${title}:`);
  if (rows.length === 0) {
    console.log("- none");
    return;
  }
  for (const row of rows) {
    console.log(`- ${row.label}: ${row.count}`);
  }
}

function printSamples(rows: Sample[]): void {
  console.log("");
  console.log(`Ambiguous samples without PII - max ${rows.length}:`);
  if (rows.length === 0) {
    console.log("- none");
    return;
  }
  for (const row of rows) {
    console.log(`- ${JSON.stringify(row)}`);
  }
}

function formatRange(range: DateRange): string {
  return `${range.min ?? "none"} -> ${range.max ?? "none"}`;
}
