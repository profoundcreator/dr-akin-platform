"use client";

import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--ploy-background-primary)]">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
