import { OptimizedImage } from "@/components/ui/optimized-image";

interface InsightArticleHeroProps {
  src: string;
  alt: string;
}

export function InsightArticleHero({ src, alt }: InsightArticleHeroProps) {
  return (
    <figure className="overflow-hidden rounded-xl border border-[var(--ploy-border-primary)] bg-[var(--ploy-background-secondary)]">
      <OptimizedImage
        src={src}
        alt={alt}
        width={1600}
        height={900}
        className="aspect-[16/9] w-full object-cover"
      />
    </figure>
  );
}

interface InsightSourceAttributionProps {
  sourceLabel: string;
  sourceUrl?: string | null;
}

export function InsightSourceAttribution({ sourceLabel, sourceUrl }: InsightSourceAttributionProps) {
  return (
    <p className="text-sm text-[var(--ploy-text-tertiary)]">
      Originally published on{" "}
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[var(--ploy-text-secondary)] underline decoration-[var(--ploy-border-primary)] underline-offset-4 hover:text-[var(--ploy-text-primary)]"
        >
          {sourceLabel}
        </a>
      ) : (
        <span className="font-medium text-[var(--ploy-text-secondary)]">{sourceLabel}</span>
      )}
    </p>
  );
}
