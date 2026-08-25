"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  CircleHelp,
  Headphones,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  BookOpen,
  FileText,
  Briefcase,
  Users,
  ScrollText,
  PackageOpen,
  Mail,
  Megaphone,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { canAccessAuditLog, canAccessTeamAdmin, canManageResources, formatAdminRole } from "@/lib/auth/permissions";
import type { AdminProfile } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
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
  { label: "Resources", href: "/admin/resources", icon: PackageOpen, requiresResourceAccess: true },
  { label: "Audience", href: "/admin/audience", icon: Megaphone },
  { label: "Email preview", href: "/admin/settings/email-preview", icon: Mail },
  { label: "Team", href: "/admin/team", icon: Users, requiresTeamAccess: true },
  { label: "Audit Log", href: "/admin/audit-log", icon: ScrollText, requiresAuditAccess: true },
  { label: "Featured Episodes", href: "/admin/audio", icon: Headphones },
  { label: "Help", href: "/admin/help", icon: CircleHelp },
] as const;

function filterNavItems(profile: AdminProfile | null) {
  return NAV_ITEMS.filter((item) => {
    if ("requiresTeamAccess" in item && item.requiresTeamAccess && !canAccessTeamAdmin(profile)) {
      return false;
    }
    if ("requiresAuditAccess" in item && item.requiresAuditAccess && !canAccessAuditLog(profile)) {
      return false;
    }
    if ("requiresResourceAccess" in item && item.requiresResourceAccess && !canManageResources(profile)) {
      return false;
    }
    return true;
  });
}

function AdminNavLinks({
  currentPath,
  profile,
  onNavigate,
  className,
}: {
  currentPath: string;
  profile: AdminProfile | null;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)} aria-label="Admin">
      {filterNavItems(profile).map(({ label, href, icon: Icon }) => (
        <a
          key={href}
          href={href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2 rounded-[var(--ploy-radius-md)] px-3 py-2 text-sm font-medium transition-colors",
            currentPath.startsWith(href)
              ? "bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
              : "text-[var(--ploy-text-secondary)] hover:bg-[var(--ploy-interactive-secondary)] hover:text-[var(--ploy-text-primary)]",
          )}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </a>
      ))}
    </nav>
  );
}

interface AdminLayoutShellProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AdminLayoutShell({ children, title, subtitle }: AdminLayoutShellProps) {
  const { profile, signOut, configured } = useAdminAuth();
  const isDemoMode = !isSupabaseConfigured;
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(88);
  const headerRef = useRef<HTMLElement>(null);
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/admin/requests";

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeight = () => setHeaderHeight(header.offsetHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(header);
    return () => observer.disconnect();
  }, [title, subtitle, profile, isDemoMode]);

  useEffect(() => {
    if (!mobileNavOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      return;
    }

    const scrollY = window.scrollY;
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-[var(--ploy-background-secondary)]">
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)]"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
          <div className="min-w-0 flex-1">
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
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex size-10 items-center justify-center rounded-[var(--ploy-radius-button)] border border-[var(--ploy-border-primary)] text-[var(--ploy-text-primary)] lg:hidden"
              aria-label={mobileNavOpen ? "Close admin menu" : "Open admin menu"}
              aria-expanded={mobileNavOpen}
              aria-controls="admin-mobile-nav"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              {mobileNavOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            {configured && (
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
          aria-label="Close admin menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div
        id="admin-mobile-nav"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 overflow-y-auto overscroll-y-contain border-t border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-primary)] px-6 py-4 lg:hidden",
          mobileNavOpen ? "block" : "hidden",
        )}
        style={{ top: headerHeight }}
        aria-hidden={!mobileNavOpen}
      >
        <AdminNavLinks
          currentPath={currentPath}
          profile={profile}
          onNavigate={() => setMobileNavOpen(false)}
        />
      </div>

      <div className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <aside className="hidden w-48 shrink-0 lg:block">
          <AdminNavLinks currentPath={currentPath} profile={profile} />
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
