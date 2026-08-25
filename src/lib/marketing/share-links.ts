export interface ShareLinkInput {
  title: string;
  summary?: string;
  url: string;
}

export interface ShareLinkOption {
  id: string;
  label: string;
  href: string;
}

function encode(value: string): string {
  return encodeURIComponent(value);
}

/** Build platform share URLs for a public page. */
export function buildShareLinks({ title, summary, url }: ShareLinkInput): ShareLinkOption[] {
  const text = summary ? `${title} — ${summary}` : title;
  const emailBody = summary ? `${summary}\n\n${url}` : url;

  return [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encode(url)}`,
    },
    {
      id: "x",
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${encode(url)}&text=${encode(title)}`,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: `https://wa.me/?text=${encode(`${text} ${url}`)}`,
    },
    {
      id: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encode(url)}`,
    },
    {
      id: "email",
      label: "Email",
      href: `mailto:?subject=${encode(title)}&body=${encode(emailBody)}`,
    },
  ];
}
