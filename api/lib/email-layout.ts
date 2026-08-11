/** Email-safe hex approximations of site design tokens (see src/styles/globals.css). */
export const EMAIL_THEME = {
  canvas: "#F7F4F0",
  surface: "#FFFFFF",
  surfaceMuted: "#FAF8F5",
  textPrimary: "#2E2C2A",
  textSecondary: "#6F6C68",
  textTertiary: "#8A8681",
  accent: "#C45A2E",
  accentMuted: "#F3E4DA",
  border: "#E4DDD5",
  borderStrong: "#CFC6BC",
  button: "#2E2C2A",
  buttonText: "#FFFFFF",
  link: "#7A3E1E",
} as const;

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export interface BrandedEmailOptions {
  siteUrl: string;
  preheader: string;
  eyebrow?: string;
  title: string;
  introHtml?: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerNote?: string;
}

export function renderBrandedEmail(options: BrandedEmailOptions): string {
  const logoUrl = `${options.siteUrl.replace(/\/$/, "")}/brand/akin-logo-mono.png`;
  const preheader = escapeHtml(options.preheader);
  const eyebrow = options.eyebrow ? escapeHtml(options.eyebrow) : "";
  const title = escapeHtml(options.title);
  const footerNote = options.footerNote
    ? escapeHtml(options.footerNote)
    : "Dr. Akin Akinpelu — Leadership, Governance & Enterprise";

  const ctaBlock = options.cta
    ? `<tr>
        <td style="padding:8px 32px 28px;">
          <a href="${escapeHtml(options.cta.href)}" style="display:inline-block;background:${EMAIL_THEME.button};color:${EMAIL_THEME.buttonText};font-family:Inter,Arial,sans-serif;font-size:15px;font-weight:600;line-height:1;text-decoration:none;padding:14px 22px;border-radius:8px;">
            ${escapeHtml(options.cta.label)}
          </a>
        </td>
      </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_THEME.canvas};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${EMAIL_THEME.canvas};border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border-collapse:collapse;background:${EMAIL_THEME.surface};border:1px solid ${EMAIL_THEME.border};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid ${EMAIL_THEME.border};background:${EMAIL_THEME.surfaceMuted};">
              <img src="${escapeHtml(logoUrl)}" alt="Akin Akinpelu" width="168" height="40" style="display:block;height:40px;width:auto;max-width:168px;border:0;" />
              ${eyebrow ? `<p style="margin:18px 0 0;font-family:Inter,Arial,sans-serif;font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:${EMAIL_THEME.accent};font-weight:600;">${eyebrow}</p>` : ""}
              <h1 style="margin:${eyebrow ? "10px" : "18px"} 0 0;font-family:Inter,Arial,sans-serif;font-size:28px;line-height:1.2;font-weight:700;color:${EMAIL_THEME.textPrimary};">${title}</h1>
            </td>
          </tr>
          ${
            options.introHtml
              ? `<tr><td style="padding:24px 32px 0;font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.65;color:${EMAIL_THEME.textSecondary};">${options.introHtml}</td></tr>`
              : ""
          }
          <tr>
            <td style="padding:24px 32px 8px;font-family:Inter,Arial,sans-serif;font-size:16px;line-height:1.65;color:${EMAIL_THEME.textPrimary};">
              ${options.bodyHtml}
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td style="padding:8px 32px 28px;font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.6;color:${EMAIL_THEME.textTertiary};border-top:1px solid ${EMAIL_THEME.border};">
              <p style="margin:20px 0 8px;">${footerNote}</p>
              <p style="margin:0;"><a href="${escapeHtml(options.siteUrl)}" style="color:${EMAIL_THEME.link};text-decoration:underline;">${escapeHtml(options.siteUrl.replace(/^https?:\/\//, ""))}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderDetailTable(rows: Array<{ label: string; value: string | null | undefined }>): string {
  const visible = rows.filter((row) => (row.value ?? "").trim());
  if (visible.length === 0) return "";

  const items = visible
    .map(
      (row) => `<tr>
        <td style="padding:10px 0;width:34%;vertical-align:top;font-family:Inter,Arial,sans-serif;font-size:13px;line-height:1.5;font-weight:600;color:${EMAIL_THEME.textSecondary};">${escapeHtml(row.label)}</td>
        <td style="padding:10px 0;vertical-align:top;font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.55;color:${EMAIL_THEME.textPrimary};">${escapeHtml((row.value ?? "").trim())}</td>
      </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-top:1px solid ${EMAIL_THEME.border};margin-top:8px;">
    ${items}
  </table>`;
}

export function renderMessageBlock(message: string): string {
  const trimmed = message.trim() || "(empty)";
  return `<div style="margin-top:18px;padding:18px 20px;background:${EMAIL_THEME.surfaceMuted};border:1px solid ${EMAIL_THEME.border};border-radius:12px;">
    <p style="margin:0 0 8px;font-family:Inter,Arial,sans-serif;font-size:12px;line-height:1.4;letter-spacing:0.06em;text-transform:uppercase;color:${EMAIL_THEME.textSecondary};font-weight:600;">Message</p>
    <p style="margin:0;font-family:Inter,Arial,sans-serif;font-size:15px;line-height:1.7;color:${EMAIL_THEME.textPrimary};white-space:pre-wrap;">${escapeHtml(trimmed)}</p>
  </div>`;
}

export function renderReferenceBadge(reference: string): string {
  return `<p style="margin:0 0 16px;display:inline-block;padding:10px 14px;background:${EMAIL_THEME.accentMuted};border:1px solid ${EMAIL_THEME.borderStrong};border-radius:999px;font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1;font-weight:700;color:${EMAIL_THEME.link};letter-spacing:0.04em;">${escapeHtml(reference)}</p>`;
}
