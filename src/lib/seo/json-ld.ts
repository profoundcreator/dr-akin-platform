import { SITE_CONTACT } from "@/data/site-contact";
import { PERSON_IDENTITY } from "@/data/person-identity";

export type JsonLdValue = Record<string, unknown>;

export function absoluteUrl(path: string, site: URL | string): string {
  return new URL(path, site).href;
}

export function personSchema(site: URL | string): JsonLdValue {
  const url = absoluteUrl("/meet-akin/profile", site);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: SITE_CONTACT.personName,
    url,
    jobTitle: PERSON_IDENTITY.auTitle,
    description:
      "Leadership scholar, governance strategist, diplomat, and institution builder working across Governance, Enterprise, and Education.",
    knowsAbout: [
      "African governance",
      "Leadership development",
      "Enterprise development",
      "Educational leadership",
      "Institution building",
    ],
    sameAs: SITE_CONTACT.socialLinks.map((link) => link.href),
  };
}

export function websiteSchema(site: URL | string): JsonLdValue {
  const url = absoluteUrl("/", site);
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}#website`,
    name: SITE_CONTACT.organizationName,
    url,
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
  site: URL | string,
): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path, site),
    })),
  };
}

export function articleSchema(
  article: {
    title: string;
    slug: string;
    summary: string;
    publishedAt?: string | null;
    updatedAt?: string | null;
    image?: string | null;
  },
  site: URL | string,
): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    url: absoluteUrl(`/insights/${article.slug}`, site),
    datePublished: article.publishedAt || undefined,
    dateModified: article.updatedAt || article.publishedAt || undefined,
    image: article.image ? absoluteUrl(article.image, site) : undefined,
    author: { "@id": `${absoluteUrl("/meet-akin/profile", site)}#person` },
  };
}

export function eventSchema(
  event: {
    title: string;
    slug: string;
    description?: string | null;
    startsAt: string;
    endsAt: string;
    location?: string | null;
    locationType?: string;
    image?: string | null;
    registrationUrl?: string | null;
  },
  site: URL | string,
): JsonLdValue {
  const virtual = event.locationType?.toLowerCase().includes("virtual");
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || undefined,
    url: absoluteUrl(`/events/${event.slug}`, site),
    startDate: event.startsAt,
    endDate: event.endsAt,
    eventAttendanceMode: virtual
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: virtual
      ? { "@type": "VirtualLocation", url: event.registrationUrl || undefined }
      : event.location
        ? { "@type": "Place", name: event.location }
        : undefined,
    image: event.image ? absoluteUrl(event.image, site) : undefined,
    organizer: { "@id": `${absoluteUrl("/meet-akin/profile", site)}#person` },
  };
}

export function bookSchema(
  book: {
    title: string;
    slug: string;
    description: string;
    year?: string | null;
    image?: string | null;
  },
  site: URL | string,
): JsonLdValue {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description,
    url: absoluteUrl(`/library/${book.slug}`, site),
    datePublished: book.year || undefined,
    image: book.image ? absoluteUrl(book.image, site) : undefined,
    author: { "@id": `${absoluteUrl("/meet-akin/profile", site)}#person` },
  };
}
