import type {
  HistoryBackupSettings,
  ScheduleType,
  Statistics
} from '@/features/settings';
import type { Theme } from '@/features/theme';

export type SchedulePanelProps = {
  is_scheduled_cleanup_enabled: boolean;
  schedule_type: ScheduleType;
  schedule_interval_minutes: number;
  OnScheduledCleanupEnabledChange: (value: boolean) => void;
  OnScheduleIntervalChange: (schedule_interval_minutes: number) => void;
  OnScheduleTypeChange: (schedule_type: ScheduleType) => void;
};

export type SettingsPanelProps = {
  theme: Theme;
  is_enabled: boolean;
  confirm_before_clearing: boolean;
  show_notifications: boolean;
  clear_on_browser_startup: boolean;
  whitelist_domains: string[];
  history_backup: HistoryBackupSettings;
  OnClearOnBrowserStartupChange: (value: boolean) => void;
  OnConfirmBeforeClearingChange: (value: boolean) => void;
  OnEnabledChange: (value: boolean) => void;
  OnHistoryBackupChange: (history_backup: HistoryBackupSettings) => void;
  OnShowNotificationsChange: (value: boolean) => void;
  OnThemeChange: (theme: Theme) => void;
  OnWhitelistDomainsChange: (whitelist_domains: string[]) => void;
};

export type StatisticsCardProps = {
  statistics: Statistics;
};
