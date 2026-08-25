"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Download,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { AdminOptionalImageField } from "@/components/admin/admin-optional-image-field";
import { AdminSetupNotice } from "@/components/admin/admin-setup-notice";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { AdminRebuildSeoButton } from "@/components/admin/admin-rebuild-seo-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-provider";
import { canApproveEvents } from "@/lib/auth/permissions";
import { uploadEventCover } from "@/lib/events/cover-upload";
import {
  EVENT_BRAND_LABELS,
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  LOCATION_TYPE_OPTIONS,
} from "@/lib/events/constants";
import { EVENT_COVER_IMAGE_HINT } from "@/lib/site-settings/constants";
import {
  clearEventHomepageFeatured,
  createEvent,
  deleteEvent,
  eventsToCsv,
  getAdminEvents,
  getEventCoverUrl,
  getPendingEvents,
  isValidEventSlug,
  logEventAudit,
  setEventHomepageFeatured,
  slugifyEventTitle,
  updateEvent,
  type EventInput,
  type PlatformEvent,
} from "@/lib/events/events";
import { triggerSiteRebuild } from "@/lib/events/trigger-rebuild";
import { publishNoticeWithRebuild } from "@/lib/events/publish-notice";
import type { EventBrand, EventStatus, EventType } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { isPhase1SchemaReady } from "@/lib/site-settings/site-settings";

const EMPTY_FORM = {
  slug: "",
  title: "",
  description: "",
  seoDescription: "",
  eventType: "hosted_by_dr_akin" as EventType,
  brand: "dr_akin" as EventBrand,
  startsAt: "",
  endsAt: "",
  timezone: "Africa/Lagos",
  location: "",
  locationType: "in_person",
  registrationUrl: "",
  registrationEmbedUrl: "",
  paymentUrl: "",
  paymentLabel: "",
  isHomepageFeatured: false,
};

function toLocalDatetimeValue(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalDatetimeValue(value: string): string {
  if (!value) return new Date().toISOString();
  return new Date(value).toISOString();
}

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function EventsDashboard() {
  const { profile } = useAdminAuth();
  const isApprover = canApproveEvents(profile);
  const [events, setEvents] = useState<PlatformEvent[]>([]);
  const [pending, setPending] = useState<PlatformEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverPath, setExistingCoverPath] = useState<string | null>(null);
  const [coverImageHidden, setCoverImageHidden] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);

  const pendingCount = pending.length;

  async function loadEvents() {
    try {
      setError(null);
      setSchemaReady(await isPhase1SchemaReady());
      const [allEvents, pendingEvents] = await Promise.all([
        getAdminEvents(),
        isApprover ? getPendingEvents() : Promise.resolve([]),
      ]);
      setEvents(allEvents);
      setPending(pendingEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, [isApprover]);

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()),
    [events],
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverPath(null);
    setCoverImageHidden(false);
  }

  function startEdit(event: PlatformEvent) {
    setEditingId(event.id);
    setForm({
      slug: event.slug,
      title: event.title,
      description: event.description ?? "",
      seoDescription: event.seoDescription ?? "",
      eventType: event.eventType,
      brand: event.brand,
      startsAt: toLocalDatetimeValue(event.startsAt),
      endsAt: toLocalDatetimeValue(event.endsAt),
      timezone: event.timezone,
      location: event.location ?? "",
      locationType: event.locationType,
      registrationUrl: event.registrationUrl ?? "",
      registrationEmbedUrl: event.registrationEmbedUrl ?? "",
      paymentUrl: event.paymentUrl ?? "",
      paymentLabel: event.paymentLabel ?? "",
      isHomepageFeatured: event.isHomepageFeatured,
    });
    setExistingCoverPath(event.coverImagePath);
    setCoverImageHidden(event.coverImageHidden);
    setCoverFile(null);
    setCoverPreview(getEventCoverUrl(event.coverImagePath));
  }

  async function buildInput(status?: EventStatus): Promise<EventInput> {
    const slug = form.slug.trim().toLowerCase() || slugifyEventTitle(form.title);

    if (!form.title.trim()) throw new Error("Event title is required.");
    if (!isValidEventSlug(slug)) {
      throw new Error("Link name must use lowercase letters, numbers, and hyphens only.");
    }
    if (!form.startsAt || !form.endsAt) throw new Error("Start and end dates are required.");

    let coverImagePath = existingCoverPath;
    if (coverFile) {
      coverImagePath = await uploadEventCover(coverFile, slug);
    }

    return {
      slug,
      title: form.title,
      description: form.description,
      seoDescription: form.seoDescription,
      eventType: form.eventType,
      brand: form.brand,
      startsAt: fromLocalDatetimeValue(form.startsAt),
      endsAt: fromLocalDatetimeValue(form.endsAt),
      timezone: form.timezone,
      location: form.location,
      locationType: form.locationType,
      coverImagePath,
      coverImageHidden,
      registrationUrl: form.registrationUrl,
      registrationEmbedUrl: form.registrationEmbedUrl,
      paymentUrl: form.paymentUrl,
      paymentLabel: form.paymentLabel,
      status,
    };
  }

  async function saveEvent(mode: "draft" | "submit" | "publish") {
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const input = await buildInput(
        mode === "publish" ? "published" : mode === "submit" ? "pending_approval" : "draft",
      );

      let saved: PlatformEvent;

      if (editingId) {
        saved = await updateEvent(editingId, {
          ...input,
          ...(mode === "publish"
            ? {
                approvedBy: profile?.id ?? null,
                approvedAt: new Date().toISOString(),
                rejectionNote: null,
              }
            : {}),
          ...(mode === "submit"
            ? {
                submittedBy: profile?.id ?? null,
                rejectionNote: null,
              }
            : {}),
        });
      } else if (mode === "publish" && isApprover) {
        saved = await createEvent(input, {
          createdBy: profile?.id,
          publishDirectly: true,
          approverId: profile?.id,
        });
      } else if (mode === "submit") {
        saved = await createEvent(input, {
          createdBy: profile?.id,
          submitForApproval: true,
        });
      } else {
        saved = await createEvent(input, { createdBy: profile?.id });
      }

      if (mode === "submit") {
        await logEventAudit("event_submitted_for_approval", saved.id, {
          title: saved.title,
          slug: saved.slug,
          submittedBy: profile?.full_name,
        });
        setNotice("Event submitted for approval. An approver will review it before it goes public.");
      }

      if (mode === "publish") {
        await logEventAudit("event_published", saved.id, {
          title: saved.title,
          slug: saved.slug,
          publishedBy: profile?.full_name,
        });

        let publishNotice: string | null = null;

        if (isApprover && form.isHomepageFeatured) {
          try {
            await setEventHomepageFeatured(saved.id);
          } catch (featuredError) {
            publishNotice =
              featuredError instanceof Error
                ? featuredError.message
                : "Homepage feature needs migration 007.";
          }
        } else if (isApprover && editingId && !form.isHomepageFeatured && saved.isHomepageFeatured) {
          try {
            await clearEventHomepageFeatured(saved.id);
          } catch (featuredError) {
            publishNotice =
              featuredError instanceof Error
                ? featuredError.message
                : "Could not clear homepage feature.";
          }
        }

        if (!publishNotice) {
          const rebuild = await triggerSiteRebuild();
          publishNotice = publishNoticeWithRebuild("Event published.", rebuild);
        }

        setNotice(publishNotice);
      }

      resetForm();
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  async function approveEvent(event: PlatformEvent) {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateEvent(event.id, {
        status: "published",
        manuallyHidden: false,
        approvedBy: profile?.id ?? null,
        approvedAt: new Date().toISOString(),
        rejectionNote: null,
      });
      await logEventAudit("event_published", saved.id, {
        title: saved.title,
        slug: saved.slug,
        publishedBy: profile?.full_name,
        approvedFromPending: true,
      });
      const rebuild = await triggerSiteRebuild();
      setNotice(publishNoticeWithRebuild("Event approved.", rebuild));
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve event");
    } finally {
      setSaving(false);
    }
  }

  async function rejectEvent(event: PlatformEvent) {
    const note = window.prompt("Optional note for the person who submitted this event:");
    setSaving(true);
    try {
      await updateEvent(event.id, {
        status: "draft",
        rejectionNote: note?.trim() || "Please revise and resubmit.",
      });
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send back event");
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden(event: PlatformEvent) {
    try {
      await updateEvent(event.id, { manuallyHidden: !event.manuallyHidden });
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  async function toggleHomepageFeatured(event: PlatformEvent) {
    if (!isApprover) return;
    setSaving(true);
    setError(null);
    try {
      if (event.isHomepageFeatured) {
        await clearEventHomepageFeatured(event.id);
      } else {
        await setEventHomepageFeatured(event.id);
      }
      setNotice(
        event.isHomepageFeatured
          ? "Event removed from homepage feature slot."
          : "Event set as homepage featured event.",
      );
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update homepage feature");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this event permanently?")) return;
    try {
      await deleteEvent(id);
      if (editingId === id) resetForm();
      await loadEvents();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete event");
    }
  }

  async function handleRebuild() {
    setRebuilding(true);
    setError(null);
    try {
      const result = await triggerSiteRebuild();
      setNotice(result.message);
      if (!result.ok) setError(result.message);
    } finally {
      setRebuilding(false);
    }
  }

  function handleCoverChange(file: File | null) {
    setCoverFile(file);
    if (file) setCoverImageHidden(false);
    setCoverPreview(file ? URL.createObjectURL(file) : getEventCoverUrl(existingCoverPath));
  }

  function handleRemoveCover() {
    setCoverFile(null);
    setExistingCoverPath(null);
    setCoverPreview(null);
    setCoverImageHidden(false);
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminLayoutShell title="Events" subtitle="Manage public events and registrations">
        <p className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-text-secondary)]">
          Connect Supabase to manage events. Public visitors will see events at{" "}
          <a href="/events" className="underline">/events</a>.
        </p>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell title="Events" subtitle="Create events, manage approvals, and export registrations">
      {!schemaReady && <AdminSetupNotice />}
      {(error || notice) && (
        <div className="mb-4 space-y-2">
          {error && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.14_145/0.12)] px-4 py-3 text-sm text-[var(--ploy-status-success)]">
              {notice}
            </p>
          )}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => downloadCsv(`events-${new Date().toISOString().slice(0, 10)}.csv`, eventsToCsv(events))}
        >
          <Download className="size-4 shrink-0" />
          Export CSV
        </Button>
        {isApprover && (
          <AdminRebuildSeoButton rebuilding={rebuilding} onClick={handleRebuild} />
        )}
        <a
          href="/events"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
        >
          View public page
          <ArrowUpRight className="size-4" />
        </a>
      </div>

      {isApprover && pendingCount > 0 && (
        <div className="ploy-surface-elevated mb-8 space-y-4 p-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-[var(--ploy-accent-primary)]" />
            <h2 className="text-lg font-semibold">Awaiting approval ({pendingCount})</h2>
          </div>
          <ul className="space-y-3">
            {pending.map((event) => (
              <li
                key={event.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
              >
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    /events/{event.slug} · {EVENT_TYPE_LABELS[event.eventType]}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="primary" onClick={() => approveEvent(event)} disabled={saving}>
                    <Check className="size-4" />
                    Approve & publish
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(event)}>
                    Review
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => rejectEvent(event)} disabled={saving}>
                    <X className="size-4" />
                    Send back
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form
          className="ploy-surface-elevated space-y-5 p-6"
          onSubmit={(event) => {
            event.preventDefault();
            saveEvent(isApprover ? "publish" : "submit");
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-[var(--ploy-accent-primary)]" />
              <h2 className="text-lg font-semibold">{editingId ? "Edit event" : "Add event"}</h2>
            </div>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-title" required>
              Event title
            </Label>
            <Input
              id="event-title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.slug || slugifyEventTitle(e.target.value),
                }))
              }
              placeholder="Agora Leadership Summit 2026"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-slug" required>
              Link name
            </Label>
            <Input
              id="event-slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
              placeholder="agora2026"
            />
            <p className="text-xs text-[var(--ploy-text-tertiary)]">Public URL: /events/{form.slug || "your-link"}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-type">Event type</Label>
              <select
                id="event-type"
                value={form.eventType}
                onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value as EventType }))}
                className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              >
                {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-brand">Brand</Label>
              <select
                id="event-brand"
                value={form.brand}
                onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value as EventBrand }))}
                className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              >
                {Object.entries(EVENT_BRAND_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-starts" required>
                Starts
              </Label>
              <Input
                id="event-starts"
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm((prev) => ({ ...prev, startsAt: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-ends" required>
                Ends
              </Label>
              <Input
                id="event-ends"
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((prev) => ({ ...prev, endsAt: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-timezone">Timezone</Label>
              <Input
                id="event-timezone"
                value={form.timezone}
                onChange={(e) => setForm((prev) => ({ ...prev, timezone: e.target.value }))}
                placeholder="Africa/Lagos"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-location-type">Format</Label>
              <select
                id="event-location-type"
                value={form.locationType}
                onChange={(e) => setForm((prev) => ({ ...prev, locationType: e.target.value }))}
                className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              >
                {LOCATION_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-location">Location</Label>
            <Input
              id="event-location"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Lagos, Nigeria or Zoom link label"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-description">Description</Label>
            <textarea
              id="event-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              placeholder="What attendees should know"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-seo">SEO description</Label>
            <textarea
              id="event-seo"
              value={form.seoDescription}
              onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
              rows={2}
              className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              placeholder="Short summary for Google and social sharing (optional)"
            />
          </div>

          <AdminOptionalImageField
            id="event-cover"
            label="Cover image"
            hint={EVENT_COVER_IMAGE_HINT}
            previewUrl={coverPreview}
            uploadLabel="Upload image"
            imageHidden={coverImageHidden}
            onFileSelect={handleCoverChange}
            onRemove={handleRemoveCover}
            onToggleHidden={coverPreview ? () => setCoverImageHidden((value) => !value) : undefined}
          />

          {isApprover && (
            <label className="flex items-start gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4">
              <input
                type="checkbox"
                checked={form.isHomepageFeatured}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, isHomepageFeatured: e.target.checked }))
                }
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">Feature on homepage</span>
                <span className="mt-1 block text-xs text-[var(--ploy-text-tertiary)]">
                  Shows this event in the homepage Events section. Only one event can be featured
                  at a time. Requires the Events section to be enabled in Homepage admin.
                </span>
              </span>
            </label>
          )}

          <div className="space-y-2">
            <Label htmlFor="event-registration">Registration link</Label>
            <Input
              id="event-registration"
              value={form.registrationUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, registrationUrl: e.target.value }))}
              placeholder="https://eventbrite.com/... or https://lu.ma/..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-embed">Registration embed URL</Label>
            <Input
              id="event-embed"
              value={form.registrationEmbedUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, registrationEmbedUrl: e.target.value }))}
              placeholder="Optional Eventbrite/Luma embed URL"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-payment">Payment link</Label>
              <Input
                id="event-payment"
                value={form.paymentUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentUrl: e.target.value }))}
                placeholder="Optional Paystack or Flutterwave URL"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-payment-label">Payment button label</Label>
              <Input
                id="event-payment-label"
                value={form.paymentLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, paymentLabel: e.target.value }))}
                placeholder="Pay now"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => saveEvent("draft")}>
              Save draft
            </Button>
            {isApprover ? (
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Publish changes" : "Publish event"}
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Submitting…" : "Submit for approval"}
              </Button>
            )}
          </div>
        </form>

        <div className="ploy-surface-elevated space-y-6 p-6">
          <h2 className="text-lg font-semibold">All events</h2>
          {loading ? (
            <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading events…</p>
          ) : sortedEvents.length === 0 ? (
            <p className="text-sm text-[var(--ploy-text-secondary)]">No events yet.</p>
          ) : (
            <ul className="space-y-4">
              {sortedEvents.map((event) => (
                <li
                  key={event.id}
                  className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        /events/{event.slug} · {EVENT_STATUS_LABELS[event.status]}
                        {event.manuallyHidden ? " · Hidden" : ""}
                        {event.isHomepageFeatured ? " · Homepage featured" : ""}
                      </p>
                      <p className="text-sm text-[var(--ploy-text-secondary)]">
                        {EVENT_TYPE_LABELS[event.eventType]} · {EVENT_BRAND_LABELS[event.brand]}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(event)}>
                        Edit
                      </Button>
                      {isApprover && event.status === "published" && !event.manuallyHidden && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleHomepageFeatured(event)}
                          disabled={saving}
                        >
                          {event.isHomepageFeatured ? "Unfeature on homepage" : "Feature on homepage"}
                        </Button>
                      )}
                      {isApprover && event.status === "published" && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => toggleHidden(event)}>
                          {event.manuallyHidden ? "Show" : "Hide"}
                        </Button>
                      )}
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayoutShell>
  );
}
