import { postgresPool } from "../db/postgres.js";
import type { ConversationCreateInput, ConversationListQuery } from "../validation/conversation-schemas.js";

export async function createConversation(input: ConversationCreateInput) {
  const result = await postgresPool.query(
    `insert into conversations (
      contact_id, channel, provider, provider_conversation_id, status, started_at, last_message_at
    ) values ($1, $2, $3, $4, $5, $6, $7)
    on conflict (provider, provider_conversation_id) do update
      set last_message_at = greatest(
        coalesce(conversations.last_message_at, excluded.last_message_at),
        coalesce(excluded.last_message_at, conversations.last_message_at)
      )
    returning *`,
    [
      input.contact_id,
      input.channel,
      input.provider,
      input.provider_conversation_id ?? null,
      input.status,
      input.started_at ?? null,
      input.last_message_at ?? null
    ]
  );

  return result.rows[0];
}

export async function findConversationById(id: string) {
  const result = await postgresPool.query("select * from conversations where id = $1", [id]);
  return result.rows[0] ?? null;
}

export async function listConversations(query: ConversationListQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  for (const key of ["contact_id", "provider", "status"] as const) {
    if (query[key]) {
      values.push(query[key]);
      conditions.push(`${key} = $${values.length}`);
    }
  }

  values.push(query.limit, query.offset);
  const where = conditions.length > 0 ? `where ${conditions.join(" and ")}` : "";
  const result = await postgresPool.query(
    `select * from conversations ${where} order by coalesce(last_message_at, created_at) desc limit $${values.length - 1} offset $${values.length}`,
    values
  );

  return result.rows;
}

export async function touchConversationLastMessage(id: string, timestamp: string) {
  const result = await postgresPool.query(
    `update conversations
      set last_message_at = greatest(coalesce(last_message_at, $2), $2)
      where id = $1
      returning *`,
    [id, timestamp]
  );

  return result.rows[0] ?? null;
}
