import type { Settings } from '@/features/settings';
import { SCHEDULED_CLEANUP_ALARM_NAME } from '../constants/cleanup';
import type { CleanupResult } from '../types/cleanup';
import { ClearBrowserData } from './browser-data-cleanup.service';

let previous_sync_task: Promise<void> = Promise.resolve();

function HasSelectedDataType(settings: Settings): boolean {
  return Object.values(settings.data_types).some(Boolean);
}

function IsScheduledCleanupActive(settings: Settings): boolean {
  return (
    settings.is_enabled &&
    settings.is_scheduled_cleanup_enabled &&
    HasSelectedDataType(settings)
  );
}

async function ApplyScheduledCleanup(settings: Settings): Promise<void> {
  if (!IsScheduledCleanupActive(settings)) {
    await chrome.alarms.clear(SCHEDULED_CLEANUP_ALARM_NAME);

    return;
  }

  const existing_alarm = await chrome.alarms.get(SCHEDULED_CLEANUP_ALARM_NAME);

  if (existing_alarm?.periodInMinutes === settings.schedule_interval_minutes) {
    return;
  }

  await chrome.alarms.create(SCHEDULED_CLEANUP_ALARM_NAME, {
    delayInMinutes: settings.schedule_interval_minutes,
    periodInMinutes: settings.schedule_interval_minutes
  });
}

export function SyncScheduledCleanup(settings: Settings): Promise<void> {
  const sync_task = previous_sync_task.then(() => {
    return ApplyScheduledCleanup(settings);
  });

  previous_sync_task = sync_task.catch(() => undefined);

  return sync_task;
}

export function IsScheduledCleanupAlarm(alarm_name: string): boolean {
  return alarm_name === SCHEDULED_CLEANUP_ALARM_NAME;
}

export async function RunScheduledCleanup(): Promise<CleanupResult> {
  return ClearBrowserData('scheduled');
}
