import { ChevronRight } from "lucide-react";

import { UIEmptyState } from "../../components/ui/empty-state";
import { LeadCard } from "./LeadCard";
import { queueLabels } from "./mockData";
import type { OperationalLead, QueueKey } from "./types";

type Props = {
  queue: QueueKey;
  leads: OperationalLead[];
  collapsed?: boolean;
  onOpenLead: (lead: OperationalLead) => void;
  onVisualAction: (message: string) => void;
};

export function QueueColumn({ queue, leads, collapsed = false, onOpenLead, onVisualAction }: Props) {
  const label = queueLabels[queue];

  if (collapsed) {
    return (
      <section className="rounded-lg border border-dashed border-clube-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-950">{label.title} recolhida</h2>
            <p className="mt-1 text-sm text-slate-500">{leads.length} leads fora da rotina diaria.</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-clube-orange">
            Use o filtro Nutricao <ChevronRight className="h-4 w-4" />
          </span>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-w-[300px] flex-1 flex-col rounded-lg border border-clube-border bg-slate-50/80">
      <div className="border-b border-clube-border p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-950">{label.title}</h2>
            <p className="mt-1 text-xs text-slate-500">{label.description}</p>
          </div>
          <strong className="rounded-full bg-white px-2.5 py-1 text-sm tabular-nums text-slate-800">{leads.length}</strong>
        </div>
      </div>
      <div className="grid gap-3 p-3">
        {leads.length === 0 ? (
          <UIEmptyState
            title="Nenhum lead nesta fila."
            description="Quando houver proxima acao, os leads aparecem aqui."
            className="bg-white"
          />
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} onOpen={onOpenLead} onVisualAction={onVisualAction} />)
        )}
      </div>
    </section>
  );
}
