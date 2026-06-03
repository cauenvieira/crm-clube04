import { cn } from "../../lib/utils";

type Tone = "success" | "warning" | "danger" | "muted" | "neutral";

const toneClasses: Record<Tone, string> = {
  success: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  danger: "bg-red-100 text-red-700",
  muted: "bg-slate-100 text-slate-500",
  neutral: "bg-slate-100 text-slate-700"
};

type Props = {
  children: string;
  tone?: Tone;
  className?: string;
};

export function UIStatusChip({ children, tone = "neutral", className }: Props) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", toneClasses[tone], className)}>{children}</span>;
}
