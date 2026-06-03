import * as React from "react";

import { cn } from "../../lib/utils";

export const UITextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-24 w-full rounded-md border border-clube-border bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-clube-orange focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
);

UITextarea.displayName = "UITextarea";
