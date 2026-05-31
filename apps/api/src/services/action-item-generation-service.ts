import * as generationRepository from "../repositories/action-item-generation-repository.js";
import type { ActionItemStatus } from "../validation/action-item-schemas.js";

type ActionItemRuleType = "follow_up_lead" | "follow_up_agendado" | "lead_sem_interacao";

type ActionCandidate = {
  type: ActionItemRuleType;
  priority: number;
  contact_id: string | null;
  lead_id: string;
  title: string;
  reason: string;
  recommended_action: string;
  due_at: Date | string;
  assigned_to: string | null;
};

const activeLeadStatuses = [
  "novo_lead",
  "em_atendimento",
  "aguardando_resposta",
  "em_negociacao",
  "agendado",
  "reativar_depois"
] as const;

const openActionItemStatuses: readonly ActionItemStatus[] = [
  "pendente",
  "em_andamento",
  "reagendado"
];

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const priorities = {
  alta: 90,
  media: 60
} as const;

export async function generateActionItems() {
  const now = new Date();
  const nowMs = now.getTime();
  const cutoffMs = nowMs - ONE_DAY_MS;

  const [newLeads, activeLeads] = await Promise.all([
    generationRepository.listLeadsByStatus("novo_lead"),
    generationRepository.listLeadsByStatuses(activeLeadStatuses)
  ]);

  const candidates: ActionCandidate[] = [];

  for (const lead of newLeads) {
    candidates.push({
      type: "follow_up_lead",
      priority: priorities.alta,
      contact_id: lead.contact_id,
      lead_id: lead.id,
      title: "Responder novo lead",
      reason: "Lead em status novo_lead requer contato inicial",
      recommended_action: "Enviar resposta inicial e registrar proximo passo",
      due_at: now,
      assigned_to: lead.assigned_to
    });
  }

  for (const lead of activeLeads) {
    const nextActionAtMs = toTimestampMs(lead.next_action_at);
    if (nextActionAtMs !== null && nextActionAtMs <= nowMs) {
      candidates.push({
        type: "follow_up_agendado",
        priority: priorities.media,
        contact_id: lead.contact_id,
        lead_id: lead.id,
        title: "Realizar follow-up agendado",
        reason: "Lead com next_action_at vencido",
        recommended_action: "Executar contato conforme acao agendada",
        due_at: lead.next_action_at ?? now,
        assigned_to: lead.assigned_to
      });
    }

    const lastReferenceAtMs = toTimestampMs(
      lead.last_interaction_at ?? lead.first_message_at ?? lead.created_at
    );
    if (lastReferenceAtMs !== null && lastReferenceAtMs <= cutoffMs) {
      candidates.push({
        type: "lead_sem_interacao",
        priority: priorities.media,
        contact_id: lead.contact_id,
        lead_id: lead.id,
        title: "Retomar contato com lead sem interacao",
        reason: "Lead ativo sem interacao ha mais de 24 horas",
        recommended_action: "Retomar contato e atualizar status do atendimento",
        due_at: now,
        assigned_to: lead.assigned_to
      });
    }
  }

  let created = 0;
  let skipped = 0;
  const items: unknown[] = [];
  const processedLeadTypeKeys = new Set<string>();

  for (const candidate of candidates) {
    const leadTypeKey = `${candidate.lead_id}:${candidate.type}`;
    if (processedLeadTypeKeys.has(leadTypeKey)) {
      skipped += 1;
      continue;
    }

    processedLeadTypeKeys.add(leadTypeKey);
    const createdItem = await generationRepository.createActionItemIfNotOpen(
      candidate,
      openActionItemStatuses
    );

    if (createdItem) {
      items.push(createdItem);
      created += 1;
    } else {
      skipped += 1;
    }
  }

  return { created, skipped, items };
}

function toTimestampMs(value: Date | string | null): number | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  const parsed = date.getTime();
  return Number.isNaN(parsed) ? null : parsed;
}
