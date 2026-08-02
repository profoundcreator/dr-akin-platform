"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Mail, User } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  convertEnquiryToBooking,
  getEnquiryById,
  updateEnquiryStatus,
  type EnquiryRecord,
} from "@/lib/booking/api";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { canWriteBookings } from "@/lib/auth/permissions";

interface InboxDetailPageProps {
  enquiryId: string;
}

const STATUS_OPTIONS = ["New", "Open", "Awaiting Reply", "Resolved", "Spam", "Archived"];

export function InboxDetailPage({ enquiryId }: InboxDetailPageProps) {
  const { profile } = useAdminAuth();
  const canEdit = canWriteBookings(profile);
  const [enquiry, setEnquiry] = useState<EnquiryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("New");
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getEnquiryById(enquiryId);
        if (!data) {
          setError("Enquiry not found");
          return;
        }
        setEnquiry(data);
        setStatus(data.status);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load enquiry");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [enquiryId]);

  const handleSaveStatus = async () => {
    if (!enquiry || !canEdit) return;
    setSaving(true);
    setError(null);
    try {
      await updateEnquiryStatus(enquiry.id, status);
      setEnquiry((prev) => (prev ? { ...prev, status } : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const handleConvert = async () => {
    if (!enquiry || !canEdit || enquiry.bookingRequestId) return;
    const confirmed = window.confirm(
      "Create a structured booking request from this enquiry? Missing fields will be marked as pending.",
    );
    if (!confirmed) return;

    setConverting(true);
    setError(null);
    try {
      const result = await convertEnquiryToBooking(enquiry.id);
      setEnquiry((prev) =>
        prev
          ? {
              ...prev,
              bookingRequestId: result.bookingRequestId,
              status: "Open",
            }
          : prev,
      );
      window.location.href = `/admin/requests/detail?id=${result.bookingRequestId}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to convert enquiry");
      setConverting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayoutShell title="Inbox Detail">
        <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading...</p>
      </AdminLayoutShell>
    );
  }

  if (!enquiry) {
    return (
      <AdminLayoutShell title="Inbox Detail">
        <p className="text-sm text-[var(--ploy-status-error)]">{error ?? "Not found"}</p>
        <Button variant="ghost" href="/admin/inbox" className="mt-4">
          <ArrowLeft className="size-4" />
          Back to inbox
        </Button>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell
      title={enquiry.subject ?? "General enquiry"}
      subtitle={`${enquiry.source} · ${enquiry.contactName}`}
    >
      <div className="space-y-8">
        <Button variant="ghost" size="sm" href="/admin/inbox">
          <ArrowLeft className="size-4" />
          All enquiries
        </Button>

        {error && (
          <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
            {error}
          </p>
        )}

        {!canEdit && (
          <p className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
            Your role is read-only for the inbox.
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="ploy-surface-elevated space-y-4 p-6">
            <Heading as="h2" size="card">
              Contact
            </Heading>
            <div className="flex gap-2 text-sm">
              <User className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
              <div>
                <p className="font-medium">{enquiry.contactName}</p>
                {enquiry.organization && (
                  <p className="text-[var(--ploy-text-secondary)]">{enquiry.organization}</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 text-sm">
              <Mail className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
              <a
                href={`mailto:${enquiry.contactEmail}`}
                className="text-[var(--ploy-text-link)] hover:underline"
              >
                {enquiry.contactEmail}
              </a>
            </div>
            {enquiry.contactPhone && (
              <p className="text-sm text-[var(--ploy-text-secondary)]">{enquiry.contactPhone}</p>
            )}
            <div className="flex gap-2 text-sm">
              <Calendar className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
              <span>{new Date(enquiry.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="ploy-surface-elevated space-y-4 p-6">
            <Heading as="h2" size="card">
              Message
            </Heading>
            {enquiry.message ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                {enquiry.message}
              </p>
            ) : (
              <p className="text-sm text-[var(--ploy-text-tertiary)]">No message body.</p>
            )}
          </div>
        </div>

        <div className="ploy-surface-elevated space-y-4 p-6">
          <Heading as="h2" size="card">
            Actions
          </Heading>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label htmlFor="enquiry-status" className="text-xs font-medium text-[var(--ploy-text-secondary)]">
                Status
              </label>
              <select
                id="enquiry-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={!canEdit}
                className="block rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm disabled:opacity-60"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            {canEdit && (
              <Button variant="secondary" onClick={handleSaveStatus} disabled={saving}>
                {saving ? "Saving..." : "Save status"}
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[var(--ploy-border-subtle)] pt-4">
            {enquiry.bookingRequestId ? (
              <Button
                variant="primary"
                href={`/admin/requests/detail?id=${enquiry.bookingRequestId}`}
              >
                View linked booking
              </Button>
            ) : canEdit ? (
              <Button variant="primary" onClick={handleConvert} disabled={converting}>
                {converting ? "Converting..." : "Convert to booking request"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </AdminLayoutShell>
  );
}
