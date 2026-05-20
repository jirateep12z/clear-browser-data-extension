import type {
  HistoryBackupFilterState,
  HistoryBackupSortKey
} from '../types/history-backup';

export const HISTORY_BACKUP_MAX_RESULTS = 10000;

export const DEFAULT_HISTORY_BACKUP_FILTERS: HistoryBackupFilterState = {
  keyword: '',
  domain: '',
  entry_start_date: '',
  entry_end_date: '',
  backup_start_date: '',
  backup_end_date: '',
  trigger_key: 'all',
  time_range: 'all',
  sort_key: 'newest',
  is_grouped_by_domain: false
};

export const HISTORY_BACKUP_SORT_OPTIONS: ReadonlyArray<{
  value: HistoryBackupSortKey;
  label: string;
}> = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'domain_asc', label: 'Domain A-Z' },
  { value: 'title_asc', label: 'Title A-Z' }
];
