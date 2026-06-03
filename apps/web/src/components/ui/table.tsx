import * as React from "react";

import { cn } from "../../lib/utils";

export function UITable({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("w-full caption-bottom text-sm", className)} {...props} />;
}

export function UITableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

export function UITableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function UITableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-b border-clube-border transition-colors hover:bg-slate-50", className)} {...props} />;
}

export function UITableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("h-10 px-3 text-left align-middle text-xs font-semibold text-slate-500", className)} {...props} />;
}

export function UITableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-3 align-middle text-slate-700", className)} {...props} />;
}
