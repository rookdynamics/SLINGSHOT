# SLINGSHOT Build Prompt — Phase 4B: Lookup Engine & Results Overlay

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Lookup Results Popup section
- `src/types/lookup.ts` — LookupResult types
- `src/lib/lookup/sources/` — All source implementations from Phase 4A

## Goal
Implement the lookup orchestration engine (parallel queries, result aggregation, caching) and the in-page results overlay UI.

## Current State
- Phase 4A complete: All lookup sources implemented
- Empty file at `src/lib/lookup/engine.ts`

## Deliverables (max 5 files touched)
1. `src/lib/lookup/engine.ts` — Lookup orchestrator: takes an indicator + type + list of enabled sources. Queries all applicable sources in parallel (Promise.allSettled). Aggregates results into LookupResult. Session cache (same indicator won't re-query within 5 minutes). Timeout handling per source.
2. `src/content/lookup-overlay.tsx` — React component: in-page overlay popup anchored near highlighted text. Collapsible sections per source. Results stream in as they return (loading → result → error states per source). "Copy as Defanged" button. "Send to →" button (dispatches enriched results to a Slingshot destination). Dismiss with Escape or click outside.
3. `src/content/lookup-overlay.css` — Styles for the overlay (must not conflict with host page CSS — use shadow DOM or heavy namespacing)
4. Update `src/content/capture.ts` — Wire the overlay injection into the content script lifecycle

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Engine queries sources in parallel, not sequentially
- [ ] Failed sources show error in results (don't break the whole lookup)
- [ ] Cache prevents duplicate queries within 5-minute window
- [ ] Overlay renders without breaking host page layout/styles
- [ ] Overlay is dismissible via Escape key and clicking outside
- [ ] "Copy as Defanged" works correctly
- [ ] "Send to →" opens destination picker and dispatches

## Constraints
- Overlay styles must be isolated from host page (shadow DOM preferred)
- No full-page overlay/backdrop — just a positioned card near the selection
- React portal or shadow DOM for rendering
- Keep the overlay lightweight — no heavy component library
