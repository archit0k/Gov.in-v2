"use client";

import { AppShell } from "@/components/shell/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div id="main">{children}</div>
    </AppShell>
  );
}
