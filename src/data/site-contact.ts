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
  socialLinks: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/akinakinpelu/" },
    { label: "Twitter", href: "https://x.com/iamakinakinpelu" },
    { label: "Instagram", href: "https://www.instagram.com/iamakinakinpelu/" },
    { label: "TikTok", href: "https://www.tiktok.com/@theakinakinpelu" },
  ] satisfies ApprovedSocialLink[],
} as const;

export const APPROVED_SOCIAL_LINKS: readonly ApprovedSocialLink[] = SITE_CONTACT.socialLinks;
