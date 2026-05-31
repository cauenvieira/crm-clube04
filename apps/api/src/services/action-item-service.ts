import * as actionItems from "../repositories/action-item-repository.js";
import type { ActionItemListQuery } from "../validation/action-item-schemas.js";

export async function listActionItems(query: ActionItemListQuery) {
  return actionItems.listActionItems(query);
}
