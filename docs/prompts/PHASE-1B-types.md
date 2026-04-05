# SLINGSHOT Build Prompt — Phase 1B: Core Type Definitions

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Full project specification (payload schema, destination types, lookup types)

## Goal
Define all TypeScript interfaces and types that the entire codebase will depend on. This is the foundation — get it right now.

## Current State
- Phase 1A complete: WXT project scaffolded and compiling
- Empty type files exist at `src/types/`

## Deliverables (max 5 files touched)
1. `src/types/destinations.ts` — Destination config types (Webhook, REST API, Clipboard+, Email, Local File), base DestinationConfig interface, transport-specific config interfaces, DestinationType enum
2. `src/types/payload.ts` — SlingPayload interface (text, source, timestamp, metadata), TemplateVariables
3. `src/types/lookup.ts` — IOC types enum, LookupSource interface (built-in + custom), ResponseMapping, LookupResult, LookupSourceResult
4. `src/types/settings.ts` — GlobalSettings interface, TransformConfig (simple + advanced), DefangOptions
5. `src/types/index.ts` — Barrel export

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] All types from SPEC.md are represented
- [ ] No `any` types — everything explicitly typed
- [ ] Discriminated unions for destination types (switch on `type` field)
- [ ] JSDoc comments on all exported interfaces

## Constraints
- No runtime code — types/interfaces only
- Use discriminated unions, not inheritance
- Export everything from barrel file
