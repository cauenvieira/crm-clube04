import * as React from "react";

import { cn } from "../../lib/utils";

export const UIInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-clube-border bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-clube-orange focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);

UIInput.displayName = "UIInput";
