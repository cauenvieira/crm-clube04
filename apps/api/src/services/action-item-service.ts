import * as actionItems from "../repositories/action-item-repository.js";
import * as actionItemGeneration from "./action-item-generation-service.js";
import { notFound } from "../utils/api-error.js";
import type { ActionItemListQuery, ActionItemStatus } from "../validation/action-item-schemas.js";

const followUpActionItemTypes = [
  "follow_up_lead",
  "follow_up_agendado",
  "lead_sem_interacao",
  "retomar_atendimento",
  "fazer_follow_up",
  "revisar_lideranca"
] as const;

const openActionItemStatuses: readonly ActionItemStatus[] = [
  "pendente",
  "em_andamento",
  "reagendado"
];

export async function listActionItems(query: ActionItemListQuery) {
  return actionItems.listActionItems(query);
}

export async function generateActionItems() {
  return actionItemGeneration.generateActionItems();
}

export async function completeActionItem(id: string) {
  return updateActionItemStatusWithIdempotency(id, "concluido", { markCompleted: true });
}

export async function cancelActionItem(id: string) {
  return updateActionItemStatusWithIdempotency(id, "ignorado", { markCompleted: false });
}

export async function completeOpenFollowUpActionItemsByLead(leadId: string) {
  return actionItems.closeOpenActionItemsByLeadAndTypes(
    leadId,
    followUpActionItemTypes,
    openActionItemStatuses
  );
}

async function updateActionItemStatusWithIdempotency(
  id: string,
  targetStatus: ActionItemStatus,
  options: { markCompleted: boolean }
) {
  const current = await actionItems.findActionItemById(id);
  if (!current) throw notFound("Action item");

  if (current.status === targetStatus) return current;

  const updated = await actionItems.updateActionItemStatus(id, targetStatus, options);
  if (!updated) throw notFound("Action item");
  return updated;
}
