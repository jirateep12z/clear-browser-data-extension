import type { CleanupTrigger } from '@/features/settings';

export const CLEAR_SELECTED_DATA_COMMAND = 'clear-selected-data';
export const SCHEDULED_CLEANUP_ALARM_NAME = 'scheduled-cleanup';

export const HISTORY_BACKUP_WARNING_MESSAGE =
  'Selected browser data was cleared, but history backup could not be saved.';

export const SHORTCUT_CONFIRMATION_NOTIFICATION_ID =
  'clear-browser-data-shortcut-confirmation';
export const CLEANUP_NOTIFICATION_IDS: Record<CleanupTrigger, string> = {
  manual: 'clear-browser-data-manual',
  scheduled: 'clear-browser-data-scheduled',
  startup: 'clear-browser-data-startup',
  shortcut: 'clear-browser-data-shortcut'
};
