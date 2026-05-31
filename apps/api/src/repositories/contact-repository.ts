import { postgresPool } from "../db/postgres.js";
import type { ContactCreateInput, ContactListQuery, ContactPatchInput } from "../validation/contact-schemas.js";
import { buildUpdateSet, compactObject } from "../utils/sql.js";

export async function createContact(input: Omit<ContactCreateInput, "normalized_phone"> & { normalized_phone?: string | null }) {
  const result = await postgresPool.query(
    `insert into contacts (
      name, phone, normalized_phone, email, source, external_customer_id, type, notes
    ) values ($1, $2, $3, $4, $5, $6, $7, $8)
    returning *`,
    [
      input.name ?? null,
      input.phone ?? null,
      input.normalized_phone ?? null,
      input.email ?? null,
      input.source ?? null,
      input.external_customer_id ?? null,
      input.type,
      input.notes ?? null
    ]
  );

  return result.rows[0];
}

export async function findContactById(id: string) {
  const result = await postgresPool.query("select * from contacts where id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function findContactByNormalizedPhone(normalizedPhone: string) {
  const result = await postgresPool.query(
    "select * from contacts where normalized_phone = $1",
    [normalizedPhone]
  );
  return result.rows[0] ?? null;
}

export async function listContacts(query: ContactListQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (query.normalized_phone) {
    values.push(query.normalized_phone);
    conditions.push(`normalized_phone = $${values.length}`);
  }

  if (query.source) {
    values.push(query.source);
    conditions.push(`source = $${values.length}`);
  }

  if (query.type) {
    values.push(query.type);
    conditions.push(`type = $${values.length}`);
  }

  values.push(query.limit, query.offset);

  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
  const result = await postgresPool.query(
    `select * from contacts ${where} order by created_at desc limit $${values.length - 1} offset $${values.length}`,
    values
  );

  return result.rows;
}

export async function updateContact(id: string, input: Omit<ContactPatchInput, "normalized_phone"> & { normalized_phone?: string | null }) {
  const data = compactObject({
    name: input.name,
    phone: input.phone,
    normalized_phone: input.normalized_phone,
    email: input.email,
    source: input.source,
    external_customer_id: input.external_customer_id,
    type: input.type,
    notes: input.notes
  });

  const { assignments, values, nextIndex } = buildUpdateSet(data);
  const result = await postgresPool.query(
    `update contacts set ${assignments} where id = $${nextIndex} returning *`,
    [...values, id]
  );

  return result.rows[0] ?? null;
}
