# SLINGSHOT Build Prompt — Phase 4A: Lookup Sources (Built-in + Custom)

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Built-In Lookup Sources and Custom Lookup Sources sections
- `src/types/lookup.ts` — LookupSource, ResponseMapping, LookupResult types
- `src/lib/lookup/ioc-detect.ts` — IOC detection from Phase 3B

## Goal
Implement the built-in lookup source adapters and the custom source engine with JSONPath response mapping.

## Current State
- Phase 3B complete: IOC detection working
- Empty files at `src/lib/lookup/sources/`

## Deliverables (max 5 files touched)
1. `src/lib/lookup/sources/whois.ts` — RDAP lookup for IPs and domains. Free, no API key. Parse RDAP JSON response for: registrar, country, ASN, creation date, name servers.
2. `src/lib/lookup/sources/virustotal.ts` — VirusTotal API v3. Handles: IP, domain, URL, hash lookups. Requires API key from settings. Parse response for: detection ratio, reputation score, last analysis date, tags.
3. `src/lib/lookup/sources/abuseipdb.ts` — AbuseIPDB API v2. IP lookups only. Parse: abuse confidence score, country, ISP, usage type, reports count.
4. `src/lib/lookup/sources/custom.ts` — Custom source engine: build request from URL template + headers + auth + body template. Execute fetch. Apply JSONPath response mappings to extract display fields. Handle `"$"` wildcard (full raw response). Error handling for malformed responses, auth failures, timeouts.
5. `src/lib/lookup/sources/index.ts` — Source registry: maps source names to handlers. Each source declares which IOC types it supports.

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Each source returns `LookupSourceResult` with consistent shape
- [ ] Sources that don't support the given IOC type return null (skip gracefully)
- [ ] Custom source correctly substitutes `{{indicator}}` and `{{type}}` in URL/body templates
- [ ] Custom source JSONPath mapping extracts nested fields correctly
- [ ] All sources handle errors gracefully (network, auth, rate limit, malformed response)
- [ ] API keys are passed as arguments — sources do NOT read storage directly

## Constraints
- Use `fetch()` for all HTTP calls
- JSONPath: use a lightweight library (jsonpath-plus or implement dot-notation parsing)
- Each source is independent — failure in one does not affect others
- Timeout: 10 second default per source
