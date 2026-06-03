import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "../../lib/utils";

export const UITooltipProvider = TooltipPrimitive.Provider;
export const UITooltip = TooltipPrimitive.Root;
export const UITooltipTrigger = TooltipPrimitive.Trigger;

export const UITooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      className={cn("z-50 rounded-md bg-slate-950 px-3 py-1.5 text-xs text-white shadow-md", className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
));

UITooltipContent.displayName = "UITooltipContent";
