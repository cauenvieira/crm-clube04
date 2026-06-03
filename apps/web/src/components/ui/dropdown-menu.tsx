import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { cn } from "../../lib/utils";

export const UIDropdownMenu = DropdownMenuPrimitive.Root;
export const UIDropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export const UIDropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      className={cn("z-50 min-w-40 rounded-md border border-clube-border bg-white p-1 text-sm shadow-lg", className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));

UIDropdownMenuContent.displayName = "UIDropdownMenuContent";

export const UIDropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn("cursor-pointer rounded-sm px-2 py-1.5 outline-none hover:bg-slate-100", className)}
    {...props}
  />
));

UIDropdownMenuItem.displayName = "UIDropdownMenuItem";
