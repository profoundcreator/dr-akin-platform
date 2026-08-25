import type { PurchaseLink } from "@/lib/library/purchase-links";

export interface PlatformBook {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  year: string | null;
  category: string;
  description: string;
  coverImagePath: string | null;
  coverImageHidden: boolean;
  coverUrl: string;
  purchaseLinks: PurchaseLink[];
  isFeatured: boolean;
  sortOrder: number;
  status: "draft" | "pending_approval" | "published" | "hidden";
  manuallyHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookInput {
  slug: string;
  title: string;
  subtitle?: string;
  year?: string;
  category: string;
  description: string;
  coverImagePath?: string | null;
  coverImageHidden?: boolean;
  purchaseLinks?: PurchaseLink[];
  isFeatured?: boolean;
  sortOrder?: number;
  status?: PlatformBook["status"];
  manuallyHidden?: boolean;
}
