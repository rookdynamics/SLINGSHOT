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

## IOC Lookup (Right-Click)

SLINGSHOT includes a built-in **Lookup** feature for cybersecurity workflows. When the user highlights an indicator of compromise (IP, domain, URL, hash, email), a "Lookup" option appears in the context menu. Results are displayed in an in-page overlay popup without leaving the current tab.

### Context Menu Position

```
Slingshot →
  ☐ My Webhook
  ☐ Slack Channel
  ───────────
  🔍 Lookup
  ───────────
  Report a Bug
```

### IOC Auto-Detection

The extension auto-detects the IOC type from the highlighted text using regex:

| IOC Type | Detection Pattern | Example |
|----------|-------------------|---------|
| IPv4 | `\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b` | `1.2.3.4` |
| IPv6 | Standard IPv6 regex | `2001:db8::1` |
| Domain | FQDN pattern (no protocol) | `evil.com` |
| URL | `https?://...` | `https://evil.com/payload` |
| File Hash | Hex string, length-based (32=MD5, 40=SHA1, 64=SHA256) | `d41d8cd9...` |
| Email | Standard email regex | `badguy@evil.com` |

If the selected text contains multiple IOC types, the extension uses the most specific match (URL > domain > IP).

### Built-In Lookup Sources

These ship with the extension and require only an API key in settings:

| Source | IOC Types | API Key Required | Free Tier |
|--------|-----------|------------------|-----------|
| WHOIS/RDAP | Domain, IP | No | Unlimited |
| VirusTotal | IP, Domain, URL, Hash | Yes | 4 req/min |
| AbuseIPDB | IP | Yes | 1000/day |
| Shodan | IP | Yes | Limited |
| URLScan.io | URL, Domain | Yes | 1000/day |
| MalwareBazaar | Hash | No | Unlimited |
| IPInfo | IP | Optional | 50k/month |

### Custom Lookup Sources

Users can configure **custom lookup sources** in settings to query any API — XSOAR, MISP, TheHive, internal threat intel platforms, or any REST endpoint.

#### Custom Source Configuration

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name in results | `XSOAR Lookup` |
| **IOC Types** | Which IOC types this source handles | `[ip, domain, hash]` |
| **URL Template** | API endpoint with `{{indicator}}` placeholder | `https://xsoar.corp.com/api/indicators/search?value={{indicator}}` |
| **Method** | HTTP method | `GET` or `POST` |
| **Headers** | Custom headers (auth, content-type) | `Authorization: <API_KEY>`, `Content-Type: application/json` |
| **Body Template** | Request body for POST (with `{{indicator}}`, `{{type}}` placeholders) | `{"indicator": "{{indicator}}", "type": "{{type}}"}` |
| **Auth Type** | Authentication method | None / Bearer / Basic / API Key (header) / API Key (query param) |
| **Response Mapping** | JSONPath or dot-notation mappings to extract display fields from the response | See below |

#### Response Mapping

Since every API returns data differently, custom sources use a **response mapping** to tell the extension which fields to display. Each mapping is a key-value pair: display label → JSONPath into the response.

Example for an XSOAR-style response:

```json
{
  "mappings": {
    "Verdict": "$.data.verdict",
    "Score": "$.data.score",
    "Source": "$.data.source",
    "Last Seen": "$.data.lastSeen",
    "Tags": "$.data.tags",
    "Description": "$.data.description"
  }
}
```

Example for a custom threat intel API:

```json
{
  "mappings": {
    "Risk Score": "$.risk.score",
    "Category": "$.risk.category",
    "First Seen": "$.timeline.first_seen",
    "Country": "$.geo.country",
    "ASN": "$.network.asn",
    "Raw": "$"
  }
}
```

The special mapping value `"$"` dumps the full raw JSON response into a collapsible section for debugging or when you're still figuring out the response structure.

#### Custom Source Testing

Each custom source has a **Test** button in settings. Enter a sample indicator, fire the request, and see:
- HTTP status code
- Raw response body (collapsible)
- Parsed fields based on the response mapping
- Any errors (auth failure, timeout, mapping miss)

### Lookup Results Popup

Results display in an **in-page overlay** (not a new tab) anchored near the highlighted text:

```
┌─────────────────────────────────────────┐
│ 🔍 Lookup: 1.2.3.4 (IPv4)        [✕]  │
├─────────────────────────────────────────┤
│ ▼ WHOIS/RDAP                           │
│   ASN: AS13335 (Cloudflare)             │
│   Country: US                           │
│   Registrar: ARIN                       │
│                                         │
│ ▼ VirusTotal                            │
│   Detections: 3/89                      │
│   Reputation: -15                       │
│   Last Analysis: 2026-04-03             │
│                                         │
│ ▼ XSOAR Lookup (custom)                │
│   Verdict: Suspicious                   │
│   Score: 72                             │
│   Tags: [C2, proxy]                     │
│                                         │
├─────────────────────────────────────────┤
│ [Copy as Defanged]  [Send to →]         │
└─────────────────────────────────────────┘
```

Key behaviors:
- Sources are queried in parallel; results stream in as they return
- Failed sources show error inline (timeout, auth error, rate limit)
- Collapsible sections per source
- **"Copy as Defanged"** copies the indicator in defanged format
- **"Send to →"** dispatches the enriched lookup result (indicator + all source results as structured text) to a Slingshot destination — closing the loop with core functionality
- Popup is dismissible with Escape or clicking outside
- Results are cached for the session (same indicator won't re-query within 5 minutes)


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
- **Defang IOCs** — "Make Safe" for cybersecurity/threat intel contexts

### Defang IOCs Transform ("Make Safe")

A built-in transform specifically for cybersecurity and threat intelligence workflows. When enabled on a destination, all indicators of compromise (IOCs) in the selected text are automatically defanged before dispatch:

| IOC Type | Original | Defanged |
|----------|----------|----------|
| IPv4 Address | `1.2.3.4` | `1.2.3[.]4` |
| Domain | `evil.com` | `evil[.]com` |
| Email | `badguy@evil.com` | `badguy@evil[.]com` |
| URL | `https://evil.com/payload` | `hxxps://evil[.]com/payload` |
| IPv6 Address | `2001:db8::1` | `2001:db8[:]1` |

Implementation notes:
- Regex-based detection and replacement for each IOC type
- Handles multiple IOCs in a single text block
- Preserves surrounding text and formatting
- Available in both simple mode (as a toggle: "Defang IOCs") and advanced mode (as a pipeline step)
- This is a **one-way transform** — there is no "refang" option in the extension since the purpose is safe sharing

This is particularly useful for destinations like Slack, Discord, or email where you want to share indicators without them becoming clickable/resolvable links.

Advanced mode is exposed as an expandable "Transforms" section in the destination config card. Hidden by default to keep the simple path clean.
