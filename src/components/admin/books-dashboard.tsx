"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Download,
  ImagePlus,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { AdminSetupNotice } from "@/components/admin/admin-setup-notice";
import { AdminHelpTip } from "@/components/admin/admin-help-tip";
import { AdminLayoutShell } from "@/components/admin/admin-layout-shell";
import { Button } from "@/components/ui/button";
import { ImageUploadHint } from "@/components/ui/image-upload-hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/context/admin-auth-provider";
import {
  canApproveBooks,
  canPermanentlyDeleteBooks,
} from "@/lib/auth/permissions";
import { uploadBookCover } from "@/lib/library/cover-upload";
import {
  BOOK_CATEGORIES,
  BOOK_COVER_IMAGE_HINT,
  LIBRARY_BOOK_STATUS_LABELS,
} from "@/lib/library/constants";
import {
  booksToCsv,
  clearBookFeatured,
  createBook,
  deleteBookPermanently,
  getAdminBooks,
  getBookCoverUrl,
  getPendingBooks,
  isPhase2SchemaReady,
  isValidBookSlug,
  logBookAudit,
  setBookFeatured,
  slugifyBookTitle,
  updateBook,
} from "@/lib/library/books";
import type { BookInput, PlatformBook } from "@/lib/library/types";
import type { LiveSiteBook } from "@/lib/library/public-books";
import {
  getBooksLiveOnSite,
  getFeaturedBookLiveOnSite,
} from "@/lib/library/public-books";
import type { PurchaseLink } from "@/lib/library/purchase-links";
import { triggerSiteRebuild } from "@/lib/events/trigger-rebuild";
import { BOOKS_ADMIN_COPY } from "@/lib/admin/plain-language-copy";
import type { LibraryBookStatus } from "@/lib/supabase/database.types";
import { isSupabaseConfigured } from "@/lib/supabase/client";

const EMPTY_FORM = {
  slug: "",
  title: "",
  subtitle: "",
  year: "",
  category: BOOK_CATEGORIES[0],
  description: "",
  purchaseLinks: [{ label: "", url: "" }] as PurchaseLink[],
  isFeatured: false,
  sortOrder: 0,
};

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function cleanPurchaseLinks(links: PurchaseLink[]): PurchaseLink[] {
  return links
    .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
    .filter((link) => link.label && link.url);
}

export function BooksDashboard() {
  const { profile } = useAdminAuth();
  const isApprover = canApproveBooks(profile);
  const canDelete = canPermanentlyDeleteBooks(profile);
  const [books, setBooks] = useState<PlatformBook[]>([]);
  const [liveBooks, setLiveBooks] = useState<LiveSiteBook[]>([]);
  const [featuredLiveBook, setFeaturedLiveBook] = useState<LiveSiteBook | null>(null);
  const [pending, setPending] = useState<PlatformBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [existingCoverPath, setExistingCoverPath] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [rebuilding, setRebuilding] = useState(false);
  const [schemaReady, setSchemaReady] = useState(true);

  async function loadBooks() {
    try {
      setError(null);
      setSchemaReady(await isPhase2SchemaReady());
      const [allBooks, pendingBooks, liveOnSite, featuredLive] = await Promise.all([
        getAdminBooks(),
        isApprover ? getPendingBooks() : Promise.resolve([]),
        getBooksLiveOnSite(),
        getFeaturedBookLiveOnSite(),
      ]);
      setBooks(allBooks);
      setPending(pendingBooks);
      setLiveBooks(liveOnSite);
      setFeaturedLiveBook(featuredLive);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load books");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, [isApprover]);

  const sortedBooks = useMemo(
    () => [...books].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
    [books],
  );

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setCoverFile(null);
    setCoverPreview(null);
    setExistingCoverPath(null);
  }

  function startEdit(book: PlatformBook) {
    setEditingId(book.id);
    setForm({
      slug: book.slug,
      title: book.title,
      subtitle: book.subtitle ?? "",
      year: book.year ?? "",
      category: book.category,
      description: book.description,
      purchaseLinks:
        book.purchaseLinks.length > 0
          ? book.purchaseLinks
          : [{ label: "", url: "" }],
      isFeatured: book.isFeatured,
      sortOrder: book.sortOrder,
    });
    setExistingCoverPath(book.coverImagePath);
    setCoverFile(null);
    setCoverPreview(getBookCoverUrl(book.coverImagePath) ?? book.coverUrl);
  }

  function startFromLiveBook(book: LiveSiteBook) {
    const cmsBook = books.find((item) => item.slug === book.slug);
    if (cmsBook) {
      startEdit(cmsBook);
      return;
    }

    resetForm();
    setForm({
      slug: book.slug,
      title: book.title,
      subtitle: book.subtitle ?? "",
      year: book.year ?? "",
      category: book.category,
      description: book.description,
      purchaseLinks:
        book.purchaseLinks.length > 0
          ? book.purchaseLinks
          : [{ label: "", url: "" }],
      isFeatured: book.isFeatured,
      sortOrder: book.sortOrder,
    });
    setExistingCoverPath(book.coverImagePath);
    setCoverPreview(book.coverUrl);
  }

  async function buildInput(status?: LibraryBookStatus): Promise<BookInput> {
    const slug = form.slug.trim().toLowerCase() || slugifyBookTitle(form.title);

    if (!form.title.trim()) throw new Error("Book title is required.");
    if (!form.description.trim()) throw new Error("Description is required.");
    if (!isValidBookSlug(slug)) {
      throw new Error("Link name must use lowercase letters, numbers, and hyphens only.");
    }

    let coverImagePath = existingCoverPath;
    if (coverFile) {
      coverImagePath = await uploadBookCover(coverFile, slug);
    }

    return {
      slug,
      title: form.title,
      subtitle: form.subtitle,
      year: form.year,
      category: form.category,
      description: form.description,
      coverImagePath,
      purchaseLinks: cleanPurchaseLinks(form.purchaseLinks),
      sortOrder: form.sortOrder,
      status,
    };
  }

  async function saveBook(mode: "draft" | "submit" | "publish") {
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const input = await buildInput(
        mode === "publish" ? "published" : mode === "submit" ? "pending_approval" : "draft",
      );

      let saved: PlatformBook;

      if (editingId) {
        saved = await updateBook(editingId, {
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
        saved = await createBook(input, {
          createdBy: profile?.id,
          publishDirectly: true,
          approverId: profile?.id,
        });
      } else if (mode === "submit") {
        saved = await createBook(input, {
          createdBy: profile?.id,
          submitForApproval: true,
        });
      } else {
        saved = await createBook(input, { createdBy: profile?.id });
      }

      if (mode === "submit") {
        await logBookAudit("book_submitted_for_approval", saved.id, {
          title: saved.title,
          slug: saved.slug,
          submittedBy: profile?.full_name,
        });
        setNotice("Book submitted for approval. An approver will review it before it goes public.");
      }

      if (mode === "publish") {
        await logBookAudit("book_published", saved.id, {
          title: saved.title,
          slug: saved.slug,
          publishedBy: profile?.full_name,
        });

        let publishNotice: string | null = null;

        if (isApprover && form.isFeatured) {
          try {
            await setBookFeatured(saved.id);
          } catch (featuredError) {
            publishNotice =
              featuredError instanceof Error
                ? featuredError.message
                : "Could not set featured book.";
          }
        } else if (isApprover && editingId && !form.isFeatured && saved.isFeatured) {
          try {
            await clearBookFeatured(saved.id);
          } catch (featuredError) {
            publishNotice =
              featuredError instanceof Error
                ? featuredError.message
                : "Could not clear featured book.";
          }
        }

        if (!publishNotice) {
          const rebuild = await triggerSiteRebuild();
          publishNotice = rebuild.ok
            ? rebuild.message
            : `Book published. ${rebuild.message}`;
        }

        setNotice(publishNotice);
      }

      resetForm();
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save book");
    } finally {
      setSaving(false);
    }
  }

  async function approveBook(book: PlatformBook) {
    setSaving(true);
    setError(null);
    try {
      const saved = await updateBook(book.id, {
        status: "published",
        manuallyHidden: false,
        approvedBy: profile?.id ?? null,
        approvedAt: new Date().toISOString(),
        rejectionNote: null,
      });
      await logBookAudit("book_published", saved.id, {
        title: saved.title,
        slug: saved.slug,
        publishedBy: profile?.full_name,
        approvedFromPending: true,
      });
      const rebuild = await triggerSiteRebuild();
      setNotice(rebuild.ok ? rebuild.message : `Book approved. ${rebuild.message}`);
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve book");
    } finally {
      setSaving(false);
    }
  }

  async function rejectBook(book: PlatformBook) {
    const note = window.prompt("Optional note for the person who submitted this book:");
    setSaving(true);
    try {
      await updateBook(book.id, {
        status: "draft",
        rejectionNote: note?.trim() || "Please revise and resubmit.",
      });
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send back book");
    } finally {
      setSaving(false);
    }
  }

  async function toggleHidden(book: PlatformBook) {
    try {
      await updateBook(book.id, { manuallyHidden: !book.manuallyHidden });
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    }
  }

  async function toggleFeatured(book: PlatformBook) {
    if (!isApprover) return;
    setSaving(true);
    setError(null);
    try {
      if (book.isFeatured) {
        await clearBookFeatured(book.id);
      } else {
        await setBookFeatured(book.id);
      }
      setNotice(
        book.isFeatured
          ? "Book removed from featured slot."
          : "Book set as featured title on the library.",
      );
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update featured book");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!canDelete) return;
    if (!window.confirm("Delete this book permanently? This cannot be undone.")) return;
    try {
      await deleteBookPermanently(id);
      if (editingId === id) resetForm();
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete book");
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
    setCoverPreview(file ? URL.createObjectURL(file) : getBookCoverUrl(existingCoverPath));
  }

  function updatePurchaseLink(index: number, field: keyof PurchaseLink, value: string) {
    setForm((prev) => ({
      ...prev,
      purchaseLinks: prev.purchaseLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link,
      ),
    }));
  }

  if (!isSupabaseConfigured) {
    return (
      <AdminLayoutShell title="Books" subtitle="Manage the public library">
        <p className="ploy-surface-elevated p-6 text-sm text-[var(--ploy-text-secondary)]">
          {BOOKS_ADMIN_COPY.notConnected}{" "}
          <a href="/resources" className="underline">/resources</a>.
        </p>
      </AdminLayoutShell>
    );
  }

  return (
    <AdminLayoutShell title="Books" subtitle="Create books, manage approvals, and export the catalog">
      {!schemaReady && <AdminSetupNotice variant="books" />}
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
          onClick={() =>
            downloadCsv(`books-${new Date().toISOString().slice(0, 10)}.csv`, booksToCsv(books))
          }
        >
          <Download className="size-4" />
          Export CSV
        </Button>
        {isApprover && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRebuild} disabled={rebuilding}>
            <RefreshCw className="size-4" />
            {rebuilding ? "Rebuilding…" : "Rebuild site for SEO"}
          </Button>
        )}
        <a
          href="/resources"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
        >
          View public library
          <ArrowUpRight className="size-4" />
        </a>
      </div>

      <div className="ploy-surface-elevated mb-8 space-y-5 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-[var(--ploy-accent-primary)]" />
              <h2 className="text-lg font-semibold">
                {BOOKS_ADMIN_COPY.liveSectionTitle} ({liveBooks.length})
              </h2>
              <AdminHelpTip text={BOOKS_ADMIN_COPY.liveSectionHelp} />
            </div>
            <p className="mt-1 text-sm text-[var(--ploy-text-secondary)]">
              These titles are what visitors see on{" "}
              <a href="/resources" target="_blank" rel="noopener noreferrer" className="underline">
                /resources
              </a>{" "}
              and the homepage featured section.
            </p>
          </div>
          {liveBooks[0]?.source === "static" && (
            <p className="max-w-sm rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)] px-4 py-3 text-xs text-[var(--ploy-text-secondary)]">
              {BOOKS_ADMIN_COPY.preloadedNotice}
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading public catalog…</p>
        ) : liveBooks.length === 0 ? (
          <p className="text-sm text-[var(--ploy-text-secondary)]">No books are live on the site yet.</p>
        ) : (
          <>
            {featuredLiveBook && (
              <div className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-accent-primary)]/30 bg-[oklch(0.68_0.145_29/0.06)] p-4 md:p-5">
                <div className="flex flex-wrap items-start gap-4">
                  <img
                    src={featuredLiveBook.coverUrl}
                    alt=""
                    className="h-28 w-20 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ploy-accent-primary)]">
                      <Star className="size-3.5 fill-current" />
                      Featured book
                    </p>
                    <p className="text-lg font-semibold">{featuredLiveBook.title}</p>
                    {featuredLiveBook.subtitle && (
                      <p className="text-sm text-[var(--ploy-text-secondary)]">
                        {featuredLiveBook.subtitle}
                      </p>
                    )}
                    <p className="text-xs text-[var(--ploy-text-tertiary)]">
                      /library/{featuredLiveBook.slug}
                      {featuredLiveBook.source === "static"
                        ? ` · ${BOOKS_ADMIN_COPY.preloadedLabel}`
                        : " · You manage this"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => startFromLiveBook(featuredLiveBook)}
                    >
                      {featuredLiveBook.cmsId ? BOOKS_ADMIN_COPY.edit : BOOKS_ADMIN_COPY.startManaging}
                    </Button>
                    {!featuredLiveBook.cmsId && (
                      <AdminHelpTip text={BOOKS_ADMIN_COPY.startManagingHelp} />
                    )}
                  </div>
                </div>
              </div>
            )}

            <ul className="grid gap-3 sm:grid-cols-2">
              {liveBooks.map((book) => (
                <li
                  key={book.slug}
                  className="flex items-start gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
                >
                  <img
                    src={book.coverUrl}
                    alt=""
                    className="h-20 w-14 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{book.title}</p>
                      {book.isFeatured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[oklch(0.68_0.145_29/0.12)] px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-[var(--ploy-accent-primary)]">
                          <Star className="size-3 fill-current" />
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--ploy-text-tertiary)]">
                      {book.category} · /library/{book.slug}
                    </p>
                    <p className="text-xs text-[var(--ploy-text-tertiary)]">
                      {book.source === "static"
                        ? BOOKS_ADMIN_COPY.preloadedLabel
                        : BOOKS_ADMIN_COPY.managedLabel}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0"
                      onClick={() => startFromLiveBook(book)}
                    >
                      {book.cmsId ? BOOKS_ADMIN_COPY.edit : BOOKS_ADMIN_COPY.startManaging}
                    </Button>
                    {!book.cmsId && <AdminHelpTip text={BOOKS_ADMIN_COPY.startManagingHelp} />}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {isApprover && pending.length > 0 && (
        <div className="ploy-surface-elevated mb-8 space-y-4 p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="size-4 text-[var(--ploy-accent-primary)]" />
            <h2 className="text-lg font-semibold">Awaiting approval ({pending.length})</h2>
          </div>
          <ul className="space-y-3">
            {pending.map((book) => (
              <li
                key={book.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
              >
                <div>
                  <p className="font-medium">{book.title}</p>
                  <p className="text-xs text-[var(--ploy-text-tertiary)]">
                    /library/{book.slug} · {book.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="primary" onClick={() => approveBook(book)} disabled={saving}>
                    <Check className="size-4" />
                    Approve & publish
                  </Button>
                  <Button type="button" size="sm" variant="secondary" onClick={() => startEdit(book)}>
                    Review
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => rejectBook(book)} disabled={saving}>
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
            saveBook(isApprover ? "publish" : "submit");
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Plus className="size-4 text-[var(--ploy-accent-primary)]" />
              <h2 className="text-lg font-semibold">{editingId ? "Edit book" : "Add book"}</h2>
            </div>
            {editingId && (
              <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
                Cancel edit
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-title" required>
              Title
            </Label>
            <Input
              id="book-title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                  slug: prev.slug || slugifyBookTitle(e.target.value),
                }))
              }
              placeholder="The Leadership Blueprint"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-slug" required>
              Link name
            </Label>
            <Input
              id="book-slug"
              value={form.slug}
              onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase() }))}
              placeholder="leadership-blueprint"
            />
            <p className="text-xs text-[var(--ploy-text-tertiary)]">
              Public URL: /library/{form.slug || "your-link"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-subtitle">Subtitle</Label>
            <Input
              id="book-subtitle"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Optional subtitle"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="book-year">Year</Label>
              <Input
                id="book-year"
                value={form.year}
                onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                placeholder="2024"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-category" required>
                Category
              </Label>
              <select
                id="book-category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              >
                {BOOK_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-description" required>
              Description
            </Label>
            <textarea
              id="book-description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full rounded-[var(--ploy-radius-input)] border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-primary)] px-3 py-2 text-sm"
              placeholder="What readers should know about this book"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-cover">Cover image</Label>
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--ploy-radius-button)] border border-[var(--ploy-border-primary)] px-4 py-2 text-sm font-medium">
                <ImagePlus className="size-4" />
                Upload cover
                <input
                  id="book-cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => handleCoverChange(e.target.files?.[0] ?? null)}
                />
              </label>
              {coverPreview && (
                <img src={coverPreview} alt="" className="h-20 w-14 rounded-md object-cover" />
              )}
            </div>
            <ImageUploadHint hint={BOOK_COVER_IMAGE_HINT} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Label>Purchase links</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    purchaseLinks: [...prev.purchaseLinks, { label: "", url: "" }],
                  }))
                }
              >
                Add link
              </Button>
            </div>
            {form.purchaseLinks.map((link, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <Input
                  value={link.label}
                  onChange={(e) => updatePurchaseLink(index, "label", e.target.value)}
                  placeholder="Paperback"
                />
                <Input
                  value={link.url}
                  onChange={(e) => updatePurchaseLink(index, "url", e.target.value)}
                  placeholder="https://..."
                />
                {form.purchaseLinks.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        purchaseLinks: prev.purchaseLinks.filter((_, i) => i !== index),
                      }))
                    }
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-sort">Sort order</Label>
            <Input
              id="book-sort"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 0 }))
              }
            />
            <p className="text-xs text-[var(--ploy-text-tertiary)]">Lower numbers appear first in the catalog.</p>
          </div>

          {isApprover && (
            <label className="flex items-start gap-3 rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">Feature in library</span>
                <span className="mt-1 block text-xs text-[var(--ploy-text-tertiary)]">
                  Shows as the featured title on the homepage and resources page. Only one book can
                  be featured at a time.
                </span>
              </span>
            </label>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => saveBook("draft")}>
              Save draft
            </Button>
            {isApprover ? (
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Saving…" : editingId ? "Publish changes" : "Publish book"}
              </Button>
            ) : (
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Submitting…" : "Submit for approval"}
              </Button>
            )}
          </div>
        </form>

        <div className="ploy-surface-elevated space-y-6 p-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{BOOKS_ADMIN_COPY.managedSectionTitle}</h2>
              <AdminHelpTip text={BOOKS_ADMIN_COPY.managedSectionHelp} />
            </div>
          </div>
          {loading ? (
            <p className="text-sm text-[var(--ploy-text-tertiary)]">Loading books…</p>
          ) : sortedBooks.length === 0 ? (
            <p className="text-sm text-[var(--ploy-text-secondary)]">{BOOKS_ADMIN_COPY.noManagedYet}</p>
          ) : (
            <ul className="space-y-4">
              {sortedBooks.map((book) => (
                <li
                  key={book.id}
                  className="rounded-[var(--ploy-radius-md)] border border-[var(--ploy-border-primary)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium">{book.title}</p>
                      <p className="text-xs text-[var(--ploy-text-tertiary)]">
                        /library/{book.slug} · {LIBRARY_BOOK_STATUS_LABELS[book.status]}
                        {book.manuallyHidden ? " · Hidden" : ""}
                        {book.isFeatured ? " · Featured" : ""}
                      </p>
                      <p className="text-sm text-[var(--ploy-text-secondary)]">{book.category}</p>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2">
                      <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(book)}>
                        Edit
                      </Button>
                      {isApprover && book.status === "published" && !book.manuallyHidden && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFeatured(book)}
                          disabled={saving}
                        >
                          {book.isFeatured ? "Unfeature" : "Set featured"}
                        </Button>
                      )}
                      {isApprover && book.status === "published" && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => toggleHidden(book)}>
                          {book.manuallyHidden ? "Show" : "Hide"}
                        </Button>
                      )}
                      {canDelete && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(book.id)}>
                          <Trash2 className="size-4" />
                          Delete
                        </Button>
                      )}
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
