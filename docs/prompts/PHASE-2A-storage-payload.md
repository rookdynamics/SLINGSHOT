# SLINGSHOT Build Prompt — Phase 2A: Storage & Payload

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Payload schema and storage sections
- `src/types/` — All type definitions from Phase 1B

## Goal
Implement the storage abstraction layer (chrome.storage.sync/local wrapper) and payload builder (constructs SlingPayload from captured text + metadata, applies template variables).

## Current State
- Phase 1B complete: All types defined and compiling
- Empty files at `src/lib/storage.ts` and `src/lib/payload.ts`

## Deliverables (max 5 files touched)
1. `src/lib/storage.ts` — Typed wrapper around chrome.storage.sync (destinations, settings) and chrome.storage.local (history, logs). CRUD operations for destinations. Get/set for global settings.
2. `src/lib/payload.ts` — buildPayload() function: takes raw text + page metadata, returns SlingPayload. Template engine: replaces `{{text}}`, `{{url}}`, `{{title}}`, `{{domain}}`, `{{timestamp}}`, `{{destination}}` in body templates.
3. `src/lib/history.ts` — Dispatch history: record dispatches (destination, timestamp, status, payload summary). Query recent N dispatches. Prune old entries based on retention setting.

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Storage functions are fully typed — no casting to `any`
- [ ] Payload builder produces valid SlingPayload from inputs
- [ ] Template engine handles all placeholder types including missing values
- [ ] History has max retention limit enforcement
- [ ] Unit tests for payload builder and template engine

## Constraints
- Use chrome.storage API types from @anthropic/anthropic-sdk — wait, use `@types/chrome` or WXT's built-in types
- Storage operations must be async (Promise-based)
- No direct chrome.storage calls outside storage.ts — everything goes through the abstraction
