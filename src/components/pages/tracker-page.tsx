"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Calendar,
  Download,
  FileText,
  LockKeyhole,
  Mail,
  MapPin,
  MessageSquare,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { STATUS_DESCRIPTIONS } from "@/lib/booking/constants";
import { getBookingByReference, getStoredAccessToken, isSupabaseConfigured } from "@/lib/booking/api";
import { formatEventLocation } from "@/lib/booking/format-rules";
import { seedDemoRequests } from "@/lib/booking/storage";
import type { BookingRequest } from "@/lib/booking/types";
import { cn } from "@/lib/utils";
import { getBookingLookupStrategy } from "@/lib/booking/tracker-access";
import {
  getOrganizerGrantedResources,
  requestOrganizerResourceDownload,
} from "@/lib/organizer-resources/api";
import type { OrganizerGrantedResource } from "@/lib/organizer-resources/types";

interface TrackerPageProps {
  reference: string;
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "Confirmed" || status === "Completed"
      ? "success"
      : status === "Declined" || status === "Cancelled"
        ? "error"
        : status === "Information Required"
          ? "warning"
          : "default";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium",
        tone === "success" && "bg-[oklch(0.55_0.14_145/0.12)] text-[var(--ploy-status-success)]",
        tone === "error" && "bg-[oklch(0.55_0.2_25/0.12)] text-[var(--ploy-status-error)]",
        tone === "warning" && "bg-[oklch(0.72_0.14_75/0.15)] text-[var(--ploy-status-warning)]",
        tone === "default" && "bg-[var(--ploy-interactive-secondary)] text-[var(--ploy-text-primary)]",
      )}
    >
      {status}
    </span>
  );
}

export function TrackerPage({ reference: initialRef }: TrackerPageProps) {
  const [reference, setReference] = useState(initialRef);
  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [secureLinkRequired, setSecureLinkRequired] = useState(false);
  const [approvedMaterials, setApprovedMaterials] = useState<OrganizerGrantedResource[]>([]);
  const [materialsError, setMaterialsError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const fromPath = window.location.pathname.match(/\/booking\/([^/]+)/)?.[1];
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get("token");
      const resolved = fromPath ?? initialRef;
      setReference(resolved);

      if (!isSupabaseConfigured) {
        seedDemoRequests();
      }

      const token = tokenFromUrl ?? getStoredAccessToken(resolved);
      const lookupStrategy = getBookingLookupStrategy(isSupabaseConfigured, Boolean(token));
      setSecureLinkRequired(lookupStrategy === "unavailable");

      try {
        const found = await getBookingByReference(resolved, token);
        setRequest(found);
        if (found && token && isSupabaseConfigured) {
          try {
            setApprovedMaterials(await getOrganizerGrantedResources(resolved, token));
          } catch (resourceError) {
            setApprovedMaterials([]);
            setMaterialsError(
              resourceError instanceof Error
                ? resourceError.message
                : "Approved materials could not be loaded.",
            );
          }
        }
      } catch {
        setRequest(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [initialRef]);

  if (loading) {
    return (
      <PageShell>
        <div className="ploy-container py-24 text-center text-[var(--ploy-text-secondary)]">
          Loading booking status...
        </div>
      </PageShell>
    );
  }

  if (!request) {
    return (
      <PageShell>
        <div className="ploy-container py-24">
          <div className="mx-auto max-w-lg space-y-4 text-center">
            {secureLinkRequired ? (
              <>
                <LockKeyhole className="mx-auto size-12 text-[var(--ploy-status-warning)]" />
                <Heading as="h1" size="card">
                  Secure link required
                </Heading>
                <p className="text-sm text-[var(--ploy-text-secondary)]">
                  Open the booking tracker from the secure link in your confirmation email, or use
                  the same browser where you submitted reference{" "}
                  <strong>{reference}</strong>.
                </p>
                <p className="text-sm text-[var(--ploy-text-tertiary)]">
                  For privacy, booking details are not shown without your personal access token.
                </p>
              </>
            ) : (
              <>
                <AlertCircle className="mx-auto size-12 text-[var(--ploy-status-warning)]" />
                <Heading as="h1" size="card">
                  Booking not found
                </Heading>
                <p className="text-sm text-[var(--ploy-text-secondary)]">
                  We could not find a booking with reference{" "}
                  <strong>{reference}</strong>. Please check the reference number in your
                  confirmation email or submit a new request.
                </p>
              </>
            )}
            <a
              href="/book-dr-akin"
              className="inline-block text-sm font-medium text-[var(--ploy-text-link)] hover:underline"
            >
              Submit a new booking request
            </a>
          </div>
        </div>
      </PageShell>
    );
  }

  const latestEvent = request.statusHistory[request.statusHistory.length - 1];

  async function downloadMaterial(resource: OrganizerGrantedResource) {
    setDownloadingId(resource.resourceId);
    setMaterialsError(null);
    try {
      const signedUrl = await requestOrganizerResourceDownload(reference, resource.resourceId);
      window.location.assign(signedUrl);
    } catch (downloadError) {
      setMaterialsError(
        downloadError instanceof Error ? downloadError.message : "The secure download failed.",
      );
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <PageShell>
      <section className="ploy-section">
        <div className="ploy-container">
          <div className="mx-auto max-w-4xl space-y-10">
            <Reveal className="space-y-4">
              <p className="ploy-kicker">Booking Status</p>
              <div className="flex flex-wrap items-center gap-4">
                <Heading as="h1" size="section">
                  {request.form.eventTitle}
                </Heading>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-sm text-[var(--ploy-text-tertiary)]">
                Reference: <strong className="text-[var(--ploy-text-primary)]">{request.reference}</strong>
                {" · "}
                Last updated{" "}
                {new Date(request.updatedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="leading-relaxed text-[var(--ploy-text-secondary)]">
                {STATUS_DESCRIPTIONS[request.status] ??
                  "Your request is being processed by our team."}
              </p>
              {latestEvent?.organizerMessage && (
                <div className="rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-secondary)] p-4">
                  <p className="text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                    <MessageSquare className="mr-2 inline size-4 align-text-bottom" />
                    {latestEvent.organizerMessage}
                  </p>
                </div>
              )}
            </Reveal>

            <Reveal delay={0.05}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="ploy-surface-elevated space-y-4 p-6">
                  <Heading as="h2" size="label">
                    Event summary
                  </Heading>
                  <dl className="space-y-3 text-sm">
                    <div className="flex gap-3">
                      <Calendar className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
                      <div>
                        <dt className="text-[var(--ploy-text-tertiary)]">Preferred date</dt>
                        <dd className="font-medium">{request.form.preferredDate || "—"}</dd>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <MapPin className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
                      <div>
                        <dt className="text-[var(--ploy-text-tertiary)]">Location</dt>
                        <dd className="font-medium">{formatEventLocation(request.form)}</dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-[var(--ploy-text-tertiary)]">Engagement</dt>
                      <dd className="font-medium">
                        {request.form.engagementType} · {request.form.format}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[var(--ploy-text-tertiary)]">Audience</dt>
                      <dd className="font-medium">{request.form.audienceSize}</dd>
                    </div>
                  </dl>
                </div>

                <div className="ploy-surface-elevated space-y-4 p-6">
                  <Heading as="h2" size="label">
                    Organizer contact
                  </Heading>
                  <dl className="space-y-3 text-sm">
                    <div>
                      <dt className="text-[var(--ploy-text-tertiary)]">Name</dt>
                      <dd className="font-medium">{request.form.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[var(--ploy-text-tertiary)]">Organization</dt>
                      <dd className="font-medium">{request.form.organization}</dd>
                    </div>
                    <div className="flex gap-3">
                      <Mail className="size-4 shrink-0 text-[var(--ploy-text-tertiary)]" />
                      <div>
                        <dt className="text-[var(--ploy-text-tertiary)]">Email</dt>
                        <dd className="font-medium">{request.form.email}</dd>
                      </div>
                    </div>
                  </dl>
                </div>
              </div>
            </Reveal>

            {request.status === "Information Required" && (
              <Reveal delay={0.1}>
                <div className="rounded-[var(--ploy-radius-lg)] border border-[oklch(0.72_0.14_75/0.4)] bg-[oklch(0.72_0.14_75/0.08)] p-6">
                  <Heading as="h2" size="label">
                    Outstanding actions
                  </Heading>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--ploy-text-secondary)]">
                    <li>• Provide updated event agenda or program outline</li>
                    <li>• Confirm final venue address and on-site contact</li>
                    <li>• Upload formal invitation letter if not yet submitted</li>
                  </ul>
                </div>
              </Reveal>
            )}

            <Reveal delay={0.12}>
              <div className="ploy-surface-elevated space-y-4 p-6">
                <div>
                  <Heading as="h2" size="label">
                    Approved Materials
                  </Heading>
                  <p className="mt-2 text-sm text-[var(--ploy-text-secondary)]">
                    Materials approved for this engagement are protected by your booking link.
                    Downloads use a short-lived private link; do not share it.
                  </p>
                </div>
                {materialsError && (
                  <p className="rounded-[var(--ploy-radius-md)] bg-[oklch(0.55_0.2_25/0.08)] px-4 py-3 text-sm text-[var(--ploy-status-error)]">
                    {materialsError}
                  </p>
                )}
                {approvedMaterials.length === 0 ? (
                  <div className="flex gap-3 text-sm text-[var(--ploy-text-tertiary)]">
                    <LockKeyhole className="mt-0.5 size-4 shrink-0" />
                    <p>No approved materials have been released for this booking yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {approvedMaterials.map((resource) => (
                      <li
                        key={resource.grantId}
                        className="flex flex-wrap items-center gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] px-4 py-3 text-sm"
                      >
                        <FileText className="size-4 text-[var(--ploy-text-accent)]" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{resource.title}</p>
                          <p className="text-xs text-[var(--ploy-text-tertiary)]">
                            {resource.category} · version {resource.version}
                            {resource.expiresAt
                              ? ` · available until ${new Date(resource.expiresAt).toLocaleString()}`
                              : ""}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => downloadMaterial(resource)}
                          disabled={downloadingId === resource.resourceId}
                          className="inline-flex items-center gap-2 rounded-[var(--ploy-radius-button)] border border-[var(--ploy-border-primary)] px-4 py-2 font-medium disabled:opacity-50"
                        >
                          <Download className="size-4" />
                          {downloadingId === resource.resourceId ? "Preparing..." : "Download"}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="ploy-surface-elevated space-y-4 p-6">
                <Heading as="h2" size="label">
                  Documents
                </Heading>
                {request.documents.length === 0 ? (
                  <p className="text-sm text-[var(--ploy-text-tertiary)]">
                    {request.status === "Information Required"
                      ? "Email requested documents to the Executive Assistant team — they will attach files to your booking. Online upload is coming soon."
                      : "No documents uploaded yet."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {request.documents.map((doc) => (
                      <li
                        key={doc.id}
                        className="flex items-center gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-subtle)] px-4 py-3 text-sm"
                      >
                        <FileText className="size-4 text-[var(--ploy-text-accent)]" />
                        <span className="font-medium">{doc.name}</span>
                        <span className="ml-auto text-xs text-[var(--ploy-text-tertiary)]">
                          {doc.category}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="rounded-[var(--ploy-radius-lg)] border border-[var(--ploy-border-subtle)] bg-[var(--ploy-background-secondary)] p-6">
                <Heading as="h2" size="label">
                  Team communication
                </Heading>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ploy-text-secondary)]">
                  Our Executive Assistant team will contact you at{" "}
                  <strong>{request.form.email}</strong> for any updates. Replies
                  to team emails are logged against your booking reference. Please
                  do not share this tracking link publicly.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
