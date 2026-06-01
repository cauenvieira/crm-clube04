import { useMemo, useState } from "react";

import { AppShell } from "./components/AppShell";
import { Card } from "./components/Card";
import { clearStoredApiKey, getStoredApiKey, setStoredApiKey } from "./lib/storage";
import { NewLeadPage } from "./features/leads/NewLeadPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { WorklistPage } from "./features/worklist/WorklistPage";

type PageKey = "today" | "leads" | "new-lead" | "settings";

export default function App() {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [page, setPage] = useState<PageKey>("today");

  const menuItems = useMemo(
    () => [
      { key: "today", label: "Hoje", enabled: true },
      { key: "leads", label: "Leads", enabled: true },
      { key: "new-lead", label: "Novo Lead", enabled: true },
      { key: "settings", label: "Configuracoes", enabled: true }
    ],
    []
  );

  return (
    <AppShell
      title="Painel Operacional"
      subtitle="Fila de trabalho e cadastro manual de leads."
      hasApiKey={apiKey.trim().length > 0}
      currentPage={page}
      menuItems={menuItems}
      onNavigate={(nextPage) => setPage(nextPage as PageKey)}
    >
      {page === "today" ? <WorklistPage apiKey={apiKey} /> : null}
      {page === "new-lead" ? <NewLeadPage apiKey={apiKey} onOpenToday={() => setPage("today")} /> : null}
      {page === "settings" ? (
        <SettingsPage
          apiKey={apiKey}
          onSaveApiKey={(value) => {
            setStoredApiKey(value);
            setApiKey(value.trim());
          }}
          onClearApiKey={() => {
            clearStoredApiKey();
            setApiKey("");
          }}
        />
      ) : null}
      {page === "leads" ? (
        <Card title="Leads" subtitle="Tela de listagem detalhada entra na proxima etapa.">
          <p>Use Novo Lead para cadastro manual e Hoje para executar a fila operacional.</p>
        </Card>
      ) : null}
    </AppShell>
  );
}
