import { IsChromeExtension } from '@/lib/is-chrome-extension';
import { useCallback, useEffect, useState } from 'react';
import { HISTORY_BACKUP_SAVE_ERROR_MESSAGE } from '../constants/messages';
import {
  HISTORY_BACKUP_STORAGE_KEY,
  LOCAL_HISTORY_BACKUP_STORAGE_KEY
} from '../constants/storage';
import { NormalizeHistoryBackupRecords } from '../lib/history-backup-records';
import type { HistoryBackupRecord } from '../types/history-backup';
import type { HistoryBackupMutationResponse } from '../types/message';

function CacheLocalHistoryBackups(records: HistoryBackupRecord[]): void {
  try {
    localStorage.setItem(
      LOCAL_HISTORY_BACKUP_STORAGE_KEY,
      JSON.stringify(records)
    );
  } catch (error) {
    console.error('Failed to cache history backups locally:', error);
  }
}

export function UseHistoryBackups() {
  const [records, set_records] = useState<HistoryBackupRecord[]>([]);
  const [is_loading, set_is_loading] = useState(true);
  const [error_message, set_error_message] = useState<string | null>(null);

  const LoadHistoryBackups = useCallback(async () => {
    set_is_loading(true);
    try {
      if (IsChromeExtension()) {
        const stored = (await chrome.storage.local.get(
          HISTORY_BACKUP_STORAGE_KEY
        )) as Record<string, unknown>;
        const normalized_records = NormalizeHistoryBackupRecords(
          stored[HISTORY_BACKUP_STORAGE_KEY]
        );

        set_records(normalized_records);
        CacheLocalHistoryBackups(normalized_records);
      } else {
        const stored = localStorage.getItem(LOCAL_HISTORY_BACKUP_STORAGE_KEY);

        set_records(
          stored ? NormalizeHistoryBackupRecords(JSON.parse(stored)) : []
        );
      }

      set_error_message(null);
    } catch (error) {
      console.error('Failed to load history backups:', error);
      set_error_message('Unable to load history backups.');
    } finally {
      set_is_loading(false);
    }
  }, []);

  const SaveHistoryBackups = useCallback(
    async (next_records: HistoryBackupRecord[]) => {
      try {
        localStorage.setItem(
          LOCAL_HISTORY_BACKUP_STORAGE_KEY,
          JSON.stringify(next_records)
        );
        CacheLocalHistoryBackups(next_records);
        set_records(next_records);
        set_error_message(null);
      } catch (error) {
        console.error('Failed to save history backups:', error);
        set_error_message(HISTORY_BACKUP_SAVE_ERROR_MESSAGE);
      }
    },
    []
  );

  const ApplyHistoryBackupMutationResponse = useCallback(
    (response: HistoryBackupMutationResponse | undefined) => {
      if (!response?.success) {
        set_error_message(response?.error ?? HISTORY_BACKUP_SAVE_ERROR_MESSAGE);

        return;
      }

      const normalized_records = NormalizeHistoryBackupRecords(
        response.records
      );

      CacheLocalHistoryBackups(normalized_records);
      set_records(normalized_records);
      set_error_message(null);
    },
    []
  );

  const DeleteHistoryBackup = useCallback(
    async (backup_id: string) => {
      if (IsChromeExtension()) {
        try {
          const response = (await chrome.runtime.sendMessage({
            action: 'delete-history-backup',
            backup_id
          })) as HistoryBackupMutationResponse;

          ApplyHistoryBackupMutationResponse(response);
        } catch (error) {
          console.error('Failed to delete history backup:', error);
          set_error_message(HISTORY_BACKUP_SAVE_ERROR_MESSAGE);
        }

        return;
      }

      await SaveHistoryBackups(
        records.filter(record => record.backup_id !== backup_id)
      );
    },
    [ApplyHistoryBackupMutationResponse, SaveHistoryBackups, records]
  );

  const DeleteAllHistoryBackups = useCallback(async () => {
    if (IsChromeExtension()) {
      try {
        const response = (await chrome.runtime.sendMessage({
          action: 'delete-all-history-backups'
        })) as HistoryBackupMutationResponse;

        ApplyHistoryBackupMutationResponse(response);
      } catch (error) {
        console.error('Failed to delete history backups:', error);
        set_error_message(HISTORY_BACKUP_SAVE_ERROR_MESSAGE);
      }

      return;
    }

    await SaveHistoryBackups([]);
  }, [ApplyHistoryBackupMutationResponse, SaveHistoryBackups]);

  useEffect(() => {
    LoadHistoryBackups();
  }, [LoadHistoryBackups]);

  useEffect(() => {
    if (!IsChromeExtension()) return;
    const HandleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      area_name: string
    ) => {
      if (area_name !== 'local') return;
      if (!changes[HISTORY_BACKUP_STORAGE_KEY]) return;
      const normalized_records = NormalizeHistoryBackupRecords(
        changes[HISTORY_BACKUP_STORAGE_KEY].newValue
      );

      set_records(normalized_records);
      CacheLocalHistoryBackups(normalized_records);
    };

    chrome.storage.onChanged.addListener(HandleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(HandleStorageChange);
    };
  }, []);

  return {
    records,
    is_loading,
    error_message,
    LoadHistoryBackups,
    DeleteHistoryBackup,
    DeleteAllHistoryBackups
  };
}
