# SLINGSHOT

**Highlight. Right-click. Send anywhere.**

SLINGSHOT is an open-source browser extension that lets you highlight text on any webpage and send it to configurable destinations via the right-click context menu.

Unlike webhook-only extensions, SLINGSHOT is a **destination router** — it supports multiple transport types out of the box: webhooks, REST APIs, enhanced clipboard, email, and local files. Configure named destinations in settings, and they appear in your context menu ready to fire.

## Features

- **Multi-destination** — Configure as many destinations as you need
- **Pluggable transports** — Webhook, REST API, Clipboard+, Email, Local File (more coming)
- **Context menu integration** — Right-click highlighted text to send
- **Rich payload** — Sends text + source URL, page title, timestamp
- **Template support** — Customize payloads with `{{text}}`, `{{url}}`, `{{title}}` placeholders
- **Sync across devices** — Destinations sync via Chrome storage
- **Test before you ship** — Test button for every destination in settings
- **Import/Export** — Share destination configs as JSON

## Quick Start

1. Install SLINGSHOT from the Chrome Web Store *(coming soon)*
2. Click the extension icon → Settings
3. Add a destination (e.g., a webhook URL)
4. Highlight text on any page → Right-click → **Slingshot → [Your Destination]**

## Supported Destinations

| Type | Status |
|------|--------|
| Webhook (HTTP POST) | v1 |
| REST API (authenticated) | v1 |
| Clipboard+ (append w/ metadata) | v1 |
| Email (mailto:) | v1 |
| Local File (via native messaging) | v1.1 |
| Slack | Planned |
| Discord | Planned |
| Obsidian | Planned |
| Notion | Planned |

## Development

```bash
# Clone
git clone https://github.com/rookdynamics/SLINGSHOT.git
cd SLINGSHOT

# Install dependencies
npm install

# Dev mode (Chrome)
npm run dev

# Build for production
npm run build
```

## Tech Stack

- TypeScript
- WXT (Web Extension Tooling)
- React + Tailwind CSS
- Vite
- Vitest + Playwright

## License

MIT — see [LICENSE](LICENSE)

## Contributing

Contributions welcome. See [docs/SPEC.md](docs/SPEC.md) for the full project specification.

---

*Built by [Rook Dynamics](https://github.com/rookdynamics)*
