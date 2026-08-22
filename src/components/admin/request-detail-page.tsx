"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Textarea } from "@/components/ui/textarea";
import { bookingRequestAreaLabel } from "@/lib/contact/platform-labels";
import {
  formatEventLocation,
  isLogisticsNotApplicable,
  isProtocolNotApplicable,
} from "@/lib/booking/format-rules";
import {
  getBookingRequestById,
  updateBookingStatus,
} from "@/lib/booking/api";
import type { BookingRequest, InternalStatus, OrganizerStatus } from "@/lib/booking/types";
import { ORGANIZER_STATUSES, INTERNAL_STATUSES } from "@/lib/booking/types";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { canWriteBookings } from "@/lib/auth/permissions";
import { BookingResourceGrants } from "@/components/admin/booking-resource-grants";

interface RequestDetailPageProps {
  requestId: string;
}

export function RequestDetailPage({ requestId }: RequestDetailPageProps) {
  const { profile } = useAdminAuth();
  const canEdit = canWriteBookings(profile);
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<OrganizerStatus>("Received");
  const [internalStatus, setInternalStatus] = useState<InternalStatus>("New / Unassigned");
  const [organizerMessage, setOrganizerMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getBookingRequestById(requestId);
        if (!data) {
          setError("Request not found");
          return;
        }
        setRequest(data);
        setStatus(data.status);
        setInternalStatus(data.internalStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load request");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [requestId]);

  const handleSave = async () => {
    if (!request || !canEdit) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateBookingStatus(request.id, {
        status,
        internalStatus,
        organizerMessage: organizerMessage || undefined,
        internalReason: internalNote || undefined,
        actorName: profile?.full_name ?? "EA",
      });
      if (updated) {
        setRequest(updated);
        setOrganizerMessage("");
        setInternalNote("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayoutShell title="Request Detail">
        <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading...</p>
      </AdminLayoutShell>
    );
  }

  if (!request) {
    return (
      <AdminLayoutShell title="Request Detail">
        <p className="text-sm text-[var(--ploy-status-error)]">{error ?? "Not found"}</p>
        <Button variant="ghost" href="/admin/requests" className="mt-4">
          <ArrowLeft className="size-4" />
          Back to requests
        </Button>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell title={request.form.eventTitle} subtitle={request.reference}>
      <div className="space-y-8">
        <Button variant="ghost" size="sm" href="/admin/requests">
          <ArrowLeft className="size-4" />
          All requests
        </Button>

        {error && (
          <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="ploy-surface-elevated space-y-4 p-6">
            <Heading as="h2" size="card">
              Organizer
            </Heading>
            <div className="flex gap-2 text-sm">
              <User className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
              <div>
                <p className="font-medium">{request.form.name}</p>
                <p className="text-[var(--ploy-text-secondary)]">
                Request area: {bookingRequestAreaLabel(request.form.requestArea)}
              </p>
              <p className="text-[var(--ploy-text-secondary)]">{request.form.organization}</p>
                <p className="text-[var(--ploy-text-tertiary)]">{request.form.email}</p>
                <p className="text-[var(--ploy-text-tertiary)]">{request.form.phone}</p>
              </div>
            </div>
          </div>

          <div className="ploy-surface-elevated space-y-4 p-6">
            <Heading as="h2" size="card">
              Event
            </Heading>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <Calendar className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
                <span>{request.form.preferredDate || "—"}</span>
              </div>
              <div className="flex gap-2">
                <MapPin className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
                <span>{formatEventLocation(request.form)}</span>
              </div>
              <p>
                {request.form.engagementType} · {request.form.format} · {request.form.audienceSize}
              </p>
              {request.form.travelDetails.trim() && (
                <p
                  className={
                    isLogisticsNotApplicable(request.form.travelDetails)
                      ? "italic text-[var(--ploy-text-tertiary)]"
                      : "text-[var(--ploy-text-secondary)]"
                  }
                >
                  Logistics: {request.form.travelDetails}
                </p>
              )}
              {request.form.vipProtocol.trim() && (
                <p
                  className={
                    isProtocolNotApplicable(request.form.vipProtocol)
                      ? "italic text-[var(--ploy-text-tertiary)]"
                      : "text-[var(--ploy-text-secondary)]"
                  }
                >
                  Event security & reception: {request.form.vipProtocol}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="ploy-surface-elevated space-y-6 p-6">
          <Heading as="h2" size="card">
            Status workflow
          </Heading>
          {!canEdit && (
            <p className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-4 py-3 text-sm text-[var(--ploy-text-secondary)]">
              Your role is read-only for booking requests. You can review details but cannot change
              status.
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span className="font-medium">Organizer status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as OrganizerStatus)}
                disabled={!canEdit}
                className="w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-[var(--ploy-background-primary)] px-3 py-2 disabled:opacity-60"
              >
                {ORGANIZER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">Internal status</span>
              <select
                value={internalStatus}
                onChange={(e) => setInternalStatus(e.target.value as InternalStatus)}
                disabled={!canEdit}
                className="w-full rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-default)] bg-[var(--ploy-background-primary)] px-3 py-2 disabled:opacity-60"
              >
                {INTERNAL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Message to organizer (optional)</span>
            <Textarea
              value={organizerMessage}
              onChange={(e) => setOrganizerMessage(e.target.value)}
              placeholder="Visible on the organizer tracker..."
              rows={3}
              disabled={!canEdit}
            />
          </label>
          <label className="block space-y-2 text-sm">
            <span className="font-medium">Internal note</span>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Internal team note..."
              rows={2}
              disabled={!canEdit}
            />
          </label>
          {canEdit && (
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Update status"}
            </Button>
          )}
        </div>

        <BookingResourceGrants bookingRequestId={request.id} />

        <div className="ploy-surface-elevated space-y-4 p-6">
          <Heading as="h2" size="card">
            Status history
          </Heading>
          {request.statusHistory.length === 0 ? (
            <p className="text-sm text-[var(--ploy-text-tertiary)]">No events yet.</p>
          ) : (
            <ul className="space-y-3">
              {[...request.statusHistory].reverse().map((event, i) => (
                <li
                  key={`${event.timestamp}-${i}`}
                  className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] p-4 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{event.newStatus}</span>
                    <span className="text-[var(--ploy-text-tertiary)]">· {event.actor}</span>
                    <span className="text-xs text-[var(--ploy-text-tertiary)]">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {event.organizerMessage && (
                    <p className="mt-2 text-[var(--ploy-text-secondary)]">{event.organizerMessage}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayoutShell>
  );
}
