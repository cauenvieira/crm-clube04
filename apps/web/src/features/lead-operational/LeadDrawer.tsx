import { CalendarClock, History, LockKeyhole, MessageCircle, UserRound } from "lucide-react";

import { UIBadge } from "../../components/ui/badge";
import { UIButton } from "../../components/ui/button";
import { UISheet, UISheetContent, UISheetDescription, UISheetTitle } from "../../components/ui/sheet";
import { UITabs, UITabsContent, UITabsList, UITabsTrigger } from "../../components/ui/tabs";
import { queueLabels } from "./mockData";
import type { OperationalLead, ViewerRole } from "./types";

type Props = {
  lead: OperationalLead | null;
  viewerRole: ViewerRole;
  onClose: () => void;
  onVisualAction: (message: string) => void;
};

const roleLabel = {
  atendente: "Atendente",
  lider: "Lider",
  admin: "Admin"
};

export function LeadDrawer({ lead, viewerRole, onClose, onVisualAction }: Props) {
  const canFinish = viewerRole !== "atendente";

  return (
    <UISheet open={Boolean(lead)} onOpenChange={(open) => (open ? undefined : onClose())}>
      <UISheetContent className="w-[min(620px,100vw)]">
        {lead ? (
          <div className="grid gap-5">
            <header className="grid gap-3 border-b border-clube-border pb-4 pr-10">
              <div>
                <UISheetTitle className="text-xl font-semibold text-slate-950">{lead.tutorName}</UISheetTitle>
                <UISheetDescription className="mt-1 text-sm text-slate-500">{lead.pets.join(", ")}</UISheetDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <UIButton type="button" variant="secondary" size="sm" onClick={() => onVisualAction(`Acao visual: WhatsApp de ${lead.tutorName}.`)}>
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </UIButton>
                <UIButton type="button" variant="ghost" size="sm" onClick={() => onVisualAction(`Telefone de ${lead.tutorName} copiado.`)}>
                  Copiar telefone
                </UIButton>
              </div>
              <div className="grid gap-2 rounded-lg border border-clube-border bg-slate-50 p-3 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <UIBadge>{queueLabels[lead.queue].title}</UIBadge>
                  <UIBadge tone={lead.primarySituation.tone === "danger" ? "danger" : lead.primarySituation.tone === "warning" ? "warning" : "default"}>
                    {lead.primarySituation.label}
                  </UIBadge>
                </div>
                <div className="flex flex-wrap gap-4 text-slate-600">
                  <span>Prox.: {lead.nextActionLabel}</span>
                  <span className="tabular-nums">SR {lead.semRespostaCount}/12</span>
                  <span className="tabular-nums">FU {lead.followUpCount}</span>
                  <span>Resp.: {lead.responsible}</span>
                </div>
              </div>
            </header>

            <section className="grid gap-3 rounded-lg border border-clube-border p-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-clube-orange" />
                <h3 className="text-base font-semibold text-slate-950">Acao principal visual</h3>
              </div>
              <p className="text-sm text-slate-600">
                Esta primeira versao exibe a estrutura do fluxo. Transicoes criticas continuam sem implementacao real no frontend.
              </p>
              {lead.longFollowUpReason ? (
                <div className="rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">
                  Follow-up longo: {lead.longFollowUpReason}
                </div>
              ) : null}
              {lead.appointment ? <p className="text-sm text-slate-600">Agendamento: {lead.appointment}</p> : null}
              {lead.leadershipReason ? <p className="text-sm text-slate-600">Motivo lideranca: {lead.leadershipReason}</p> : null}
              <div className="flex flex-wrap gap-2">
                <UIButton type="button" size="sm" onClick={() => onVisualAction("Resultado visual registrado localmente.")}>
                  Simular resultado
                </UIButton>
                <UIButton type="button" variant="secondary" size="sm" onClick={onClose}>
                  Fechar
                </UIButton>
              </div>
            </section>

            <section className="grid gap-3 rounded-lg border border-clube-border p-4">
              <div className="flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-slate-500" />
                <h3 className="text-base font-semibold text-slate-950">Decisoes criticas</h3>
              </div>
              <p className="text-sm text-slate-600">Visualizando como {roleLabel[viewerRole]}. Atendente nao finaliza perdido/desqualificado.</p>
              <div className="flex flex-wrap gap-2">
                <UIButton type="button" variant="danger" size="sm" disabled={!canFinish}>
                  Finalizar perdido
                </UIButton>
                <UIButton type="button" variant="danger" size="sm" disabled={!canFinish}>
                  Desqualificar
                </UIButton>
                <UIButton type="button" variant="secondary" size="sm" disabled={!canFinish}>
                  Enviar nutricao
                </UIButton>
              </div>
            </section>

            <UITabs defaultValue="resumo" className="grid gap-3">
              <UITabsList>
                <UITabsTrigger value="resumo">Resumo</UITabsTrigger>
                <UITabsTrigger value="historico">Historico</UITabsTrigger>
                <UITabsTrigger value="cadastro">Cadastro</UITabsTrigger>
              </UITabsList>
              <UITabsContent value="resumo" className="grid gap-2 text-sm text-slate-600">
                <p>Origem: {lead.origin}</p>
                <p>Ultimo resultado: {lead.lastResult}</p>
                <p>Observacao: {lead.observation}</p>
                <div className="flex flex-wrap gap-1.5">
                  {lead.tags.map((tag) => (
                    <UIBadge key={tag.label} tone={tag.tone}>
                      {tag.label}
                    </UIBadge>
                  ))}
                </div>
              </UITabsContent>
              <UITabsContent value="historico" className="grid gap-2">
                {lead.history.map((item) => (
                  <article key={`${item.at}-${item.event}`} className="rounded-md border border-clube-border p-3 text-sm">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <History className="h-4 w-4" />
                      {item.event}
                    </div>
                    <p className="mt-1 text-slate-500">{item.at}</p>
                    <p className="mt-1 text-slate-600">{item.detail}</p>
                  </article>
                ))}
              </UITabsContent>
              <UITabsContent value="cadastro" className="grid gap-2 text-sm text-slate-600">
                <p className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  Tutor: {lead.tutorName}
                </p>
                <p>Doguinho(s): {lead.pets.join(", ")}</p>
                <p>Telefone normalizado: {lead.phone}</p>
              </UITabsContent>
            </UITabs>
          </div>
        ) : null}
      </UISheetContent>
    </UISheet>
  );
}
