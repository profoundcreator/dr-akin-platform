"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TEMPLATE_OPTIONS = [
  { id: "enquiry-admin", label: "Contact — admin alert" },
  { id: "enquiry-confirmation", label: "Contact — submitter confirmation" },
  { id: "booking-admin", label: "Booking — admin alert" },
  { id: "booking-confirmation", label: "Booking — submitter confirmation" },
  { id: "booking-conversion-admin", label: "Conversion — admin alert" },
  { id: "booking-conversion-confirmation", label: "Conversion — organizer confirmation" },
  { id: "booking-status-update", label: "Booking — status update" },
] as const;

type TemplateId = (typeof TEMPLATE_OPTIONS)[number]["id"];

export function EmailPreviewDashboard() {
  const [template, setTemplate] = useState<TemplateId>("enquiry-admin");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPreview = useCallback(async (nextTemplate: TemplateId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/email-preview?template=${nextTemplate}`);
      const data = (await response.json()) as { subject?: string; html?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load preview.");
      }
      setSubject(data.subject ?? "");
      setHtml(data.html ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preview.");
      setSubject("");
      setHtml("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreview(template);
  }, [template, loadPreview]);

  return (
    <AdminLayoutShell
      title="Email preview"
      subtitle="Read-only preview of transactional templates sent via Resend."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {TEMPLATE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTemplate(option.id)}
              className={cn(
                "rounded-[var(--ploy-radius-md)] border px-3 py-2 text-sm transition-colors",
                template === option.id
                  ? "border-[var(--ploy-interactive-primary)] bg-[var(--ploy-interactive-primary)] text-[var(--ploy-text-inverse)]"
                  : "border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] hover:bg-[var(--ploy-interactive-secondary)]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        )}

        <div className="rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] p-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 size-5 shrink-0 text-[var(--ploy-text-tertiary)]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wide text-[var(--ploy-text-tertiary)]">
                Subject line
              </p>
              <p className="mt-1 font-medium">{loading ? "Loading…" : subject || "—"}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              disabled={loading || !html}
              onClick={() => {
                const blob = new Blob([html], { type: "text/html" });
                const url = URL.createObjectURL(blob);
                window.open(url, "_blank", "noopener,noreferrer");
              }}
            >
              Open in new tab
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--ploy-border-primary)] bg-white">
          {loading ? (
            <p className="p-8 text-sm text-[var(--ploy-text-tertiary)]">Loading preview…</p>
          ) : html ? (
            <iframe
              title={`Email preview — ${template}`}
              srcDoc={html}
              className="min-h-[640px] w-full border-0"
              sandbox="allow-same-origin"
            />
          ) : (
            <p className="p-8 text-sm text-[var(--ploy-text-tertiary)]">No preview available.</p>
          )}
        </div>
      </div>
    </AdminLayoutShell>
  );
}
