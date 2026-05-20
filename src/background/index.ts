import {
  CLEAR_SELECTED_DATA_COMMAND,
  ClearBrowserData,
  IsScheduledCleanupAlarm,
  RunScheduledCleanup,
  SHORTCUT_CONFIRMATION_NOTIFICATION_ID,
  SyncScheduledCleanup
} from '@/features/cleanup';
import type { Settings } from '@/features/settings';
import { CHROME_STORAGE_KEY, MergeSettings } from '@/features/settings';
import { HandleMessage } from './services/message-handler.service';

async function ReadSettings(): Promise<Settings> {
  const stored = (await chrome.storage.sync.get(CHROME_STORAGE_KEY)) as Record<
    string,
    Settings | undefined
  >;

  return MergeSettings(stored[CHROME_STORAGE_KEY] ?? {});
}

async function ShowShortcutConfirmationNotification(): Promise<void> {
  await chrome.notifications.create(SHORTCUT_CONFIRMATION_NOTIFICATION_ID, {
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title: 'Confirmation required',
    message: 'Open the extension popup and confirm before clearing data.'
  });
}

async function OpenPopupForShortcutConfirmation(
  settings: Settings
): Promise<void> {
  try {
    await chrome.action.openPopup();
  } catch (error) {
    console.error('[background] Failed to open popup for shortcut:', error);
    if (settings.show_notifications) {
      await ShowShortcutConfirmationNotification();
    }
  }
}

async function HandleClearSelectedDataCommand(): Promise<void> {
  const settings = await ReadSettings();

  if (settings.confirm_before_clearing) {
    await OpenPopupForShortcutConfirmation(settings);

    return;
  }

  await ClearBrowserData('shortcut');
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const stored = (await chrome.storage.sync.get(
      CHROME_STORAGE_KEY
    )) as Record<string, Settings | undefined>;
    const prev = stored[CHROME_STORAGE_KEY];
    const settings = MergeSettings(prev ?? {});

    await chrome.storage.sync.set({
      [CHROME_STORAGE_KEY]: settings
    });
    await SyncScheduledCleanup(settings);
  } catch (error) {
    console.error(
      '[background] Failed to initialize settings on install:',
      error
    );
  }
});

chrome.runtime.onStartup.addListener(async () => {
  try {
    const stored = (await chrome.storage.sync.get(
      CHROME_STORAGE_KEY
    )) as Record<string, Settings | undefined>;
    const settings = MergeSettings(stored[CHROME_STORAGE_KEY] ?? {});

    await SyncScheduledCleanup(settings);

    if (settings.clear_on_browser_startup) {
      await ClearBrowserData('startup');
    }
  } catch (error) {
    console.error('[background] Failed to run startup cleanup:', error);
  }
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (!IsScheduledCleanupAlarm(alarm.name)) return;
  RunScheduledCleanup().catch(error => {
    console.error('[background] Failed to run scheduled cleanup:', error);
  });
});

chrome.commands.onCommand.addListener(command => {
  if (command !== CLEAR_SELECTED_DATA_COMMAND) return;
  HandleClearSelectedDataCommand().catch(error => {
    console.error('[background] Failed to run shortcut cleanup:', error);
  });
});

chrome.runtime.onMessage.addListener(HandleMessage);
