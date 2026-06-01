import { Card } from "../../components/Card";
import type { WorklistActionItem } from "../../lib/api";
import { WorklistTable } from "./WorklistTable";

type Props = {
  title: string;
  subtitle: string;
  items: WorklistActionItem[];
  onComplete: (id: string) => Promise<void>;
  onIgnore: (id: string) => Promise<void>;
};

export function WorklistSection({ title, subtitle, items, onComplete, onIgnore }: Props) {
  return (
    <Card title={title} subtitle={subtitle}>
      <WorklistTable items={items} onComplete={onComplete} onIgnore={onIgnore} />
    </Card>
  );
}
