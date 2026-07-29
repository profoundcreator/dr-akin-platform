Dr Akin Akinpelu Site Architecture and Source Backup
Repository snapshot prepared from the current site source.
1. Complete Tech Stack & Configuration
Runtime and framework
Framework: Astro ^6.1.8
Rendering mode: Astro server output (output: "server"), with public marketing routes individually prerendered
UI runtime: React ^19.2.3 and React DOM ^19.2.3
React integration: @astrojs/react ^5.0.3
Deployment adapter: @astrojs/cloudflare ^13.1.10
Content: Astro MDX ^5.0.4, Astro Content Collections, SSR catch-all article route
Language: TypeScript in Astro strict mode
Module system: ES modules
Path alias: @/* → ./src/*
Build tool: Astro/Vite
Dev port: 3000
Trailing slash policy: never
Styling and design utilities
CSS utility framework: Tailwind CSS v4 ^4.1.18
Tailwind integration: @tailwindcss/vite ^4.1.18
Tailwind configuration model: CSS-first configuration in src/styles/globals.css; there is no tailwind.config.js
Typography plugin: @tailwindcss/typography ^0.5.19
Animation utilities: tw-animate-css ^1.4.0
Class composition: clsx ^2.1.1, tailwind-merge ^3.4.0, class-variance-authority ^0.7.1
Motion: motion ^12.35.2
Icons, controls, and interaction packages
Icons: lucide-react ^0.563.0
Primitive UI: @base-ui/react ^1.1.0, radix-ui ^1.4.3, @radix-ui/react-slot ^1.2.4, vaul ^1.1.2
Carousel/slider: embla-carousel-react ^8.6.0, swiper ^12.0.3
Forms and validation: react-hook-form ^7.71.1, @hookform/resolvers ^5.2.2, zod ^4.3.6
State: zustand ^5.0.10
Dates: date-fns ^4.1.0
Fonts actually loaded
@fontsource-variable/inter ^5.2.8 is imported globally by Layout.astro.
Hosted Inter WOFF2 files are declared at weights 400, 500, 600, and 700.
Hosted Fraunces WOFF2 files are declared at weights 400, 500, 600, and 700.
Current active CSS role mapping: heading, body, mono, eyebrow, and button all resolve to "Inter Variable".
Fraunces is loaded in the stylesheet but is not the current active --font-heading value.
Active Tailwind v4 design tokens
:root,
.light {
  --radius: 0.75rem;
  --radius-button: 0.5rem;
  --radius-card: 0.75rem;
  --radius-input: 0.5rem;
  --border-width: 1px;
  --border-style: solid;

  --ploy-neutral-primary: oklch(0.982 0.008 80);
  --ploy-neutral-secondary: oklch(0.949 0.009 78);
  --ploy-neutral-inverse: oklch(0.37 0.008 74);
  --ploy-neutral-light: oklch(1 0 0);
  --ploy-neutral-dark: oklch(0.223 0.065 274.76);

  --ploy-accent-primary: oklch(0.68 0.145 29);
  --ploy-accent-secondary: oklch(0.82 0.07 67);
  --ploy-accent-tertiary: oklch(0.949 0.009 78);

  --ploy-text-primary: oklch(0.21 0.005 70);
  --ploy-text-secondary: oklch(0.52 0.01 72);
  --ploy-text-inverse: var(--ploy-neutral-primary);
  --ploy-text-on-accent-primary: oklch(0.982 0.008 80);
  --ploy-text-on-accent-secondary: oklch(0.223 0.065 274.76);
  --ploy-text-on-accent-tertiary: oklch(0.223 0.065 274.76);

  --ploy-button-primary-background: oklch(0.21 0.005 70);
  --ploy-button-primary-text: oklch(0.982 0.008 80);
  --ploy-button-primary-border: oklch(0.21 0.005 70);
  --ploy-button-secondary-background: var(--ploy-background-primary);
  --ploy-button-secondary-text: oklch(0.239 0.012 264.31);
  --ploy-button-secondary-border: oklch(0 0 0);

  --ploy-background-primary: var(--ploy-neutral-primary-s1);
  --ploy-background-secondary: var(--ploy-neutral-secondary);
  --ploy-background-accent-primary: var(--ploy-neutral-inverse);
  --ploy-background-accent-secondary: var(--ploy-accent-secondary);
  --ploy-background-accent-tertiary: var(--ploy-accent-tertiary);
  --ploy-background-inverse: var(--ploy-neutral-inverse-s1);
  --ploy-border-primary: var(--ploy-neutral-primary-s5);

  --font-heading: "Inter Variable", system-ui, -apple-system, sans-serif;
  --font-body: "Inter Variable", system-ui, -apple-system, sans-serif;
  --font-mono: "Inter Variable", ui-monospace, monospace;
  --font-eyebrow: "Inter Variable", system-ui, -apple-system, sans-serif;
  --font-button: "Inter Variable", system-ui, -apple-system, sans-serif;

  --font-heading-weight: 620;
  --font-heading-letter-spacing: -0.035em;
  --font-heading-line-height: 1.02;
  --font-body-weight: 430;
  --font-body-bold-weight: 600;
  --font-body-letter-spacing: normal;
  --font-body-line-height: 1.63;
  --font-button-weight: 600;
  --font-button-letter-spacing: normal;
  --font-button-line-height: 1.43;
}
Typography scale exposed to Tailwind utilities
--text-xs: 0.75rem;
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
--text-xl: 1.25rem;
--text-2xl: 1.5rem;
--text-3xl: 1.875rem;
--text-4xl: 2.25rem;
--text-5xl: 3rem;
--text-6xl: 3.75rem;
--text-7xl: 4.5rem;
--text-8xl: 6rem;
--text-9xl: 8rem;
Layout spacing and width conventions used by the live components
Tailwind’s standard spacing scale is used. The architecture adds these explicit layout values directly in utility classes:
Global header height: h-20 (5rem)
Global wide canvas: max-w-[1600px]
Main content canvas: max-w-[1450px]
Article canvas: max-w-3xl
Desktop horizontal gutters: lg:px-14, xl:px-20
Tablet gutters: md:px-10
Mobile gutters: px-6
Primary section rhythm: py-20 md:py-28
Hero height: min-h-[calc(100svh-5rem)]
Hero media minimum: min-h-[34rem]
Ecosystem media minimum: min-h-[36rem]
Desktop hero columns: lg:grid-cols-[1.08fr_0.92fr]
Section intro columns: lg:grid-cols-[0.72fr_1.28fr]
Ecosystem columns: lg:grid-cols-[0.92fr_1.08fr]
Footer columns: lg:grid-cols-[1.25fr_repeat(3,0.75fr)]
Desktop dropdown width: w-[22rem]
Card/media radii: rounded-lg / rounded-xl, based on 0.5rem and 0.75rem tokens
package.json
{
  "name": "ploy-web",
  "type": "module",
  "version": "0.0.1",
  "scripts": {
    "dev": "astro dev --port 3000",
    "dev:ploy": "astro dev --port 3000 --config ploy.astro.config.mjs",
    "dev:wrangler": "wrangler dev",
    "check": "astro check",
    "format": "prettier --write .",
    "lint": "eslint .",
    "build": "astro build",
    "verify": "node scripts/verify.mjs",
    "preview": "wrangler dev --local",
    "cf-types": "wrangler types",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.8",
    "@astrojs/cloudflare": "^13.1.10",
    "@astrojs/mdx": "^5.0.4",
    "@astrojs/react": "^5.0.3",
    "@astrojs/sitemap": "^3.7.2",
    "@base-ui/react": "^1.1.0",
    "@fontsource-variable/inter": "^5.2.8",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-slot": "^1.2.4",
    "@tailwindcss/typography": "^0.5.19",
    "@tailwindcss/vite": "^4.1.18",
    "@types/react": "^19.2.8",
    "@types/react-dom": "^19.2.3",
    "astro": "^6.1.8",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "embla-carousel-react": "^8.6.0",
    "github-slugger": "^2.0.0",
    "lucide-react": "^0.563.0",
    "motion": "^12.35.2",
    "radix-ui": "^1.4.3",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-hook-form": "^7.71.1",
    "swiper": "^12.0.3",
    "tailwind-merge": "^3.4.0",
    "tailwindcss": "^4.1.18",
    "tw-animate-css": "^1.4.0",
    "vaul": "^1.1.2",
    "zod": "^4.3.6",
    "zustand": "^5.0.10"
  },
  "devDependencies": {
    "@eslint/js": "^9",
    "@types/bun": "^1.3.6",
    "@types/node": "^25.0.9",
    "eslint": "^9",
    "eslint-plugin-astro": "^1.7.0",
    "eslint-plugin-jsx-a11y": "^6.10.2",
    "eslint-plugin-react-hooks": "^7.0.1",
    "globals": "^17.5.0",
    "prettier": "^3.8.2",
    "prettier-plugin-astro": "^0.14.1",
    "schema-dts": "^2.0.0",
    "typescript-eslint": "^8.58.2",
    "wrangler": "^4.84.1"
  }
}
astro.config.mjs
// @ts-check
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, sessionDrivers } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { sitemapWithCustomPages } from "./src/lib/sitemap/sitemap-with-custom-pages-plugin.ts";

const wranglerConfig = ["./wrangler.toml", "./wrangler.jsonc", "./wrangler.json"].find(
  (path) => existsSync(fileURLToPath(new URL(path, import.meta.url))),
);

const astroCommand = process.argv.slice(2).find((arg) => !arg.startsWith("-"));
const viteCacheDir =
  astroCommand === "dev" || astroCommand === "preview"
    ? "node_modules/.vite-dev"
    : "node_modules/.vite-build";

export default defineConfig({
  site: "https://example.com",
  output: "server",
  trailingSlash: "never",
  session: {
    driver: sessionDrivers.lruCache(),
  },
  build: {
    assets: "_ploy_static/_astro",
  },
  adapter: cloudflare({
    imageService: "compile",
    ...(wranglerConfig && { configPath: wranglerConfig }),
  }),
  integrations: [
    mdx(),
    react(),
    ...sitemapWithCustomPages(),
  ],
  vite: {
    cacheDir: viteCacheDir,
    plugins: [tailwindcss()],
    resolve: {
      alias: import.meta.env.PROD
        ? { "react-dom/server": "react-dom/server.edge" }
        : undefined,
    },
    ssr: {
      noExternal: ["xxhash-wasm"],
      ...(import.meta.env.PROD && {
        resolve: {
          conditions: ["workerd", "worker", "node"],
          externalConditions: ["workerd", "worker", "node"],
        },
      }),
    },
    server: {
      strictPort: true,
    },
  },
  server: {
    port: 3000,
    open: false,
  },
  devToolbar: {
    enabled: false,
  },
});
tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
2. Sitemap & Menu Architecture
Complete route map
/
├── /work
│   ├── /work/aald
│   ├── /work/erudio-hub
│   ├── /work/performx
│   └── /work/tc-resource-technology
├── /meet-akin
│   ├── /meet-akin/profile
│   ├── /meet-akin/au-ambassador
│   ├── /meet-akin/edu-governance
│   └── /meet-akin/speaking
├── /resources
├── /insights
├── /[...slug]              # SSR Astro Content Collection article route
├── /404                    # SSR 404 handler
├── /robots.txt
└── /llms.txt
No files currently exist under src/content/pages, so the dynamic /[...slug] route does not currently add content-derived URLs to the sitemap.
Global desktop/mobile header hierarchy
- Brand: Dr. Akin Akinpelu Ph.D → `/`
- Work → `/work`
  - Work overview → `/work`
  - Corporate Transformation — AALD → `/work/aald`
  - Educational Reform — Erudio Hub → `/work/erudio-hub`
  - Execution Think Tank — PERFORMX → `/work/performx`
  - Tech Alliances — TC Resource Tech → `/work/tc-resource-technology`
- Meet Dr. Akin → `/meet-akin`
  - Meet overview — Leadership across four spheres → `/meet-akin`
  - Profile — Biography & credentials → `/meet-akin/profile`
  - Continental Mandate — AU Agenda 2063 → `/meet-akin/au-ambassador`
  - Board Governance — Boards & advisory → `/meet-akin/edu-governance`
  - Keynote Speaking — Stages & engagements → `/meet-akin/speaking`
- Resources → `/resources`
  - Library overview — Nine published titles → `/resources`
  - Insights & Writing — Articles, essays & papers → `/insights`
  - Marketplace Ministry — Faith & influence → `/resources#marketplace-ministry`
  - High Performance — Process & execution → `/resources#high-performance`
  - Academic Excellence — Students & educators → `/resources#academic`
  - Audio Archives — Keynotes & conversations → `/resources#audio`
- Primary CTA: Inquire → `/meet-akin/speaking`
Global footer hierarchy
- Brand: Dr. Akin Akinpelu Ph.D → `/`
- Work
  - Corporate Transformation → `/work/aald`
  - Educational Reform → `/work/erudio-hub`
  - Execution Think Tank → `/work/performx`
  - Tech Alliances → `/work/tc-resource-technology`
- Meet Dr. Akin
  - Profile → `/meet-akin/profile`
  - AU Ambassador → `/meet-akin/au-ambassador`
  - Board Governance → `/meet-akin/edu-governance`
  - Keynote Speaking → `/meet-akin/speaking`
- Resources
  - Insights & Writing → `/insights`
  - The Library → `/resources`
  - Marketplace Ministry → `/resources#marketplace-ministry`
  - Audio Archives → `/resources#audio`
- Footer CTA: Inquire for advisory → `/meet-akin/speaking`
3. Raw Layout Code — Section by Section
Global Astro document shell — src/layouts/Layout.astro
---
import "@fontsource-variable/inter";
import "../styles/globals.css";
import { STARTER_VERSION } from "../starter-version";
import { SEO } from "@/components/seo";
import { SITE_CONFIG } from "@/site-config";
import type { SeoJsonSchema } from "@/components/seo-json";

interface Props {
  title?: string;
  description?: string;
  canonical?: string | URL;
  image?: string | URL;
  imageAlt?: string;
  noindex?: boolean;
  type?: "website" | "article";
  siteName?: string;
  jsonLd?: SeoJsonSchema | SeoJsonSchema[];
}

const {
  title = SITE_CONFIG.name,
  description = SITE_CONFIG.description,
  canonical,
  image,
  imageAlt,
  noindex = false,
  type = "website",
  siteName = SITE_CONFIG.name,
  jsonLd,
} = Astro.props;

const site = Astro.site;
const resolveUrl = (value?: string | URL) => {
  if (!value) return undefined;
  if (value instanceof URL) return value.toString();
  if (site) return new URL(value, site).toString();
  return value;
};
const canonicalUrl = resolveUrl(canonical) ?? (site ? new URL(Astro.url.pathname, site).toString() : undefined);
const imageUrl = resolveUrl(image);
---

<!doctype html>
<html lang="en" class="light" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="generator" content={Astro.generator} />
    <meta name="ploy-astro-starter-version" content={STARTER_VERSION} />
    <SEO
      title={title}
      description={description}
      canonicalUrl={canonicalUrl}
      imageUrl={imageUrl}
      imageAlt={imageAlt}
      noindex={noindex}
      type={type}
      siteName={siteName}
      jsonLd={jsonLd}
    />
    <slot name="head" />
  </head>
  <body class="relative m-0 overflow-x-hidden bg-ploy-background-primary font-body font-normal leading-[1.6] text-ploy-text-primary antialiased">
    <slot />
  </body>
</html>
Shared React page shell — src/components/layout/page-shell.tsx
import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";
import SiteHeader from "./site-header";
import Footer from "./footer";
import { cn } from "@/lib/utils";

export default function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <MotionConfig reducedMotion="user">
      <div className={cn("inner-page min-h-screen bg-ploy-background-primary text-ploy-text-primary", className)}>
        <SiteHeader />
        <main>{children}</main>
        <Footer />
      </div>
    </MotionConfig>
  );
}
Global navigation — src/components/layout/site-header.tsx
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_GROUPS = [
  {
    label: "Work",
    href: "/work",
    items: [
      ["Work overview", "/work", "The four operating arms"],
      ["Corporate Transformation", "/work/aald", "AALD"],
      ["Educational Reform", "/work/erudio-hub", "Erudio Hub"],
      ["Execution Think Tank", "/work/performx", "PERFORMX"],
      ["Tech Alliances", "/work/tc-resource-technology", "TC Resource Tech"],
    ],
  },
  {
    label: "Meet Dr. Akin",
    href: "/meet-akin",
    items: [
      ["Meet overview", "/meet-akin", "Leadership across four spheres"],
      ["Profile", "/meet-akin/profile", "Biography & credentials"],
      ["Continental Mandate", "/meet-akin/au-ambassador", "AU Agenda 2063"],
      ["Board Governance", "/meet-akin/edu-governance", "Boards & advisory"],
      ["Keynote Speaking", "/meet-akin/speaking", "Stages & engagements"],
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    items: [
      ["Library overview", "/resources", "Nine published titles"],
      ["Insights & Writing", "/insights", "Articles, essays & papers"],
      ["Marketplace Ministry", "/resources#marketplace-ministry", "Faith & influence"],
      ["High Performance", "/resources#high-performance", "Process & execution"],
      ["Academic Excellence", "/resources#academic", "Students & educators"],
      ["Audio Archives", "/resources#audio", "Keynotes & conversations"],
    ],
  },
] as const;

export default function SiteHeader() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>("Work");
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <header ref={headerRef} className="site-header sticky top-0 z-50 border-b border-ploy-border-primary bg-ploy-background-primary/95 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 md:px-10 lg:px-14 xl:px-20">
        <a href="/" className="site-header__brand text-lg font-semibold tracking-[-0.035em]">
          Dr. Akin Akinpelu <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ploy-accent-primary">Ph.D</span>
        </a>

        <nav className="hidden items-stretch gap-1 lg:flex" aria-label="Primary navigation">
          {NAV_GROUPS.map((group) => {
            const isOpen = openMenu === group.label;
            return (
              <div
                key={group.label}
                className="site-header__group relative flex items-stretch"
                onMouseEnter={() => setOpenMenu(group.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-lg px-4 text-sm font-medium text-ploy-text-secondary transition-colors hover:bg-ploy-background-secondary hover:text-ploy-text-primary"
                  aria-haspopup="menu"
                  aria-expanded={isOpen}
                  onClick={() => setOpenMenu(isOpen ? null : group.label)}
                  onFocus={() => setOpenMenu(group.label)}
                >
                  {group.label}
                  <ChevronDown className={`size-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>

                <div
                  role="menu"
                  aria-label={group.label}
                  className={`absolute left-1/2 top-[calc(100%-0.15rem)] w-[22rem] -translate-x-1/2 rounded-xl border border-ploy-border-primary bg-ploy-background-primary p-2 transition-all duration-200 ${isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}
                >
                  {group.items.map(([label, href, description]) => (
                    <a
                      key={href}
                      href={href}
                      role="menuitem"
                      onClick={() => setOpenMenu(null)}
                      className="group block rounded-lg px-4 py-3 transition-colors hover:bg-ploy-background-secondary focus:bg-ploy-background-secondary focus:outline-none"
                    >
                      <span className="block text-sm font-semibold text-ploy-text-primary">{label}</span>
                      <span className="mt-0.5 block text-xs text-ploy-text-secondary">{description}</span>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <Button asChild size="compact" showArrow><a href="/meet-akin/speaking">Inquire</a></Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((current) => !current)}
          className="grid size-10 place-items-center rounded-lg border border-ploy-border-primary lg:hidden"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <nav className="max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-ploy-border-primary bg-ploy-background-primary px-6 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto max-w-[1600px]">
            {NAV_GROUPS.map((group) => {
              const expanded = mobileGroup === group.label;
              return (
                <div key={group.label} className="border-b border-ploy-border-primary">
                  <button
                    type="button"
                    onClick={() => setMobileGroup(expanded ? null : group.label)}
                    className="flex w-full items-center justify-between py-4 text-left text-lg font-semibold"
                    aria-expanded={expanded}
                  >
                    {group.label}
                    <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} aria-hidden="true" />
                  </button>
                  {expanded ? (
                    <div className="pb-4">
                      {group.items.map(([label, href, description]) => (
                        <a key={href} href={href} onClick={() => setMobileOpen(false)} className="block rounded-lg px-3 py-3 hover:bg-ploy-background-secondary">
                          <span className="block text-sm font-semibold">{label}</span>
                          <span className="mt-0.5 block text-xs text-ploy-text-secondary">{description}</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <Button asChild showArrow className="mt-6 w-full"><a href="/meet-akin/speaking">Inquire</a></Button>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
Homepage composition — src/components/pages/home.tsx
import PageShell from "../layout/page-shell";
import HeroSection from "../sections/hero-section";
import CorporateTransformationSection from "../sections/corporate-transformation-section";
import AaldSection from "../sections/aald-section";
import LibraryFeaturedSection from "../sections/library-featured-section";

export default function Page() {
  return (
    <PageShell className="home">
      <HeroSection />
      <CorporateTransformationSection />
      <AaldSection />
      <LibraryFeaturedSection />
    </PageShell>
  );
}
Hero — src/components/sections/hero-section.tsx
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

const PORTRAIT_URL =
  "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/75ad6227-slurp-3ed01cc3-akin-akinpelu-burgundy-suit-portrait.webp";

export default function HeroSection() {
  return (
    <section className="hero border-b border-ploy-border-primary bg-ploy-background-primary">
      <div className="hero__grid mx-auto grid min-h-[calc(100svh-5rem)] max-w-[1600px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="hero__copy flex flex-col justify-between px-6 py-14 md:px-10 md:py-20 lg:px-14 lg:py-24 xl:px-20">
          <Reveal className="max-w-4xl">
            <p className="hero__eyebrow mb-8 max-w-2xl font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ploy-text-secondary">
              Forbes Thought Leader · Professor of Educational Leadership · AU Agenda 2063 Ambassador
            </p>
            <Heading as="h1" size="display" className="hero__title">
              Building leaders and institutions
              <span className="block text-ploy-text-secondary">that outlast the moment.</span>
            </Heading>
            <p className="hero__description mt-8 max-w-2xl text-lg leading-relaxed text-ploy-text-secondary md:text-xl">
              Dr. Akin Akinpelu works across corporate strategy, academic reform, public policy, and marketplace ministry—helping leaders turn ideas into institutions that endure.
            </p>
            <div className="hero__actions mt-10 flex flex-wrap gap-3">
              <Button asChild showArrow>
                <a href="/work">Explore the ecosystem</a>
              </Button>
              <Button asChild variant="secondary">
                <a href="/meet-akin">Meet Dr. Akin</a>
              </Button>
            </div>
          </Reveal>

          <div className="hero__marker mt-16 flex items-center gap-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ploy-text-secondary">
            <span className="h-px w-16 bg-ploy-border-primary" />
            Leadership · Systems · Legacy
          </div>
        </div>

        <div className="hero__media relative min-h-[34rem] overflow-x-hidden border-t border-ploy-border-primary bg-ploy-background-secondary lg:min-h-0 lg:border-l lg:border-t-0">
          <img
            src={PORTRAIT_URL}
            alt="Dr. Akin Akinpelu seated in a burgundy suit"
            loading="eager"
            className="hero__portrait absolute inset-0 h-full w-full object-cover object-top"
          />
          <div className="hero__quote absolute inset-x-5 bottom-5 rounded-xl bg-ploy-background-primary/95 p-5 backdrop-blur-sm md:inset-x-8 md:bottom-8 md:p-7">
            <p className="max-w-lg text-xl font-medium leading-snug tracking-[-0.02em] text-ploy-text-primary md:text-2xl">
              “Change doesn’t wait for permission; it responds to bold leadership.”
            </p>
          </div>
          <div className="absolute right-0 top-0 h-24 w-3 bg-ploy-accent-primary" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
Insights/features grid — src/components/sections/corporate-transformation-section.tsx
import { ArrowUpRight } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";

const DEFAULT_INSIGHTS = [
  {
    href: "/insights/leadership-systems-that-hold",
    category: "Corporate transformation",
    title: "Leadership Systems That Hold Under Pressure",
    description:
      "Why leadership training fades—and how to embed capability into the structure of an organisation so change compounds.",
  },
  {
    href: "https://www.forbes.com/sites/forbescoachescouncil/",
    category: "High performance",
    title: "Strategy Is Cheap. Execution Is the Moat.",
    description:
      "The operating discipline that separates ambitious strategy from durable competitive advantage.",
  },
  {
    href: "https://businessday.ng/",
    category: "Education reform",
    title: "Reforming How a Continent Teaches and Governs",
    description:
      "Why lasting educational change depends on governance, capability, and incentives—not curriculum alone.",
  },
];

export default function CorporateTransformationSection({ items = DEFAULT_INSIGHTS }: { items?: typeof DEFAULT_INSIGHTS }) {
  return (
    <section className="insights border-b border-ploy-border-primary bg-ploy-background-primary px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-[1450px]">
        <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ploy-text-secondary">Insights & writing</p>
          </div>
          <div>
            <Heading>Ideas become durable when they are built into systems.</Heading>
            <div className="mt-7 flex items-end justify-between gap-8">
              <p className="max-w-2xl text-lg leading-relaxed text-ploy-text-secondary">
                Essays and field notes on leadership, execution, education reform, and the institutions that shape public life.
              </p>
              <a href="/insights" className="hidden shrink-0 text-sm font-semibold underline decoration-ploy-border-primary underline-offset-4 hover:decoration-ploy-text-primary md:block">
                View all writing
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal stagger className="mt-14 grid border-l border-t border-ploy-border-primary md:grid-cols-3">
          {items.map((item) => (
            <RevealItem key={item.title}>
              <a
                href={item.href}
                className="insights__card group flex min-h-[25rem] flex-col justify-between border-b border-r border-ploy-border-primary p-7 transition-colors duration-300 hover:bg-ploy-background-secondary md:p-9"
              >
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ploy-text-secondary">{item.category}</p>
                  <Heading as="h3" size="card" className="mt-10">{item.title}</Heading>
                </div>
                <div>
                  <p className="leading-relaxed text-ploy-text-secondary">{item.description}</p>
                  <ArrowUpRight className="mt-8 size-5 transition-colors group-hover:text-ploy-accent-primary" aria-hidden="true" />
                </div>
              </a>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
Interactive ecosystem body section — src/components/sections/aald-section.tsx
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";

const SYSTEM_VISUAL_URL =
  "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/3a077906-ai-generated-1784225940885.webp";

const DEFAULT_ARMS = [
  {
    title: "Corporate Transformation",
    label: "AALD",
    href: "/work/aald",
    description:
      "Leadership systems and institutional capability designed to hold under pressure and compound over time.",
  },
  {
    title: "Educational Reform",
    label: "Erudio Hub",
    href: "/work/erudio-hub",
    description:
      "Systemic reform of how nations teach, govern schools, and develop the next generation of African educators.",
  },
  {
    title: "Execution Think Tank",
    label: "PERFORMX",
    href: "/work/performx",
    description:
      "A high-performance practice turning strategy into disciplined execution for leaders and operating teams.",
  },
  {
    title: "Tech Alliances",
    label: "TC Resource Tech",
    href: "/work/tc-resource-technology",
    description:
      "Technology partnerships and infrastructure extending the reach of every other arm of the ecosystem.",
  },
];

export default function AaldSection({ items = DEFAULT_ARMS }: { items?: typeof DEFAULT_ARMS }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex] ?? items[0];

  return (
    <section className="ecosystem border-b border-ploy-border-primary bg-ploy-background-secondary px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-[1450px]">
        <Reveal className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ploy-text-secondary">The ecosystem</p>
          <Heading>A connected system for building leaders, institutions, and public impact.</Heading>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="ecosystem__list border-t border-ploy-border-primary">
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={item.title}
                  type="button"
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                  className="ecosystem__item grid w-full grid-cols-[1fr_auto] gap-5 border-b border-ploy-border-primary py-6 text-left"
                >
                  <span>
                    <span className={`block text-xl font-semibold tracking-[-0.025em] transition-colors md:text-2xl ${isActive ? "text-ploy-text-primary" : "text-ploy-text-secondary"}`}>
                      {item.title}
                    </span>
                    <span className="mt-2 block font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ploy-text-secondary">{item.label}</span>
                  </span>
                  <ArrowUpRight className={`mt-1 size-5 transition-colors ${isActive ? "text-ploy-accent-primary" : "text-ploy-text-secondary"}`} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <Reveal className="ecosystem__visual relative overflow-x-hidden rounded-xl bg-ploy-neutral-inverse">
            <img src={SYSTEM_VISUAL_URL} alt="Abstract architectural forms representing durable institutional systems" className="h-full min-h-[36rem] w-full object-cover" />
            <div className="absolute inset-x-5 bottom-5 rounded-lg bg-ploy-background-primary/95 p-6 backdrop-blur md:inset-x-8 md:bottom-8 md:p-8">
              <p className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ploy-text-secondary">{activeItem.label}</p>
              <p className="mt-3 max-w-xl text-lg leading-relaxed text-ploy-text-primary">{activeItem.description}</p>
              <a href={activeItem.href} className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline decoration-ploy-border-primary underline-offset-4 hover:decoration-ploy-text-primary">
                Explore platform <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
Library body section — src/components/sections/library-featured-section.tsx
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal, RevealItem } from "@/components/ui/reveal";

const FEATURED_BOOK_URL =
  "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/2cb19b46-slurp-2282d963-a2c158d4-the-agenda-the-rise-of-kings-and-priests.webp";

const DEFAULT_BOOKS = [
  ["Called But Missing", "/resources/called-but-missing", "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/cc7d90c1-slurp-0d82a1e2-4b008842-called-but-missing.webp"],
  ["From the Streets to Forbes", "/resources/from-the-streets-to-forbes", "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/180bb7a5-slurp-cca30cc3-8467f6ee-from-the-streets-to-forbes-.webp"],
  ["Networking Your Way to the Top", "/resources/networking-your-way-to-the-top", "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/e13a9c37-slurp-6425a529-44d7c750-networking-your-way-to-the-top-.webp"],
  ["Stay in Your Process", "/resources/stay-in-your-process", "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/35fcd639-slurp-6e21cc26-23e3dd0b-stay-in-your-process-.webp"],
  ["Not Guilty", "/resources/not-guilty", "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/2cbca2a3-slurp-484be223-e8733223-not-guilty-understanding-the-scandal-of-g.webp"],
  ["Dominion", "/resources/dominion", "https://storage.googleapis.com/ployai/3b0be71c-40e9-45e5-9330-d6975465f3c2/user/8a87a632-slurp-ed49fccb-1ca9a578-dominion.webp"],
] as const;

export default function LibraryFeaturedSection({ items = DEFAULT_BOOKS }: { items?: typeof DEFAULT_BOOKS }) {
  return (
    <section className="library border-b border-ploy-border-primary bg-ploy-background-primary px-6 py-20 md:px-10 md:py-28 lg:px-14 xl:px-20">
      <div className="mx-auto max-w-[1450px]">
        <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
          <Reveal>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ploy-text-secondary">The library · Featured</p>
            <Heading className="mt-7">The Agenda</Heading>
            <p className="mt-3 text-xl font-medium text-ploy-text-secondary">The Rise of Kings and Priests</p>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ploy-text-secondary">
              A globally minded call to believers and leaders shaping culture, law, government, and business—a blueprint for stepping into the rooms where civilization is being formed.
            </p>
            <Button asChild showArrow className="mt-9">
              <a href="/resources/the-agenda">Explore the book</a>
            </Button>
          </Reveal>

          <Reveal className="library__feature rounded-xl bg-ploy-background-secondary p-8 md:p-14">
            <img src={FEATURED_BOOK_URL} alt="The Agenda — The Rise of Kings and Priests" className="mx-auto w-full max-w-lg object-contain" />
          </Reveal>
        </div>

        <div className="mt-20 border-t border-ploy-border-primary pt-10">
          <div className="flex items-end justify-between gap-6">
            <Heading as="h3" size="card">The complete library</Heading>
            <a href="/resources" className="inline-flex items-center gap-2 text-sm font-semibold underline decoration-ploy-border-primary underline-offset-4 hover:decoration-ploy-text-primary">
              View all titles <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
          <Reveal stagger className="mt-9 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-6">
            {items.map(([title, href, image]) => (
              <RevealItem key={title}>
                <a href={href} className="library__book group block">
                  <div className="aspect-[2/3] overflow-x-hidden rounded-lg border border-ploy-border-primary bg-ploy-background-secondary">
                    <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  </div>
                  <p className="mt-3 text-sm font-semibold leading-snug text-ploy-text-primary">{title}</p>
                </a>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
Global footer — src/components/layout/footer.tsx
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";

const LINK_GROUPS = [
  {
    title: "Work",
    links: [
      ["Corporate Transformation", "/work/aald"],
      ["Educational Reform", "/work/erudio-hub"],
      ["Execution Think Tank", "/work/performx"],
      ["Tech Alliances", "/work/tc-resource-technology"],
    ],
  },
  {
    title: "Meet Dr. Akin",
    links: [
      ["Profile", "/meet-akin/profile"],
      ["AU Ambassador", "/meet-akin/au-ambassador"],
      ["Board Governance", "/meet-akin/edu-governance"],
      ["Keynote Speaking", "/meet-akin/speaking"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Insights & Writing", "/insights"],
      ["The Library", "/resources"],
      ["Marketplace Ministry", "/resources#marketplace-ministry"],
      ["Audio Archives", "/resources#audio"],
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="footer bg-ploy-background-primary">
      <section className="footer__cta bg-ploy-background-secondary px-6 py-16 md:px-10 md:py-24 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[1450px] gap-10 rounded-xl border border-ploy-border-primary p-8 md:p-12 lg:grid-cols-[1fr_auto] lg:items-end lg:p-16">
          <div>
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-ploy-text-secondary">Advisory · Keynotes · Transformation</p>
            <Heading className="mt-6 max-w-4xl">Bring Dr. Akin into the room where the next system is being built.</Heading>
          </div>
          <Button asChild showArrow>
            <a href="/meet-akin/speaking">Inquire for advisory</a>
          </Button>
        </div>
      </section>

      <div className="border-t border-ploy-border-primary px-6 py-14 md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto grid max-w-[1450px] gap-12 lg:grid-cols-[1.25fr_repeat(3,0.75fr)]">
          <div>
            <a href="/" className="text-xl font-semibold tracking-[-0.03em]">Dr. Akin Akinpelu <span className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ploy-accent-primary">Ph.D</span></a>
            <p className="mt-5 max-w-sm leading-relaxed text-ploy-text-secondary">
              Leadership strategist, educator, author, and marketplace-ministry leader across corporate, academic, and public spheres.
            </p>
            <div className="mt-6 text-sm leading-relaxed text-ploy-text-secondary">
              <p>+234 706 589 5185</p>
              <p>hello@theakinakinpelu.org</p>
            </div>
          </div>

          {LINK_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ploy-text-secondary">{group.title}</p>
              <ul className="mt-5 space-y-3">
                {group.links.map(([label, href]) => (
                  <li key={label}><a href={href} className="text-sm text-ploy-text-secondary transition-colors hover:text-ploy-text-primary">{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-ploy-border-primary px-6 py-6 text-xs text-ploy-text-secondary md:px-10 lg:px-14 xl:px-20">
        <div className="mx-auto flex max-w-[1450px] flex-col gap-2 md:flex-row md:justify-between">
          <p>© 2026 Dr. Akin Akinpelu. All rights reserved.</p>
          <p>Leadership · Systems · Legacy</p>
        </div>
      </div>
    </footer>
  );
}
Supporting UI primitives
Button — src/components/ui/button.tsx
import { cloneElement, isValidElement, type ButtonHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "button inline-flex min-h-12 items-center justify-center gap-3 rounded-[var(--radius-button)] px-5 font-button text-sm font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ploy-accent-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-ploy-button-primary-background text-ploy-button-primary-text hover:bg-ploy-accent-primary/85",
        secondary:
          "border border-ploy-button-secondary-border bg-ploy-button-secondary-background text-ploy-button-secondary-text hover:bg-ploy-neutral-primary-s2",
        inverse:
          "bg-ploy-neutral-primary text-ploy-text-primary hover:bg-ploy-neutral-primary/85",
        text: "min-h-0 rounded-none px-0 py-1 text-ploy-text-primary underline decoration-ploy-border-primary underline-offset-4 hover:decoration-ploy-text-primary",
      },
      size: {
        default: "min-h-12 px-5",
        compact: "min-h-10 px-4 text-xs",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    children: ReactNode;
    showArrow?: boolean;
  };

function ButtonContents({ children, showArrow }: { children: ReactNode; showArrow: boolean }) {
  return (
    <>
      {showArrow ? (
        <span className="button__icon grid size-7 shrink-0 place-items-center rounded-md bg-current/10">
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </span>
      ) : null}
      <span className="button__label">{children}</span>
    </>
  );
}

export function Button({
  asChild = false,
  children,
  className,
  variant,
  size,
  showArrow = false,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; children?: ReactNode }>;
    return cloneElement(child, {
      className: cn(classes, child.props.className),
      children: <ButtonContents showArrow={showArrow}>{child.props.children}</ButtonContents>,
    });
  }

  return (
    <button className={classes} {...props}>
      <ButtonContents showArrow={showArrow}>{children}</ButtonContents>
    </button>
  );
}
Heading — src/components/ui/heading.tsx
import { cva, type VariantProps } from "class-variance-authority";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

const headingVariants = cva(
  "heading text-balance font-heading font-semibold tracking-[-0.035em] text-ploy-text-primary",
  {
    variants: {
      size: {
        display: "text-5xl leading-[0.98] md:text-6xl lg:text-7xl xl:text-8xl",
        section: "text-4xl leading-[1.02] md:text-5xl lg:text-6xl",
        card: "text-2xl leading-tight md:text-3xl",
      },
      tone: {
        primary: "text-ploy-text-primary",
        inverse: "text-ploy-text-inverse",
        muted: "text-ploy-text-secondary",
      },
    },
    defaultVariants: {
      size: "section",
      tone: "primary",
    },
  },
);

type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: ElementType;
    children: ReactNode;
  };

export function Heading({ as: Component = "h2", children, className, size, tone, ...props }: HeadingProps) {
  return (
    <Component className={cn(headingVariants({ size, tone }), className)} {...props}>
      {children}
    </Component>
  );
}
Reveal motion wrapper — src/components/ui/reveal.tsx
import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const easing = [0.22, 1, 0.36, 1] as const;

const parentVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.11,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 1, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: easing },
  },
};

export function Reveal({ children, className, stagger = false }: { children: ReactNode; className?: string; stagger?: boolean }) {
  return (
    <motion.div
      className={cn("reveal", className)}
      variants={stagger ? parentVariants : itemVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={cn("reveal__item", className)} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
Notes for reconstruction
The visual system depends on the Ploy semantic Tailwind token names (bg-ploy-background-primary, text-ploy-text-secondary, etc.), not raw colors in components.
The global header and footer are injected by PageShell, so every React page should compose inside that shell.
The Astro route files are intentionally thin and mount the React page component with client:load.
Motion accessibility is set globally for the React tree through <MotionConfig reducedMotion="user">.
The current homepage section order is: Navigation → Hero → Insights/Features → Interactive Ecosystem → Featured Library → Footer CTA → Footer Navigation.
Asset URLs in the source are workspace-hosted WebP files and should be preserved or downloaded when moving the site elsewhere.

