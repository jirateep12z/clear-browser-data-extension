import type { DataTypeKey } from '@/features/settings';

export type DataTypeGroup = {
  group_title: string;
  data_type_keys: readonly DataTypeKey[];
};
