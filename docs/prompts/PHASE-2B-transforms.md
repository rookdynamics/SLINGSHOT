# SLINGSHOT Build Prompt — Phase 2B: Transform Pipeline

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Payload Transformations and Defang IOCs sections
- `src/types/settings.ts` — TransformConfig, DefangOptions types

## Goal
Implement the transform pipeline: basic transforms (always-on), defang IOCs, and advanced transform steps.

## Current State
- Phase 2A complete: Storage and payload modules working
- Empty files at `src/lib/transforms/`

## Deliverables (max 5 files touched)
1. `src/lib/transforms/basic.ts` — Always-on transforms: trim whitespace, strip HTML tags, normalize line breaks
2. `src/lib/transforms/defang.ts` — IOC defanging: IPv4 (1.2.3.4 → 1.2.3[.]4), IPv6, domains (evil.com → evil[.]com), emails (bad@evil.com → bad@evil[.]com), URLs (https:// → hxxps://, dots defanged). Must handle multiple IOCs in one text block.
3. `src/lib/transforms/pipeline.ts` — Transform pipeline runner: takes text + TransformConfig, applies basic transforms, then optionally defang, then advanced steps (regex extract, find/replace, case transform, truncate, prepend/append). Steps execute in order.
4. `src/lib/transforms/index.ts` — Barrel export
5. Unit tests for defang module — comprehensive IOC test cases

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Defang handles: IPv4, IPv6, domains, subdomains, emails, URLs with paths
- [ ] Defang does NOT mangle non-IOC text
- [ ] Pipeline applies transforms in correct order
- [ ] Advanced steps are optional and composable
- [ ] All defang patterns have unit tests with edge cases

## Constraints
- Pure functions — no side effects, no storage access
- Defang regex must handle edge cases: IPs in URLs, domains with ports, multiple IOCs per line
- Each transform step is independently testable
