const COMPACT_COUNT_THRESHOLD = 1_000;

const COMPACT_COUNT_FORMATTER = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1
});

export function FormatCompactCount(total_count: number): string {
  if (total_count < COMPACT_COUNT_THRESHOLD) {
    return total_count.toString();
  }

  return COMPACT_COUNT_FORMATTER.format(total_count);
}
