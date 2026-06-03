import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../../lib/utils";

export const UITabs = TabsPrimitive.Root;

export const UITabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List ref={ref} className={cn("inline-flex rounded-md bg-slate-100 p-1", className)} {...props} />
));

UITabsList.displayName = "UITabsList";

export const UITabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn("rounded px-3 py-1.5 text-sm font-medium text-slate-600 data-[state=active]:bg-white data-[state=active]:text-slate-950", className)}
    {...props}
  />
));

UITabsTrigger.displayName = "UITabsTrigger";

export const UITabsContent = TabsPrimitive.Content;
