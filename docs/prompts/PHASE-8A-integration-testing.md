# SLINGSHOT Build Prompt — Phase 8A: Integration & E2E Testing

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- All `src/` files — the complete codebase

## Goal
Write integration tests and end-to-end tests to verify the full dispatch and lookup flows work correctly.

## Current State
- Phases 1-7 complete: Full extension built and functional
- Empty test directories at `tests/`

## Deliverables (max 5 files touched)
1. `tests/unit/transforms.test.ts` — Unit tests for all transform modules (basic, defang, pipeline)
2. `tests/unit/ioc-detect.test.ts` — Unit tests for IOC detection (all types, edge cases, priority)
3. `tests/unit/payload.test.ts` — Unit tests for payload builder and template engine
4. `tests/unit/transports.test.ts` — Unit tests for transport handlers (mock fetch, verify request construction)
5. `vitest.config.ts` — Vitest configuration for the extension context

## Acceptance Criteria
- [ ] `npm run test` passes all tests
- [ ] Transform tests cover: basic transforms, all IOC defang patterns, pipeline ordering
- [ ] IOC detect tests cover: all 6 types, edge cases, priority ordering
- [ ] Payload tests cover: all template variables, missing values, edge cases
- [ ] Transport tests verify correct HTTP request construction per type
- [ ] Tests use proper mocking for chrome.* APIs and fetch

## Constraints
- Use Vitest (compatible with WXT)
- Mock chrome.* APIs — don't require a real browser
- Mock fetch for HTTP transport tests
- Tests should be fast — no network calls
