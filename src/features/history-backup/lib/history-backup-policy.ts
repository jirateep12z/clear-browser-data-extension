export function ShouldSkipEmptyHistoryBackup(entries_count: number): boolean {
  return entries_count === 0;
}
