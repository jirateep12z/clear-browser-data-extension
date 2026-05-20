import type { CleanupTrigger, TimeRange } from '@/features/settings';

export type HistoryBackupEntry = {
  url: string;
  title: string;
  domain: string;
  last_visit_time: number | null;
  visit_count: number;
  typed_count: number;
};

export type HistoryBackupRecord = {
  backup_id: string;
  created_at: string;
  trigger: CleanupTrigger;
  time_range: TimeRange;
  entries_count: number;
  entries: HistoryBackupEntry[];
};

export type HistoryBackupSortKey =
  'newest' | 'oldest' | 'domain_asc' | 'title_asc';

export type HistoryBackupTriggerFilter = CleanupTrigger | 'all';
export type HistoryBackupTimeRangeFilter = TimeRange | 'all';

export type HistoryBackupFilterState = {
  keyword: string;
  domain: string;
  entry_start_date: string;
  entry_end_date: string;
  backup_start_date: string;
  backup_end_date: string;
  trigger_key: HistoryBackupTriggerFilter;
  time_range: HistoryBackupTimeRangeFilter;
  sort_key: HistoryBackupSortKey;
  is_grouped_by_domain: boolean;
};

export type HistoryBackupDisplayEntry = HistoryBackupEntry & {
  backup_id: string;
  backup_created_at: string;
  trigger: CleanupTrigger;
  time_range: TimeRange;
};

export type HistoryBackupResult =
  | {
      success: true;
      skipped: false;
      record: HistoryBackupRecord;
    }
  | {
      success: true;
      skipped: true;
    }
  | {
      success: false;
      error: string;
    };
