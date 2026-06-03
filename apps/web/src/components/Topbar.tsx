import { UIStatusChip } from "./ui/status-chip";

type Props = {
  title: string;
  subtitle?: string;
  hasApiKey: boolean;
};

export function Topbar({ title, subtitle, hasApiKey }: Props) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      <UIStatusChip tone={hasApiKey ? "success" : "warning"}>
        {hasApiKey ? "API key configurada" : "API key pendente"}
      </UIStatusChip>
    </header>
  );
}
