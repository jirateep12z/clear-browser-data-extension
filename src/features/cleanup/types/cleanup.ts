import type { Settings } from '@/features/settings';

export type CleanupResult =
  | {
      success: true;
      settings: Settings;
      warning?: string;
    }
  | {
      success: false;
      error: string;
    };
