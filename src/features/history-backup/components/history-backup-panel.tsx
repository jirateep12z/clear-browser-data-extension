import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  CLEANUP_TRIGGER_OPTIONS,
  TIME_RANGE_OPTIONS
} from '@/features/settings';
import { FormatDate } from '@/lib/format-date';
import { Cn } from '@/lib/utils';
import { format as FormatDateFns } from 'date-fns';
import {
  CalendarIcon,
  Check,
  Download,
  Eye,
  Filter,
  FolderClock,
  RefreshCcw,
  Search,
  Trash2
} from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import {
  DEFAULT_HISTORY_BACKUP_FILTERS,
  HISTORY_BACKUP_SORT_OPTIONS
} from '../constants/history-backup';
import type {
  HistoryBackupDisplayEntry,
  HistoryBackupFilterState,
  HistoryBackupRecord,
  HistoryBackupSortKey,
  HistoryBackupTimeRangeFilter,
  HistoryBackupTriggerFilter
} from '../types/history-backup';
import type { HistoryBackupPanelProps } from '../types/props';

const TEXT_INPUT_CLASS_NAME =
  'border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 min-w-0 rounded-md border px-3 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50';

type HistoryBackupDatePickerProps = {
  id: string;
  value: string;
  OnValueChange: (value: string) => void;
};

type HistoryBackupEntryScope =
  | {
      scope_key: 'none';
    }
  | {
      scope_key: 'all';
    }
  | {
      scope_key: 'batch';
      backup_id: string;
    };

const DEFAULT_HISTORY_BACKUP_ENTRY_SCOPE: HistoryBackupEntryScope = {
  scope_key: 'none'
};

function CreateDateStartTimestamp(date_value: string): number | null {
  if (!date_value) return null;
  const timestamp = new Date(`${date_value}T00:00:00`).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
}

function CreateDateEndTimestamp(date_value: string): number | null {
  if (!date_value) return null;
  const timestamp = new Date(`${date_value}T23:59:59.999`).getTime();

  return Number.isFinite(timestamp) ? timestamp : null;
}

function NormalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function ParseFilterDateValue(date_value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date_value);

  if (!match) return undefined;
  const year = Number(match[1]);
  const month_index = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month_index, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month_index ||
    date.getDate() !== day
  ) {
    return undefined;
  }

  return date;
}

function FormatFilterDateValue(date: Date): string {
  return FormatDateFns(date, 'yyyy-MM-dd');
}

function FormatDatePickerLabel(date_value: string): string {
  const date = ParseFilterDateValue(date_value);

  return date ? FormatDateFns(date, 'MMM d, yyyy') : 'Pick date';
}

function CreateDisplayEntries(
  records: HistoryBackupRecord[]
): HistoryBackupDisplayEntry[] {
  return records.flatMap(record => {
    return record.entries.map(entry => ({
      ...entry,
      backup_id: record.backup_id,
      backup_created_at: record.created_at,
      trigger: record.trigger,
      time_range: record.time_range
    }));
  });
}

function CreateScopedHistoryBackupRecords(
  records: HistoryBackupRecord[],
  entry_scope: HistoryBackupEntryScope
): HistoryBackupRecord[] {
  if (entry_scope.scope_key === 'none') return [];
  if (entry_scope.scope_key === 'all') return records;

  return records.filter(record => record.backup_id === entry_scope.backup_id);
}

function ResolveHistoryBackupEntryScope(
  records: HistoryBackupRecord[],
  entry_scope: HistoryBackupEntryScope
): HistoryBackupEntryScope {
  if (entry_scope.scope_key === 'all') {
    return records.length > 0
      ? entry_scope
      : DEFAULT_HISTORY_BACKUP_ENTRY_SCOPE;
  }

  if (entry_scope.scope_key === 'batch') {
    return records.some(record => record.backup_id === entry_scope.backup_id)
      ? entry_scope
      : DEFAULT_HISTORY_BACKUP_ENTRY_SCOPE;
  }

  return entry_scope;
}

function HasSelectedHistoryBackupScope(
  entry_scope: HistoryBackupEntryScope
): boolean {
  return entry_scope.scope_key !== 'none';
}

function IsSelectedHistoryBackupBatch(
  entry_scope: HistoryBackupEntryScope,
  backup_id: string
): boolean {
  return (
    entry_scope.scope_key === 'batch' && entry_scope.backup_id === backup_id
  );
}

function MatchesEntryDateRange(
  entry: HistoryBackupDisplayEntry,
  filters: HistoryBackupFilterState
): boolean {
  const start_time = CreateDateStartTimestamp(filters.entry_start_date);
  const end_time = CreateDateEndTimestamp(filters.entry_end_date);

  if (start_time === null && end_time === null) return true;
  if (entry.last_visit_time === null) return false;
  if (start_time !== null && entry.last_visit_time < start_time) return false;

  return !(end_time !== null && entry.last_visit_time > end_time);
}

function MatchesBackupDateRange(
  entry: HistoryBackupDisplayEntry,
  filters: HistoryBackupFilterState
): boolean {
  return MatchesBackupTimestampRange(entry.backup_created_at, filters);
}

function MatchesBackupTimestampRange(
  backup_created_at: string,
  filters: HistoryBackupFilterState
): boolean {
  const start_time = CreateDateStartTimestamp(filters.backup_start_date);
  const end_time = CreateDateEndTimestamp(filters.backup_end_date);

  if (start_time === null && end_time === null) return true;
  const backup_time = new Date(backup_created_at).getTime();

  if (!Number.isFinite(backup_time)) return false;
  if (start_time !== null && backup_time < start_time) return false;

  return !(end_time !== null && backup_time > end_time);
}

function FilterDisplayEntries(
  entries: HistoryBackupDisplayEntry[],
  filters: HistoryBackupFilterState
): HistoryBackupDisplayEntry[] {
  const keyword = NormalizeSearchText(filters.keyword);
  const domain = NormalizeSearchText(filters.domain);

  return entries.filter(entry => {
    const searchable_text = `${entry.title} ${entry.url} ${entry.domain}`
      .toLowerCase()
      .trim();

    if (keyword && !searchable_text.includes(keyword)) return false;
    if (domain && !entry.domain.toLowerCase().includes(domain)) return false;
    if (filters.trigger_key !== 'all' && entry.trigger !== filters.trigger_key)
      return false;
    if (filters.time_range !== 'all' && entry.time_range !== filters.time_range)
      return false;
    if (!MatchesEntryDateRange(entry, filters)) return false;

    return MatchesBackupDateRange(entry, filters);
  });
}

function CreateSortableEntryTimestamp(
  entry: HistoryBackupDisplayEntry
): number {
  if (entry.last_visit_time !== null) return entry.last_visit_time;
  const backup_time = new Date(entry.backup_created_at).getTime();

  return Number.isFinite(backup_time) ? backup_time : 0;
}

function SortDisplayEntries(
  entries: HistoryBackupDisplayEntry[],
  sort_key: HistoryBackupSortKey
): HistoryBackupDisplayEntry[] {
  return [...entries].sort((first_entry, second_entry) => {
    if (sort_key === 'oldest') {
      return (
        CreateSortableEntryTimestamp(first_entry) -
        CreateSortableEntryTimestamp(second_entry)
      );
    }

    if (sort_key === 'domain_asc') {
      return first_entry.domain.localeCompare(second_entry.domain);
    }

    if (sort_key === 'title_asc') {
      return first_entry.title.localeCompare(second_entry.title);
    }

    return (
      CreateSortableEntryTimestamp(second_entry) -
      CreateSortableEntryTimestamp(first_entry)
    );
  });
}

function GroupDisplayEntries(entries: HistoryBackupDisplayEntry[]) {
  const groups = new Map<string, HistoryBackupDisplayEntry[]>();

  entries.forEach(entry => {
    const group_key = entry.domain || 'Unknown domain';

    groups.set(group_key, [...(groups.get(group_key) ?? []), entry]);
  });

  return Array.from(groups.entries()).sort(
    ([first_domain], [second_domain]) => {
      return first_domain.localeCompare(second_domain);
    }
  );
}

function CreateFilteredRecords(
  records: HistoryBackupRecord[],
  entries: HistoryBackupDisplayEntry[],
  filters: HistoryBackupFilterState
): HistoryBackupRecord[] {
  const entries_by_backup_id = new Map<string, HistoryBackupDisplayEntry[]>();

  entries.forEach(entry => {
    entries_by_backup_id.set(entry.backup_id, [
      ...(entries_by_backup_id.get(entry.backup_id) ?? []),
      entry
    ]);
  });

  return records
    .map(record => {
      const record_entries = entries_by_backup_id.get(record.backup_id) ?? [];

      return {
        ...record,
        entries_count: record_entries.length,
        entries: record_entries.map(entry => ({
          url: entry.url,
          title: entry.title,
          domain: entry.domain,
          last_visit_time: entry.last_visit_time,
          visit_count: entry.visit_count,
          typed_count: entry.typed_count
        }))
      };
    })
    .filter(record => {
      if (record.entries_count > 0) return true;

      return (
        record.entries.length === 0 &&
        MatchesEmptyHistoryBackupRecord(record, filters)
      );
    });
}

function HasEntryScopedFilters(filters: HistoryBackupFilterState): boolean {
  return Boolean(
    filters.keyword ||
    filters.domain ||
    filters.entry_start_date ||
    filters.entry_end_date
  );
}

function MatchesEmptyHistoryBackupRecord(
  record: HistoryBackupRecord,
  filters: HistoryBackupFilterState
): boolean {
  if (record.entries.length > 0) return false;
  if (HasEntryScopedFilters(filters)) return false;
  if (filters.trigger_key !== 'all' && record.trigger !== filters.trigger_key) {
    return false;
  }

  if (
    filters.time_range !== 'all' &&
    record.time_range !== filters.time_range
  ) {
    return false;
  }

  return MatchesBackupTimestampRange(record.created_at, filters);
}

function EscapeCsvCell(value: unknown): string {
  const text = String(value ?? '');

  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function DownloadTextFile(
  filename: string,
  content: string,
  content_type: string
): void {
  const blob = new Blob([content], { type: content_type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function ExportJson(
  records: HistoryBackupRecord[],
  entries: HistoryBackupDisplayEntry[],
  filters: HistoryBackupFilterState
): void {
  const payload = {
    exported_at: new Date().toISOString(),
    filters,
    records: CreateFilteredRecords(records, entries, filters)
  };

  DownloadTextFile(
    `history-backup-${Date.now()}.json`,
    JSON.stringify(payload, null, 2),
    'application/json;charset=utf-8'
  );
}

function ExportCsv(entries: HistoryBackupDisplayEntry[]): void {
  const headers = [
    'backup_id',
    'backup_created_at',
    'trigger',
    'time_range',
    'url',
    'title',
    'domain',
    'last_visit_time',
    'visit_count',
    'typed_count'
  ];
  const rows = entries.map(entry => {
    return [
      entry.backup_id,
      entry.backup_created_at,
      entry.trigger,
      entry.time_range,
      entry.url,
      entry.title,
      entry.domain,
      entry.last_visit_time ?? '',
      entry.visit_count,
      entry.typed_count
    ].map(EscapeCsvCell);
  });

  DownloadTextFile(
    `history-backup-${Date.now()}.csv`,
    [headers.map(EscapeCsvCell), ...rows].map(row => row.join(',')).join('\n'),
    'text/csv;charset=utf-8'
  );
}

function RenderEntry(entry: HistoryBackupDisplayEntry) {
  return (
    <div
      key={`${entry.backup_id}-${entry.url}`}
      className="border-border bg-card flex flex-col gap-1 rounded-md border p-3"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate text-sm font-medium">
          {entry.title || entry.url}
        </p>
        <span className="text-muted-foreground shrink-0 text-[11px]">
          {FormatDate(
            entry.last_visit_time
              ? new Date(entry.last_visit_time).toISOString()
              : null
          )}
        </span>
      </div>
      <p className="text-muted-foreground truncate text-xs">{entry.url}</p>
      <div className="text-muted-foreground flex flex-wrap gap-2 text-[11px]">
        <span>{entry.domain || 'Unknown domain'}</span>
        <span>{entry.trigger}</span>
        <span>{entry.time_range}</span>
        <span>{entry.visit_count} visits</span>
      </div>
    </div>
  );
}

function HistoryBackupDatePicker({
  id,
  value,
  OnValueChange
}: HistoryBackupDatePickerProps) {
  const selected_date = ParseFilterDateValue(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={Cn(
            'w-full justify-between font-normal',
            !selected_date && 'text-muted-foreground'
          )}
        >
          <span className="min-w-0 truncate">
            {FormatDatePickerLabel(value)}
          </span>
          <CalendarIcon data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-0 p-0">
        <Calendar
          mode="single"
          selected={selected_date}
          captionLayout="dropdown"
          onSelect={date => {
            OnValueChange(date ? FormatFilterDateValue(date) : '');
          }}
        />
        <div className="border-border border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!value}
            className="w-full"
            onClick={() => {
              OnValueChange('');
            }}
          >
            Clear date
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const HistoryBackupPanel = memo(function HistoryBackupPanel({
  records,
  is_loading,
  error_message,
  OnDeleteAllHistoryBackups,
  OnDeleteHistoryBackup,
  OnReloadHistoryBackups
}: HistoryBackupPanelProps) {
  const [filters, set_filters] = useState<HistoryBackupFilterState>(
    DEFAULT_HISTORY_BACKUP_FILTERS
  );
  const [entry_scope, set_entry_scope] = useState<HistoryBackupEntryScope>(
    DEFAULT_HISTORY_BACKUP_ENTRY_SCOPE
  );
  const effective_entry_scope = useMemo(() => {
    return ResolveHistoryBackupEntryScope(records, entry_scope);
  }, [records, entry_scope]);
  const scoped_records = useMemo(() => {
    return CreateScopedHistoryBackupRecords(records, effective_entry_scope);
  }, [records, effective_entry_scope]);
  const display_entries = useMemo(
    () => CreateDisplayEntries(scoped_records),
    [scoped_records]
  );
  const filtered_entries = useMemo(() => {
    return SortDisplayEntries(
      FilterDisplayEntries(display_entries, filters),
      filters.sort_key
    );
  }, [display_entries, filters]);
  const grouped_entries = useMemo(() => {
    return GroupDisplayEntries(filtered_entries);
  }, [filtered_entries]);
  const matching_empty_backup_records = useMemo(() => {
    return scoped_records.filter(record => {
      return MatchesEmptyHistoryBackupRecord(record, filters);
    });
  }, [scoped_records, filters]);
  const has_backup_records = records.length > 0;
  const has_selected_entry_scope = HasSelectedHistoryBackupScope(
    effective_entry_scope
  );
  const total_entries_count = display_entries.length;
  const has_filtered_entries = filtered_entries.length > 0;
  const is_export_disabled =
    !has_selected_entry_scope ||
    (!has_filtered_entries && matching_empty_backup_records.length === 0);

  const UpdateFilters = (
    partial_filters: Partial<HistoryBackupFilterState>
  ) => {
    set_filters(current_filters => ({
      ...current_filters,
      ...partial_filters
    }));
  };

  const HandleDeleteHistoryBackup = (backup_id: string) => {
    if (IsSelectedHistoryBackupBatch(effective_entry_scope, backup_id)) {
      set_entry_scope(DEFAULT_HISTORY_BACKUP_ENTRY_SCOPE);
    }

    OnDeleteHistoryBackup(backup_id);
  };

  const HandleDeleteAllHistoryBackups = () => {
    set_entry_scope(DEFAULT_HISTORY_BACKUP_ENTRY_SCOPE);
    OnDeleteAllHistoryBackups();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span className="flex min-w-0 items-center gap-2">
            <FolderClock className="size-4" />
            History Backup
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Reload history backups"
            onClick={OnReloadHistoryBackups}
          >
            <RefreshCcw />
          </Button>
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex gap-2">
          <Label htmlFor="backup-keyword" className="sr-only">
            Search history backups
          </Label>
          <div className="relative min-w-0 flex-1">
            <Search className="text-muted-foreground pointer-events-none absolute top-2.5 left-2.5 size-4" />
            <input
              id="backup-keyword"
              value={filters.keyword}
              placeholder="Search URL, title, domain"
              className={`${TEXT_INPUT_CLASS_NAME} w-full pl-8`}
              onChange={event => {
                UpdateFilters({ keyword: event.target.value });
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={is_export_disabled}
            onClick={() => {
              ExportJson(scoped_records, filtered_entries, filters);
            }}
          >
            <Download data-icon="inline-start" />
            JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            disabled={is_export_disabled}
            onClick={() => {
              ExportCsv(filtered_entries);
            }}
          >
            CSV
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-xs font-medium">
            <Filter className="size-3.5" />
            Filters
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="backup-domain" className="text-xs">
                Domain
              </Label>
              <input
                id="backup-domain"
                value={filters.domain}
                placeholder="example.com"
                className={TEXT_INPUT_CLASS_NAME}
                onChange={event => {
                  UpdateFilters({ domain: event.target.value });
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="backup-trigger" className="text-xs">
                Trigger
              </Label>
              <Select
                value={filters.trigger_key}
                onValueChange={value => {
                  UpdateFilters({
                    trigger_key: value as HistoryBackupTriggerFilter
                  });
                }}
              >
                <SelectTrigger id="backup-trigger" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All triggers</SelectItem>
                    {CLEANUP_TRIGGER_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="backup-time-range" className="text-xs">
                Cleanup range
              </Label>
              <Select
                value={filters.time_range}
                onValueChange={value => {
                  UpdateFilters({
                    time_range: value as HistoryBackupTimeRangeFilter
                  });
                }}
              >
                <SelectTrigger id="backup-time-range" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All ranges</SelectItem>
                    {TIME_RANGE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="backup-sort" className="text-xs">
                Sort
              </Label>
              <Select
                value={filters.sort_key}
                onValueChange={value => {
                  UpdateFilters({ sort_key: value as HistoryBackupSortKey });
                }}
              >
                <SelectTrigger id="backup-sort" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {HISTORY_BACKUP_SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="entry-start-date" className="text-xs">
                Entry from
              </Label>
              <HistoryBackupDatePicker
                id="entry-start-date"
                value={filters.entry_start_date}
                OnValueChange={entry_start_date => {
                  UpdateFilters({ entry_start_date });
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="entry-end-date" className="text-xs">
                Entry to
              </Label>
              <HistoryBackupDatePicker
                id="entry-end-date"
                value={filters.entry_end_date}
                OnValueChange={entry_end_date => {
                  UpdateFilters({ entry_end_date });
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="backup-start-date" className="text-xs">
                Backup from
              </Label>
              <HistoryBackupDatePicker
                id="backup-start-date"
                value={filters.backup_start_date}
                OnValueChange={backup_start_date => {
                  UpdateFilters({ backup_start_date });
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="backup-end-date" className="text-xs">
                Backup to
              </Label>
              <HistoryBackupDatePicker
                id="backup-end-date"
                value={filters.backup_end_date}
                OnValueChange={backup_end_date => {
                  UpdateFilters({ backup_end_date });
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="group-by-domain"
              className="cursor-pointer text-xs font-medium"
            >
              Group by domain
            </Label>
            <Switch
              id="group-by-domain"
              checked={filters.is_grouped_by_domain}
              className="data-checked:bg-green-500 dark:data-checked:bg-green-500 data-checked:[&_[data-slot=switch-thumb]]:bg-white"
              onCheckedChange={is_grouped_by_domain => {
                UpdateFilters({ is_grouped_by_domain });
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground text-xs">
            {filtered_entries.length} of {total_entries_count} entries
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={records.length === 0}
              >
                <Trash2 data-icon="inline-start" />
                Delete all
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete all backups?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes every saved history backup from this extension.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
                  onClick={HandleDeleteAllHistoryBackups}
                >
                  Delete backups
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {error_message ? (
          <p role="alert" className="text-destructive text-xs">
            {error_message}
          </p>
        ) : null}

        {is_loading ? (
          <p className="text-muted-foreground py-2 text-center text-sm">
            Loading backups...
          </p>
        ) : !has_backup_records ? (
          <p className="text-muted-foreground py-2 text-center text-sm">
            No history backup entries found.
          </p>
        ) : !has_selected_entry_scope ? (
          <p className="text-muted-foreground py-2 text-center text-sm">
            Select a backup batch or show all backups to view entries.
          </p>
        ) : !has_filtered_entries ? (
          <p className="text-muted-foreground py-2 text-center text-sm">
            No history backup entries found.
          </p>
        ) : (
          <ScrollArea className="h-[260px] pr-3">
            <div className="flex flex-col gap-2 pb-1">
              {filters.is_grouped_by_domain
                ? grouped_entries.map(([domain, entries]) => (
                    <div key={domain} className="flex flex-col gap-2">
                      <p className="text-muted-foreground text-xs font-semibold">
                        {domain} ({entries.length})
                      </p>
                      {entries.map(RenderEntry)}
                    </div>
                  ))
                : filtered_entries.map(RenderEntry)}
            </div>
          </ScrollArea>
        )}

        {has_backup_records ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium">Backup batches</p>
              <Button
                type="button"
                variant={
                  effective_entry_scope.scope_key === 'all'
                    ? 'secondary'
                    : 'outline'
                }
                size="sm"
                onClick={() => {
                  set_entry_scope({ scope_key: 'all' });
                }}
              >
                <Eye data-icon="inline-start" />
                Show all
              </Button>
            </div>
            <div className="border-border flex max-h-24 flex-col gap-1 overflow-y-auto rounded-md border p-1">
              {records.map(record => {
                const is_selected_backup = IsSelectedHistoryBackupBatch(
                  effective_entry_scope,
                  record.backup_id
                );

                return (
                  <div
                    key={record.backup_id}
                    className={Cn(
                      'border-border flex min-h-8 items-center justify-between gap-1 rounded-sm border px-1 text-xs',
                      is_selected_backup
                        ? 'border-green-500 bg-green-500/10'
                        : 'bg-muted/50'
                    )}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto min-h-7 min-w-0 flex-1 justify-start px-1 py-1 text-left text-xs"
                      onClick={() => {
                        set_entry_scope({
                          scope_key: 'batch',
                          backup_id: record.backup_id
                        });
                      }}
                    >
                      {is_selected_backup ? (
                        <Check data-icon="inline-start" />
                      ) : null}
                      <span className="min-w-0 truncate">
                        {record.trigger} - {record.time_range} -{' '}
                        {record.entries_count} entries -{' '}
                        {FormatDate(record.created_at)}
                      </span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Delete backup ${record.backup_id}`}
                        >
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent size="sm">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete this backup?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This removes the selected history backup batch.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
                            onClick={() => {
                              HandleDeleteHistoryBackup(record.backup_id);
                            }}
                          >
                            Delete backup
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
});
