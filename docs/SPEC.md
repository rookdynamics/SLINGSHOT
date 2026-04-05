# SLINGSHOT — Project Specification

**Owner:** Rook Dynamics
**License:** MIT
**Status:** Planning
**Created:** 2026-04-04

---

## Summary

SLINGSHOT is an open-source, general-purpose browser extension that lets users highlight text on any webpage, right-click, and send it to one or more configurable destinations. Unlike existing webhook-only extensions, SLINGSHOT supports multiple destination *types* — webhooks, APIs, local actions, messaging platforms, and more — making it a true text-routing tool.

## Problem

Existing solutions in this space (Send To WebHook, Webhook Manager, etc.) are webhook-centric. They require the user to stand up middleware (n8n, Zapier, Make) to route data to its final destination. There is no general-purpose extension that acts as a **destination router** with pluggable transport types configured directly in the extension.

## Core Concept

```
[Highlight Text] → [Right-Click] → [Select Destination] → [Delivered]
```

The extension maintains a list of named destinations, each with a configured transport type and settings. The context menu dynamically populates with available destinations. Selected text (plus optional metadata like source URL, timestamp, page title) is dispatched to the chosen destination.

## Destination Types (v1 Target)

| Type | Description | Config Fields |
|------|-------------|---------------|
| **Webhook** | HTTP POST to arbitrary URL | URL, method, headers, body template |
| **REST API** | Authenticated API call | URL, method, auth type (Bearer/Basic/API Key), headers, body template |
| **Clipboard+** | Enhanced clipboard (append, with metadata) | Format template |
| **Local File** | Append to a local file (via native messaging host) | File path, format |
| **Email** | Send via mailto: link | To, subject template, body template |

### Future Destination Types (v2+)

| Type | Description |
|------|-------------|
| **Slack** | Post to channel/DM via Slack API |
| **Discord** | Post to channel via Discord webhook |
| **Obsidian** | Append to note via Obsidian Local REST API |
| **Notion** | Append to page/database via Notion API |
| **Custom Script** | Execute local script via native messaging host |

## Payload Schema

Every dispatch sends a standardized payload, adapted per transport:

```json
{
  "text": "The highlighted text content",
  "source": {
    "url": "https://example.com/page",
    "title": "Page Title",
    "domain": "example.com"
  },
  "timestamp": "2026-04-04T18:45:00Z",
  "destination": "My Slack Channel",
  "metadata": {
    "extension_version": "1.0.0",
    "browser": "chrome"
  }
}
```

Body templates support placeholders: `{{text}}`, `{{url}}`, `{{title}}`, `{{domain}}`, `{{timestamp}}`, `{{destination}}`.

## Architecture

### Components

1. **Manifest (manifest.json)** — Manifest V3, Chrome + Firefox target
2. **Background Service Worker** — Context menu creation, dispatch routing, destination management
3. **Content Script** — Captures selected text and page metadata
4. **Options Page (Settings UI)** — Destination CRUD, import/export, test destinations
5. **Popup** — Quick status, recent dispatches, destination shortcuts
6. **Native Messaging Host** (optional, v1.1+) — For local file and script destinations

### Data Flow

```
Content Script (selection + metadata)
    ↓ chrome.runtime.sendMessage
Service Worker (dispatch router)
    ↓ destination.type switch
Transport Handler (webhook | api | clipboard | file | email)
    ↓
Destination
```

### Storage

- `chrome.storage.sync` — Destination configs (synced across devices)
- `chrome.storage.local` — Dispatch history, logs, large configs

## Settings UI

### Destination Management

Each destination is a card/row with:
- **Name** — displayed in context menu
- **Type** — dropdown (Webhook, REST API, Clipboard+, Local File, Email)
- **Enabled** — toggle on/off without deleting
- **Config** — type-specific fields rendered dynamically
- **Test** — fire a test dispatch with sample data
- **Icon/Color** — optional visual identifier in context menu

### Global Settings

- Default payload format (JSON, plain text, Markdown)
- Include source URL by default (on/off)
- Include page title by default (on/off)
- Dispatch notifications (toast on success/failure)
- History retention (number of dispatches to keep)
- Import/Export destinations as JSON

## Context Menu Behavior

- Parent menu item: **"Slingshot →"**
- Child items: one per enabled destination, by name
- If only one destination: skip submenu, show directly as "Slingshot to [Name]"
- Multi-select: users can select multiple destinations per dispatch (see Design Decisions)
- Grayed out if no text selected
- Optional keyboard shortcut per destination
- **Separator line**
- **"Report a Bug"** — always present at bottom of the submenu

### Report a Bug (Context Menu)

A persistent "Report a Bug" item appears at the bottom of the Slingshot context menu, separated from destinations by a divider. When clicked:

1. Automatically captures context:
   - Current page URL
   - Extension version
   - Browser name + version
   - OS platform
   - List of configured destination types (no secrets/URLs)
   - Selected text (if any, truncated to 200 chars) as reproduction context
2. Opens a new tab to GitHub Issues with a pre-filled issue template:
   - URL: `https://github.com/rookdynamics/SLINGSHOT/issues/new`
   - Query params populate title prefix `[Bug Report]` and body with captured context
   - User adds their description of the problem above the auto-captured block
3. No data is sent anywhere automatically — the user reviews and submits the GitHub issue themselves

This keeps bug reporting frictionless (two clicks from any page) while giving us structured context on every report.

## Design Decisions (Resolved)

### 1. Conditional Routing — NO
All destinations are always visible in the context menu regardless of the current page. Keep it simple. Users can mentally skip destinations that aren't relevant. Revisit only if user feedback demands it.

### 2. Multi-Destination Dispatch — YES (multi-select in context menu)
Users can send to multiple destinations in a single action. Implementation: context menu items get checkboxes or a "Send to selected" flow. Exact UX TBD — options include:
- Hold modifier key (Ctrl/Cmd) + click to queue multiple, release to fire
- Submenu with checkboxes and a "Send" button at the bottom
- "Send to All" option as a built-in destination

### 3. Payload Transformations — TIERED
**Simple mode (default):** Basic transforms applied automatically — trim whitespace, strip HTML tags, normalize line breaks. Always on, no config needed.

**Advanced mode (opt-in per destination):** Per-destination transform pipeline with steps like:
- Regex extract (capture group)
- Find/replace
- Case transform (upper, lower, title)
- Markdown → plain text
- Truncate to N characters
- Prepend/append static text

Advanced mode is exposed as an expandable "Transforms" section in the destination config card. Hidden by default to keep the simple path clean.
