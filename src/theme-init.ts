import type { Settings } from '@/features/settings';
import {
  CHROME_STORAGE_KEY,
  DEFAULT_SETTINGS,
  LOCAL_STORAGE_KEY,
  MergeSettings
} from '@/features/settings';
import { ApplyTheme } from '@/features/theme';

function ReadCachedSettings(): Settings {
  try {
    const raw_settings = localStorage.getItem(LOCAL_STORAGE_KEY);
    const parsed_settings = raw_settings ? JSON.parse(raw_settings) : null;

    return parsed_settings && typeof parsed_settings === 'object'
      ? MergeSettings(parsed_settings as Partial<Settings>)
      : DEFAULT_SETTINGS;
  } catch (error) {
    console.warn('[theme-init] Failed to read cached theme:', error);
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    return DEFAULT_SETTINGS;
  }
}

function CacheSyncedSettings(settings: Settings): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
}

try {
  ApplyTheme(ReadCachedSettings().theme);
  if (typeof chrome !== 'undefined' && chrome.storage?.sync) {
    chrome.storage.sync
      .get(CHROME_STORAGE_KEY)
      .then(data => {
        const synced_settings = data?.[CHROME_STORAGE_KEY];

        if (synced_settings && typeof synced_settings === 'object') {
          const next_settings = MergeSettings(
            synced_settings as Partial<Settings>
          );

          CacheSyncedSettings(next_settings);
          ApplyTheme(next_settings.theme);
        }
      })
      .catch(error => {
        console.warn('[theme-init] Failed to read synced theme:', error);
      });
  }
} catch (error) {
  console.warn('[theme-init] Failed to initialize theme:', error);
  ApplyTheme(DEFAULT_SETTINGS.theme);
}
