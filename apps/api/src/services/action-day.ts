export type ActionDayCategory =
  | "new_leads"
  | "overdue_lead_actions"
  | "overdue_returns"
  | "clients_without_next_booking"
  | "active_package_without_booking"
  | "package_near_end"
  | "package_finished_without_renewal"
  | "clients_61_90_days"
  | "clients_over_90_days";

export const actionDayCategories: ActionDayCategory[] = [
  "new_leads",
  "overdue_lead_actions",
  "overdue_returns",
  "clients_without_next_booking",
  "active_package_without_booking",
  "package_near_end",
  "package_finished_without_renewal",
  "clients_61_90_days",
  "clients_over_90_days"
];
