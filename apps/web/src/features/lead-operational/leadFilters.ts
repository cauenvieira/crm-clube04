import type { FilterKey, OperationalLead } from "./types";

export const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "todos", label: "Todos ativos" },
  { key: "hoje", label: "Hoje" },
  { key: "atrasados", label: "Atrasados" },
  { key: "backlog", label: "Backlog" },
  { key: "proximos_7", label: "Prox. 7 dias" },
  { key: "validar", label: "Validar" },
  { key: "lideranca", label: "Lideranca" },
  { key: "nutricao", label: "Nutricao" },
  { key: "tentativa_alta", label: "Tentativa alta" }
];

export function filterLeads(leads: OperationalLead[], filter: FilterKey) {
  return leads.filter((lead) => {
    if (filter === "todos") return lead.queue !== "nutricao_campanha";
    if (filter === "hoje") return lead.nextActionBucket === "today";
    if (filter === "atrasados") return lead.nextActionBucket === "overdue";
    if (filter === "backlog") return lead.nextActionBucket === "backlog";
    if (filter === "proximos_7") return lead.nextActionBucket === "next7";
    if (filter === "validar") return lead.queue === "validar_agendamento";
    if (filter === "lideranca") return lead.queue === "revisar_lideranca";
    if (filter === "nutricao") return lead.queue === "nutricao_campanha";
    if (filter === "tentativa_alta") return lead.semRespostaCount >= 8;
    return true;
  });
}

export function countFilter(leads: OperationalLead[], filter: FilterKey) {
  return filterLeads(leads, filter).length;
}
