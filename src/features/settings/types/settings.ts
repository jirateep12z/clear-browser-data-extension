import type { Theme } from '@/features/theme';

export type CleanupTrigger = 'manual' | 'scheduled' | 'startup' | 'shortcut';

export type Statistics = {
  total_count: number;
  last_date: string | null;
};

export type DataTypeKey =
  | 'cache'
  | 'cookies'
  | 'history'
  | 'downloads'
  | 'form_data'
  | 'local_storage'
  | 'indexed_db'
  | 'service_workers'
  | 'file_systems'
  | 'plugin_data'
  | 'web_sql';

export type DataTypes = Record<DataTypeKey, boolean>;

export type TimeRange =
  'last_hour' | 'last_24_hours' | 'last_7_days' | 'last_4_weeks' | 'all_time';

export type ScheduleType =
  'custom_minutes' | 'custom_hours' | 'hourly' | 'daily' | 'weekly' | 'monthly';

export type HistoryBackupSettings = {
  is_enabled: boolean;
  trigger_keys: CleanupTrigger[];
  retention_days: number;
};

export type Settings = {
  theme: Theme;
  is_enabled: boolean;
  data_types: DataTypes;
  time_range: TimeRange;
  is_scheduled_cleanup_enabled: boolean;
  schedule_type: ScheduleType;
  schedule_interval_minutes: number;
  confirm_before_clearing: boolean;
  show_notifications: boolean;
  clear_on_browser_startup: boolean;
  whitelist_domains: string[];
  history_backup: HistoryBackupSettings;
  statistics: Statistics;
};
