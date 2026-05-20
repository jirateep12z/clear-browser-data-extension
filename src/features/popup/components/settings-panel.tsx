import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
  CLEANUP_TRIGGER_OPTIONS,
  NormalizeWhitelistDomain,
  type CleanupTrigger
} from '@/features/settings';
import { VALID_THEMES, type Theme } from '@/features/theme';
import {
  Bell,
  FileClock,
  GlobeLock,
  Monitor,
  Moon,
  Plus,
  Power,
  Settings,
  ShieldCheck,
  Sun,
  TimerReset,
  X
} from 'lucide-react';
import { memo, useState, type FormEvent } from 'react';
import type { SettingsPanelProps } from '../types/props';

export const SettingsPanel = memo(function SettingsPanel({
  theme,
  is_enabled,
  confirm_before_clearing,
  show_notifications,
  clear_on_browser_startup,
  whitelist_domains,
  history_backup,
  OnClearOnBrowserStartupChange,
  OnConfirmBeforeClearingChange,
  OnEnabledChange,
  OnHistoryBackupChange,
  OnShowNotificationsChange,
  OnThemeChange,
  OnWhitelistDomainsChange
}: SettingsPanelProps) {
  const [whitelist_input, set_whitelist_input] = useState('');
  const [whitelist_error, set_whitelist_error] = useState<string | null>(null);

  const HandleWhitelistSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized_domain = NormalizeWhitelistDomain(whitelist_input);

    if (!normalized_domain) {
      set_whitelist_error('Enter a valid http or https domain.');

      return;
    }

    if (whitelist_domains.includes(normalized_domain)) {
      set_whitelist_error('This domain is already protected.');

      return;
    }

    OnWhitelistDomainsChange([...whitelist_domains, normalized_domain]);
    set_whitelist_input('');
    set_whitelist_error(null);
  };

  const HandleWhitelistRemove = (domain: string) => {
    OnWhitelistDomainsChange(
      whitelist_domains.filter(whitelist_domain => {
        return whitelist_domain !== domain;
      })
    );
  };

  const HandleHistoryBackupTriggerChange = (
    trigger: CleanupTrigger,
    is_selected: boolean
  ) => {
    const next_trigger_keys = is_selected
      ? Array.from(new Set([...history_backup.trigger_keys, trigger]))
      : history_backup.trigger_keys.filter(trigger_key => {
          return trigger_key !== trigger;
        });

    OnHistoryBackupChange({
      ...history_backup,
      trigger_keys:
        next_trigger_keys.length > 0 ? next_trigger_keys : ['manual']
    });
  };

  const HandleHistoryBackupRetentionChange = (value: string) => {
    const retention_days = Number(value);

    if (!Number.isFinite(retention_days)) return;
    OnHistoryBackupChange({
      ...history_backup,
      retention_days
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          Settings
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="flex flex-col gap-4 pt-4">
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="theme-select"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Monitor className="h-4 w-4" />
            Theme
          </Label>
          <Select
            value={theme}
            onValueChange={v => {
              if (VALID_THEMES.has(v)) {
                OnThemeChange(v as Theme);
              }
            }}
          >
            <SelectTrigger id="theme-select" className="w-full">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="light">
                  <span className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light
                  </span>
                </SelectItem>
                <SelectItem value="dark">
                  <span className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark
                  </span>
                </SelectItem>
                <SelectItem value="system">
                  <span className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System
                  </span>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Label
            htmlFor="extension-enabled"
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <Power className="h-4 w-4" />
            Extension enabled
          </Label>
          <Switch
            id="extension-enabled"
            checked={is_enabled}
            className="data-checked:bg-green-500 dark:data-checked:bg-green-500 data-checked:[&_[data-slot=switch-thumb]]:bg-white"
            onCheckedChange={OnEnabledChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="confirm-before-clearing"
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <ShieldCheck className="h-4 w-4" />
            Confirm before manual clearing
          </Label>
          <Switch
            id="confirm-before-clearing"
            checked={confirm_before_clearing}
            className="data-checked:bg-green-500 dark:data-checked:bg-green-500 data-checked:[&_[data-slot=switch-thumb]]:bg-white"
            onCheckedChange={OnConfirmBeforeClearingChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="show-notifications"
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <Bell className="h-4 w-4" />
            Show notifications
          </Label>
          <Switch
            id="show-notifications"
            checked={show_notifications}
            className="data-checked:bg-green-500 dark:data-checked:bg-green-500 data-checked:[&_[data-slot=switch-thumb]]:bg-white"
            onCheckedChange={OnShowNotificationsChange}
          />
        </div>
        <div className="flex items-center justify-between">
          <Label
            htmlFor="clear-on-browser-startup"
            className="flex cursor-pointer items-center gap-2 text-sm font-medium"
          >
            <TimerReset className="h-4 w-4" />
            Clear on browser startup
          </Label>
          <Switch
            id="clear-on-browser-startup"
            checked={clear_on_browser_startup}
            className="data-checked:bg-green-500 dark:data-checked:bg-green-500 data-checked:[&_[data-slot=switch-thumb]]:bg-white"
            onCheckedChange={OnClearOnBrowserStartupChange}
          />
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="history-backup-enabled"
                className="flex cursor-pointer items-center gap-2 text-sm font-medium"
              >
                <FileClock className="h-4 w-4" />
                History backup
              </Label>
              <p className="text-muted-foreground text-xs">
                Stores visited URL history locally before clearing.
              </p>
            </div>
            <Switch
              id="history-backup-enabled"
              checked={history_backup.is_enabled}
              className="data-checked:bg-green-500 dark:data-checked:bg-green-500 data-checked:[&_[data-slot=switch-thumb]]:bg-white"
              onCheckedChange={is_enabled => {
                OnHistoryBackupChange({
                  ...history_backup,
                  is_enabled
                });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CLEANUP_TRIGGER_OPTIONS.map(option => (
              <Label
                key={option.value}
                htmlFor={`history-backup-trigger-${option.value}`}
                className="border-border bg-card flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-2 text-xs font-medium"
              >
                <Checkbox
                  id={`history-backup-trigger-${option.value}`}
                  checked={history_backup.trigger_keys.includes(option.value)}
                  disabled={!history_backup.is_enabled}
                  className="data-[state=checked]:border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white dark:data-[state=checked]:border-green-400 dark:data-[state=checked]:bg-green-500 dark:data-[state=checked]:text-white"
                  onCheckedChange={value => {
                    HandleHistoryBackupTriggerChange(
                      option.value,
                      value === true
                    );
                  }}
                />
                {option.label}
              </Label>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="history-backup-retention-days"
              className="text-sm font-medium"
            >
              Retention days
            </Label>
            <input
              id="history-backup-retention-days"
              type="number"
              min={1}
              max={3650}
              step={1}
              value={history_backup.retention_days}
              disabled={!history_backup.is_enabled}
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 min-w-0 rounded-md border px-3 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={event => {
                HandleHistoryBackupRetentionChange(event.target.value);
              }}
            />
          </div>
        </div>
        <Separator />
        <div className="flex flex-col gap-3">
          <Label
            htmlFor="whitelist-domain"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <GlobeLock className="h-4 w-4" />
            Whitelist domains
          </Label>
          <form className="flex gap-2" onSubmit={HandleWhitelistSubmit}>
            <input
              id="whitelist-domain"
              value={whitelist_input}
              placeholder="example.com"
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 min-w-0 flex-1 rounded-md border px-3 text-sm outline-none focus-visible:ring-3"
              onChange={event => {
                set_whitelist_input(event.target.value);
                set_whitelist_error(null);
              }}
            />
            <Button
              type="submit"
              size="default"
              disabled={!whitelist_input.trim()}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              <Plus data-icon="inline-start" />
              Add
            </Button>
          </form>
          {whitelist_error ? (
            <p className="text-destructive text-xs" role="alert">
              {whitelist_error}
            </p>
          ) : null}
          {whitelist_domains.length > 0 ? (
            <div className="border-border flex max-h-28 flex-col gap-1 overflow-y-auto rounded-md border p-1">
              {whitelist_domains.map(domain => (
                <div
                  key={domain}
                  className="bg-muted/50 flex min-h-8 items-center justify-between gap-2 rounded-sm px-2 text-xs"
                >
                  <span className="min-w-0 truncate">{domain}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Remove ${domain}`}
                    onClick={() => {
                      HandleWhitelistRemove(domain);
                    }}
                  >
                    <X />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              No protected domains yet.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
