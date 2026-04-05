# SLINGSHOT Build Prompt — Phase 7A: Popup UI

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Popup section
- `src/lib/history.ts` — Dispatch history from Phase 2A

## Goal
Build the extension popup: quick status overview, recent dispatch history, and destination shortcuts.

## Current State
- Phases 1-6 complete: Full backend + options page working
- Empty files at `src/popup/`

## Deliverables (max 4 files touched)
1. `src/popup/Popup.tsx` — Main popup component: header with extension name/version, destination quick-list (click to set as default/favorite), recent dispatches (last 10) with status indicators (success/failure), link to open full options page.
2. `src/popup/index.tsx` — Entry point, React root mount
3. `src/popup/popup.html` — HTML shell for popup (WXT may generate this — check WXT docs)
4. `src/components/DispatchHistoryItem.tsx` — Single history entry: destination name, timestamp, status badge, payload preview (truncated), expandable details

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Popup opens on extension icon click
- [ ] Shows recent dispatch history with status
- [ ] Links to options page work
- [ ] Popup width/height appropriate (400x500 max)
- [ ] Tailwind styled, consistent with options page

## Constraints
- Popup must load fast — no heavy initialization
- Read history from chrome.storage.local on mount
- Keep it simple — popup is for glanceable info, not configuration
