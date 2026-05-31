import { ApiError, notFound } from "../utils/api-error.js";
import { normalizePhone } from "../utils/phone.js";
import * as contacts from "../repositories/contact-repository.js";
import type { ContactCreateInput, ContactListQuery, ContactPatchInput } from "../validation/contact-schemas.js";

export async function createContact(input: ContactCreateInput) {
  const normalized_phone = input.normalized_phone ?? normalizePhone(input.phone);

  if (normalized_phone) {
    const existing = await contacts.findContactByNormalizedPhone(normalized_phone);
    if (existing) {
      return { contact: existing, created: false };
    }
  }

  const contact = await contacts.createContact({ ...input, normalized_phone });
  return { contact, created: true };
}

export async function getContact(id: string) {
  const contact = await contacts.findContactById(id);
  if (!contact) throw notFound("Contato");
  return contact;
}

export async function listContacts(query: ContactListQuery) {
  const normalized_phone = query.normalized_phone
    ? normalizePhone(query.normalized_phone) ?? query.normalized_phone
    : undefined;

  return contacts.listContacts({ ...query, normalized_phone });
}

export async function updateContact(id: string, input: ContactPatchInput) {
  const normalized_phone = input.normalized_phone ?? normalizePhone(input.phone);

  if (normalized_phone) {
    const existing = await contacts.findContactByNormalizedPhone(normalized_phone);
    if (existing && existing.id !== id) {
      throw new ApiError(409, "Ja existe contato com este telefone normalizado", {
        existing_contact_id: existing.id
      });
    }
  }

  const contact = await contacts.updateContact(id, { ...input, normalized_phone });
  if (!contact) throw notFound("Contato");
  return contact;
}
