import { Badge } from "../../components/Badge";
import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { formatDateTime, isOverdue, isToday } from "../../lib/date";
import { buildWhatsappUrl, formatPhone } from "../../lib/phone";
import type { WorklistActionItem } from "../../lib/api";

type Props = {
  items: WorklistActionItem[];
  onComplete: (id: string) => Promise<void>;
  onIgnore: (id: string) => Promise<void>;
};

export function WorklistTable({ items, onComplete, onIgnore }: Props) {
  if (items.length === 0) {
    return <EmptyState title="Sem itens nesta secao." />;
  }

  return (
    <div className="table-wrap">
      <table className="worklist-table">
        <thead>
          <tr>
            <th>Contato</th>
            <th>Telefone</th>
            <th>Acao</th>
            <th>Prazo</th>
            <th>Detalhe</th>
            <th>Status</th>
            <th>Acoes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const dueTone = item.dueAt ? (isOverdue(item.dueAt) ? "danger" : isToday(item.dueAt) ? "warning" : "neutral") : "neutral";
            const whatsappUrl = buildWhatsappUrl(item.normalizedPhone);
            return (
              <tr key={item.id}>
                <td>{item.contactName ?? "Sem nome"}</td>
                <td>{formatPhone(item.normalizedPhone)}</td>
                <td>{item.type}</td>
                <td>
                  <Badge tone={dueTone}>{formatDateTime(item.dueAt)}</Badge>
                </td>
                <td>
                  {(item.leadSource ?? "-") === "spreadsheet_import" ? "spreadsheet_import" : item.leadSource ?? "-"}
                  {item.reason ? ` | ${item.reason}` : ""}
                </td>
                <td>{item.status}</td>
                <td>
                  <div className="inline-actions">
                    <Button
                      type="button"
                      variant="ghost"
                      disabled={!whatsappUrl}
                      onClick={() => whatsappUrl && window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
                    >
                      Abrir WhatsApp
                    </Button>
                    <Button type="button" onClick={() => void onComplete(item.id)}>
                      Concluir
                    </Button>
                    <Button type="button" variant="danger" onClick={() => void onIgnore(item.id)}>
                      Ignorar
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
