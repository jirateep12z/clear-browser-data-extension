import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
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
  SCHEDULE_INTERVAL_OPTIONS,
  SCHEDULE_TYPE_OPTIONS,
  type ScheduleType
} from '@/features/settings';
import { CalendarClock } from 'lucide-react';
import { memo } from 'react';
import type { SchedulePanelProps } from '../types/props';

export const SchedulePanel = memo(function SchedulePanel({
  is_scheduled_cleanup_enabled,
  schedule_type,
  schedule_interval_minutes,
  OnScheduledCleanupEnabledChange,
  OnScheduleIntervalChange,
  OnScheduleTypeChange
}: SchedulePanelProps) {
  const schedule_interval_options = SCHEDULE_INTERVAL_OPTIONS.filter(option => {
    return option.schedule_type === schedule_type;
  });
  const selected_schedule_interval = schedule_interval_options.some(option => {
    return option.value === schedule_interval_minutes;
  })
    ? schedule_interval_minutes
    : schedule_interval_options[0]?.value;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarClock className="size-4" />
          Schedule
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex items-center justify-between gap-4">
          <Label
            htmlFor="scheduled-cleanup"
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            Enable scheduled cleanup
          </Label>
          <Switch
            id="scheduled-cleanup"
            checked={is_scheduled_cleanup_enabled}
            className="data-checked:bg-green-500 dark:data-checked:bg-green-500 data-checked:[&_[data-slot=switch-thumb]]:bg-white"
            onCheckedChange={OnScheduledCleanupEnabledChange}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="schedule-type-select" className="text-xs font-medium">
            Type
          </Label>
          <Select
            value={schedule_type}
            disabled={!is_scheduled_cleanup_enabled}
            onValueChange={value => {
              if (
                SCHEDULE_TYPE_OPTIONS.some(option => option.value === value)
              ) {
                const next_schedule_type = value as ScheduleType;
                const first_interval = SCHEDULE_INTERVAL_OPTIONS.find(
                  option => {
                    return option.schedule_type === next_schedule_type;
                  }
                );

                OnScheduleTypeChange(next_schedule_type);
                if (first_interval) {
                  OnScheduleIntervalChange(first_interval.value);
                }
              }
            }}
          >
            <SelectTrigger id="schedule-type-select" className="w-full">
              <SelectValue placeholder="Select schedule type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {SCHEDULE_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="schedule-interval-select"
            className="text-xs font-medium"
          >
            Time
          </Label>
          <Select
            value={String(selected_schedule_interval)}
            disabled={!is_scheduled_cleanup_enabled}
            onValueChange={value => {
              const schedule_interval_minutes_value = Number(value);

              if (
                schedule_interval_options.some(
                  option => option.value === schedule_interval_minutes_value
                )
              ) {
                OnScheduleIntervalChange(schedule_interval_minutes_value);
              }
            }}
          >
            <SelectTrigger id="schedule-interval-select" className="w-full">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {schedule_interval_options.map(option => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
});
