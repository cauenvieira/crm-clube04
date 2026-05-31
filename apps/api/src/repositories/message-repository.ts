import { postgresPool } from "../db/postgres.js";
import type { MessageCreateInput, MessageListQuery } from "../validation/message-schemas.js";

export async function findMessageByProviderId(provider: string, providerMessageId: string) {
  const result = await postgresPool.query(
    "select * from messages where provider = $1 and provider_message_id = $2",
    [provider, providerMessageId]
  );
  return result.rows[0] ?? null;
}

export async function createMessage(input: MessageCreateInput & { contact_id: string; provider: string }) {
  const result = await postgresPool.query(
    `insert into messages (
      conversation_id, contact_id, provider, provider_message_id, direction, message_type,
      from_number, to_number, body, media_url, "timestamp", raw_payload
    ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    returning *`,
    [
      input.conversation_id,
      input.contact_id,
      input.provider,
      input.provider_message_id ?? null,
      input.direction,
      input.message_type,
      input.from_number ?? null,
      input.to_number ?? null,
      input.body ?? null,
      input.media_url ?? null,
      input.timestamp,
      input.raw_payload === undefined ? null : JSON.stringify(input.raw_payload)
    ]
  );

  return result.rows[0];
}

export async function listMessages(query: MessageListQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  for (const key of ["contact_id", "conversation_id", "provider"] as const) {
    if (query[key]) {
      values.push(query[key]);
      conditions.push(`${key} = $${values.length}`);
    }
  }

  values.push(query.limit, query.offset);
  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
  const result = await postgresPool.query(
    `select * from messages ${where} order by "timestamp" desc limit $${values.length - 1} offset $${values.length}`,
    values
  );

  return result.rows;
}

export async function listMessagesByConversation(conversationId: string, limit: number, offset: number) {
  const result = await postgresPool.query(
    `select * from messages where conversation_id = $1 order by "timestamp" asc limit $2 offset $3`,
    [conversationId, limit, offset]
  );

  return result.rows;
}
