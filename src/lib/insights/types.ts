export interface PlatformInsight {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  heroImagePath: string | null;
  heroImageUrl: string | null;
  sourceLabel: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  sortOrder: number;
  isHomepageFeatured: boolean;
  homepageFeatureOrder: number | null;
  status: "draft" | "pending_approval" | "published" | "hidden";
  manuallyHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsightInput {
  slug: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  heroImagePath?: string | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  publishedAt?: string | null;
  sortOrder?: number;
  status?: PlatformInsight["status"];
  manuallyHidden?: boolean;
}
