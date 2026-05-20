import { ClearBrowserData, SyncScheduledCleanup } from '@/features/cleanup';
import type {
  DeleteAllHistoryBackupsMessage,
  DeleteHistoryBackupMessage
} from '@/features/history-backup';
import {
  DeleteAllHistoryBackupRecords,
  DeleteHistoryBackupRecord
} from '@/features/history-backup';
import type { SaveSettingsMessage, Settings } from '@/features/settings';
import {
  CHROME_STORAGE_KEY,
  DEFAULT_SETTINGS,
  MergeSettings
} from '@/features/settings';

function IsRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function IsGetSettingsMessage(message: unknown): boolean {
  return IsRecord(message) && message.action === 'get-settings';
}

function IsClearBrowsingDataMessage(message: unknown): boolean {
  return IsRecord(message) && message.action === 'clear-browsing-data';
}

function IsDeleteHistoryBackupMessage(
  message: unknown
): message is DeleteHistoryBackupMessage {
  return (
    IsRecord(message) &&
    message.action === 'delete-history-backup' &&
    typeof message.backup_id === 'string' &&
    message.backup_id.length > 0
  );
}

function IsDeleteAllHistoryBackupsMessage(
  message: unknown
): message is DeleteAllHistoryBackupsMessage {
  return IsRecord(message) && message.action === 'delete-all-history-backups';
}

function IsSaveSettingsMessage(
  message: unknown
): message is SaveSettingsMessage {
  return (
    IsRecord(message) &&
    message.action === 'save-settings' &&
    IsRecord(message.settings)
  );
}

export function HandleMessage(
  message: unknown,
  sender: chrome.runtime.MessageSender,
  SendResponse: (response: unknown) => void
): boolean {
  if (sender.id !== chrome.runtime.id) return false;
  if (IsGetSettingsMessage(message)) {
    chrome.storage.sync
      .get(CHROME_STORAGE_KEY)
      .then(data => {
        const stored = data[CHROME_STORAGE_KEY] as
          Partial<Settings> | undefined;

        SendResponse(MergeSettings(stored ?? {}));
      })
      .catch(error => {
        console.error(
          '[background] Failed to read settings from storage:',
          error
        );
        SendResponse(DEFAULT_SETTINGS);
      });

    return true;
  }

  if (IsRecord(message) && message.action === 'save-settings') {
    if (!IsSaveSettingsMessage(message)) {
      SendResponse({
        success: false,
        error: 'Invalid settings payload.'
      });

      return false;
    }

    const validated = MergeSettings(message.settings);

    chrome.storage.sync
      .set({ [CHROME_STORAGE_KEY]: validated })
      .then(() => SyncScheduledCleanup(validated))
      .then(() => {
        SendResponse({ success: true });
      })
      .catch(error => {
        console.error('[background] Failed to save settings:', error);
        SendResponse({
          success: false,
          error: 'Unable to save settings. Please try again.'
        });
      });

    return true;
  }

  if (IsClearBrowsingDataMessage(message)) {
    ClearBrowserData('manual')
      .then(response => {
        SendResponse(response);
      })
      .catch(error => {
        console.error('[background] Failed to clear browser data:', error);
        SendResponse({
          success: false,
          error: 'Unable to clear browser data. Please try again.'
        });
      });

    return true;
  }

  if (IsRecord(message) && message.action === 'delete-history-backup') {
    if (!IsDeleteHistoryBackupMessage(message)) {
      SendResponse({
        success: false,
        error: 'Invalid history backup payload.'
      });

      return false;
    }

    DeleteHistoryBackupRecord(message.backup_id)
      .then(records => {
        SendResponse({ success: true, records });
      })
      .catch(error => {
        console.error('[background] Failed to delete history backup:', error);
        SendResponse({
          success: false,
          error: 'Unable to update history backups. Please try again.'
        });
      });

    return true;
  }

  if (IsDeleteAllHistoryBackupsMessage(message)) {
    DeleteAllHistoryBackupRecords()
      .then(records => {
        SendResponse({ success: true, records });
      })
      .catch(error => {
        console.error('[background] Failed to delete history backups:', error);
        SendResponse({
          success: false,
          error: 'Unable to update history backups. Please try again.'
        });
      });

    return true;
  }

  return false;
}
