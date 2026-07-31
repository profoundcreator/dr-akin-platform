export interface RebuildResult {
  ok: boolean;
  message: string;
}

/** Admin toast after publish/approve when rebuild may or may not have started. */
export function publishNoticeWithRebuild(
  fallbackSuccessLabel: string,
  rebuild: RebuildResult,
): string {
  if (rebuild.ok) return rebuild.message;
  return `${fallbackSuccessLabel} ${rebuild.message}`;
}

/** Admin toast after hide/restore when rebuild is optional. */
export function hideRestoreNoticeWithRebuild(baseNotice: string, rebuild: RebuildResult): string {
  if (rebuild.ok) return `${baseNotice} ${rebuild.message}`;
  return baseNotice;
}
