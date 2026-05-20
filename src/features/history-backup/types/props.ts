import type { HistoryBackupRecord } from './history-backup';

export type HistoryBackupPanelProps = {
  records: HistoryBackupRecord[];
  is_loading: boolean;
  error_message: string | null;
  OnDeleteAllHistoryBackups: () => void;
  OnDeleteHistoryBackup: (backup_id: string) => void;
  OnReloadHistoryBackups: () => void;
};
