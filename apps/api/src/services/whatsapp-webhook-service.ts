import * as contactService from "./contact-service.js";
import * as conversationService from "./conversation-service.js";
import * as messageService from "./message-service.js";
import * as leadService from "./lead-service.js";
import * as conversations from "../repositories/conversation-repository.js";
import * as leads from "../repositories/lead-repository.js";
import { ApiError } from "../utils/api-error.js";
import { normalizePhone } from "../utils/phone.js";
import type { WhatsappInboundInput } from "../validation/whatsapp-webhook-schemas.js";

export async function processWhatsappInbound(input: WhatsappInboundInput) {
  const normalizedPhone = normalizePhone(input.fromNumber);
  if (!normalizedPhone) {
    throw new ApiError(400, "Nao foi possivel normalizar fromNumber");
  }

  const { contact, created: contactCreated } = await contactService.createContact({
    name: input.contactName,
    phone: input.fromNumber,
    normalized_phone: normalizedPhone,
    source: input.source,
    type: "lead"
  });

  let conversation = await conversations.findConversationByProviderConversationId(
    input.provider,
    input.providerConversationId
  );
  let conversationCreated = false;

  if (!conversation) {
    conversation = await conversationService.createConversation({
      contact_id: contact.id,
      channel: "whatsapp",
      provider: input.provider,
      provider_conversation_id: input.providerConversationId,
      status: "open",
      started_at: input.timestamp,
      last_message_at: input.timestamp
    });
    conversationCreated = true;
  }

  const messageResult = await messageService.createMessage({
    conversation_id: conversation.id,
    provider: input.provider,
    provider_message_id: input.providerMessageId,
    direction: input.direction,
    message_type: input.messageType,
    from_number: input.fromNumber,
    to_number: input.toNumber,
    body: input.body,
    timestamp: input.timestamp,
    raw_payload: input.rawPayload
  });

  let lead = await leads.findLatestActiveLeadByContact(contact.id);
  let leadCreated = false;

  if (!lead) {
    lead = await leadService.createLead({
      contact_id: contact.id,
      source: input.source,
      campaign: input.campaign,
      status: "novo_lead",
      first_message_at: input.timestamp,
      last_interaction_at: input.timestamp,
      service_interest: "whatsapp_inbound"
    });
    leadCreated = true;
  } else if (!messageResult.created) {
    // Mensagem repetida nao deve alterar lead.
  } else {
    const refreshedLead = await leads.findLeadById(lead.id);
    if (refreshedLead) lead = refreshedLead;
  }

  return {
    contact,
    conversation,
    message: messageResult.message,
    lead,
    created: {
      contact: contactCreated,
      conversation: conversationCreated,
      message: messageResult.created,
      lead: leadCreated
    }
  };
}
