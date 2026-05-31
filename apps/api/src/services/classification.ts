export type RecencyBand = "0-30" | "31-60" | "61-90" | "+90";

export function classifyRecency(daysSinceLastVisit: number): RecencyBand {
  if (daysSinceLastVisit <= 30) return "0-30";
  if (daysSinceLastVisit <= 60) return "31-60";
  if (daysSinceLastVisit <= 90) return "61-90";
  return "+90";
}
