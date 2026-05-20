import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import type { ClearBrowsingDataResponse } from '@/features/cleanup';
import { ClearPanel } from '@/features/cleanup';
import {
  HistoryBackupPanel,
  UseHistoryBackups
} from '@/features/history-backup';
import type {
  DataTypeKey,
  HistoryBackupSettings,
  ScheduleType,
  TimeRange
} from '@/features/settings';
import { UseChromeStorage } from '@/features/settings';
import type { Theme } from '@/features/theme';
import { UseTheme } from '@/features/theme';
import { IsChromeExtension } from '@/lib/is-chrome-extension';
import { Cn } from '@/lib/utils';
import {
  BarChart3,
  CalendarClock,
  FolderClock,
  Settings,
  Trash2
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { SchedulePanel } from './components/schedule-panel';
import { SettingsPanel } from './components/settings-panel';
import { StatisticsCard } from './components/statistics-card';
import { TAB_VALUES } from './constants/popup';
import type { TabValue } from './types/popup';

const LOADING_VIEW = (
  <div className="flex h-screen w-[420px] items-center justify-center bg-neutral-50 dark:bg-neutral-950">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

function CreateTabTriggerClassName(
  tab_value: TabValue,
  active_tab: TabValue
): string {
  return Cn(
    'px-0 hover:bg-muted/80 focus-visible:ring-[3px]',
    active_tab === tab_value &&
      'bg-background text-foreground hover:bg-background dark:border-input dark:bg-input/30 dark:text-foreground dark:hover:bg-input/30'
  );
}

export function PopupApp() {
  const {
    settings,
    is_loading,
    save_error_message,
    SaveSettings,
    GetLatestSettings
  } = UseChromeStorage();
  const {
    records: history_backup_records,
    is_loading: is_history_backup_loading,
    error_message: history_backup_error_message,
    LoadHistoryBackups,
    DeleteHistoryBackup,
    DeleteAllHistoryBackups
  } = UseHistoryBackups();
  const [is_clearing, set_is_clearing] = useState(false);
  const [status_message, set_status_message] = useState<string | null>(null);
  const [active_tab, set_active_tab] = useState<TabValue>('clear');

  UseTheme(settings.theme);

  const HandleDataTypeChange = useCallback(
    (key: DataTypeKey, value: boolean) => {
      const latest_settings = GetLatestSettings();

      SaveSettings({
        ...latest_settings,
        data_types: {
          ...latest_settings.data_types,
          [key]: value
        }
      });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleTimeRangeChange = useCallback(
    (time_range: TimeRange) => {
      SaveSettings({ ...GetLatestSettings(), time_range });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleThemeChange = useCallback(
    (theme: Theme) => {
      SaveSettings({ ...GetLatestSettings(), theme });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleEnabledChange = useCallback(
    (is_enabled: boolean) => {
      SaveSettings({ ...GetLatestSettings(), is_enabled });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleScheduledCleanupEnabledChange = useCallback(
    (is_scheduled_cleanup_enabled: boolean) => {
      SaveSettings({ ...GetLatestSettings(), is_scheduled_cleanup_enabled });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleScheduleIntervalChange = useCallback(
    (schedule_interval_minutes: number) => {
      SaveSettings({ ...GetLatestSettings(), schedule_interval_minutes });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleScheduleTypeChange = useCallback(
    (schedule_type: ScheduleType) => {
      SaveSettings({ ...GetLatestSettings(), schedule_type });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleConfirmBeforeClearingChange = useCallback(
    (confirm_before_clearing: boolean) => {
      SaveSettings({ ...GetLatestSettings(), confirm_before_clearing });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleShowNotificationsChange = useCallback(
    (show_notifications: boolean) => {
      SaveSettings({ ...GetLatestSettings(), show_notifications });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleClearOnBrowserStartupChange = useCallback(
    (clear_on_browser_startup: boolean) => {
      SaveSettings({ ...GetLatestSettings(), clear_on_browser_startup });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleWhitelistDomainsChange = useCallback(
    (whitelist_domains: string[]) => {
      SaveSettings({ ...GetLatestSettings(), whitelist_domains });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleHistoryBackupChange = useCallback(
    (history_backup: HistoryBackupSettings) => {
      SaveSettings({ ...GetLatestSettings(), history_backup });
    },
    [SaveSettings, GetLatestSettings]
  );

  const HandleTabValueChange = useCallback(
    (next_tab: string) => {
      if (TAB_VALUES.has(next_tab)) {
        set_active_tab(next_tab as TabValue);
      }
    },
    [set_active_tab]
  );

  const HandleClearData = useCallback(async () => {
    set_is_clearing(true);
    set_status_message(null);
    try {
      if (!IsChromeExtension()) {
        set_status_message(
          'Build and load the extension in Chrome to clear data.'
        );

        return;
      }

      const response = (await chrome.runtime.sendMessage({
        action: 'clear-browsing-data'
      })) as ClearBrowsingDataResponse;

      if (!response?.success) {
        set_status_message(response?.error ?? 'Unable to clear browser data.');

        return;
      }

      SaveSettings(response.settings);
      set_status_message(
        response.warning ?? 'Selected browser data has been cleared.'
      );
    } catch (error) {
      console.error('Failed to clear browser data:', error);
      set_status_message('Unable to clear browser data. Please try again.');
    } finally {
      set_is_clearing(false);
    }
  }, [SaveSettings, set_is_clearing, set_status_message]);

  if (is_loading) {
    return LOADING_VIEW;
  }

  return (
    <div className="h-screen w-[420px] overflow-y-auto bg-neutral-50 p-4 dark:bg-neutral-950">
      <Header />
      <Tabs
        value={active_tab}
        className="mt-4"
        onValueChange={HandleTabValueChange}
      >
        <TooltipProvider>
          <TabsList className="grid w-full grid-cols-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="clear"
                  className={CreateTabTriggerClassName('clear', active_tab)}
                  aria-label="Clear"
                >
                  <Trash2 />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Clear</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="schedule"
                  className={CreateTabTriggerClassName('schedule', active_tab)}
                  aria-label="Schedule"
                >
                  <CalendarClock />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Schedule</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="settings"
                  className={CreateTabTriggerClassName('settings', active_tab)}
                  aria-label="Settings"
                >
                  <Settings />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="statistics"
                  className={CreateTabTriggerClassName(
                    'statistics',
                    active_tab
                  )}
                  aria-label="Statistics"
                >
                  <BarChart3 />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Statistics</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="backup"
                  className={CreateTabTriggerClassName('backup', active_tab)}
                  aria-label="Backup"
                >
                  <FolderClock />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Backup</TooltipContent>
            </Tooltip>
          </TabsList>
        </TooltipProvider>
        <TabsContent value="clear" className="mt-4">
          <ClearPanel
            data_types={settings.data_types}
            time_range={settings.time_range}
            is_enabled={settings.is_enabled}
            is_clearing={is_clearing}
            confirm_before_clearing={settings.confirm_before_clearing}
            status_message={status_message}
            OnClearData={HandleClearData}
            OnDataTypeChange={HandleDataTypeChange}
            OnTimeRangeChange={HandleTimeRangeChange}
          />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          <SchedulePanel
            is_scheduled_cleanup_enabled={settings.is_scheduled_cleanup_enabled}
            schedule_type={settings.schedule_type}
            schedule_interval_minutes={settings.schedule_interval_minutes}
            OnScheduledCleanupEnabledChange={
              HandleScheduledCleanupEnabledChange
            }
            OnScheduleIntervalChange={HandleScheduleIntervalChange}
            OnScheduleTypeChange={HandleScheduleTypeChange}
          />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <SettingsPanel
            theme={settings.theme}
            is_enabled={settings.is_enabled}
            confirm_before_clearing={settings.confirm_before_clearing}
            show_notifications={settings.show_notifications}
            clear_on_browser_startup={settings.clear_on_browser_startup}
            whitelist_domains={settings.whitelist_domains}
            history_backup={settings.history_backup}
            OnClearOnBrowserStartupChange={HandleClearOnBrowserStartupChange}
            OnConfirmBeforeClearingChange={HandleConfirmBeforeClearingChange}
            OnEnabledChange={HandleEnabledChange}
            OnHistoryBackupChange={HandleHistoryBackupChange}
            OnShowNotificationsChange={HandleShowNotificationsChange}
            OnThemeChange={HandleThemeChange}
            OnWhitelistDomainsChange={HandleWhitelistDomainsChange}
          />
        </TabsContent>
        <TabsContent value="statistics" className="mt-4">
          <StatisticsCard statistics={settings.statistics} />
        </TabsContent>
        <TabsContent value="backup" className="mt-4">
          <HistoryBackupPanel
            records={history_backup_records}
            is_loading={is_history_backup_loading}
            error_message={history_backup_error_message}
            OnDeleteAllHistoryBackups={DeleteAllHistoryBackups}
            OnDeleteHistoryBackup={DeleteHistoryBackup}
            OnReloadHistoryBackups={LoadHistoryBackups}
          />
        </TabsContent>
      </Tabs>
      {save_error_message ? (
        <p role="alert" className="text-destructive mt-3 text-center text-xs">
          {save_error_message}
        </p>
      ) : null}
      <Footer />
    </div>
  );
}
