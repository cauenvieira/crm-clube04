import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { UIButton } from "./button";

export const UISheet = DialogPrimitive.Root;
export const UISheetTrigger = DialogPrimitive.Trigger;
export const UISheetClose = DialogPrimitive.Close;

export function UISheetContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/35" />
      <DialogPrimitive.Content
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-[min(860px,100vw)] overflow-y-auto border-l border-clube-border bg-white p-5 shadow-xl",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close asChild>
          <UIButton type="button" variant="ghost" size="icon" className="absolute right-3 top-3">
            <X className="h-4 w-4" />
          </UIButton>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export const UISheetTitle = DialogPrimitive.Title;
export const UISheetDescription = DialogPrimitive.Description;
