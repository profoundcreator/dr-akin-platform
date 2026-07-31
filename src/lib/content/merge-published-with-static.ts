/** Merge CMS-published rows with static seed content. DB rows override matching slugs. */
export function mergePublishedWithStatic<T extends { slug: string }>(
  publishedFromDb: T[],
  staticItems: T[],
  hiddenStaticSlugs: string[] = [],
): T[] {
  const hidden = new Set(hiddenStaticSlugs.map((slug) => slug.toLowerCase()));
  const publishedSlugs = new Set(publishedFromDb.map((item) => item.slug));
  const staticFallback = staticItems.filter(
    (item) => !publishedSlugs.has(item.slug) && !hidden.has(item.slug.toLowerCase()),
  );
  return [...publishedFromDb, ...staticFallback];
}
