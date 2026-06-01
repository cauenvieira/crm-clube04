import type { ActionType } from "./remediate-lead-import-classification.js";

type ActionItemRow = {
  id: string;
  type: string;
  reason: string | null;
};

export const noisyGenericTypes = ["lead_sem_interacao", "follow_up_agendado", "follow_up_lead", "validar_conversao"];
export const specificTypes = ["retomar_atendimento", "fazer_follow_up", "revisar_lideranca"];

export function findItemsToIgnore(items: ActionItemRow[], desiredType: ActionType | null) {
  const ignored: ActionItemRow[] = [];
  const desiredCandidates = items.filter((item) => item.type === desiredType);
  const keepDesired = desiredCandidates[0]?.id ?? null;

  for (const item of items) {
    if (noisyGenericTypes.includes(item.type)) {
      ignored.push(item);
      continue;
    }
    if (desiredType === null && specificTypes.includes(item.type) && isSpreadsheetActionItem(item.reason)) {
      ignored.push(item);
      continue;
    }
    if (desiredType && item.type === desiredType && item.id !== keepDesired && isSpreadsheetActionItem(item.reason)) {
      ignored.push(item);
      continue;
    }
    if (desiredType && item.type !== desiredType && specificTypes.includes(item.type) && isSpreadsheetActionItem(item.reason)) {
      ignored.push(item);
    }
  }

  return uniqueById(ignored);
}

export function pickExistingDesiredItem<T extends ActionItemRow>(items: T[], desiredType: ActionType) {
  const sameType = items.filter((item) => item.type === desiredType);
  const spreadsheet = sameType.find((item) => isSpreadsheetActionItem(item.reason));
  return spreadsheet ?? sameType[0] ?? null;
}

export function priorityForAction(type: ActionType) {
  if (type === "retomar_atendimento") return 90;
  if (type === "fazer_follow_up") return 70;
  return 80;
}

export function titleForAction(type: ActionType) {
  if (type === "retomar_atendimento") return "Retomar atendimento";
  if (type === "fazer_follow_up") return "Fazer follow-up agendado";
  return "Revisar lead com lideranca";
}

export function toDueIso(ymd: string) {
  return `${ymd}T09:00:00.000-03:00`;
}

export function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

export function isSpreadsheetActionItem(reason: string | null) {
  return !!reason && reason.includes("spreadsheet_import");
}

function uniqueById<T extends ActionItemRow>(items: T[]) {
  const map = new Map<string, T>();
  for (const item of items) map.set(item.id, item);
  return Array.from(map.values());
}

