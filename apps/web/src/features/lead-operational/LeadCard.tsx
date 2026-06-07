import { Copy, MessageCircle } from "lucide-react";

import { UIBadge } from "../../components/ui/badge";
import { UIButton } from "../../components/ui/button";
import { UITooltip, UITooltipContent, UITooltipProvider, UITooltipTrigger } from "../../components/ui/tooltip";
import type { OperationalLead } from "./types";

type Props = {
  lead: OperationalLead;
  onOpen: (lead: OperationalLead) => void;
  onVisualAction: (message: string) => void;
};

const situationTone = {
  danger: "danger",
  warning: "warning",
  info: "default",
  success: "success",
  muted: "muted"
} as const;

function formatPhone(phone: string) {
  const local = phone.replace(/^55/, "");
  return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
}

export function LeadCard({ lead, onOpen, onVisualAction }: Props) {
  const pets = lead.pets.length > 2 ? `${lead.pets.slice(0, 2).join(", ")} +${lead.pets.length - 2}` : lead.pets.join(", ");

  async function copyPhone(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    await navigator.clipboard?.writeText(lead.phone);
    onVisualAction(`Telefone de ${lead.tutorName} copiado.`);
  }

  function simulateWhatsApp(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onVisualAction(`Acao visual: abrir WhatsApp de ${lead.tutorName}.`);
  }

  return (
    <article
      className="min-h-[148px] cursor-pointer rounded-lg border border-clube-border bg-white p-3 shadow-sm transition hover:border-clube-orange/60 hover:shadow-md"
      onClick={() => onOpen(lead)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-5 text-slate-950">{lead.tutorName}</h3>
          <p className="truncate text-[13px] font-medium text-slate-500">{pets}</p>
        </div>
        <UIBadge tone={situationTone[lead.primarySituation.tone]} className="shrink-0 text-[11px]">
          {lead.primarySituation.label}
        </UIBadge>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="truncate text-sm text-slate-700">{formatPhone(lead.phone)}</span>
        <UITooltipProvider>
          <div className="flex items-center gap-1">
            <UITooltip>
              <UITooltipTrigger asChild>
                <UIButton type="button" variant="ghost" size="icon" aria-label="Acao visual de WhatsApp" onClick={simulateWhatsApp}>
                  <MessageCircle className="h-4 w-4" />
                </UIButton>
              </UITooltipTrigger>
              <UITooltipContent>Acao visual de WhatsApp</UITooltipContent>
            </UITooltip>
            <UITooltip>
              <UITooltipTrigger asChild>
                <UIButton type="button" variant="ghost" size="icon" aria-label="Copiar telefone" onClick={(event) => void copyPhone(event)}>
                  <Copy className="h-4 w-4" />
                </UIButton>
              </UITooltipTrigger>
              <UITooltipContent>Copiar telefone</UITooltipContent>
            </UITooltip>
          </div>
        </UITooltipProvider>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[12px] font-medium tabular-nums text-slate-600">
        <span className="truncate">Prox.: {lead.nextActionLabel}</span>
        <span className="shrink-0">SR {lead.semRespostaCount}/12</span>
        <span className="shrink-0">FU {lead.followUpCount}</span>
      </div>

      <div className="mt-2 flex min-h-7 flex-wrap gap-1.5 overflow-hidden">
        {lead.tags.slice(0, 3).map((tag) => (
          <UIBadge key={tag.label} tone={tag.tone} className="max-w-[130px] truncate px-2 py-1 text-[11px]">
            {tag.label}
          </UIBadge>
        ))}
      </div>

      <div className="mt-2 grid gap-1 text-[12px] leading-4 text-slate-500">
        <p className="truncate">
          <span className="font-semibold text-slate-600">Ult.:</span> {lead.lastResult}
        </p>
        <p className="truncate">
          <span className="font-semibold text-slate-600">Obs.:</span> {lead.observation}
        </p>
      </div>
    </article>
  );
}
