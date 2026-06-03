import { ApiError } from "../utils/api-error.js";
import { normalizePhone } from "../utils/phone.js";
import * as leadRepository from "../repositories/lead-repository.js";
import * as manualLeadRepository from "../repositories/manual-lead-repository.js";
import type { ManualLeadCreateInput } from "../validation/manual-lead-schemas.js";
import type { LeadSearchQuery } from "../validation/lead-schemas.js";

type ManualLeadActionType = "novo_lead" | "fazer_follow_up" | "retomar_atendimento" | "revisar_lideranca";

export async function createManualLead(input: ManualLeadCreateInput) {
  const normalizedPhone = normalizePhone(input.phone);
  if (!normalizedPhone) {
    throw new ApiError(400, "Telefone invalido");
  }
  const tutorName = sanitizeOptional(input.tutorName) ?? "Sem nome";

  const entryDateIso = toOperationalDueIso(input.entryDate ?? input.nextActionAt);
  const nextActionAtIso = toOperationalDueIso(input.nextActionAt);
  const actionType = mapManualLeadActionType(input.nextAction);
  const actionTitle = mapActionTitle(actionType);

  return await manualLeadRepository.withTransaction(async (client) => {
    const existingContact = await manualLeadRepository.findContactByNormalizedPhone(client, normalizedPhone);
    const contact =
      existingContact ??
      (await manualLeadRepository.createContact(client, {
        name: tutorName,
        phone: input.phone,
        normalizedPhone,
        source: "manual_entry"
      }));

    const existingActiveLead = await manualLeadRepository.findLatestActiveLeadByContact(client, contact.id);
    const lead =
      existingActiveLead ??
      (await manualLeadRepository.createLead(client, {
        contactId: contact.id,
        source: "manual_entry",
        campaign: sanitizeOptional(input.campaign) ?? input.entryMethod,
        assignedTo: input.attendant,
        petName: input.petName,
        petBreed: input.breed,
        petSize: input.estimatedWeight,
        serviceInterest: input.serviceInterest,
        firstMessageAtIso: entryDateIso,
        nextActionAtIso
      }));

    if (existingActiveLead) {
      await manualLeadRepository.updateLeadAfterManualEntry(client, lead.id, {
        assignedTo: input.attendant,
        nextActionAtIso
      });
    }

    const interactionNotes = buildInitialInteractionNotes(input);
    await manualLeadRepository.createCrmInteraction(client, {
      contactId: contact.id,
      leadId: lead.id,
      responsible: input.attendant,
      result: input.nextAction,
      notes: interactionNotes,
      nextActionAtIso
    });

    const existingActionItem = await manualLeadRepository.findOpenActionItemByLeadTypeAndDue(
      client,
      lead.id,
      actionType,
      nextActionAtIso
    );

    const actionItem =
      existingActionItem ??
      (await manualLeadRepository.createActionItem(client, {
        type: actionType,
        priority: mapActionPriority(actionType),
        leadId: lead.id,
        contactId: contact.id,
        title: actionTitle,
        reason: `manual_lead_entry:${input.entryMethod}`,
        dueAtIso: nextActionAtIso,
        assignedTo: input.attendant
      }));

    const created = {
      contact: !existingContact,
      lead: !existingActiveLead,
      action_item: !existingActionItem,
      interaction: true
    };

    const linked = {
      existing_contact: Boolean(existingContact),
      existing_active_lead: Boolean(existingActiveLead),
      existing_action_item: Boolean(existingActionItem)
    };

    const duplicate = {
      active_lead: Boolean(existingActiveLead)
    };

    return {
      contact_id: contact.id,
      lead_id: lead.id,
      action_item_id: actionItem.id,
      created,
      linked,
      duplicate,
      message: existingActiveLead
        ? "Lead ativo ja existente. Registro vinculado sem duplicar lead."
        : "Lead manual criado com sucesso."
    };
  });
}

export async function searchLeads(query: LeadSearchQuery) {
  const normalizedPhone = query.phone ? normalizePhone(query.phone) ?? query.phone.trim() : undefined;
  const contacts = await manualLeadRepository.searchContactsByPhoneOrName({
    normalizedPhone,
    queryText: query.q?.trim(),
    limit: query.limit
  });

  const items = await Promise.all(
    contacts.map(async (contact) => {
      const activeLead = await leadRepository.findLatestActiveLeadByContact(contact.id);
      const openActionItems = activeLead
        ? await manualLeadRepository.listOpenActionItemsByLead(activeLead.id, 10)
        : [];

      return {
        contact: {
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          normalized_phone: contact.normalized_phone,
          source: contact.source
        },
        active_lead: activeLead
          ? {
              id: activeLead.id,
              status: activeLead.status,
              source: activeLead.source,
              campaign: activeLead.campaign,
              assigned_to: activeLead.assigned_to,
              next_action_at: activeLead.next_action_at
            }
          : null,
        open_action_items: openActionItems
      };
    })
  );

  return { data: items };
}

function mapManualLeadActionType(nextAction: string): ManualLeadActionType {
  const normalized = nextAction.trim().toLowerCase();
  if (normalized.includes("revis")) return "revisar_lideranca";
  if (normalized.includes("retom")) return "retomar_atendimento";
  if (normalized.includes("novo")) return "novo_lead";
  return "fazer_follow_up";
}

function mapActionTitle(actionType: ManualLeadActionType): string {
  if (actionType === "novo_lead") return "Responder novo lead";
  if (actionType === "revisar_lideranca") return "Revisar lead com lideranca";
  if (actionType === "retomar_atendimento") return "Retomar atendimento de lead";
  return "Realizar follow-up agendado";
}

function mapActionPriority(actionType: ManualLeadActionType): number {
  if (actionType === "novo_lead") return 95;
  if (actionType === "retomar_atendimento") return 90;
  if (actionType === "revisar_lideranca") return 85;
  return 80;
}

function toOperationalDueIso(dateYmd: string): string {
  const candidate = `${dateYmd}T03:00:00.000Z`;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) {
    throw new ApiError(400, "Data Prox Acao invalida");
  }
  return parsed.toISOString();
}

function buildInitialInteractionNotes(input: ManualLeadCreateInput): string {
  const parts: string[] = [];

  parts.push(`entry_method: ${input.entryMethod}`);
  if (input.entryDate) parts.push(`entry_date: ${input.entryDate}`);
  parts.push(`next_action: ${input.nextAction}`);
  parts.push(`next_action_at: ${input.nextActionAt}`);
  if (input.sourceDetail) parts.push(`source_detail: ${input.sourceDetail}`);
  if (input.campaign) parts.push(`campaign: ${input.campaign}`);

  if (input.petName) parts.push(`pet_name: ${input.petName}`);
  if (input.breed) parts.push(`breed: ${input.breed}`);
  if (input.estimatedWeight) parts.push(`estimated_weight: ${input.estimatedWeight}`);
  if (input.serviceInterest) parts.push(`service_interest: ${input.serviceInterest}`);
  if (input.additionalNote) parts.push(`additional_note: ${input.additionalNote}`);
  if (input.initialNote) parts.push(`initial_note: ${input.initialNote}`);

  return parts.join(" | ");
}

function sanitizeOptional(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}
