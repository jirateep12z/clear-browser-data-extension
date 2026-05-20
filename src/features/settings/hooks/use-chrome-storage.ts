import { IsChromeExtension } from '@/lib/is-chrome-extension';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SAVE_SETTINGS_ERROR_MESSAGE } from '../constants/messages';
import { DEFAULT_SETTINGS } from '../constants/settings';
import {
  CHROME_STORAGE_AREA,
  CHROME_STORAGE_KEY,
  LOCAL_STORAGE_KEY
} from '../constants/storage';
import { MergeSettings } from '../lib/merge-settings';
import type {
  GetSettingsMessage,
  GetSettingsResponse,
  SaveSettingsMessage,
  SaveSettingsResponse
} from '../types/message';
import type { Settings } from '../types/settings';

function CacheLocalSettings(settings: Settings): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to cache settings locally:', error);
  }
}

export function UseChromeStorage() {
  const [settings, set_settings] = useState<Settings>(DEFAULT_SETTINGS);
  const [is_loading, set_is_loading] = useState(true);
  const [save_error_message, set_save_error_message] = useState<string | null>(
    null
  );
  const settings_ref = useRef<Settings>(DEFAULT_SETTINGS);
  const last_persisted_settings = useRef<Settings>(DEFAULT_SETTINGS);
  const queued_settings = useRef<Settings | null>(null);
  const is_save_processing = useRef(false);
  const pending_external_settings = useRef<Settings | null>(null);

  const CommitSettings = useCallback((next_settings: Settings) => {
    CacheLocalSettings(next_settings);
    settings_ref.current = next_settings;
    last_persisted_settings.current = next_settings;
    set_settings(current => {
      return JSON.stringify(current) === JSON.stringify(next_settings)
        ? current
        : next_settings;
    });
  }, []);

  const PersistSettings = useCallback(
    async (next_settings: Settings): Promise<boolean> => {
      try {
        if (IsChromeExtension()) {
          const message: SaveSettingsMessage = {
            action: 'save-settings',
            settings: next_settings
          };
          const response = (await chrome.runtime.sendMessage(
            message
          )) as SaveSettingsResponse;

          if (!response?.success) {
            console.error('Failed to save settings:', response?.error);
            set_save_error_message(
              response?.error ?? SAVE_SETTINGS_ERROR_MESSAGE
            );

            return false;
          }

          CacheLocalSettings(next_settings);
        } else {
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(next_settings)
          );
        }

        last_persisted_settings.current = next_settings;
        set_save_error_message(null);

        return true;
      } catch (error) {
        console.error('Failed to save settings:', error);
        set_save_error_message(SAVE_SETTINGS_ERROR_MESSAGE);

        return false;
      }
    },
    []
  );

  const FlushSaveQueue = useCallback(async () => {
    if (is_save_processing.current) return;
    is_save_processing.current = true;
    try {
      while (queued_settings.current) {
        const next_settings = queued_settings.current;

        queued_settings.current = null;
        const did_persist = await PersistSettings(next_settings);

        if (!did_persist && !queued_settings.current) {
          CommitSettings(last_persisted_settings.current);
        }
      }
    } finally {
      is_save_processing.current = false;

      if (pending_external_settings.current) {
        const next_settings = pending_external_settings.current;

        pending_external_settings.current = null;
        CommitSettings(next_settings);
      }
    }
  }, [CommitSettings, PersistSettings]);

  const LoadSettings = useCallback(async () => {
    set_is_loading(true);
    try {
      if (IsChromeExtension()) {
        const message: GetSettingsMessage = {
          action: 'get-settings'
        };
        const response = (await chrome.runtime.sendMessage(
          message
        )) as GetSettingsResponse;
        const partial = response as Partial<Settings>;
        const merged_settings = MergeSettings(partial);

        CommitSettings(merged_settings);
      } else {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);

        if (stored) {
          const parsed = JSON.parse(stored);

          if (parsed && typeof parsed === 'object') {
            CommitSettings(MergeSettings(parsed as Partial<Settings>));
          }
        }
      }

      set_save_error_message(null);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      set_is_loading(false);
    }
  }, [CommitSettings]);

  const SaveSettings = useCallback(
    async (new_settings: Settings) => {
      if (JSON.stringify(settings_ref.current) === JSON.stringify(new_settings))
        return;
      set_save_error_message(null);
      settings_ref.current = new_settings;
      queued_settings.current = new_settings;
      set_settings(new_settings);
      await FlushSaveQueue();
    },
    [FlushSaveQueue]
  );

  useEffect(() => {
    settings_ref.current = settings;
  }, [settings]);

  useEffect(() => {
    LoadSettings();
  }, [LoadSettings]);

  useEffect(() => {
    if (!IsChromeExtension()) return;
    const HandleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area_name: string
    ) => {
      if (area_name === CHROME_STORAGE_AREA && changes[CHROME_STORAGE_KEY]) {
        const new_value = changes[CHROME_STORAGE_KEY].newValue;
        const next_settings =
          new_value && typeof new_value === 'object'
            ? MergeSettings(new_value as Partial<Settings>)
            : DEFAULT_SETTINGS;

        if (is_save_processing.current) {
          pending_external_settings.current = next_settings;

          return;
        }

        CommitSettings(next_settings);
      }
    };

    chrome.storage.onChanged.addListener(HandleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(HandleStorageChange);
    };
  }, [CommitSettings]);

  const GetLatestSettings = useCallback(() => settings_ref.current, []);

  return {
    settings,
    is_loading,
    save_error_message,
    SaveSettings,
    GetLatestSettings
  };
}
