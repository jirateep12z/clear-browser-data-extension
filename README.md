# Clear Browser Data

🧹 A modern Chrome Extension to quickly clear your browser data with customizable options, presets, and one-click cleanup.

## ✨ Features

### Core Features

- **Data Types Selection** - Select multiple data types to clear
  - Cached Images & Files
  - Cookies
  - Browsing History
  - Download History
  - Autofill Form Data
  - Local Storage
  - IndexedDB
  - Service Workers
  - File Systems
  - Plugin Data
  - Web SQL Data

### Advanced Features

- **Time Range Selection** - Choose time range (1 hour, 24 hours, 7 days, 4 weeks, All time)
- **Keyboard Shortcuts** - Clear data with keyboard shortcuts
  - `Ctrl+Shift+Y` - Clear selected data types with current settings
- **Notifications** - Notify when clearing is successful
- **Confirmation Dialog** - Confirm before manual and shortcut clearing
- **Clear on Browser Startup** - Automatically clear selected data types when browser starts
- **Scheduled Cleanup** - Automatic data clearing with flexible scheduling options
  - Custom minutes interval (5, 10, 15, 20, 30, 45 minutes)
  - Custom hours interval (1, 2, 3, 4, 6, 8, 12 hours)
  - Hourly, Daily, Weekly, Monthly options
- **Whitelist Domains** - Protect cookies, cache, and site storage for specific domains during cleanup. History, download history, autofill form data, and deprecated plugin data are cleared by time range because Chrome does not support origin filtering for those data types.
- **History Backup** - Save browsing history entries locally before clearing them.
  - Configurable backup triggers for manual, scheduled, startup, and shortcut cleanup
  - Local-only storage with a 90-day default retention period
  - Advanced filters for keyword, domain, cleanup trigger, cleanup time range, entry date, and backup date
  - Calendar date pickers for date-based filters
  - Sorting, grouping by domain, and batch deletion controls
  - Export filtered backup results as JSON or CSV
  - Backup viewing and export only; restoring entries back into Chrome is not included

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Format code
npm run format
```

### Load Extension in Chrome

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `dist` folder from this project

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

## ⭐ Show your support

Give a ⭐️ if this project helped you!

## 📝 Author

**Made with ❤️ by @jirateep12z**
