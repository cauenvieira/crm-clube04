import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/utils";

type Props = HTMLAttributes<HTMLElement> & {
  label: string;
  value: string | number;
  icon?: ReactNode;
  active?: boolean;
  helper?: string;
};

export function UIMetricCard({ label, value, icon, active = false, helper, className, ...props }: Props) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-white p-4 shadow-sm transition-colors",
        active ? "border-clube-orange bg-orange-50" : "border-clube-border",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
        {icon ? <span className="text-slate-500">{icon}</span> : null}
      </div>
      <strong className="mt-2 block text-2xl font-semibold text-slate-950">{value}</strong>
      {helper ? <span className="mt-1 block text-xs text-slate-500">{helper}</span> : null}
    </article>
  );
}
