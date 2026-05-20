import type { DataTypeKey } from '@/features/settings';
import {
  Cookie,
  Database,
  Download,
  FileArchive,
  FileClock,
  Folder,
  History,
  ServerCog,
  SquareStack,
  UserRoundCheck,
  type LucideIcon
} from 'lucide-react';

export const DATA_TYPE_ICONS: Readonly<Record<DataTypeKey, LucideIcon>> = {
  cache: FileArchive,
  cookies: Cookie,
  history: History,
  downloads: Download,
  form_data: UserRoundCheck,
  local_storage: Database,
  indexed_db: SquareStack,
  service_workers: ServerCog,
  file_systems: Folder,
  plugin_data: FileClock,
  web_sql: Database
};
