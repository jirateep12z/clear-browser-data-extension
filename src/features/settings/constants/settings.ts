import type {
  DataTypeKey,
  DataTypes,
  HistoryBackupSettings,
  ScheduleType,
  Settings,
  TimeRange
} from '../types/settings';

export const CLEANUP_TRIGGER_OPTIONS = [
  { value: 'manual', label: 'Manual' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'startup', label: 'Startup' },
  { value: 'shortcut', label: 'Shortcut' }
] as const;

export const VALID_CLEANUP_TRIGGERS = new Set<string>(
  CLEANUP_TRIGGER_OPTIONS.map(option => option.value)
);

export const TIME_RANGE_OPTIONS: ReadonlyArray<{
  value: TimeRange;
  label: string;
}> = [
  { value: 'last_hour', label: 'Last hour' },
  { value: 'last_24_hours', label: 'Last 24 hours' },
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_4_weeks', label: 'Last 4 weeks' },
  { value: 'all_time', label: 'All time' }
];

export const DATA_TYPE_OPTIONS: ReadonlyArray<{
  key: DataTypeKey;
  label: string;
  description: string;
}> = [
  {
    key: 'cache',
    label: 'Cached Images & Files',
    description: 'Removes cached files stored by the browser.'
  },
  {
    key: 'cookies',
    label: 'Cookies',
    description: 'Removes site cookies and related session data.'
  },
  {
    key: 'history',
    label: 'Browsing History',
    description: 'Removes visited page history for the selected time range.'
  },
  {
    key: 'downloads',
    label: 'Download History',
    description: 'Removes download records without deleting downloaded files.'
  },
  {
    key: 'form_data',
    label: 'Autofill Form Data',
    description: 'Removes saved form entries used for autofill.'
  },
  {
    key: 'local_storage',
    label: 'Local Storage',
    description: 'Removes local storage saved by websites.'
  },
  {
    key: 'indexed_db',
    label: 'IndexedDB',
    description: 'Removes website databases stored in IndexedDB.'
  },
  {
    key: 'service_workers',
    label: 'Service Workers',
    description: 'Removes registered service workers for websites.'
  },
  {
    key: 'file_systems',
    label: 'File Systems',
    description: 'Removes website file system storage.'
  },
  {
    key: 'plugin_data',
    label: 'Plugin Data',
    description: 'Deprecated by Chrome and may be ignored.'
  },
  {
    key: 'web_sql',
    label: 'Web SQL Data',
    description: 'Removes legacy Web SQL database storage.'
  }
];

export const SCHEDULE_TYPE_OPTIONS: ReadonlyArray<{
  value: ScheduleType;
  label: string;
}> = [
  { value: 'custom_minutes', label: 'Custom minutes' },
  { value: 'custom_hours', label: 'Custom hours' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export const SCHEDULE_INTERVAL_OPTIONS: ReadonlyArray<{
  value: number;
  label: string;
  schedule_type: ScheduleType;
}> = [
  { value: 5, label: 'Every 5 minutes', schedule_type: 'custom_minutes' },
  { value: 10, label: 'Every 10 minutes', schedule_type: 'custom_minutes' },
  { value: 15, label: 'Every 15 minutes', schedule_type: 'custom_minutes' },
  { value: 20, label: 'Every 20 minutes', schedule_type: 'custom_minutes' },
  { value: 30, label: 'Every 30 minutes', schedule_type: 'custom_minutes' },
  { value: 45, label: 'Every 45 minutes', schedule_type: 'custom_minutes' },
  { value: 60, label: 'Every 1 hour', schedule_type: 'custom_hours' },
  { value: 120, label: 'Every 2 hours', schedule_type: 'custom_hours' },
  { value: 180, label: 'Every 3 hours', schedule_type: 'custom_hours' },
  { value: 240, label: 'Every 4 hours', schedule_type: 'custom_hours' },
  { value: 360, label: 'Every 6 hours', schedule_type: 'custom_hours' },
  { value: 480, label: 'Every 8 hours', schedule_type: 'custom_hours' },
  { value: 720, label: 'Every 12 hours', schedule_type: 'custom_hours' },
  { value: 60, label: 'Every hour', schedule_type: 'hourly' },
  { value: 1440, label: 'Every day', schedule_type: 'daily' },
  { value: 10080, label: 'Every week', schedule_type: 'weekly' },
  { value: 43200, label: 'Every month', schedule_type: 'monthly' }
];

export const VALID_TIME_RANGES = new Set<string>(
  TIME_RANGE_OPTIONS.map(option => option.value)
);

export const VALID_DATA_TYPE_KEYS = new Set<string>(
  DATA_TYPE_OPTIONS.map(option => option.key)
);

export const VALID_SCHEDULE_TYPES = new Set<string>(
  SCHEDULE_TYPE_OPTIONS.map(option => option.value)
);

export const VALID_SCHEDULE_INTERVALS = new Set<number>(
  SCHEDULE_INTERVAL_OPTIONS.map(option => option.value)
);

export const DEFAULT_DATA_TYPES: DataTypes = Object.freeze(
  DATA_TYPE_OPTIONS.reduce((data_types, option) => {
    return {
      ...data_types,
      [option.key]: ['cache', 'history', 'downloads', 'form_data'].includes(
        option.key
      )
    };
  }, {} as DataTypes)
);

export const DEFAULT_HISTORY_BACKUP_SETTINGS: HistoryBackupSettings = {
  is_enabled: false,
  trigger_keys: ['manual'],
  retention_days: 90
};

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  is_enabled: true,
  data_types: DEFAULT_DATA_TYPES,
  time_range: 'all_time',
  is_scheduled_cleanup_enabled: false,
  schedule_type: 'custom_minutes',
  schedule_interval_minutes: 10,
  confirm_before_clearing: true,
  show_notifications: true,
  clear_on_browser_startup: false,
  whitelist_domains: [],
  history_backup: DEFAULT_HISTORY_BACKUP_SETTINGS,
  statistics: {
    total_count: 0,
    last_date: null
  }
};
