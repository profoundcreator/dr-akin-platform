/** Merge CMS-published rows with static seed content. DB rows override matching slugs. */
export function mergePublishedWithStatic<T extends { slug: string }>(
  publishedFromDb: T[],
  staticItems: T[],
): T[] {
  const publishedSlugs = new Set(publishedFromDb.map((item) => item.slug));
  const staticFallback = staticItems.filter((item) => !publishedSlugs.has(item.slug));
  return [...publishedFromDb, ...staticFallback];
}
