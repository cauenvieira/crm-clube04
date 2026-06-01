import { useState } from "react";

import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Input } from "../../components/Input";
import { LoadingState } from "../../components/LoadingState";
import { formatDateTime } from "../../lib/date";
import { formatPhone } from "../../lib/phone";
import { searchLeads } from "../../lib/api";

type ResultItem = Awaited<ReturnType<typeof searchLeads>>[number];

type Props = {
  apiKey: string;
};

export function LeadSearch({ apiKey }: Props) {
  const [phone, setPhone] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<ResultItem[]>([]);

  async function handleSearch() {
    if (!apiKey) {
      setError("Configure a API key para pesquisar leads.");
      return;
    }
    if (!phone.trim() && !query.trim()) {
      setError("Informe telefone ou nome para busca.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await searchLeads(apiKey, {
        phone: phone.trim() || undefined,
        q: query.trim() || undefined,
        limit: 10
      });
      setResults(data);
      if (data.length === 0) setError("Nenhum resultado encontrado.");
    } catch (apiError) {
      const message = apiError instanceof Error ? apiError.message : "Falha ao buscar leads.";
      setError(message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="Busca rapida de lead" subtitle="Confere duplicidade antes de cadastrar novo contato.">
      <div className="stack-gap">
        <div className="split-fields">
          <Input
            id="lead-search-phone"
            label="Telefone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="5511999999999"
          />
          <Input
            id="lead-search-name"
            label="Nome"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nome do tutor"
          />
        </div>
        <div className="inline-actions">
          <Button type="button" variant="secondary" onClick={handleSearch} disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </Button>
        </div>
        {loading ? <LoadingState message="Buscando contatos e leads..." /> : null}
        {!loading && results.length === 0 && !error ? (
          <EmptyState title="Sem consulta ainda." description="Use telefone ou nome para verificar duplicidade." />
        ) : null}
        {error ? <p className="field-error">{error}</p> : null}
        {results.length > 0 ? (
          <ul className="search-results">
            {results.map((item) => (
              <li key={item.contact.id}>
                <p>
                  <strong>{item.contact.name ?? "Sem nome"}</strong> - {formatPhone(item.contact.normalized_phone)}
                </p>
                <p>
                  Lead ativo: {item.active_lead ? item.active_lead.status : "nenhum"}{" "}
                  {item.active_lead?.next_action_at ? `| prox: ${formatDateTime(item.active_lead.next_action_at)}` : ""}
                </p>
                <p>Action items abertos: {item.open_action_items.length}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Card>
  );
}
