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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import type { TimeRange } from '@/features/settings';
import { DATA_TYPE_OPTIONS, TIME_RANGE_OPTIONS } from '@/features/settings';
import { Clock, Trash2 } from 'lucide-react';
import { memo } from 'react';
import { DATA_TYPE_GROUPS } from '../constants/data-type-groups';
import { DATA_TYPE_ICONS } from '../constants/data-type-icons';
import type { ClearPanelProps } from '../types/props';

export const ClearPanel = memo(function ClearPanel({
  data_types,
  time_range,
  is_enabled,
  is_clearing,
  confirm_before_clearing,
  status_message,
  OnClearData,
  OnDataTypeChange,
  OnTimeRangeChange
}: ClearPanelProps) {
  const has_selected_data_type = Object.values(data_types).some(Boolean);
  const is_clear_disabled =
    !is_enabled || !has_selected_data_type || is_clearing;
  const clear_button_label = is_clearing
    ? 'Clearing...'
    : 'Clear selected data';
  const clear_button = (
    <Button
      type="button"
      disabled={is_clear_disabled}
      className="w-full bg-green-600 text-white hover:bg-green-700"
      onClick={confirm_before_clearing ? undefined : OnClearData}
    >
      <Trash2 data-icon="inline-start" />
      {clear_button_label}
    </Button>
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trash2 className="size-4" />
              Data Types
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-3 pt-4">
            <ScrollArea className="h-[320px] pr-3">
              <div className="flex flex-col gap-4 pb-1">
                {DATA_TYPE_GROUPS.map((data_type_group, group_index) => {
                  const group_title_id = `data-type-group-${group_index}`;

                  return (
                    <section
                      key={data_type_group.group_title}
                      aria-labelledby={group_title_id}
                      className="flex flex-col gap-2"
                    >
                      <h3
                        id={group_title_id}
                        className="text-muted-foreground text-[11px] leading-none font-semibold tracking-wide uppercase"
                      >
                        {data_type_group.group_title}
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {data_type_group.data_type_keys.map(data_type_key => {
                          const data_type_option = DATA_TYPE_OPTIONS.find(
                            data_type_option_candidate =>
                              data_type_option_candidate.key === data_type_key
                          );

                          if (!data_type_option) {
                            return null;
                          }

                          const Icon = DATA_TYPE_ICONS[data_type_key];

                          return (
                            <Tooltip key={data_type_key}>
                              <TooltipTrigger asChild>
                                <Label
                                  htmlFor={`data-type-${data_type_key}`}
                                  data-selected={data_types[data_type_key]}
                                  className="border-border bg-card hover:bg-muted/60 data-[selected=true]:text-foreground relative flex min-h-[76px] cursor-pointer flex-col items-start justify-between gap-2 rounded-md border py-2.5 pr-8 pl-2 text-left text-xs leading-tight font-semibold data-[selected=true]:border-green-500/70 data-[selected=true]:bg-green-500/10"
                                >
                                  <Checkbox
                                    id={`data-type-${data_type_key}`}
                                    checked={data_types[data_type_key]}
                                    className="absolute top-2 right-2 data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white dark:data-[state=checked]:border-green-400 dark:data-[state=checked]:bg-green-500 dark:data-[state=checked]:text-white"
                                    onCheckedChange={value => {
                                      OnDataTypeChange(
                                        data_type_key,
                                        value === true
                                      );
                                    }}
                                  />
                                  <Icon className="text-muted-foreground size-4 shrink-0 self-start" />
                                  <span className="min-w-0 self-start text-left text-balance">
                                    {data_type_option.label}
                                  </span>
                                </Label>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                {data_type_option.description}
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4" />
              Time Range
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-col gap-4 pt-4">
            <Select
              value={time_range}
              onValueChange={value => {
                if (TIME_RANGE_OPTIONS.some(option => option.value === value)) {
                  OnTimeRangeChange(value as TimeRange);
                }
              }}
            >
              <SelectTrigger id="time-range-select" className="w-full">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIME_RANGE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {confirm_before_clearing ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>{clear_button}</AlertDialogTrigger>
                <AlertDialogContent size="sm">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear selected data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will clear the selected browser data for the selected
                      time range. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:text-white dark:hover:bg-green-600"
                      onClick={OnClearData}
                    >
                      Clear data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              clear_button
            )}
            {status_message ? (
              <p className="text-muted-foreground text-center text-xs">
                {status_message}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
});
