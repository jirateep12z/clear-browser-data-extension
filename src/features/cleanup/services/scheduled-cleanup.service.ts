import type { Settings } from '@/features/settings';
import { SCHEDULED_CLEANUP_ALARM_NAME } from '../constants/cleanup';
import type { CleanupResult } from '../types/cleanup';
import { ClearBrowserData } from './browser-data-cleanup.service';

function HasSelectedDataType(settings: Settings): boolean {
  return Object.values(settings.data_types).some(Boolean);
}

export async function SyncScheduledCleanup(settings: Settings): Promise<void> {
  await chrome.alarms.clear(SCHEDULED_CLEANUP_ALARM_NAME);
  if (!settings.is_enabled) return;
  if (!settings.is_scheduled_cleanup_enabled) return;
  if (!HasSelectedDataType(settings)) return;
  await chrome.alarms.create(SCHEDULED_CLEANUP_ALARM_NAME, {
    delayInMinutes: settings.schedule_interval_minutes,
    periodInMinutes: settings.schedule_interval_minutes
  });
}

export function IsScheduledCleanupAlarm(alarm_name: string): boolean {
  return alarm_name === SCHEDULED_CLEANUP_ALARM_NAME;
}

export async function RunScheduledCleanup(): Promise<CleanupResult> {
  return ClearBrowserData('scheduled');
}
