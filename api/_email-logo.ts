/** Email wordmark paths (public/brand/) — keep in sync with src/lib/brand/assets.ts */
const EMAIL_WORDMARK_LIGHT = "/brand/akin-wordmark-email-light.png";
const EMAIL_WORDMARK_DARK = "/brand/akin-wordmark-email-dark.png";

/** Rendered logo width in HTML email (height auto, max 44px). */
const EMAIL_LOGO_DISPLAY_WIDTH = 200;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderEmailLogoBlock(siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, "");
  const homeUrl = escapeHtml(base);
  const lightSrc = escapeHtml(`${base}${EMAIL_WORDMARK_LIGHT}`);
  const darkSrc = escapeHtml(`${base}${EMAIL_WORDMARK_DARK}`);
  const alt = escapeHtml("Akin Akinpelu");

  return `<a href="${homeUrl}" style="text-decoration:none;display:inline-block;line-height:0;" target="_blank" rel="noopener noreferrer">
              <img class="email-logo-light" src="${lightSrc}" alt="${alt}" width="${EMAIL_LOGO_DISPLAY_WIDTH}" height="44" style="display:block;height:44px;width:auto;max-width:${EMAIL_LOGO_DISPLAY_WIDTH}px;border:0;outline:none;" />
              <img class="email-logo-dark" src="${darkSrc}" alt="${alt}" width="${EMAIL_LOGO_DISPLAY_WIDTH}" height="44" style="display:none;height:44px;width:auto;max-width:${EMAIL_LOGO_DISPLAY_WIDTH}px;border:0;outline:none;" />
            </a>
            <style type="text/css">
              @media (prefers-color-scheme: dark) {
                .email-logo-light { display: none !important; max-height: 0 !important; overflow: hidden !important; }
                .email-logo-dark { display: block !important; }
              }
            </style>`;
}
