import type { PropsWithChildren } from "react";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

type MenuItem = {
  key: string;
  label: string;
  enabled?: boolean;
};

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  hasApiKey: boolean;
  currentPage: string;
  menuItems: MenuItem[];
  onNavigate: (page: string) => void;
}>;

export function AppShell({
  title,
  subtitle,
  hasApiKey,
  currentPage,
  menuItems,
  onNavigate,
  children
}: Props) {
  return (
    <div className="app-shell">
      <Sidebar currentKey={currentPage} items={menuItems} onSelect={onNavigate} />
      <div className="app-main">
        <Topbar title={title} subtitle={subtitle} hasApiKey={hasApiKey} />
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
