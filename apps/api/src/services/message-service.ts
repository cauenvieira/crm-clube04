import { notFound } from "../utils/api-error.js";
import * as conversations from "../repositories/conversation-repository.js";
import * as messages from "../repositories/message-repository.js";
import * as leads from "../repositories/lead-repository.js";
import type { MessageCreateInput, MessageListQuery } from "../validation/message-schemas.js";

export async function createMessage(input: MessageCreateInput) {
  const conversation = await conversations.findConversationById(input.conversation_id);
  if (!conversation) throw notFound("Conversa");

  const provider = input.provider ?? conversation.provider;

  if (input.provider_message_id) {
    const existing = await messages.findMessageByProviderId(provider, input.provider_message_id);
    if (existing) {
      return { message: existing, created: false };
    }
  }

  const message = await messages.createMessage({
    ...input,
    provider,
    contact_id: conversation.contact_id
  });

  await conversations.touchConversationLastMessage(conversation.id, input.timestamp);
  await leads.touchActiveLeadsByContact(conversation.contact_id, input.timestamp);

  return { message, created: true };
}

export async function listMessages(query: MessageListQuery) {
  return messages.listMessages(query);
}

export async function listConversationMessages(conversationId: string, limit: number, offset: number) {
  const conversation = await conversations.findConversationById(conversationId);
  if (!conversation) throw notFound("Conversa");

  return messages.listMessagesByConversation(conversationId, limit, offset);
}
