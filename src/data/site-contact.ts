import { PERSON_IDENTITY } from "@/data/person-identity";

export type ApprovedSocialLink = {
  label: string;
  href: string;
};

export const SITE_CONTACT = {
  personName: PERSON_IDENTITY.publicName,
  organizationName: "Akin Akinpelu",
  phone: "+234 805 033 8853",
  email: "hello@theakinakinpelu.org",
  contactPath: "/contact",
  privacyPath: "/privacy",
  bookingPath: "/book-dr-akin",
  responseTime: "We aim to respond within 3–5 business days.",
  socialLinks: [] as ApprovedSocialLink[],
} as const;

// Social accounts intentionally remain empty until the client approves canonical URLs.
export const APPROVED_SOCIAL_LINKS: readonly ApprovedSocialLink[] = SITE_CONTACT.socialLinks;
