import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { ErrorState } from "../../components/ErrorState";
import { Input } from "../../components/Input";
import { LoadingState } from "../../components/LoadingState";
import {
  completeActionItem,
  getOperationalSummary,
  getOperationalWorklist,
  ignoreActionItem,
  type OperationalSummary,
  type OperationalWorklist
} from "../../lib/api";
import { formatDateTime } from "../../lib/date";
import { formatPhone } from "../../lib/phone";
import { WorklistSection } from "./WorklistSection";

type Props = {
  apiKey: string;
};

export function WorklistPage({ apiKey }: Props) {
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [summary, setSummary] = useState<OperationalSummary | null>(null);
  const [worklist, setWorklist] = useState<OperationalWorklist | null>(null);

  const canLoad = apiKey.trim().length > 0;

  const refresh = useCallback(async () => {
    if (!canLoad) return;
    setLoading(true);
    setError("");
    try {
      const [summaryData, worklistData] = await Promise.all([
        getOperationalSummary(apiKey),
        getOperationalWorklist(apiKey, limit)
      ]);
      setSummary(summaryData);
      setWorklist(worklistData);
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "Falha ao carregar fila operacional.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [apiKey, canLoad, limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleComplete(actionItemId: string) {
    try {
      await completeActionItem(apiKey, actionItemId);
      setFeedback("Action item concluido.");
      await refresh();
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "Falha ao concluir action item.";
      setError(message);
    }
  }

  async function handleIgnore(actionItemId: string) {
    if (!window.confirm("Confirmar ignorar este action item?")) return;
    try {
      await ignoreActionItem(apiKey, actionItemId);
      setFeedback("Action item ignorado.");
      await refresh();
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "Falha ao ignorar action item.";
      setError(message);
    }
  }

  const summaryCards = useMemo(() => {
    if (!summary) return [];
    return [
      { label: "Acoes vencidas", value: summary.actionItems.vencidos },
      { label: "Acoes pendentes", value: summary.actionItems.pendente },
      { label: "Concluidos hoje", value: summary.actionItems.concluidoHoje },
      { label: "Ignorados hoje", value: summary.actionItems.ignoradoHoje },
      { label: "Novos leads", value: summary.leads.novoLead },
      { label: "Inbound hoje", value: summary.messages.inboundHoje }
    ];
  }, [summary]);

  if (!canLoad) {
    return <ErrorState message="Configure a API key em Configuracoes para acessar a fila operacional." />;
  }

  return (
    <div className="page-grid">
      <Card
        title="Hoje / Vencidos"
        subtitle={summary ? `Business date: ${summary.businessDate} | Timezone: ${summary.timezone}` : "Carregando resumo..."}
        action={
          <div className="inline-actions">
            <Input
              id="worklist-limit"
              type="number"
              min={1}
              max={50}
              value={String(limit)}
              onChange={(event) => setLimit(Math.max(1, Math.min(50, Number.parseInt(event.target.value || "10", 10))))}
              label="Limit"
            />
            <Button type="button" variant="secondary" onClick={() => void refresh()} disabled={loading}>
              Atualizar
            </Button>
          </div>
        }
      >
        {loading ? <LoadingState message="Carregando worklist..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        {feedback ? <p className="feedback-inline">{feedback}</p> : null}
        {summaryCards.length > 0 ? (
          <div className="summary-grid">
            {summaryCards.map((card) => (
              <article className="summary-card" key={card.label}>
                <p>{card.label}</p>
                <strong>{card.value}</strong>
              </article>
            ))}
          </div>
        ) : null}
      </Card>

      {worklist ? (
        <>
          <WorklistSection
            title="Acoes vencidas"
            subtitle="Prioridade maxima para atendimento."
            items={worklist.actionItems.vencidos}
            onComplete={handleComplete}
            onIgnore={handleIgnore}
          />
          <WorklistSection
            title="Acoes pendentes"
            subtitle="Fila geral de hoje."
            items={worklist.actionItems.pendentes}
            onComplete={handleComplete}
            onIgnore={handleIgnore}
          />
          <WorklistSection
            title="Retomar atendimento"
            subtitle="Backlog operacional redistribuido."
            items={worklist.actionItems.retomarAtendimento}
            onComplete={handleComplete}
            onIgnore={handleIgnore}
          />
          <WorklistSection
            title="Follow-ups agendados"
            subtitle="Leads com Data Prox Acao valida."
            items={worklist.actionItems.followUpsAgendados}
            onComplete={handleComplete}
            onIgnore={handleIgnore}
          />
          <WorklistSection
            title="Revisao lideranca"
            subtitle="Somente excecoes criticas."
            items={worklist.actionItems.revisaoLideranca}
            onComplete={handleComplete}
            onIgnore={handleIgnore}
          />
          <WorklistSection
            title="Novos leads"
            subtitle="Entrada recente manual/integracoes."
            items={worklist.actionItems.novosLeads}
            onComplete={handleComplete}
            onIgnore={handleIgnore}
          />

          <Card title="Ultimas mensagens inbound" subtitle="Movimento recente do WhatsApp inbound.">
            {worklist.messages.ultimasInbound.length === 0 ? (
              <EmptyState title="Sem mensagens inbound recentes." />
            ) : (
              <ul className="messages-list">
                {worklist.messages.ultimasInbound.map((message) => (
                  <li key={message.id}>
                    <p>
                      <strong>{message.contactName ?? "Sem nome"}</strong> - {formatPhone(message.normalizedPhone)}
                    </p>
                    <p>{message.body ?? "Sem texto"}</p>
                    <p>{formatDateTime(message.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
