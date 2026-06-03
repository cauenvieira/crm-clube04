import * as React from "react";

import { cn } from "../../lib/utils";

export function UICard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-clube-border bg-white shadow-sm", className)} {...props} />;
}

export function UICardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1.5 p-5", className)} {...props} />;
}

export function UICardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-base font-semibold text-slate-950", className)} {...props} />;
}

export function UICardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

export function UICardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}
