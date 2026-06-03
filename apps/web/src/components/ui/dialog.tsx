import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";
import { UIButton } from "./button";

export const UIDialog = DialogPrimitive.Root;
export const UIDialogTrigger = DialogPrimitive.Trigger;

export function UIDialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-950/40" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-[min(720px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-clube-border bg-white p-5 shadow-xl",
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

export const UIDialogTitle = DialogPrimitive.Title;
export const UIDialogDescription = DialogPrimitive.Description;
export const UIDialogClose = DialogPrimitive.Close;
