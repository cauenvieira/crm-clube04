import type { ReactNode } from "react";

import { cn } from "../../lib/utils";

type Props = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function UIEmptyState({ title, description, icon, action, className }: Props) {
  return (
    <div className={cn("rounded-lg border border-dashed border-clube-border bg-white p-6 text-center", className)}>
      {icon ? <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">{icon}</div> : null}
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
