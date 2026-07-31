"use client";

import { CalendarDays, Headphones, Home, Inbox, LayoutDashboard, LogOut, BookOpen, FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { formatAdminRole } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/booking/api";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { label: "Requests", href: "/admin/requests", icon: LayoutDashboard },
  { label: "Inbox", href: "/admin/inbox", icon: Inbox },
  { label: "Homepage", href: "/admin/homepage", icon: Home },
  { label: "Events", href: "/admin/events", icon: CalendarDays },
  { label: "Books", href: "/admin/books", icon: BookOpen },
  { label: "Insights", href: "/admin/insights", icon: FileText },
  { label: "Work", href: "/admin/work", icon: Briefcase },
  { label: "Featured Episodes", href: "/admin/audio", icon: Headphones },
];

interface AdminLayoutShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayoutShell({ children, title, subtitle }: AdminLayoutShellProps) {
  const { profile, signOut, configured } = useAdminAuth();
  const isDemoMode = !isSupabaseConfigured;
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/admin/requests";

  return (
    <div className="min-h-screen bg-[var(--ploy-background-secondary)]">
      <header className="border-b border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="ploy-kicker">Private Workspace</p>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">{subtitle}</p>
            )}
            {profile && !isDemoMode && (
              <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">
                {profile.full_name} · {formatAdminRole(profile.role)}
              </p>
            )}
            {isDemoMode && (
              <p className="mt-1 text-sm text-[var(--ploy-text-tertiary)]">Demo mode · Mock data</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {configured && (
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="size-4" />
                Sign out
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="hidden w-48 shrink-0 lg:block">
          <nav className="space-y-1" aria-label="Admin">
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <a
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-[var(--ploy-radius-md)] px-3 py-2 text-sm font-medium transition-colors",
                  currentPath.startsWith(href)
                    ? "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
                    : "text-[var(--ploy-text-secondary)] hover:bg-[var(--ploy-interactive-secondary)] hover:text-[var(--ploy-text-primary)]",
                )}
              >
                <Icon className="size-4" />
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
