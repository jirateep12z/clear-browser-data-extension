import { MILLISECONDS_PER_DAY, MILLISECONDS_PER_HOUR } from '../constants/time';
import type { TimeRange } from '../types/settings';

export function GetSinceTimestamp(
  time_range: TimeRange,
  current_time = Date.now()
): number {
  if (time_range === 'last_hour') return current_time - MILLISECONDS_PER_HOUR;
  if (time_range === 'last_24_hours')
    return current_time - MILLISECONDS_PER_DAY;
  if (time_range === 'last_7_days')
    return current_time - 7 * MILLISECONDS_PER_DAY;
  if (time_range === 'last_4_weeks')
    return current_time - 28 * MILLISECONDS_PER_DAY;

  return 0;
}
