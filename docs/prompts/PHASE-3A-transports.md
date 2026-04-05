# SLINGSHOT Build Prompt — Phase 3A: Transport Handlers

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Destination Types section
- `src/types/destinations.ts` — Destination config types
- `src/lib/payload.ts` — SlingPayload type and builder

## Goal
Implement transport handlers that dispatch a SlingPayload to each destination type.

## Current State
- Phases 1-2 complete: Types, storage, payload, transforms all working
- Empty files at `src/lib/transports/`

## Deliverables (max 5 files touched)
1. `src/lib/transports/webhook.ts` — HTTP POST/PUT/PATCH to configured URL. Apply body template with payload variables. Custom headers. Return success/failure + HTTP status.
2. `src/lib/transports/rest-api.ts` — Like webhook but with auth layer: Bearer token, Basic auth, API Key (header or query param). Configurable method.
3. `src/lib/transports/clipboard.ts` — Write to clipboard using Clipboard API. Support format template (plain text or with metadata).
4. `src/lib/transports/email.ts` — Construct mailto: link with subject/body templates and open in new tab.
5. `src/lib/transports/index.ts` — Transport registry: maps DestinationType enum to handler. `dispatch(destination, payload)` function that routes to correct handler.

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Each transport returns a consistent result type: `{success: boolean, status?: number, error?: string}`
- [ ] Webhook handles non-2xx responses as failures
- [ ] REST API correctly applies all auth types
- [ ] Clipboard writes formatted text
- [ ] Email opens mailto: with URL-encoded subject/body
- [ ] Transport registry dispatches to correct handler by type
- [ ] Templates are rendered before dispatch (via payload.ts template engine)

## Constraints
- Use `fetch()` for HTTP transports — no axios
- All transports are async
- Transports must not import storage directly — they receive config as arguments
- Error handling: catch network errors, timeouts, auth failures
