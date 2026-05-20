import type { HistoryBackupRecord } from './history-backup';

export type DeleteHistoryBackupMessage = {
  action: 'delete-history-backup';
  backup_id: string;
};

export type DeleteAllHistoryBackupsMessage = {
  action: 'delete-all-history-backups';
};

export type HistoryBackupMutationResponse =
  | {
      success: true;
      records: HistoryBackupRecord[];
    }
  | {
      success: false;
      error: string;
    };
