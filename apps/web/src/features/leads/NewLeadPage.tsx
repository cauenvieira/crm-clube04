import { useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { ErrorState } from "../../components/ErrorState";
import { createManualLead, FrontendApiError, type ManualLeadPayload, type ManualLeadResponse } from "../../lib/api";
import { LeadForm } from "./LeadForm";
import { LeadSearch } from "./LeadSearch";

type Props = {
  apiKey: string;
  onOpenToday: () => void;
};

export function NewLeadPage({ apiKey, onOpenToday }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ManualLeadResponse | null>(null);

  async function handleSubmit(payload: ManualLeadPayload) {
    if (!apiKey) {
      setError("Configure a API key antes de cadastrar lead.");
      return;
    }

    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const response = await createManualLead(apiKey, payload);
      setResult(response);
    } catch (apiError) {
      const message = apiError instanceof FrontendApiError ? apiError.message : "Falha ao cadastrar lead.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-grid">
      <LeadForm submitting={submitting} onSubmit={handleSubmit} />

      {error ? <ErrorState message={error} /> : null}

      {result ? (
        <Card title="Resultado do cadastro" subtitle={result.message}>
          <div className="stack-gap">
            <p>contact_id: {result.contact_id}</p>
            <p>lead_id: {result.lead_id}</p>
            <p>action_item_id: {result.action_item_id}</p>
            <p>
              criado: contato={String(result.created.contact)} lead={String(result.created.lead)} action_item=
              {String(result.created.action_item)}
            </p>
            {result.duplicate.active_lead ? (
              <div className="inline-actions">
                <Button type="button" variant="secondary" onClick={onOpenToday}>
                  Abrir fila Hoje
                </Button>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}

      <LeadSearch apiKey={apiKey} />
    </div>
  );
}
