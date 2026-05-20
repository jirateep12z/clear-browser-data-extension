# Clear Browser Data

A Chrome Extension (Manifest V3) for clearing browser data from a compact popup. Choose which data types and time range to clear, run cleanup manually, on a schedule, at browser startup, or with a keyboard shortcut, protect whitelisted domains, and optionally back up browsing history before it is cleared. Built with React 19, Vite, TypeScript, Tailwind CSS v4, and shadcn/ui.

## Features

### Data Cleanup

- **Selectable Data Types**: Choose from 11 data types in three groups:
  - **Common**: Cached Images & Files, Cookies, Browsing History, Download History
  - **Site Storage**: Local Storage, IndexedDB, Service Workers, File Systems
  - **Legacy**: Autofill Form Data, Plugin Data, Web SQL Data
- **Time Range**: Clear data from the last hour, last 24 hours, last 7 days, last 4 weeks, or all time.
- **Confirmation Dialog**: Optionally asks for confirmation before manual clearing.
- **Default Selection**: Cached Images & Files, Browsing History, Download History, and Autofill Form Data are selected by default with an "All time" range.
- **Queued Cleanups**: Cleanup runs triggered at the same time execute one after another.

### Cleanup Triggers

- **Manual**: Clear data from the popup's Clear tab.
- **Scheduled**: Run cleanup every 5–45 minutes, every 1–12 hours, or hourly, daily, weekly, or monthly using `chrome.alarms`.
- **Browser Startup**: Optionally clear data when the browser starts.
- **Keyboard Shortcut**: Press `Ctrl+Shift+Y` (default suggestion) to clear the selected data. When confirmation is enabled, the shortcut opens the popup instead; if the popup cannot open, a notification asks you to confirm in the popup.

### Domain Whitelist

- **Protected Domains**: Add domains such as `example.com` to exclude their `http://` and `https://` origins from cleanup.
- **Origin-Aware Removal**: The whitelist applies to cache, cookies, and site storage. Browsing history, download history, autofill form data, and plugin data are not origin-specific and are cleared regardless of the whitelist.

### History Backup

- **Pre-Cleanup Backup**: When enabled and Browsing History is selected, saves visited URLs from the selected time range to `chrome.storage.local` before clearing, up to 10,000 entries per backup.
- **Trigger Selection**: Choose which triggers (Manual, Scheduled, Startup, Shortcut) create a backup. Manual is selected by default.
- **Retention Period**: Removes backups older than the configured retention period (1–3650 days, default 90) whenever a new backup is saved.
- **Search and Filters**: Search by URL, title, or domain, and filter by domain, trigger, cleanup range, entry date, and backup date.
- **Sorting and Grouping**: Sort entries by newest, oldest, domain, or title, and optionally group them by domain.
- **Export**: Download the filtered entries as JSON or CSV.
- **Backup Management**: Delete individual backup batches or all backups, with confirmation.

### Notifications and Statistics

- **Cleanup Notifications**: Optionally shows a notification after each cleanup succeeds or fails, including a warning when a history backup could not be saved.
- **Statistics**: Displays the total number of successful cleanups and the date of the last cleanup.

### Popup UI

- **Tabbed Layout**: Five icon tabs with tooltips — Clear, Schedule, Settings, Statistics, and Backup.
- **Extension Toggle**: Disable the extension to stop all cleanup triggers, including scheduled cleanup.
- **Theme**: Light, Dark, or System mode. System mode follows the OS `prefers-color-scheme` setting.
- **Synced Settings**: Settings persist in `chrome.storage.sync` and are validated against defaults when loaded or saved.

## Getting Started

### Prerequisites

- Node.js and npm
- Google Chrome (or another Chromium-based browser that supports Manifest V3)

### Installation

```bash
npm install
```

### Scripts

| Command            | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `npm run dev`      | Start the Vite dev server to preview the popup in a browser tab. |
| `npm run build`    | Type-check with `tsc -b` and build the extension into `dist`.    |
| `npm run lint`     | Lint files in `src`.                                             |
| `npm run lint:fix` | Lint files in `src` and apply automatic fixes.                   |
| `npm run format`   | Format files in `src` with Prettier.                             |

> [!NOTE]
> In `npm run dev`, the popup runs outside the extension context. Settings and history backups are stored in `localStorage`, and clearing data is unavailable until the extension is built and loaded in Chrome.

### Load the Extension in Chrome

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top right)
4. Click "Load unpacked"
5. Select the `dist` folder from this project

After changing the source, run `npm run build` again and click the reload button on the extension card.

### Change the Keyboard Shortcut

Open `chrome://extensions/shortcuts` and set a new key for "Clear selected browser data". Chrome may not assign the suggested `Ctrl+Shift+Y` if another extension already uses it.

## Permissions

| Permission      | Purpose                                                 |
| --------------- | ------------------------------------------------------- |
| `storage`       | Save settings, statistics, and history backups.         |
| `browsingData`  | Clear the selected browser data.                        |
| `alarms`        | Run scheduled cleanup.                                  |
| `notifications` | Show cleanup results and shortcut confirmation prompts. |
| `history`       | Read browsing history for history backups.              |

## Project Structure

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

## Limitations

- **Plugin Data**: Deprecated by Chrome and may be ignored.
- **Download History**: Removes download records only; downloaded files stay on disk.
- **History Backup Storage**: Backups are stored locally in this browser profile and are removed if the extension is uninstalled.

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions, issues and feature requests are welcome!

## Show your support

Give a ⭐️ if this project helped you!

## Author

**Made with ❤️ by @jirateep12z**
