import type { Settings } from './settings';

export type GetSettingsMessage = {
  action: 'get-settings';
};

export type SaveSettingsMessage = {
  action: 'save-settings';
  settings: Partial<Settings>;
};

export type GetSettingsResponse = Settings;

export type SaveSettingsResponse =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };
