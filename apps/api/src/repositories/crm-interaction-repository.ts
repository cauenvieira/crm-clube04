import { postgresPool } from "../db/postgres.js";
import type { CrmInteractionCreateInput, CrmInteractionListQuery } from "../validation/crm-interaction-schemas.js";

export async function createCrmInteraction(input: Omit<CrmInteractionCreateInput, "increment_attempts">) {
  const result = await postgresPool.query(
    `insert into crm_interactions (
      contact_id, lead_id, customer_id, pet_id, interaction_type, channel,
      responsible, result, notes, next_action_at
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    returning *`,
    [
      input.contact_id ?? null,
      input.lead_id ?? null,
      input.customer_id ?? null,
      input.pet_id ?? null,
      input.interaction_type,
      input.channel ?? null,
      input.responsible ?? null,
      input.result ?? null,
      input.notes ?? null,
      input.next_action_at ?? null
    ]
  );

  return result.rows[0];
}

export async function listCrmInteractions(query: CrmInteractionListQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  for (const key of ["contact_id", "lead_id", "customer_id", "pet_id"] as const) {
    if (query[key]) {
      values.push(query[key]);
      conditions.push(`${key} = $${values.length}`);
    }
  }

  values.push(query.limit, query.offset);
  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
  const result = await postgresPool.query(
    `select * from crm_interactions ${where} order by created_at desc limit $${values.length - 1} offset $${values.length}`,
    values
  );

  return result.rows;
}
