# SLINGSHOT Build Prompt — Phase 5B: Content Script

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — full spec
- `src/background/service-worker.ts` — Service worker from Phase 5A
- `src/content/lookup-overlay.tsx` — Overlay from Phase 4B

## Goal
Complete the content script: text selection capture, page metadata extraction, message passing with the service worker, and overlay lifecycle management.

## Current State
- Phase 5A complete: Service worker and context menu working
- Partial `src/content/capture.ts` from Phase 4B overlay wiring

## Deliverables (max 3 files touched)
1. `src/content/capture.ts` — Listen for messages from service worker requesting selected text + metadata. Return: selected text, page URL, page title, domain. Handle edge cases: no selection, selection in iframes, selection in input fields. Manage lookup overlay lifecycle (inject, position, dismiss).
2. `src/content/styles.css` — Minimal content script styles (overlay positioning, toast notifications for dispatch success/failure)
3. Update `wxt.config.ts` if needed for content script registration

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Content script correctly captures selected text on any page
- [ ] Page metadata (URL, title, domain) is accurately extracted
- [ ] Messages to/from service worker work reliably
- [ ] Lookup overlay appears near selection and is dismissible
- [ ] Toast notification shows on dispatch success/failure
- [ ] No conflicts with host page JavaScript or CSS

## Constraints
- Content script must be lightweight — minimal DOM manipulation
- CSS must be scoped (shadow DOM for overlay, namespaced classes for toasts)
- Handle dynamic pages (SPAs) where URL changes without full reload
