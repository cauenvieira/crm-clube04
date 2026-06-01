import type { PropsWithChildren } from "react";

type BadgeTone = "neutral" | "warning" | "danger" | "success";

type Props = PropsWithChildren<{
  tone?: BadgeTone;
}>;

export function Badge({ tone = "neutral", children }: Props) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}
