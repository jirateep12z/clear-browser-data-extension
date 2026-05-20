import { VALID_THEMES } from '@/features/theme';
import {
  MAXIMUM_HISTORY_BACKUP_RETENTION_DAYS,
  MINIMUM_HISTORY_BACKUP_RETENTION_DAYS
} from '../constants/history-backup-settings';
import {
  DATA_TYPE_OPTIONS,
  DEFAULT_HISTORY_BACKUP_SETTINGS,
  DEFAULT_SETTINGS,
  SCHEDULE_INTERVAL_OPTIONS,
  VALID_CLEANUP_TRIGGERS,
  VALID_SCHEDULE_INTERVALS,
  VALID_SCHEDULE_TYPES,
  VALID_TIME_RANGES
} from '../constants/settings';
import type {
  CleanupTrigger,
  DataTypes,
  HistoryBackupSettings,
  Settings
} from '../types/settings';

function ValidateWhitelistDomains(value: unknown): string[] {
  if (!Array.isArray(value)) return DEFAULT_SETTINGS.whitelist_domains;

  return Array.from(
    new Set(
      value
        .filter((domain): domain is string => typeof domain === 'string')
        .map(domain => domain.trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function ValidateHistoryBackupTriggers(value: unknown): CleanupTrigger[] {
  if (!Array.isArray(value)) {
    return DEFAULT_HISTORY_BACKUP_SETTINGS.trigger_keys;
  }

  const validated_trigger_keys = Array.from(
    new Set(
      value.filter((trigger): trigger is CleanupTrigger => {
        return (
          typeof trigger === 'string' && VALID_CLEANUP_TRIGGERS.has(trigger)
        );
      })
    )
  );

  return validated_trigger_keys.length > 0
    ? validated_trigger_keys
    : DEFAULT_HISTORY_BACKUP_SETTINGS.trigger_keys;
}

function ValidateHistoryBackupSettings(value: unknown): HistoryBackupSettings {
  const partial =
    value && typeof value === 'object'
      ? (value as Partial<HistoryBackupSettings>)
      : {};
  const retention_days =
    typeof partial.retention_days === 'number' &&
    Number.isFinite(partial.retention_days)
      ? Math.floor(partial.retention_days)
      : DEFAULT_HISTORY_BACKUP_SETTINGS.retention_days;
  const bounded_retention_days = Math.min(
    Math.max(retention_days, MINIMUM_HISTORY_BACKUP_RETENTION_DAYS),
    MAXIMUM_HISTORY_BACKUP_RETENTION_DAYS
  );

  return {
    is_enabled:
      typeof partial.is_enabled === 'boolean'
        ? partial.is_enabled
        : DEFAULT_HISTORY_BACKUP_SETTINGS.is_enabled,
    trigger_keys: ValidateHistoryBackupTriggers(partial.trigger_keys),
    retention_days: bounded_retention_days
  };
}

export function MergeSettings(partial: Partial<Settings>): Settings {
  const validated_theme =
    typeof partial?.theme === 'string' && VALID_THEMES.has(partial.theme)
      ? (partial.theme as Settings['theme'])
      : DEFAULT_SETTINGS.theme;
  const validated_time_range =
    typeof partial?.time_range === 'string' &&
    VALID_TIME_RANGES.has(partial.time_range)
      ? (partial.time_range as Settings['time_range'])
      : DEFAULT_SETTINGS.time_range;
  const validated_schedule_type =
    typeof partial?.schedule_type === 'string' &&
    VALID_SCHEDULE_TYPES.has(partial.schedule_type)
      ? (partial.schedule_type as Settings['schedule_type'])
      : DEFAULT_SETTINGS.schedule_type;
  const schedule_interval_options = SCHEDULE_INTERVAL_OPTIONS.filter(option => {
    return option.schedule_type === validated_schedule_type;
  });
  const default_schedule_interval = schedule_interval_options.find(option => {
    return option.value === DEFAULT_SETTINGS.schedule_interval_minutes;
  });
  const fallback_schedule_interval_minutes =
    default_schedule_interval?.value ??
    schedule_interval_options[0]?.value ??
    DEFAULT_SETTINGS.schedule_interval_minutes;
  const validated_schedule_interval_minutes =
    typeof partial?.schedule_interval_minutes === 'number' &&
    VALID_SCHEDULE_INTERVALS.has(partial.schedule_interval_minutes) &&
    schedule_interval_options.some(option => {
      return option.value === partial.schedule_interval_minutes;
    })
      ? partial.schedule_interval_minutes
      : fallback_schedule_interval_minutes;
  const partial_data_types: Partial<DataTypes> =
    partial?.data_types && typeof partial.data_types === 'object'
      ? partial.data_types
      : {};
  const validated_data_types = DATA_TYPE_OPTIONS.reduce(
    (data_types, option) => {
      return {
        ...data_types,
        [option.key]:
          typeof partial_data_types[option.key] === 'boolean'
            ? partial_data_types[option.key]
            : DEFAULT_SETTINGS.data_types[option.key]
      };
    },
    {} as DataTypes
  );
  const validated_count =
    typeof partial?.statistics?.total_count === 'number' &&
    Number.isFinite(partial.statistics.total_count) &&
    partial.statistics.total_count >= 0
      ? Math.floor(partial.statistics.total_count)
      : DEFAULT_SETTINGS.statistics.total_count;
  const raw_date = partial?.statistics?.last_date;
  const validated_date: string | null =
    raw_date === null
      ? null
      : typeof raw_date === 'string' && !isNaN(new Date(raw_date).getTime())
        ? raw_date
        : DEFAULT_SETTINGS.statistics.last_date;

  return {
    ...DEFAULT_SETTINGS,
    is_enabled:
      typeof partial?.is_enabled === 'boolean'
        ? partial.is_enabled
        : DEFAULT_SETTINGS.is_enabled,
    data_types: validated_data_types,
    time_range: validated_time_range,
    is_scheduled_cleanup_enabled:
      typeof partial?.is_scheduled_cleanup_enabled === 'boolean'
        ? partial.is_scheduled_cleanup_enabled
        : DEFAULT_SETTINGS.is_scheduled_cleanup_enabled,
    schedule_type: validated_schedule_type,
    schedule_interval_minutes: validated_schedule_interval_minutes,
    confirm_before_clearing:
      typeof partial?.confirm_before_clearing === 'boolean'
        ? partial.confirm_before_clearing
        : DEFAULT_SETTINGS.confirm_before_clearing,
    show_notifications:
      typeof partial?.show_notifications === 'boolean'
        ? partial.show_notifications
        : DEFAULT_SETTINGS.show_notifications,
    clear_on_browser_startup:
      typeof partial?.clear_on_browser_startup === 'boolean'
        ? partial.clear_on_browser_startup
        : DEFAULT_SETTINGS.clear_on_browser_startup,
    whitelist_domains: ValidateWhitelistDomains(partial?.whitelist_domains),
    history_backup: ValidateHistoryBackupSettings(partial?.history_backup),
    theme: validated_theme,
    statistics: {
      total_count: validated_count,
      last_date: validated_date
    }
  };
}
