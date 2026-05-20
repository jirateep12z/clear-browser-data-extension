import type { DataTypeKey, DataTypes, TimeRange } from '@/features/settings';

export type ClearPanelProps = {
  data_types: DataTypes;
  time_range: TimeRange;
  is_enabled: boolean;
  is_clearing: boolean;
  confirm_before_clearing: boolean;
  status_message: string | null;
  OnClearData: () => void;
  OnDataTypeChange: (key: DataTypeKey, value: boolean) => void;
  OnTimeRangeChange: (time_range: TimeRange) => void;
};
