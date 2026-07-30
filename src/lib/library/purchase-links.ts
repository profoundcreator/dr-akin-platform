export interface PurchaseLink {
  label: string;
  url: string;
}

function purchaseLinkPriority(label: string): number {
  const lower = label.toLowerCase();
  if (lower.includes("paperback") || lower.includes("hardcopy") || lower.includes("hard copy")) {
    return 1;
  }
  if (lower.includes("ebook") || lower.includes("kindle") || lower.includes("soft copy")) {
    return 2;
  }
  return 3;
}

/** Paperback → eBook → other (audio, regional stores, etc.) */
export function sortPurchaseLinks(links: PurchaseLink[]): PurchaseLink[] {
  return links
    .map((link, index) => ({ link, index, priority: purchaseLinkPriority(link.label) }))
    .sort((a, b) => a.priority - b.priority || a.index - b.index)
    .map(({ link }) => link);
}
