import type { CleanupTrigger, Settings } from '@/features/settings';
import { GetSinceTimestamp, MILLISECONDS_PER_DAY } from '@/features/settings';
import { HISTORY_BACKUP_MAX_RESULTS } from '../constants/history-backup';
import { HISTORY_BACKUP_STORAGE_KEY } from '../constants/storage';
import { ShouldSkipEmptyHistoryBackup } from '../lib/history-backup-policy';
import {
  GetHistoryBackupDomain,
  NormalizeHistoryBackupRecords
} from '../lib/history-backup-records';
import type {
  HistoryBackupEntry,
  HistoryBackupRecord,
  HistoryBackupResult
} from '../types/history-backup';

let active_history_backup_mutation_task: Promise<HistoryBackupRecord[]> | null =
  null;

function CreateBackupId(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function ShouldCreateHistoryBackup(
  settings: Settings,
  trigger: CleanupTrigger
): boolean {
  return (
    settings.history_backup.is_enabled &&
    settings.data_types.history &&
    settings.history_backup.trigger_keys.includes(trigger)
  );
}

async function ReadHistoryBackupRecords(): Promise<HistoryBackupRecord[]> {
  const stored = (await chrome.storage.local.get(
    HISTORY_BACKUP_STORAGE_KEY
  )) as Record<string, unknown>;

  return NormalizeHistoryBackupRecords(stored[HISTORY_BACKUP_STORAGE_KEY]);
}

async function WriteHistoryBackupRecords(
  records: HistoryBackupRecord[]
): Promise<void> {
  await chrome.storage.local.set({
    [HISTORY_BACKUP_STORAGE_KEY]: records
  });
}

async function MutateHistoryBackupRecords(
  TransformRecords: (records: HistoryBackupRecord[]) => HistoryBackupRecord[]
): Promise<HistoryBackupRecord[]> {
  const previous_mutation_task = active_history_backup_mutation_task;
  const next_mutation_task = (previous_mutation_task ?? Promise.resolve([]))
    .catch(error => {
      console.error(
        '[background] Previous history backup mutation failed:',
        error
      );

      return [];
    })
    .then(async () => {
      const records = await ReadHistoryBackupRecords();
      const next_records = TransformRecords(records);

      await WriteHistoryBackupRecords(next_records);

      return next_records;
    });

  active_history_backup_mutation_task = next_mutation_task;
  void next_mutation_task
    .finally(() => {
      if (active_history_backup_mutation_task === next_mutation_task) {
        active_history_backup_mutation_task = null;
      }
    })
    .catch(error => {
      console.error(
        '[background] Failed to release history backup mutation task:',
        error
      );
    });

  return next_mutation_task;
}

function CreateHistoryBackupEntry(
  history_item: chrome.history.HistoryItem
): HistoryBackupEntry | null {
  if (!history_item.url) return null;

  return {
    url: history_item.url,
    title: history_item.title ?? '',
    domain: GetHistoryBackupDomain(history_item.url),
    last_visit_time: history_item.lastVisitTime ?? null,
    visit_count: history_item.visitCount ?? 0,
    typed_count: history_item.typedCount ?? 0
  };
}

function PruneExpiredHistoryBackupRecords(
  records: HistoryBackupRecord[],
  retention_days: number,
  current_time: number
): HistoryBackupRecord[] {
  const retention_start_time =
    current_time - retention_days * MILLISECONDS_PER_DAY;

  return records.filter(record => {
    const created_time = new Date(record.created_at).getTime();

    return (
      Number.isFinite(created_time) && created_time >= retention_start_time
    );
  });
}

function GetErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'History backup could not be saved.';
}

export async function SaveHistoryBackupBeforeCleanup(
  settings: Settings,
  trigger: CleanupTrigger
): Promise<HistoryBackupResult> {
  if (!ShouldCreateHistoryBackup(settings, trigger)) {
    return {
      success: true,
      skipped: true
    };
  }

  try {
    const current_time = Date.now();
    const start_time = GetSinceTimestamp(settings.time_range, current_time);
    const history_items = await chrome.history.search({
      text: '',
      startTime: start_time,
      endTime: current_time,
      maxResults: HISTORY_BACKUP_MAX_RESULTS
    });
    const entries = history_items
      .map(CreateHistoryBackupEntry)
      .filter((entry): entry is HistoryBackupEntry => entry !== null);

    if (ShouldSkipEmptyHistoryBackup(entries.length)) {
      return {
        success: true,
        skipped: true
      };
    }

    const record: HistoryBackupRecord = {
      backup_id: CreateBackupId(),
      created_at: new Date(current_time).toISOString(),
      trigger,
      time_range: settings.time_range,
      entries_count: entries.length,
      entries
    };

    await MutateHistoryBackupRecords(records =>
      PruneExpiredHistoryBackupRecords(
        [...records, record],
        settings.history_backup.retention_days,
        current_time
      )
    );

    return {
      success: true,
      skipped: false,
      record
    };
  } catch (error) {
    console.error('[background] Failed to save history backup:', error);

    return {
      success: false,
      error: GetErrorMessage(error)
    };
  }
}

export async function DeleteHistoryBackupRecord(
  backup_id: string
): Promise<HistoryBackupRecord[]> {
  return MutateHistoryBackupRecords(records => {
    return records.filter(record => record.backup_id !== backup_id);
  });
}

export async function DeleteAllHistoryBackupRecords(): Promise<
  HistoryBackupRecord[]
> {
  return MutateHistoryBackupRecords(() => []);
}
