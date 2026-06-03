import { notFound } from "../utils/api-error.js";
import { normalizePhone } from "../utils/phone.js";
import * as contacts from "../repositories/contact-repository.js";
import * as leads from "../repositories/lead-repository.js";
import { createContact as createContactService } from "./contact-service.js";
import type {
  LeadCreateInput,
  LeadExportQuery,
  LeadListQuery,
  LeadPatchInput,
  LeadSearchQuery
} from "../validation/lead-schemas.js";

const activeLeadStatuses = new Set([
  "novo_lead",
  "em_atendimento",
  "aguardando_resposta",
  "em_negociacao",
  "agendado",
  "reativar_depois"
]);

export async function createLead(input: LeadCreateInput) {
  let contactId = input.contact_id;

  if (!contactId && input.contact) {
    const { contact } = await createContactService(input.contact);
    contactId = contact.id;
  }

  if (!contactId) throw notFound("Contato");

  const contact = await contacts.findContactById(contactId);
  if (!contact) throw notFound("Contato");

  return leads.createLead({ ...input, contact_id: contactId });
}

export async function getLead(id: string) {
  const lead = await leads.findLeadById(id);
  if (!lead) throw notFound("Lead");
  return lead;
}

export async function listLeads(query: LeadListQuery) {
  return leads.listLeads(query);
}

export async function updateLead(id: string, input: LeadPatchInput) {
  const lead = await leads.updateLead(id, input);
  if (!lead) throw notFound("Lead");
  return lead;
}

export async function searchLeads(query: LeadSearchQuery) {
  const normalizedPhone = query.phone ? normalizePhone(query.phone) ?? query.phone.trim() : undefined;
  const rows = await leads.searchLeadsOperational({
    normalizedPhone,
    queryText: query.q?.trim(),
    status: query.status,
    source: query.source,
    campaign: query.campaign,
    limit: query.limit
  });

  return {
    data: rows.map((row) => {
      const lead = {
        id: row.lead_id,
        status: row.lead_status,
        source: row.lead_source,
        campaign: row.lead_campaign,
        assigned_to: row.lead_assigned_to,
        entry_at: toIsoOrNull(row.lead_first_message_at) ?? toIsoOrNull(row.lead_created_at),
        next_action_at: toIsoOrNull(row.lead_next_action_at),
        last_interaction_at: toIsoOrNull(row.lead_last_interaction_at),
        attempts_count: row.lead_attempts_count,
        pet_name: row.lead_pet_name,
        created_at: toIsoOrNull(row.lead_created_at),
        updated_at: toIsoOrNull(row.lead_updated_at),
        next_action_type: row.next_action_type,
        next_action_due_at: toIsoOrNull(row.next_action_due_at),
        last_outcome: row.last_outcome,
        last_note: row.last_note
      };

      return {
        contact: {
          id: row.contact_id,
          name: row.contact_name,
          phone: row.contact_phone,
          normalized_phone: row.contact_normalized_phone,
          source: row.contact_source
        },
        active_lead: activeLeadStatuses.has(row.lead_status) ? lead : null,
        latest_lead: lead,
        open_action_items: row.next_action_type
          ? [
              {
                id: row.next_action_id ?? `${row.lead_id}:${row.next_action_type}:${row.next_action_due_at ?? "no_due"}`,
                type: row.next_action_type,
                status: row.next_action_status ?? "pendente",
                title: row.next_action_title ?? row.next_action_type,
                due_at: toIsoOrNull(row.next_action_due_at)
              }
            ]
          : []
      };
    })
  };
}

export async function exportLeadsCsv(query: LeadExportQuery) {
  const normalizedPhone = query.phone ? normalizePhone(query.phone) ?? query.phone.trim() : undefined;
  const rows = await leads.searchLeadsOperational({
    normalizedPhone,
    queryText: query.q?.trim(),
    status: query.status,
    source: query.source,
    campaign: query.campaign,
    limit: query.limit
  });

  const header = [
    "nome_tutor",
    "telefone",
    "telefone_normalizado",
    "origem",
    "status",
    "proxima_acao",
    "data_proxima_acao",
    "data_entrada",
    "ultimo_resultado",
    "ultima_observacao",
    "tentativas",
    "criado_em",
    "atualizado_em"
  ];

  const dataRows = rows.map((row) => [
    row.contact_name ?? "",
    row.contact_phone ?? "",
    row.contact_normalized_phone ?? "",
    row.lead_source ?? row.contact_source ?? "",
    row.lead_status,
    row.next_action_type ?? "",
    toIsoOrNull(row.next_action_due_at) ?? toIsoOrNull(row.lead_next_action_at) ?? "",
    toIsoOrNull(row.lead_first_message_at) ?? toIsoOrNull(row.lead_created_at) ?? "",
    row.last_outcome ?? "",
    row.last_note ?? "",
    String(row.lead_attempts_count ?? 0),
    toIsoOrNull(row.lead_created_at) ?? "",
    toIsoOrNull(row.lead_updated_at) ?? ""
  ]);

  const csvLines = [header, ...dataRows].map((line) => line.map(escapeCsv).join(";")).join("\r\n");
  return `\ufeff${csvLines}\r\n`;
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

function escapeCsv(value: string) {
  const normalized = value.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
  const escaped = normalized.replaceAll("\"", "\"\"");
  if (escaped.includes(";") || escaped.includes("\"") || escaped.includes("\n")) {
    return `"${escaped}"`;
  }
  return escaped;
}
