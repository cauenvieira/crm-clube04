import * as leadOperationalRepository from "../repositories/lead-operational-repository.js";
import { ApiError, notFound } from "../utils/api-error.js";
import type { PoolClient } from "pg";
import type { LeadContactOutcomeCreateInput } from "../validation/lead-operational-schemas.js";
import {
  buildOutcomePlan,
  operationalTimezone,
  type OutcomePlan
} from "./lead-operational-outcome-plan.js";
import {
  buildMessageVariables,
  recommendActionFromLeadState,
  recommendMediaIds,
  recommendTemplateIds
} from "./lead-operational-recommendations.js";

type OutcomeFlags = {
  leadUpdated: boolean;
  interactionCreated: boolean;
  actionItemClosed: boolean;
  nextActionCreated: boolean;
  actionItemsClosed: boolean;
};

export async function registerLeadContactOutcome(leadId: string, input: LeadContactOutcomeCreateInput) {
  return await leadOperationalRepository.withTransaction(async (client) => {
    const lead = await leadOperationalRepository.findLeadById(client, leadId);
    if (!lead) throw notFound("Lead");

    const contact = await leadOperationalRepository.findContactById(client, lead.contact_id);
    if (!contact) throw notFound("Contato");

    const closedActionItemId = await closeProvidedActionItem(client, lead.id, input.actionItemId);
    const nowIso = new Date().toISOString();
    const plan = buildOutcomePlan(lead, input, nowIso);

    const interaction = await leadOperationalRepository.createLeadInteraction(client, {
      leadId: lead.id,
      contactId: contact.id,
      channel: input.channel,
      attendant: sanitizeOptionalString(input.attendant) ?? lead.assigned_to ?? null,
      outcome: input.outcome,
      notes: buildInteractionNotes(input, plan),
      nextActionAtIso: plan.nextLeadActionAtIso
    });

    const closedItemsCount = await closeActionItemsByPlan(client, lead.id, plan);
    const nextActionItemId = await createOrReuseNextAction(client, lead.id, contact.id, lead.assigned_to, input, plan);

    const updatedLead = await leadOperationalRepository.updateLeadLifecycle(client, lead.id, {
      status: plan.leadStatus,
      attemptsCount: plan.attemptCount,
      nextActionAtIso: plan.nextLeadActionAtIso,
      lastInteractionAtIso: nowIso,
      assignedTo: sanitizeOptionalString(input.attendant) ?? lead.assigned_to ?? null,
      lossReason: plan.lossReason,
      finalConclusion: plan.finalConclusion,
      qualified: plan.qualified
    });
    if (!updatedLead) throw notFound("Lead");

    const flags: OutcomeFlags = {
      leadUpdated: true,
      interactionCreated: true,
      actionItemClosed: Boolean(closedActionItemId),
      nextActionCreated: Boolean(nextActionItemId),
      actionItemsClosed: closedItemsCount > 0
    };

    return {
      leadId: updatedLead.id,
      interactionId: interaction.id,
      closedActionItemId,
      nextActionItemId,
      outcome: input.outcome,
      nextRecommendedAction: plan.nextRecommendedAction,
      message: "Outcome registrado com sucesso",
      flags
    };
  });
}

export async function getLeadOperationalContext(leadId: string) {
  const leadContext = await leadOperationalRepository.withTransaction(async (client) => {
    const foundLead = await leadOperationalRepository.findLeadById(client, leadId);
    if (!foundLead) throw notFound("Lead");

    const foundContact = await leadOperationalRepository.findContactById(client, foundLead.contact_id);
    if (!foundContact) throw notFound("Contato");

    const openActionItems = await leadOperationalRepository.listOpenActionItemsByLead(client, foundLead.id);
    return { lead: foundLead, contact: foundContact, openActionItems };
  });

  const recentInteractions = await leadOperationalRepository.listRecentLeadInteractions(leadContext.lead.id, 8);
  const lastOutcome =
    recentInteractions.find((item) => item.interaction_type === "lead_contact_outcome")?.result ?? null;

  const nextRecommendedAction = recommendActionFromLeadState({
    status: leadContext.lead.status,
    attemptsCount: leadContext.lead.attempts_count,
    hasOpenReview: leadContext.openActionItems.some((item) => item.type === "revisar_lideranca"),
    hasOpenFollowUp: leadContext.openActionItems.some((item) =>
      ["fazer_follow_up", "retomar_atendimento", "follow_up_lead", "follow_up_agendado"].includes(item.type)
    )
  });

  const recommendedTemplateIds = recommendTemplateIds({
    leadStatus: leadContext.lead.status,
    lastOutcome,
    nextRecommendedAction
  });

  return {
    leadId: leadContext.lead.id,
    contact: {
      id: leadContext.contact.id,
      name: leadContext.contact.name,
      phone: leadContext.contact.phone,
      normalizedPhone: leadContext.contact.normalized_phone,
      source: leadContext.contact.source,
      notes: leadContext.contact.notes
    },
    lead: {
      id: leadContext.lead.id,
      status: leadContext.lead.status,
      source: leadContext.lead.source,
      campaign: leadContext.lead.campaign,
      assignedTo: leadContext.lead.assigned_to,
      attemptsCount: leadContext.lead.attempts_count,
      petName: leadContext.lead.pet_name,
      entryAt: toIsoOrNull(leadContext.lead.first_message_at) ?? toIsoOrNull(leadContext.lead.created_at),
      nextActionAt: toIsoOrNull(leadContext.lead.next_action_at),
      lastInteractionAt: toIsoOrNull(leadContext.lead.last_interaction_at),
      updatedAt: toIsoOrNull(leadContext.lead.updated_at)
    },
    openActionItems: leadContext.openActionItems.map((item) => ({
      id: item.id,
      type: item.type,
      status: item.status,
      title: item.title,
      priority: item.priority,
      dueAt: toIsoOrNull(item.due_at),
      reason: item.reason
    })),
    recentInteractions: recentInteractions.map((item) => ({
      id: item.id,
      interactionType: item.interaction_type,
      channel: item.channel,
      responsible: item.responsible,
      result: item.result,
      notes: item.notes,
      nextActionAt: toIsoOrNull(item.next_action_at),
      createdAt: toIsoOrNull(item.created_at)
    })),
    lastOutcome,
    nextRecommendedAction,
    recommendedTemplateIds,
    messageVariables: buildMessageVariables({
      tutorName: leadContext.contact.name,
      petName: leadContext.lead.pet_name,
      source: leadContext.lead.source,
      attendant: leadContext.lead.assigned_to,
      nextActionAtIso: leadContext.lead.next_action_at
    }),
    recommendedMediaIds: recommendMediaIds(recommendedTemplateIds),
    timezone: operationalTimezone
  };
}

async function closeProvidedActionItem(
  client: PoolClient,
  leadId: string,
  actionItemId: string | undefined
) {
  if (!actionItemId) return null;

  const actionItem = await leadOperationalRepository.findActionItemById(client, actionItemId);
  if (!actionItem) throw notFound("Action item");
  if (actionItem.lead_id !== leadId) {
    throw new ApiError(400, "actionItemId nao pertence ao lead informado");
  }
  if (actionItem.status !== "concluido") {
    const closed = await leadOperationalRepository.updateActionItemStatus(client, actionItem.id, "concluido", true);
    if (!closed) throw notFound("Action item");
  }
  return actionItem.id;
}

async function closeActionItemsByPlan(
  client: PoolClient,
  leadId: string,
  plan: OutcomePlan
) {
  if (!plan.closeAllOpenActionItemsStatus) return 0;
  const closedItems = await leadOperationalRepository.updateActionItemsStatusByLead(
    client,
    leadId,
    plan.closeAllOpenActionItemsStatus,
    plan.closeAllOpenActionItemsCompleted
  );
  return closedItems.length;
}

async function createOrReuseNextAction(
  client: PoolClient,
  leadId: string,
  contactId: string,
  currentLeadAssignedTo: string | null,
  input: LeadContactOutcomeCreateInput,
  plan: OutcomePlan
) {
  if (!plan.nextActionItem) return null;

  const dedupe = await leadOperationalRepository.findOpenActionItemByLeadTypeAndDue(
    client,
    leadId,
    plan.nextActionItem.type,
    plan.nextActionItem.dueAtIso
  );
  if (dedupe) return dedupe.id;

  const created = await leadOperationalRepository.createActionItem(client, {
    type: plan.nextActionItem.type,
    priority: plan.nextActionItem.priority,
    leadId,
    contactId,
    title: plan.nextActionItem.title,
    reason: plan.nextActionItem.reason,
    recommendedAction: plan.nextActionItem.recommendedAction,
    dueAtIso: plan.nextActionItem.dueAtIso,
    assignedTo: sanitizeOptionalString(input.attendant) ?? currentLeadAssignedTo ?? null
  });
  return created.id;
}

function buildInteractionNotes(input: LeadContactOutcomeCreateInput, plan: OutcomePlan): string {
  const parts: string[] = [];
  parts.push(`outcome=${input.outcome}`);
  parts.push(`channel=${input.channel}`);
  if (input.reason) parts.push(`reason=${input.reason}`);
  if (input.summary) parts.push(`summary=${input.summary}`);
  if (input.nextActionAt) parts.push(`nextActionAt=${input.nextActionAt}`);
  if (input.scheduledAt) parts.push(`scheduledAt=${input.scheduledAt}`);
  if (input.messageTemplateId) parts.push(`messageTemplateId=${input.messageTemplateId}`);
  if (input.renderedMessage) parts.push(`renderedMessage=${truncateSafe(input.renderedMessage, 600)}`);
  parts.push(`nextRecommendedAction=${plan.nextRecommendedAction}`);
  return parts.join(" | ");
}

function sanitizeOptionalString(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function toIsoOrNull(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  return null;
}

function truncateSafe(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength)}...`;
}
