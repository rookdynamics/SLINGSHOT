# SLINGSHOT Build Prompt — Phase 3B: IOC Detection Engine

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — IOC Auto-Detection and Lookup sections
- `src/types/lookup.ts` — IOC type enum, lookup types

## Goal
Implement the IOC auto-detection module that identifies what type of indicator is in the highlighted text.

## Current State
- Phases 1-3A complete
- Empty files at `src/lib/lookup/ioc-detect.ts`

## Deliverables (max 3 files touched)
1. `src/lib/lookup/ioc-detect.ts` — detectIOC(text: string): {type: IOCType, value: string} | null. Regex-based detection for: IPv4, IPv6, domain (FQDN), URL, file hash (MD5/SHA1/SHA256 by length), email. Priority: URL > email > domain > IP > hash. Extract the clean indicator value (strip surrounding whitespace/punctuation). Handle mixed text (find the most specific IOC in a selection).
2. Unit tests for IOC detection — comprehensive test cases covering: clean indicators, indicators in surrounding text, multiple IOC types in one selection, edge cases (localhost, RFC1918 IPs, punycode domains, IPv6 shorthand)
3. `src/lib/lookup/index.ts` — Barrel export

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Correctly identifies all 6 IOC types
- [ ] Priority ordering works (URL containing a domain → detected as URL, not domain)
- [ ] Handles messy selections (extra whitespace, trailing punctuation)
- [ ] Does NOT false-positive on version numbers (1.2.3), partial IPs, short hex strings
- [ ] Hash detection differentiates MD5 (32), SHA1 (40), SHA256 (64) by length

## Constraints
- Pure function — no side effects
- Single responsibility: detect only, no lookup
- Must be fast — runs on every right-click to determine menu state
