import { notFound } from "../utils/api-error.js";
import * as contacts from "../repositories/contact-repository.js";
import * as leads from "../repositories/lead-repository.js";
import { createContact as createContactService } from "./contact-service.js";
import type { LeadCreateInput, LeadListQuery, LeadPatchInput } from "../validation/lead-schemas.js";

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
