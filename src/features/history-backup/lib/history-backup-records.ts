import type { CleanupTrigger, TimeRange } from '@/features/settings';
import { VALID_CLEANUP_TRIGGERS, VALID_TIME_RANGES } from '@/features/settings';
import type {
  HistoryBackupEntry,
  HistoryBackupRecord
} from '../types/history-backup';

function IsRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function ValidateString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function ValidateFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function ValidateNullableTimestamp(value: unknown): number | null {
  if (value === null) return null;

  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function ValidateHistoryBackupEntry(value: unknown): HistoryBackupEntry | null {
  if (!IsRecord(value)) return null;
  const url = ValidateString(value.url);

  if (!url) return null;

  return {
    url,
    title: ValidateString(value.title),
    domain: ValidateString(value.domain),
    last_visit_time: ValidateNullableTimestamp(value.last_visit_time),
    visit_count: Math.max(
      0,
      Math.floor(ValidateFiniteNumber(value.visit_count, 0))
    ),
    typed_count: Math.max(
      0,
      Math.floor(ValidateFiniteNumber(value.typed_count, 0))
    )
  };
}

function ValidateHistoryBackupRecord(
  value: unknown
): HistoryBackupRecord | null {
  if (!IsRecord(value)) return null;
  const backup_id = ValidateString(value.backup_id);
  const created_at = ValidateString(value.created_at);
  const trigger =
    typeof value.trigger === 'string' &&
    VALID_CLEANUP_TRIGGERS.has(value.trigger)
      ? (value.trigger as CleanupTrigger)
      : null;
  const time_range =
    typeof value.time_range === 'string' &&
    VALID_TIME_RANGES.has(value.time_range)
      ? (value.time_range as TimeRange)
      : null;

  if (!backup_id || !created_at || !trigger || !time_range) return null;
  const entries = Array.isArray(value.entries)
    ? value.entries
        .map(ValidateHistoryBackupEntry)
        .filter((entry): entry is HistoryBackupEntry => entry !== null)
    : [];

  return {
    backup_id,
    created_at,
    trigger,
    time_range,
    entries_count: entries.length,
    entries
  };
}

export function NormalizeHistoryBackupRecords(
  value: unknown
): HistoryBackupRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .map(ValidateHistoryBackupRecord)
    .filter((record): record is HistoryBackupRecord => record !== null);
}

export function GetHistoryBackupDomain(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return '';
  }
}
