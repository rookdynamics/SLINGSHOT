# SLINGSHOT

**Highlight. Right-click. Send anywhere.**

SLINGSHOT is an open-source browser extension that lets you highlight text on any webpage and route it to configurable destinations via the right-click context menu. Unlike webhook-only extensions, SLINGSHOT is a **destination router** with pluggable transport types and built-in cybersecurity tooling.

## Why SLINGSHOT?

Existing extensions like Send To WebHook and Webhook Manager only support webhooks — meaning you need middleware (Zapier, n8n, Make) to get data where it actually needs to go. SLINGSHOT cuts out the middleman with native support for multiple destination types, multi-destination dispatch, and built-in IOC lookup and defanging for security professionals.

**No backend. No accounts. No data leaves your browser except to destinations you configure.**

## Features

### Core
- **Multi-destination routing** — Configure named destinations, select one or many from the context menu
- **Pluggable transports** — Webhook, REST API, Clipboard+, Email, Local File
- **Rich payloads** — Sends highlighted text + source URL, page title, timestamp
- **Template engine** — Customize payloads with `{{text}}`, `{{url}}`, `{{title}}`, `{{domain}}`, `{{timestamp}}` placeholders
- **Multi-select dispatch** — Send to multiple destinations in a single action
- **Sync across devices** — Destination configs sync via Chrome storage
- **Import/Export** — Share destination configs as JSON

### Cybersecurity
- **IOC Defanging** — One-click "Make Safe" transform for threat intel sharing:
  - `1.2.3.4` → `1.2.3[.]4`
  - `evil.com` → `evil[.]com`
  - `badguy@evil.com` → `badguy@evil[.]com`
  - `https://evil.com` → `hxxps://evil[.]com`
- **IOC Lookup** — Right-click any IP, domain, hash, URL, or email to query reputation sources:
  - **Built-in:** WHOIS/RDAP, VirusTotal, AbuseIPDB, Shodan, URLScan.io, MalwareBazaar, IPInfo
  - **Custom:** Configure any REST API (XSOAR, MISP, TheHive, internal platforms) with JSONPath response mapping
- **In-page results overlay** — Lookup results appear inline without leaving the page, with "Copy as Defanged" and "Send to →" actions

### Transform Pipeline
- **Simple mode (default):** Trim whitespace, strip HTML, normalize line breaks, defang IOCs toggle
- **Advanced mode (per-destination):** Regex extract, find/replace, case transform, truncate, prepend/append — composable pipeline steps

## Context Menu

```
Slingshot →
  ☐ My Webhook
  ☐ Slack Channel
  ☐ Threat Intel API
  ───────────
  🔍 Lookup
  ───────────
  Report a Bug
```

## Quick Start

1. Install SLINGSHOT from the [Chrome Web Store](#) *(coming soon)*
2. Click the extension icon → **Settings**
3. Add a destination (e.g., a webhook URL, REST API endpoint)
4. Highlight text on any page → Right-click → **Slingshot → [Your Destination]**

## Supported Destinations

| Type | Description | Status |
|------|-------------|--------|
| Webhook | HTTP POST to any URL | v1 |
| REST API | Authenticated API calls (Bearer, Basic, API Key) | v1 |
| Clipboard+ | Enhanced clipboard with metadata | v1 |
| Email | mailto: with templated subject/body | v1 |
| Local File | Append via native messaging host | v1.1 |
| Slack | Post to channel/DM | Planned |
| Discord | Post via webhook | Planned |
| Obsidian | Append to note via Local REST API | Planned |
| Notion | Append to page/database | Planned |

## Development

```bash
git clone https://github.com/rookdynamics/SLINGSHOT.git
cd SLINGSHOT
npm install
npm run dev       # Dev mode with hot reload (Chrome)
npm run build     # Production build
npm run test      # Run tests
```

## Tech Stack

- **TypeScript** — Strict mode, no `any`
- **WXT** — Web Extension Tooling (Manifest V3, Chrome + Firefox)
- **React 18** — Options page and popup UI
- **Tailwind CSS** — Utility-first styling
- **Vitest** — Unit and integration testing

## Project Structure

```
src/
├── background/          # Service worker, context menu, dispatch
├── content/             # Text capture, lookup overlay
├── popup/               # Extension popup UI
├── options/             # Settings page UI
├── components/          # Shared React components
├── lib/
│   ├── transports/      # Webhook, REST API, clipboard, email handlers
│   ├── lookup/          # IOC detection, lookup engine, source adapters
│   └── transforms/      # Basic, defang, advanced pipeline
└── types/               # TypeScript interfaces and enums
```

## Build Phases

Development is organized into phased prompts in [`docs/prompts/`](docs/prompts/). Each phase is self-contained, touches ≤5 files, and has explicit acceptance criteria. See [`docs/SPEC.md`](docs/SPEC.md) for the full project specification.

| Phase | Focus |
|-------|-------|
| 1A/1B | Project scaffold + type definitions |
| 2A/2B | Storage, payload, transform pipeline |
| 3A/3B | Transport handlers + IOC detection |
| 4A/4B | Lookup sources + engine + overlay |
| 5A/5B | Context menu, service worker, content script |
| 6A/6B | Options UI (destinations + lookup settings) |
| 7A | Popup UI |
| 8A | Testing |
| 9A | Polish + release |

## Contributing

Contributions welcome. Please read:
- [`docs/SPEC.md`](docs/SPEC.md) — Project specification
- [`docs/DIRECTIVES.md`](docs/DIRECTIVES.md) — Agent/developer directives for code quality

## License

[MIT](LICENSE) — Copyright (c) 2026 Rook Dynamics

---

*Built by [Rook Dynamics](https://github.com/rookdynamics)*
