import { notFound } from "../utils/api-error.js";
import * as contacts from "../repositories/contact-repository.js";
import * as conversations from "../repositories/conversation-repository.js";
import type { ConversationCreateInput, ConversationListQuery } from "../validation/conversation-schemas.js";

export async function createConversation(input: ConversationCreateInput) {
  const contact = await contacts.findContactById(input.contact_id);
  if (!contact) throw notFound("Contato");

  return conversations.createConversation(input);
}

export async function getConversation(id: string) {
  const conversation = await conversations.findConversationById(id);
  if (!conversation) throw notFound("Conversa");
  return conversation;
}

export async function listConversations(query: ConversationListQuery) {
  return conversations.listConversations(query);
}
