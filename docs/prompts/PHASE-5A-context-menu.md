# SLINGSHOT Build Prompt — Phase 5A: Context Menu & Service Worker

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Context Menu Behavior section
- `src/types/` — All type definitions
- `src/lib/transports/` — Transport handlers from Phase 3A
- `src/lib/lookup/` — Lookup engine from Phase 4B

## Goal
Wire up the background service worker: dynamic context menu creation from stored destinations, dispatch on click, lookup trigger, bug report link.

## Current State
- Phases 1-4 complete: Types, storage, payload, transforms, transports, lookup all working
- Empty files at `src/background/`

## Deliverables (max 5 files touched)
1. `src/background/context-menu.ts` — Build context menu from stored destinations. Parent: "Slingshot →". Children: one per enabled destination. Separator + "Lookup" (if IOC detected). Separator + "Report a Bug". Rebuild menu when destinations change. Handle single-destination shortcut (skip submenu).
2. `src/background/dispatch.ts` — Handle context menu click: get selected text from content script, build payload, apply transforms, dispatch to selected destination(s). Multi-select support. Return success/failure status for notification.
3. `src/background/service-worker.ts` — Main entry point. Register listeners: onInstalled (create initial menu), onStorageChanged (rebuild menu), onContextMenuClicked (route to dispatch or lookup or bug report). Message passing with content script.
4. `src/background/bug-report.ts` — Construct GitHub issue URL with pre-filled template: extension version, browser info, OS, configured destination types (no secrets), selected text (truncated 200 chars). Open in new tab.

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Context menu populates from stored destinations
- [ ] Menu rebuilds when destinations are added/removed/toggled
- [ ] Clicking a destination dispatches correctly
- [ ] "Lookup" triggers the lookup engine and overlay
- [ ] "Report a Bug" opens pre-filled GitHub issue
- [ ] Multi-destination dispatch works
- [ ] Extension loads in Chrome and context menu appears on text selection

## Constraints
- Service worker must be stateless (Manifest V3 requirement — can be terminated at any time)
- Use chrome.runtime.onMessage for content script communication
- Menu IDs must be deterministic for reliable click handling
