import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", {
  variants: {
    tone: {
      default: "bg-slate-100 text-slate-700",
      success: "bg-green-100 text-green-700",
      warning: "bg-orange-100 text-orange-700",
      danger: "bg-red-100 text-red-700",
      muted: "bg-slate-50 text-slate-500"
    }
  },
  defaultVariants: {
    tone: "default"
  }
});

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function UIBadge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
