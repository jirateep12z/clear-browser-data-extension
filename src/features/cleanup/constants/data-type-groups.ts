import type { DataTypeGroup } from '../types/data-type-group';

export const DATA_TYPE_GROUPS: readonly DataTypeGroup[] = [
  {
    group_title: 'Common',
    data_type_keys: ['cache', 'cookies', 'history', 'downloads']
  },
  {
    group_title: 'Site Storage',
    data_type_keys: [
      'local_storage',
      'indexed_db',
      'service_workers',
      'file_systems'
    ]
  },
  {
    group_title: 'Legacy',
    data_type_keys: ['form_data', 'plugin_data', 'web_sql']
  }
];
