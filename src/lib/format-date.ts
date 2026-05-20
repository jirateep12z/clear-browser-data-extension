export function FormatDate(date_string: string | null): string {
  if (!date_string) return 'Never';
  const date = new Date(date_string);

  if (isNaN(date.getTime())) return 'Never';

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
