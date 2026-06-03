import * as worklistRepository from "../repositories/operational-worklist-repository.js";

const operationalTimezone = "America/Sao_Paulo";

type WorklistItemRow = {
  id: string;
  type: string;
  priority: number;
  status: string;
  title: string;
  due_at: Date | string | null;
  lead_id: string | null;
  contact_id: string | null;
  contact_name: string | null;
  normalized_phone: string | null;
  lead_status?: string | null;
  lead_source?: string | null;
  lead_campaign?: string | null;
  lead_assigned_to?: string | null;
  lead_pet_name?: string | null;
  attempts_count?: number | null;
  reason?: string | null;
  last_interaction_note?: string | null;
  created_at: Date | string;
};

type WorklistLeadRow = {
  id: string;
  status: string;
  source: string | null;
  campaign: string | null;
  assigned_to?: string | null;
  pet_name?: string | null;
  next_action_at: Date | string | null;
  last_interaction_at: Date | string | null;
  contact_id: string | null;
  contact_name: string | null;
  normalized_phone: string | null;
};

type WorklistMessageRow = {
  id: string;
  provider: string;
  provider_message_id: string | null;
  body: string | null;
  created_at: Date | string;
  conversation_id: string;
  contact_id: string | null;
  contact_name: string | null;
  normalized_phone: string | null;
};

export async function getOperationalWorklist(limit: number) {
  const generatedAt = new Date();
  const dayWindow = await worklistRepository.getOperationalDayWindow(operationalTimezone);
  const dayStartIso = toIsoOrNull(dayWindow?.window_start);
  const dayEndIso = toIsoOrNull(dayWindow?.window_end);

  const [
    pendingItems,
    overdueItems,
    concludedToday,
    retomarAtendimento,
    followUpsAgendados,
    revisaoLideranca,
    novosLeads,
    leadsOverdue,
    leadsWithoutNextAction,
    leadsWithoutInteraction,
    latestInbound
  ] =
    await Promise.all([
      worklistRepository.listPendingActionItems(limit),
      worklistRepository.listOverdueActionItems(limit),
      dayStartIso && dayEndIso
        ? worklistRepository.listConcludedActionItemsByWindow(limit, dayStartIso, dayEndIso)
        : Promise.resolve([]),
      worklistRepository.listOpenActionItemsByTypes(limit, ["retomar_atendimento"]),
      worklistRepository.listOpenActionItemsByTypes(limit, ["fazer_follow_up", "follow_up_agendado"]),
      worklistRepository.listOpenActionItemsByTypes(limit, ["revisar_lideranca"]),
      worklistRepository.listOpenActionItemsByTypes(limit, ["follow_up_lead", "novo_lead"]),
      worklistRepository.listLeadsWithOverdueFollowUp(limit),
      worklistRepository.listLeadsWithoutNextAction(limit),
      worklistRepository.listLeadsWithoutInteraction24h(limit),
      worklistRepository.listLatestInboundMessages(limit)
    ]);

  return {
    generatedAt: generatedAt.toISOString(),
    timezone: operationalTimezone,
    businessDate: toStringOrEmpty(dayWindow?.business_date),
    limit,
    actionItems: {
      pendentes: pendingItems.map(mapActionItem),
      vencidos: overdueItems.map(mapActionItem),
      concluidosHoje: concludedToday.map(mapActionItem),
      retomarAtendimento: retomarAtendimento.map(mapActionItem),
      followUpsAgendados: followUpsAgendados.map(mapActionItem),
      revisaoLideranca: revisaoLideranca.map(mapActionItem),
      novosLeads: novosLeads.map(mapActionItem)
    },
    leads: {
      followUpVencido: leadsOverdue.map(mapLead),
      semProximaAcao: leadsWithoutNextAction.map(mapLead),
      semInteracao24h: leadsWithoutInteraction.map(mapLead)
    },
    messages: {
      ultimasInbound: latestInbound.map(mapInboundMessage)
    }
  };
}

function mapActionItem(row: WorklistItemRow) {
  return {
    id: row.id,
    type: row.type,
    priority: row.priority,
    status: row.status,
    title: row.title,
    dueAt: toIsoOrNull(row.due_at),
    leadId: row.lead_id,
    contactId: row.contact_id,
    contactName: row.contact_name,
    normalizedPhone: row.normalized_phone,
    leadStatus: row.lead_status ?? null,
    leadSource: row.lead_source ?? null,
    leadCampaign: row.lead_campaign ?? null,
    assignedTo: row.lead_assigned_to ?? null,
    petName: row.lead_pet_name ?? null,
    reason: row.reason ?? null,
    attemptsCount: row.attempts_count ?? null,
    lastInteractionNote: row.last_interaction_note ?? null,
    createdAt: toIsoOrNull(row.created_at)
  };
}

function mapLead(row: WorklistLeadRow) {
  return {
    id: row.id,
    status: row.status,
    source: row.source,
    campaign: row.campaign,
    assignedTo: row.assigned_to ?? null,
    petName: row.pet_name ?? null,
    nextActionAt: toIsoOrNull(row.next_action_at),
    lastInteractionAt: toIsoOrNull(row.last_interaction_at),
    contactId: row.contact_id,
    contactName: row.contact_name,
    normalizedPhone: row.normalized_phone
  };
}

function mapInboundMessage(row: WorklistMessageRow) {
  return {
    id: row.id,
    provider: row.provider,
    providerMessageId: row.provider_message_id,
    body: row.body,
    createdAt: toIsoOrNull(row.created_at),
    conversationId: row.conversation_id,
    contactId: row.contact_id,
    contactName: row.contact_name,
    normalizedPhone: row.normalized_phone
  };
}

function toStringOrEmpty(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toIsoOrNull(value: unknown): string | null {
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
