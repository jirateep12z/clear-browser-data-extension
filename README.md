# Clear Browser Data

A Chrome extension that clears browser data manually, on a schedule, at startup, or with a keyboard shortcut.

Clear Browser Data helps people who clear their browsing data often do it from a compact popup instead of opening Chrome's settings each time. Choose which data types and time range to clear, run cleanup manually or automatically, protect whitelisted domains, and optionally back up browsing history before it is cleared. It is a Manifest V3 extension built with React 19, Vite, TypeScript, Tailwind CSS v4, and shadcn/ui.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Features](#features)
- [Permissions](#permissions)
- [Development](#development)
- [Show your support](#show-your-support)
- [Author](#author)
- [License](#license)

## Install

### Prerequisites

- Node.js and npm
- Google Chrome or another Chromium-based browser that supports Manifest V3

### Build and Load the Extension

Clone the repository, install dependencies, and build the extension into `dist`:

```sh
git clone https://github.com/jirateep12z/clear-browser-data-extension.git
cd clear-browser-data-extension
npm install
npm run build
```

Then load it in Chrome:

1. Open `chrome://extensions/`.
2. Turn on "Developer mode" in the top-right corner.
3. Click "Load unpacked".
4. Select the `dist` folder from this project.

After changing the source, run `npm run build` again and click the reload button on the extension card.

## Usage

### Clear Data from the Popup

1. Click the extension icon to open the popup.
2. On the Clear tab, select the data types and time range to clear.
3. Click the clear button. When confirmation is enabled, confirm in the "Clear selected data?" dialog.

### Use the Keyboard Shortcut

Press `Ctrl+Shift+Y`, the suggested default, to clear the selected data without opening the popup. When confirmation is enabled, the shortcut opens the popup instead so you can confirm there.

To change the shortcut, open `chrome://extensions/shortcuts` and set a new key for "Clear selected browser data". Chrome may not assign `Ctrl+Shift+Y` if another extension already uses it.

### Preview the Popup During Development

Start the Vite dev server to preview the popup in a browser tab:

```sh
npm run dev
```

In this mode, the popup runs outside the extension context. Settings and history backups are stored in `localStorage`, and clicking the clear button shows "Build and load the extension in Chrome to clear data." instead of clearing anything.

## Features

### Data Cleanup

- **Selectable Data Types**: Choose from 11 data types in three groups:
  - **Common**: Cached Images & Files, Cookies, Browsing History, Download History
  - **Site Storage**: Local Storage, IndexedDB, Service Workers, File Systems
  - **Legacy**: Autofill Form Data, Plugin Data, Web SQL Data
- **Time Range**: Clear data from the last hour, last 24 hours, last 7 days, last 4 weeks, or all time.
- **Default Selection**: Cached Images & Files, Browsing History, Download History, and Autofill Form Data are selected by default, with an "All time" range.
- **Confirmation Dialog**: Asks for confirmation before manual clearing. Confirmation is on by default and can be turned off in Settings.
- **Queued Cleanups**: Cleanup runs that start at the same time execute one after another.
- **Download Records Only**: Download History removes download records; downloaded files stay on disk.
- **Plugin Data**: Chrome has deprecated this data type and may ignore it.

### Cleanup Triggers

- **Manual**: Clear data from the popup's Clear tab.
- **Scheduled**: Run cleanup with `chrome.alarms` every 5, 10, 15, 20, 30, or 45 minutes; every 1, 2, 3, 4, 6, 8, or 12 hours; or hourly, daily, weekly, or monthly (every 30 days). Scheduled cleanup is off by default.
- **Browser Startup**: Optionally clear data when the browser starts. This option is off by default.
- **Keyboard Shortcut**: Clear the selected data with `Ctrl+Shift+Y`. When confirmation is enabled, the shortcut opens the popup instead; if the popup cannot open and notifications are enabled, a notification asks you to confirm in the popup.

### Domain Whitelist

- **Protected Domains**: Add domains such as `example.com` to exclude their `http://` and `https://` origins from cleanup.
- **Origin-Aware Removal**: The whitelist applies to cache, cookies, and site storage. Browsing history, download history, autofill form data, and plugin data are not origin-specific, so they are cleared regardless of the whitelist.

### History Backup

- **Pre-Cleanup Backup**: When enabled and Browsing History is selected, saves visited URLs from the selected time range to `chrome.storage.local` before clearing, up to 10,000 entries per backup. Backup is off by default.
- **Trigger Selection**: Choose which triggers (Manual, Scheduled, Startup, Shortcut) create a backup. Manual is selected by default.
- **Retention Period**: Removes backups older than the retention period (1–3650 days, default 90) whenever a new backup is saved.
- **Search and Filters**: Search by URL, title, or domain, and filter by domain, trigger, cleanup range, entry date, and backup date.
- **Sorting and Grouping**: Sort entries by newest, oldest, domain, or title, and optionally group them by domain.
- **Export**: Download the filtered entries as JSON or CSV.
- **Backup Management**: Delete individual backup batches or all backups, with confirmation.
- **Local Storage Only**: Backups stay in this browser profile and are removed if the extension is uninstalled.

### Notifications and Statistics

- **Cleanup Notifications**: Shows a notification after each cleanup succeeds or fails, including a warning when a history backup could not be saved. Notifications are on by default and can be turned off.
- **Statistics**: Displays the total number of successful cleanups and the date of the last cleanup.

### Popup Interface

- **Tabbed Layout**: Five icon tabs with tooltips: Clear, Schedule, Settings, Statistics, and Backup.
- **Extension Toggle**: Disable the extension to stop all cleanup triggers, including scheduled cleanup.
- **Theme**: Choose Light, Dark, or System mode. System mode follows the operating system's `prefers-color-scheme` setting.
- **Synced Settings**: Settings persist in `chrome.storage.sync` and are validated against defaults when loaded or saved.

## Permissions

| Permission      | Purpose                                                 |
| --------------- | ------------------------------------------------------- |
| `storage`       | Save settings, statistics, and history backups.         |
| `browsingData`  | Clear the selected browser data.                        |
| `alarms`        | Run scheduled cleanup.                                  |
| `notifications` | Show cleanup results and shortcut confirmation prompts. |
| `history`       | Read browsing history for history backups.              |

## Development

### Scripts

| Command            | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server to preview the popup in a browser tab. |
| `npm run build`    | Type-check with `tsc -b` and build the extension into `dist`.    |
| `npm run lint`     | Lint files in `src`.                                             |
| `npm run lint:fix` | Lint files in `src` and apply automatic fixes.                   |
| `npm run format`   | Format files in `src` with Prettier.                             |

### Project Structure

```text
public/
  icons/                 # Extension icons
  manifest.json          # Manifest V3 definition
src/
  background/            # Background service worker and message handler
  components/ui/         # shadcn/ui components
  features/
    cleanup/             # Clear panel, data cleanup, and scheduled cleanup services
    history-backup/      # History backup panel, storage, and records
    popup/               # Popup app, tabs, and panels
    settings/            # Settings types, defaults, validation, and storage hook
    theme/               # Theme types, hook, and ApplyTheme helper
  hooks/                 # Shared React hooks
  lib/                   # Shared utilities
  main.tsx               # Popup entry point
  theme-init.ts          # Pre-render theme initialization
index.html               # Popup HTML
vite.config.ts           # Builds the popup and background.js into dist
```

## Show your support

Give a ⭐️ if this project helped you!

## Author

**Made with ❤️ by @jirateep12z**

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Jirateep Lumvasana
