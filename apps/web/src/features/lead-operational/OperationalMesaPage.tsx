import { useMemo, useState } from "react";
import { CalendarDays, Filter, LayoutDashboard, UsersRound } from "lucide-react";

import { UIBadge } from "../../components/ui/badge";
import { UIButton } from "../../components/ui/button";
import { UIEmptyState } from "../../components/ui/empty-state";
import { UISelect, UISelectContent, UISelectItem, UISelectTrigger, UISelectValue } from "../../components/ui/select";
import { countFilter, filterLeads, filters } from "./leadFilters";
import { LeadDrawer } from "./LeadDrawer";
import { operationalLeads, queueLabels } from "./mockData";
import { QueueColumn } from "./QueueColumn";
import type { FilterKey, OperationalLead, QueueKey, ViewerRole } from "./types";

const dailyQueues: QueueKey[] = ["fazer_follow_up", "validar_agendamento", "revisar_lideranca"];
const allQueues: QueueKey[] = [...dailyQueues, "nutricao_campanha"];

const roleOptions: Array<{ value: ViewerRole; label: string }> = [
  { value: "atendente", label: "Atendente" },
  { value: "lider", label: "Lider" },
  { value: "admin", label: "Admin" }
];

export function OperationalMesaPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("todos");
  const [mobileQueue, setMobileQueue] = useState<QueueKey>("fazer_follow_up");
  const [viewerRole, setViewerRole] = useState<ViewerRole>("lider");
  const [selectedLead, setSelectedLead] = useState<OperationalLead | null>(null);
  const [feedback, setFeedback] = useState("");

  const filteredLeads = useMemo(() => filterLeads(operationalLeads, activeFilter), [activeFilter]);
  const activeQueues = activeFilter === "nutricao" ? allQueues : dailyQueues;

  const leadsByQueue = useMemo(() => {
    return allQueues.reduce<Record<QueueKey, OperationalLead[]>>(
      (acc, queue) => {
        acc[queue] = filteredLeads.filter((lead) => lead.queue === queue);
        return acc;
      },
      {
        fazer_follow_up: [],
        validar_agendamento: [],
        revisar_lideranca: [],
        nutricao_campanha: []
      }
    );
  }, [filteredLeads]);

  const dailyTotal = dailyQueues.reduce((total, queue) => total + leadsByQueue[queue].length, 0);
  const nutritionCount = operationalLeads.filter((lead) => lead.queue === "nutricao_campanha").length;

  function handleVisualAction(message: string) {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2800);
  }

  return (
    <div className="grid gap-5">
      <header className="flex flex-col gap-4 rounded-lg border border-clube-border bg-white p-5 shadow-sm lg:flex-row lg:items-start lg:justify-between">
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-clube-orange" />
            <h1 className="text-2xl font-semibold text-slate-950">Mesa Operacional</h1>
          </div>
          <p className="max-w-3xl text-sm text-slate-500">
            Operacao diaria dos leads de WhatsApp, agendamento, lideranca e nutricao com dados mockados para validacao visual.
          </p>
          <div className="flex flex-wrap gap-2">
            <UIBadge tone="default">Fila operacional separada de status</UIBadge>
            <UIBadge tone="warning">Transicoes criticas simuladas</UIBadge>
            <UIBadge tone="muted">Backend sera dono do ciclo real</UIBadge>
          </div>
        </div>
        <div className="grid min-w-[220px] gap-2">
          <span className="text-xs font-semibold text-slate-500">Visualizando como</span>
          <UISelect value={viewerRole} onValueChange={(value) => setViewerRole(value as ViewerRole)}>
            <UISelectTrigger>
              <UISelectValue />
            </UISelectTrigger>
            <UISelectContent>
              {roleOptions.map((role) => (
                <UISelectItem key={role.value} value={role.value}>
                  {role.label}
                </UISelectItem>
              ))}
            </UISelectContent>
          </UISelect>
        </div>
      </header>

      <section className="grid gap-3 rounded-lg border border-clube-border bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Filter className="h-4 w-4 text-clube-orange" />
          Filtros superiores
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map((filter) => (
            <UIButton
              key={filter.key}
              type="button"
              variant={activeFilter === filter.key ? "default" : "secondary"}
              size="sm"
              className="shrink-0"
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label}
              <span className="rounded-full bg-white/70 px-1.5 text-[11px] text-slate-800">{countFilter(operationalLeads, filter.key)}</span>
            </UIButton>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryTile label="Ativos na rotina" value={dailyTotal} />
        <SummaryTile label="Backlog" value={countFilter(operationalLeads, "backlog")} />
        <SummaryTile label="Lideranca" value={countFilter(operationalLeads, "lideranca")} />
        <SummaryTile label="Nutricao" value={nutritionCount} />
      </section>

      {feedback ? (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">{feedback}</div>
      ) : null}

      <section className="hidden gap-4 xl:flex">
        {dailyQueues.map((queue) => (
          <QueueColumn
            key={queue}
            queue={queue}
            leads={leadsByQueue[queue]}
            onOpenLead={setSelectedLead}
            onVisualAction={handleVisualAction}
          />
        ))}
      </section>

      <section className="grid gap-3 xl:hidden">
        <div className="rounded-lg border border-clube-border bg-white p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="mobile-queue">
            Fila operacional
          </label>
          <UISelect value={mobileQueue} onValueChange={(value) => setMobileQueue(value as QueueKey)}>
            <UISelectTrigger id="mobile-queue">
              <UISelectValue />
            </UISelectTrigger>
            <UISelectContent>
              {activeQueues.map((queue) => (
                <UISelectItem key={queue} value={queue}>
                  {queueLabels[queue].title}
                </UISelectItem>
              ))}
            </UISelectContent>
          </UISelect>
        </div>
        <QueueColumn
          queue={mobileQueue}
          leads={leadsByQueue[mobileQueue]}
          onOpenLead={setSelectedLead}
          onVisualAction={handleVisualAction}
        />
      </section>

      {activeFilter === "nutricao" ? (
        <section className="xl:flex">
          <QueueColumn
            queue="nutricao_campanha"
            leads={leadsByQueue.nutricao_campanha}
            onOpenLead={setSelectedLead}
            onVisualAction={handleVisualAction}
          />
        </section>
      ) : (
        <QueueColumn
          queue="nutricao_campanha"
          leads={operationalLeads.filter((lead) => lead.queue === "nutricao_campanha")}
          collapsed
          onOpenLead={setSelectedLead}
          onVisualAction={handleVisualAction}
        />
      )}

      {filteredLeads.length === 0 ? (
        <UIEmptyState
          title="Nenhum lead encontrado para este filtro."
          description="Ajuste o filtro superior para revisar outras filas operacionais."
          icon={<CalendarDays className="h-5 w-5 text-slate-500" />}
        />
      ) : null}

      <LeadDrawer lead={selectedLead} viewerRole={viewerRole} onClose={() => setSelectedLead(null)} onVisualAction={handleVisualAction} />
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-clube-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <UsersRound className="h-4 w-4 text-clube-orange" />
        {label}
      </div>
      <strong className="mt-2 block text-2xl font-semibold tabular-nums text-slate-950">{value}</strong>
    </article>
  );
}
