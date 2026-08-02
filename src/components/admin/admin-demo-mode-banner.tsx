import { AlertTriangle } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/booking/api";

interface AdminDemoModeBannerProps {
  /** e.g. "requests" or "enquiries" */
  itemLabel: string;
  count: number;
}

export function AdminDemoModeBanner({ itemLabel, count }: AdminDemoModeBannerProps) {
  if (isSupabaseConfigured) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-[var(--ploy-radius-md)] border border-[oklch(0.72_0.14_75/0.35)] bg-[oklch(0.72_0.14_75/0.1)] px-4 py-3">
      <AlertTriangle className="size-4 shrink-0 text-[var(--ploy-status-warning)]" />
      <p className="text-sm text-[var(--ploy-text-secondary)]">
        <span className="font-medium text-[var(--ploy-text-primary)]">Demo Mode</span> — Showing{" "}
        {count} sample {itemLabel}. Configure Supabase in <code>.env</code> for live data. Admin
        access requires authentication once Supabase is connected.
      </p>
    </div>
  );
}
