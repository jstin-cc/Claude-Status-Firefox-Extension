# Claude Status Monitor

A Firefox extension that displays the real-time operational status of Anthropic's Claude services directly on [claude.ai](https://claude.ai) — no need to visit the status page separately.

![Firefox](https://img.shields.io/badge/Firefox-109%2B-orange?logo=firefox)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- **Live status widget** — appears in the bottom-right corner of claude.ai
- **Color-coded indicator** — green (operational), orange (degraded/partial outage), red (major outage), gray (unknown/error)
- **Expandable component list** — shows the status of each individual Anthropic service
- **Auto-refresh** — polls the official Anthropic status API every 60 seconds
- **Bilingual** — supports German 🇩🇪 and English 🇺🇸, switchable in the widget
- **Persistent settings** — language choice and widget state are saved across page reloads
- **No tracking, no external servers** — only communicates with `status.anthropic.com`

---

## How It Works

The extension injects a small widget into claude.ai. A background script fetches status data from the [official Anthropic status API](https://status.anthropic.com/api/v2/components.json) and sends it to the widget. This avoids Content Security Policy restrictions that would block direct fetches from the page context.

```
Background Script  →  fetch status.anthropic.com  →  send to content script
Content Script     →  render widget on claude.ai
```

---

## Installation

### From Firefox Add-ons (AMO)
*Coming soon — submission in progress.*

### Manual (Developer / Temporary)
1. Clone or download this repository
2. Open Firefox and navigate to `about:debugging`
3. Click **"This Firefox"** → **"Load Temporary Add-on…"**
4. Select `manifest.json` from the `claude-status-extension/` folder
5. Open [claude.ai](https://claude.ai) — the widget appears in the bottom-right corner

---

## Usage

| Action | Result |
|--------|--------|
| Widget visible | Shows status dot + "Claude Status" label |
| Click widget | Expands to show all service components |
| Click again | Collapses back to pill |
| Click flag (🇩🇪/🇺🇸) when expanded | Opens language selector |

### Status Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | All systems operational |
| 🟠 Orange | Degraded performance or partial outage |
| 🔴 Red | Major outage |
| ⚫ Gray | Status unavailable / maintenance |

---

## File Structure

```
claude-status-extension/
├── manifest.json       # Extension manifest (MV3)
├── content.js          # Widget injection, rendering, language logic
├── content.css         # Widget styles
├── background.js       # Status API polling via alarms
└── icons/
    ├── icon-16.png
    ├── icon-48.png
    └── icon-128.png
```

---

## Permissions

| Permission | Reason |
|------------|--------|
| `alarms` | Triggers status refresh every 60 seconds |
| `tabs` | Sends updated status data to open claude.ai tabs |
| `storage` | Persists language preference and widget expand state |
| `https://claude.ai/*` | Injects the status widget |
| `https://status.anthropic.com/*` | Fetches the status API |

---

## Privacy Policy

This extension does **not** collect, store, or transmit any personal data.

- No user data is sent to any server
- No analytics or tracking of any kind
- The only network request made is a read-only GET to `https://status.anthropic.com/api/v2/components.json`
- Settings (language, widget state) are stored locally in the browser using `browser.storage.local` and never leave the device

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## License

[MIT](LICENSE)
