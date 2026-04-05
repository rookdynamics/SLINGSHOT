# SLINGSHOT Build Prompt — Phase 6A: Options Page — Destination Management

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Settings UI and Destination Management sections
- `src/types/destinations.ts` — Destination config types
- `src/lib/storage.ts` — Storage abstraction from Phase 2A

## Goal
Build the options page UI for managing destinations: add, edit, delete, toggle, test, reorder.

## Current State
- Phases 1-5 complete: All backend logic working, extension loads
- Empty files at `src/options/`

## Deliverables (max 5 files touched)
1. `src/options/Options.tsx` — Main options page layout: destination list + global settings tabs/sections
2. `src/components/DestinationCard.tsx` — Card component for a single destination: name, type badge, enabled toggle, edit/delete/test buttons. Expandable config section with type-specific fields. Transform config (simple toggle + advanced pipeline editor).
3. `src/components/DestinationForm.tsx` — Add/edit form: name, type dropdown, dynamic config fields based on selected type (Webhook fields, REST API fields with auth, Clipboard format, Email fields). Validate required fields. Save to storage.
4. `src/components/TestResult.tsx` — Test dispatch result display: loading spinner, success/failure status, HTTP response code, response body preview (collapsible).
5. `src/options/index.tsx` — Entry point, React root mount

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Options page opens from extension icon → Settings
- [ ] Can add a new destination of each type
- [ ] Type-specific config fields render correctly per destination type
- [ ] Can edit existing destinations
- [ ] Can delete destinations (with confirmation)
- [ ] Can toggle destinations enabled/disabled
- [ ] Test button fires a test dispatch and shows result
- [ ] Changes persist to chrome.storage.sync
- [ ] Responsive layout, looks good on standard options page width
- [ ] Tailwind CSS applied correctly

## Constraints
- React 18 functional components with hooks only
- All state from chrome.storage — no local-only state for config data
- Form validation before save
- Tailwind for all styling — no inline styles or separate CSS modules
