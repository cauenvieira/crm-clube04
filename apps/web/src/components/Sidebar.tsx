import { ClipboardList, Database, Settings, Sparkles } from "lucide-react";

import { UIMetricCard } from "./ui/metric-card";

type MenuItem = {
  key: string;
  label: string;
  enabled?: boolean;
};

type Props = {
  currentKey: string;
  items: MenuItem[];
  onSelect: (key: string) => void;
};

export function Sidebar({ currentKey, items, onSelect }: Props) {
  return (
    <aside className="sidebar flex min-h-screen flex-col">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-clube-orange text-slate-950">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="sidebar-title mb-0">CRM Clube04</h2>
          <p className="text-xs text-slate-400">Operacao local</p>
        </div>
      </div>
      <nav className="grid gap-2">
        {items.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`sidebar-link flex items-center gap-3${currentKey === item.key ? " active" : ""}`}
            onClick={() => item.enabled !== false && onSelect(item.key)}
            disabled={item.enabled === false}
          >
            {iconForItem(item.key)}
            {item.label}
          </button>
        ))}
      </nav>
      <UIMetricCard
        label="Modo"
        value="Local"
        helper="MVP v0.1"
        className="mt-auto border-slate-800 bg-slate-900 text-white shadow-none [&_p]:text-slate-400 [&_strong]:text-white [&_span]:text-slate-500"
      />
    </aside>
  );
}

function iconForItem(key: string) {
  if (key === "leads") return <Database className="h-4 w-4" />;
  if (key === "settings") return <Settings className="h-4 w-4" />;
  return <ClipboardList className="h-4 w-4" />;
}
