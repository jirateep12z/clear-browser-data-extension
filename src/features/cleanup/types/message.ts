import type { Settings } from '@/features/settings';

export type ClearBrowsingDataMessage = {
  action: 'clear-browsing-data';
};

export type ClearBrowsingDataResponse =
  | {
      success: true;
      settings: Settings;
      warning?: string;
    }
  | {
      success: false;
      error: string;
    };
