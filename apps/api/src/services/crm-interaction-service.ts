import { notFound } from "../utils/api-error.js";
import * as interactions from "../repositories/crm-interaction-repository.js";
import * as leads from "../repositories/lead-repository.js";
import type { CrmInteractionCreateInput, CrmInteractionListQuery } from "../validation/crm-interaction-schemas.js";

export async function createCrmInteraction(input: CrmInteractionCreateInput) {
  if (input.lead_id) {
    const lead = await leads.findLeadById(input.lead_id);
    if (!lead) throw notFound("Lead");
  }

  const interaction = await interactions.createCrmInteraction(input);

  if (input.lead_id && (input.next_action_at || input.increment_attempts)) {
    await leads.updateLeadAfterInteraction(input.lead_id, {
      next_action_at: input.next_action_at,
      increment_attempts: input.increment_attempts
    });
  }

  return interaction;
}

export async function listCrmInteractions(query: CrmInteractionListQuery) {
  return interactions.listCrmInteractions(query);
}
