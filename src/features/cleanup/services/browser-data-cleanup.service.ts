import { SaveHistoryBackupBeforeCleanup } from '@/features/history-backup';
import type { CleanupTrigger, DataTypes, Settings } from '@/features/settings';
import {
  CHROME_STORAGE_KEY,
  CreateOriginsFromWhitelistDomains,
  GetSinceTimestamp,
  MergeSettings
} from '@/features/settings';
import {
  CLEANUP_NOTIFICATION_IDS,
  HISTORY_BACKUP_WARNING_MESSAGE
} from '../constants/cleanup';
import type { CleanupResult } from '../types/cleanup';

let active_cleanup_task: Promise<CleanupResult> | null = null;

function GetErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'Unable to clear browser data. Please try again.';
}

function HasSelectedDataType(
  data_types: chrome.browsingData.DataTypeSet
): boolean {
  return Object.values(data_types).some(Boolean);
}

function CreateDataTypeSet(
  data_types: DataTypes
): chrome.browsingData.DataTypeSet {
  return {
    cache: data_types.cache,
    cookies: data_types.cookies,
    history: data_types.history,
    downloads: data_types.downloads,
    formData: data_types.form_data,
    localStorage: data_types.local_storage,
    indexedDB: data_types.indexed_db,
    serviceWorkers: data_types.service_workers,
    fileSystems: data_types.file_systems,
    pluginData: data_types.plugin_data,
    webSQL: data_types.web_sql
  };
}

function CreateRemovalOptions(
  settings: Settings
): chrome.browsingData.RemovalOptions {
  const base_options: chrome.browsingData.RemovalOptions = {
    since: GetSinceTimestamp(settings.time_range)
  };
  const excluded_origins = Array.from(
    new Set(CreateOriginsFromWhitelistDomains(settings.whitelist_domains))
  );

  return excluded_origins.length > 0
    ? {
        ...base_options,
        excludeOrigins: excluded_origins
      }
    : base_options;
}

function CreateOriginFilterableDataTypeSet(
  data_types: chrome.browsingData.DataTypeSet
): chrome.browsingData.DataTypeSet {
  return {
    cache: data_types.cache,
    cookies: data_types.cookies,
    localStorage: data_types.localStorage,
    indexedDB: data_types.indexedDB,
    serviceWorkers: data_types.serviceWorkers,
    fileSystems: data_types.fileSystems,
    webSQL: data_types.webSQL
  };
}

function CreateUnfilteredDataTypeSet(
  data_types: chrome.browsingData.DataTypeSet
): chrome.browsingData.DataTypeSet {
  return {
    history: data_types.history,
    downloads: data_types.downloads,
    formData: data_types.formData,
    pluginData: data_types.pluginData
  };
}

function CreateRemovalPlans(
  settings: Settings,
  data_types: chrome.browsingData.DataTypeSet
): ReadonlyArray<{
  removal_options: chrome.browsingData.RemovalOptions;
  data_types: chrome.browsingData.DataTypeSet;
}> {
  const base_options: chrome.browsingData.RemovalOptions = {
    since: GetSinceTimestamp(settings.time_range)
  };
  const removal_options = CreateRemovalOptions(settings);

  if (!removal_options.excludeOrigins?.length) {
    return [{ removal_options: base_options, data_types }];
  }

  const origin_filterable_data_types =
    CreateOriginFilterableDataTypeSet(data_types);
  const unfiltered_data_types = CreateUnfilteredDataTypeSet(data_types);

  return [
    HasSelectedDataType(origin_filterable_data_types)
      ? {
          removal_options,
          data_types: origin_filterable_data_types
        }
      : null,
    HasSelectedDataType(unfiltered_data_types)
      ? {
          removal_options: base_options,
          data_types: unfiltered_data_types
        }
      : null
  ].filter(
    (
      removal_plan
    ): removal_plan is {
      removal_options: chrome.browsingData.RemovalOptions;
      data_types: chrome.browsingData.DataTypeSet;
    } => removal_plan !== null
  );
}

async function ReadSettings(): Promise<Settings> {
  const stored = (await chrome.storage.sync.get(CHROME_STORAGE_KEY)) as Record<
    string,
    Partial<Settings> | undefined
  >;

  return MergeSettings(stored[CHROME_STORAGE_KEY] ?? {});
}

async function WriteSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [CHROME_STORAGE_KEY]: settings });
}

async function ShowNotification(
  trigger: CleanupTrigger,
  title: string,
  message: string
): Promise<void> {
  try {
    await chrome.notifications.create(CLEANUP_NOTIFICATION_IDS[trigger], {
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title,
      message
    });
  } catch (error) {
    console.error('[background] Failed to show notification:', error);
  }
}

async function RunBrowserDataCleanup(
  trigger: CleanupTrigger
): Promise<CleanupResult> {
  const settings = await ReadSettings();

  if (!settings.is_enabled) {
    return {
      success: false,
      error: 'Extension is disabled.'
    };
  }

  const data_types = CreateDataTypeSet(settings.data_types);

  if (!HasSelectedDataType(data_types)) {
    return {
      success: false,
      error: 'Select at least one data type before clearing.'
    };
  }

  let history_backup_warning: string | undefined;

  try {
    const history_backup_result = await SaveHistoryBackupBeforeCleanup(
      settings,
      trigger
    );

    if (!history_backup_result.success) {
      history_backup_warning = HISTORY_BACKUP_WARNING_MESSAGE;
    }

    const removal_plans = CreateRemovalPlans(settings, data_types);

    for (const removal_plan of removal_plans) {
      await chrome.browsingData.remove(
        removal_plan.removal_options,
        removal_plan.data_types
      );
    }
  } catch (error) {
    const error_message = GetErrorMessage(error);

    if (settings.show_notifications) {
      await ShowNotification(
        trigger,
        'Unable to clear browser data',
        error_message
      );
    }

    return {
      success: false,
      error: error_message
    };
  }

  let response_settings = settings;

  try {
    const latest_settings = await ReadSettings();
    const next_settings: Settings = {
      ...latest_settings,
      statistics: {
        total_count: latest_settings.statistics.total_count + 1,
        last_date: new Date().toISOString()
      }
    };

    await WriteSettings(next_settings);
    response_settings = next_settings;
  } catch (error) {
    console.error('[background] Failed to update cleanup statistics:', error);
  }

  if (settings.show_notifications) {
    await ShowNotification(
      trigger,
      'Browser data cleared',
      history_backup_warning ?? 'Selected browser data has been cleared.'
    );
  }

  return {
    success: true,
    settings: response_settings,
    warning: history_backup_warning
  };
}

export async function ClearBrowserData(
  trigger: CleanupTrigger
): Promise<CleanupResult> {
  const previous_cleanup_task = active_cleanup_task;
  const next_cleanup_task = (previous_cleanup_task ?? Promise.resolve())
    .catch(error => {
      console.error('[background] Previous cleanup failed:', error);
    })
    .then(() => RunBrowserDataCleanup(trigger));

  active_cleanup_task = next_cleanup_task;
  void next_cleanup_task
    .finally(() => {
      if (active_cleanup_task === next_cleanup_task) {
        active_cleanup_task = null;
      }
    })
    .catch(error => {
      console.error('[background] Failed to release cleanup task:', error);
    });

  return next_cleanup_task;
}
