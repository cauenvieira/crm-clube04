import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "../../lib/utils";

export const UIAccordion = AccordionPrimitive.Root;
export const UIAccordionItem = AccordionPrimitive.Item;

export const UIAccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header>
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn("flex w-full items-center justify-between py-3 text-left text-sm font-medium", className)}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-slate-500 transition-transform data-[state=open]:rotate-180" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));

UIAccordionTrigger.displayName = "UIAccordionTrigger";

export const UIAccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Content ref={ref} className={cn("pb-3 text-sm text-slate-600", className)} {...props} />
));

UIAccordionContent.displayName = "UIAccordionContent";
