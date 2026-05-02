# PHASE 1B — Tests: Core Type Definitions

**Phase goal:** every TypeScript interface and type the rest of the codebase will depend on (destinations, payload, lookup sources, settings, transforms) is defined under `src/types/`, exported from a barrel, and type-checks cleanly with strict mode.

This phase ships **types only** — there is no runtime code to exercise. Verification is therefore static: file presence, content shape, and `tsc --noEmit` exit code.

> **Review history:** the initial draft was reviewed item-by-item with the project owner on 2026-05-01. Several types gained fields, several questions were deferred, and `docs/OPEN-QUESTIONS.md` was created to track them. The checklist below reflects the **post-review** shape — not the initial draft.

---

## Manual Test Checklist

Run from the repo root: `/Users/claude/repos/slingshot`

### File presence
- [ ] `src/types/settings.ts` exists and is non-empty
- [ ] `src/types/payload.ts` exists and is non-empty
- [ ] `src/types/destinations.ts` exists and is non-empty
- [ ] `src/types/lookup.ts` exists and is non-empty
- [ ] `src/types/index.ts` exists and re-exports the four sibling modules
- [ ] `docs/OPEN-QUESTIONS.md` exists with entries Q-001 through Q-010

### Type-checking
- [ ] `npx tsc --noEmit` exits with code `0` and prints nothing
- [ ] `npm run compile` exits with code `0` (alias of the above)
- [ ] `npm run build` still produces `build/chrome-mv3/manifest.json` and `background.js`

### `settings.ts` shape
- [ ] Exports `PayloadFormat` literal union (`'json' | 'plain' | 'markdown'`)
- [ ] Exports `BrowserKind` literal union (`'chrome' | 'firefox'`)
- [ ] Exports `GlobalSettings` (interface) with: `defaultPayloadFormat`, `includeSourceUrl`, `includePageTitle`, `dispatchNotifications`, `historyRetention`, `lookupCacheTtlSeconds`
- [ ] Exports `DestinationOverrides` (interface) with optional `includeSourceUrl?`, `includePageTitle?`, `dispatchNotifications?`
- [ ] Exports `TransformConfig` discriminated union with `mode: 'simple' | 'advanced'`
- [ ] Exports `SimpleTransformConfig` (mode: 'simple') and `AdvancedTransformConfig` (mode: 'advanced')
- [ ] Exports `SimpleTransformOptions` with `trimWhitespace`, `stripHtml`, `normalizeLineBreaks`, `defangIocs`
- [ ] Exports `TransformStep` discriminated union covering all 7 step kinds: `regex_extract`, `find_replace`, `case_transform`, `markdown_to_plain`, `truncate`, `prepend_append`, `defang`
- [ ] Exports `CaseMode` (`'upper' | 'lower' | 'title'`)
- [ ] Exports `DefangOptions` covering all five SPEC IOC types (`ipv4`, `ipv6`, `domain`, `url`, `email`)

### `payload.ts` shape
- [ ] Exports `SlingPayload` matching the SPEC's payload schema (text, source, timestamp, destination, metadata)
- [ ] `SlingPayloadSource` carries `url`, `title`, `domain`
- [ ] `SlingPayloadMetadata` carries `extension_version` (snake_case — see Q-004) and `browser` (typed as `BrowserKind`)
- [ ] Exports `TemplateVariables` with keys `text`, `url`, `title`, `domain`, `timestamp`, `destination`
- [ ] Exports `DispatchResult` discriminated union on `ok: true | false`
- [ ] `DispatchSuccess` carries `destinationId`, `completedAt`, optional `httpStatus?`, optional `responseSnippet?`
- [ ] `DispatchFailure` carries `destinationId`, `completedAt`, `errorCode`, `error`, optional `httpStatus?`, optional `responseSnippet?` (added during review for symmetry with success)
- [ ] Exports `DispatchErrorCode` covering: `network`, `http_status`, `auth_failed`, `timeout`, `invalid_config`, `permission_denied`, `unknown`

### `destinations.ts` shape
- [ ] Exports `DestinationType` literal union (`'webhook' | 'rest_api' | 'clipboard_plus' | 'local_file' | 'email'`)
- [ ] Exports `HttpMethod` (`'GET' | 'POST' | 'PUT' | 'PATCH'`) — note `DELETE` is intentionally excluded, see Q-005
- [ ] Exports `DestinationBase` carrying:
  - `id`, `name`, `enabled` (required)
  - `description?`, `icon?`, `color?`, `keyboardShortcut?`, `tags?: string[]` (optional)
  - `transforms: TransformConfig` (required)
  - `overrides?: DestinationOverrides` (optional)
  - `createdAt`, `updatedAt` (required, ISO-8601 strings)
- [ ] Exports `Destination` discriminated union with five variants whose `type` literals match `DestinationType`
- [ ] `WebhookDestination` carries `url`, `method`, `payloadFormat`, `headers`, `bodyTemplate`, optional `timeoutMs?`
- [ ] `RestApiDestination` carries the same as Webhook plus `auth: DestinationAuth`
- [ ] Exports `DestinationAuth` discriminated union with **6** variants: `none`, `bearer`, `basic`, `api_key_header`, `api_key_query`, `api_credentials`
- [ ] `ApiCredentialsAuth` carries `apiId`, `apiUrl`, `apiSecret` (sensitive — see Q-006)
- [ ] `ClipboardPlusDestination` carries `formatTemplate` and `appendToExisting`
- [ ] `LocalFileDestination` carries `filePath` and `formatTemplate`
- [ ] `EmailDestination` carries `to`, `subjectTemplate`, `bodyTemplate`

### `lookup.ts` shape
- [ ] Exports `IOCType` literal union (`ipv4 | ipv6 | domain | url | hash | email`)
- [ ] Exports `HashAlgorithm` (`md5 | sha1 | sha256`)
- [ ] Exports `DetectedIndicator` carrying `value`, `type`, optional `hashAlgorithm`
- [ ] Exports `LookupAuth` discriminated union with 6 variants matching `DestinationAuth` (including `api_credentials`)
- [ ] Exports `ResponseMappingEntry` (`label`, `path`)
- [ ] Exports `ResponseMapping` with `mappings: ResponseMappingEntry[]` (ordered array, not a record — for guaranteed render order)
- [ ] Exports `RateLimit` (`maxRequests`, `windowSeconds`)
- [ ] Exports `BuiltInSourceId` covering all 7 SPEC built-ins: `whois_rdap`, `virustotal`, `abuseipdb`, `shodan`, `urlscan`, `malwarebazaar`, `ipinfo`
- [ ] `BuiltInLookupSource` (origin: 'built_in') carries `sourceId`, optional `apiKey`, optional `rateLimit`
- [ ] `CustomLookupSource` (origin: 'custom') carries `urlTemplate`, `method`, `headers`, optional `bodyTemplate`, `auth`, `responseMapping`, optional `rateLimit`, optional `timeoutMs`
- [ ] Exports `LookupSource` discriminated union (`origin`)
- [ ] Exports `LookupSourceResult` discriminated union (`pending | ok | error`)
- [ ] Exports `LookupFieldValue` (`string | number | boolean | null | string[] | Record<string, unknown>`)
- [ ] Exports `LookupErrorCode` covering: `network`, `http_status`, `auth_failed`, `rate_limited`, `timeout`, `mapping_miss`, `invalid_config`, `unknown`
- [ ] Exports `LookupResult` (aggregate) with `indicator`, `startedAt`, `sources: LookupSourceResult[]`

### `index.ts` barrel
- [ ] Re-exports everything from each of the four sibling modules via `export *`
- [ ] Contains no type or value definitions of its own (pure re-export)

### Code hygiene
- [ ] No `any` anywhere in `src/types/` (`grep -RnE ':\s*any\b' src/types/` returns nothing)
- [ ] No runtime code (no top-level `const`/`let`/`function`/`class`) in any `src/types/*.ts` file
- [ ] Every exported `interface` and top-level `type` carries a JSDoc block

### Repository hygiene
- [ ] `git status` shows the four modified type files (`destinations.ts`, `lookup.ts`, `payload.ts`, `settings.ts`), one new type file (`index.ts`), this test doc, and `docs/OPEN-QUESTIONS.md`
- [ ] No accidental edits to `src/entrypoints/background.ts` or any Phase 1A config

### Open Questions log
- [ ] `docs/OPEN-QUESTIONS.md` exists at the repo's `docs/` root
- [ ] Contains entries Q-001 through Q-010 (10 entries) under "Open"
- [ ] Each entry has Raised / Question / Current decision / Revisit when sections

---

## Claude Desktop Prompt

Copy everything between the `--- BEGIN ---` and `--- END ---` markers and paste into a fresh Claude Desktop conversation that has filesystem MCP access to `/Users/claude/repos/slingshot`.

```
--- BEGIN ---
You are verifying Phase 1B of the SLINGSHOT browser-extension project. The repo lives at /Users/claude/repos/slingshot. Phase 1B's goal is to define every TypeScript type the rest of the codebase will depend on (destinations, payload, lookup sources, settings, transforms) in src/types/, with a barrel re-export, and to keep `tsc --noEmit` green under strict mode. There is NO runtime code in this phase — verification is purely static.

Run the checks below in order. For each, report PASS / FAIL with the relevant evidence (a file path, a regex match excerpt, or command output). At the end, give a single overall verdict and list every FAIL with what would need to be fixed.

You may NOT modify any files — this is a read-only verification pass.

CHECK 1 — File presence
  Confirm each of these files exists and is non-empty (size > 0 bytes):
    src/types/settings.ts
    src/types/payload.ts
    src/types/destinations.ts
    src/types/lookup.ts
    src/types/index.ts
    docs/OPEN-QUESTIONS.md

CHECK 2 — TypeScript type-check passes
  Run: cd /Users/claude/repos/slingshot && npx tsc --noEmit 2>&1
  Expected: exit code 0, no output. Any TS error is a FAIL.

CHECK 3 — Production build still works
  Run: cd /Users/claude/repos/slingshot && npm run build 2>&1
  Expected: build finishes successfully and writes build/chrome-mv3/manifest.json + background.js.

CHECK 4 — settings.ts shape
  Read src/types/settings.ts and confirm exports of:
    - PayloadFormat  (= 'json' | 'plain' | 'markdown')
    - BrowserKind    (= 'chrome' | 'firefox')
    - GlobalSettings (interface) with fields: defaultPayloadFormat, includeSourceUrl, includePageTitle, dispatchNotifications, historyRetention, lookupCacheTtlSeconds
    - DestinationOverrides (interface) with optional fields: includeSourceUrl, includePageTitle, dispatchNotifications
    - DefangOptions  (interface) with all five fields: ipv4, ipv6, domain, url, email
    - SimpleTransformOptions (interface) with fields: trimWhitespace, stripHtml, normalizeLineBreaks, defangIocs
    - SimpleTransformConfig    (mode: 'simple')
    - AdvancedTransformConfig  (mode: 'advanced')
    - TransformConfig          (= SimpleTransformConfig | AdvancedTransformConfig)
    - CaseMode  (= 'upper' | 'lower' | 'title')
    - TransformStep            (discriminated union)
    - The TransformStep union covers all 7 SPEC step kinds: 'regex_extract', 'find_replace', 'case_transform', 'markdown_to_plain', 'truncate', 'prepend_append', 'defang'

CHECK 5 — payload.ts shape
  Read src/types/payload.ts and confirm exports of:
    - SlingPayload (interface) with fields: text, source, timestamp, destination, metadata
    - SlingPayloadSource with url, title, domain
    - SlingPayloadMetadata with extension_version (snake_case is intentional, see Q-004), browser (typed BrowserKind)
    - TemplateVariables with keys: text, url, title, domain, timestamp, destination
    - DispatchResult (discriminated union with `ok: true | false`)
    - DispatchSuccess with destinationId, completedAt, optional httpStatus, optional responseSnippet
    - DispatchFailure with destinationId, completedAt, errorCode, error, optional httpStatus, optional responseSnippet (added for symmetry with success)
    - DispatchErrorCode covering: 'network', 'http_status', 'auth_failed', 'timeout', 'invalid_config', 'permission_denied', 'unknown'

CHECK 6 — destinations.ts shape
  Read src/types/destinations.ts and confirm exports of:
    - DestinationType (= 'webhook' | 'rest_api' | 'clipboard_plus' | 'local_file' | 'email')
    - HttpMethod (= 'GET' | 'POST' | 'PUT' | 'PATCH'). DELETE is intentionally excluded — confirm it is NOT in the union (Q-005).
    - DestinationBase with required fields: id, name, enabled, transforms (TransformConfig), createdAt, updatedAt
      and optional fields: description, icon, color, keyboardShortcut, tags (string[]), overrides (DestinationOverrides)
    - DestinationAuth (discriminated union with EXACTLY 6 variants: none, bearer, basic, api_key_header, api_key_query, api_credentials)
    - ApiCredentialsAuth with apiId, apiUrl, apiSecret
    - WebhookDestination, RestApiDestination, ClipboardPlusDestination, LocalFileDestination, EmailDestination
    - The Destination union (= the five interfaces above)
  Specifically check:
    - WebhookDestination has url, method, payloadFormat, headers, bodyTemplate, optional timeoutMs
    - RestApiDestination has the same plus auth: DestinationAuth
    - ClipboardPlusDestination has formatTemplate + appendToExisting
    - LocalFileDestination has filePath + formatTemplate
    - EmailDestination has to + subjectTemplate + bodyTemplate

CHECK 7 — lookup.ts shape
  Read src/types/lookup.ts and confirm exports of:
    - IOCType (= 'ipv4' | 'ipv6' | 'domain' | 'url' | 'hash' | 'email')
    - HashAlgorithm (= 'md5' | 'sha1' | 'sha256')
    - DetectedIndicator with value, type, optional hashAlgorithm
    - LookupAuth (discriminated union with 6 variants matching DestinationAuth: none, bearer, basic, api_key_header, api_key_query, api_credentials)
    - ResponseMappingEntry with label, path
    - ResponseMapping with `mappings: ResponseMappingEntry[]` (ARRAY, not Record — confirm the array shape; this was a review-driven change for ordered rendering)
    - RateLimit with maxRequests, windowSeconds
    - BuiltInSourceId covering all 7 SPEC built-ins: whois_rdap, virustotal, abuseipdb, shodan, urlscan, malwarebazaar, ipinfo
    - BuiltInLookupSource (origin: 'built_in') with sourceId, optional apiKey, optional rateLimit
    - CustomLookupSource (origin: 'custom') with urlTemplate, method, headers, optional bodyTemplate, auth, responseMapping, optional rateLimit, optional timeoutMs
    - LookupSource (= BuiltInLookupSource | CustomLookupSource)
    - LookupSourceResult (discriminated union: pending | ok | error)
    - LookupFieldValue (= string | number | boolean | null | string[] | Record<string, unknown>)
    - LookupErrorCode covering: 'network', 'http_status', 'auth_failed', 'rate_limited', 'timeout', 'mapping_miss', 'invalid_config', 'unknown'
    - LookupResult with indicator, startedAt, sources

CHECK 8 — Barrel re-export
  Read src/types/index.ts. Confirm it ONLY contains comments and `export *` re-exports of all four sibling modules — no inline type or value definitions.

CHECK 9 — No `any` in types
  Run: cd /Users/claude/repos/slingshot && grep -RnE ':\s*any\b' src/types/ 2>&1
  Expected: no output. Any match is a FAIL.

CHECK 10 — No runtime code in types
  Run: cd /Users/claude/repos/slingshot && grep -RnE '^(const|let|var|function|class)\b' src/types/ 2>&1
  Expected: no output. Any match indicates accidental runtime code in a types file.

CHECK 11 — JSDoc coverage
  Spot-check that every exported `interface` and top-level `type` declaration in each file is preceded by a `/** ... */` JSDoc block. List any exports missing a JSDoc block.

CHECK 12 — Discriminated-union exhaustiveness sanity
  Conceptually: confirm the discriminator fields are present and consistent.
    - Destination          → discriminated on `type` (DestinationType)
    - DestinationAuth      → discriminated on `type` (6 variants)
    - LookupAuth           → discriminated on `type` (6 variants)
    - LookupSource         → discriminated on `origin` ('built_in' | 'custom')
    - LookupSourceResult   → discriminated on `status` ('pending' | 'ok' | 'error')
    - DispatchResult       → discriminated on `ok` (true | false)
    - TransformConfig      → discriminated on `mode` ('simple' | 'advanced')
    - TransformStep        → discriminated on `type` (7 variants)
  Report any union whose members do not all share the same discriminator field.

CHECK 13 — Open Questions log
  Read docs/OPEN-QUESTIONS.md. Confirm:
    - The file exists.
    - It contains 10 entries under the "Open" section, numbered Q-001 through Q-010 (in any order).
    - Each entry has a Question and a Current decision.
  Report the count of entries and whether any of Q-001..Q-010 are missing.

WHAT YOU CANNOT DO (call these out explicitly in your report):
  - You cannot exercise the types at runtime — this phase has no runtime code by design.
  - You cannot verify that future phases will use these types correctly; that lands in their respective verification passes.

Final report format:
  ## Phase 1B Verification — <PASS | FAIL>
  - CHECK 1: PASS/FAIL — <one-line evidence>
  - ... (one bullet per check)
  - Manual steps remaining for the human: (none expected — Phase 1B is fully verifiable from the filesystem)
  - If FAIL: a short list of what to fix.
--- END ---
```

---

## Notes

- **Review-driven additions (relative to the initial Phase 1B prompt's deliverable list):** `payloadFormat` on HTTP destinations; `DestinationOverrides` + `overrides?` on `DestinationBase`; `description?` / `tags?` / `createdAt` / `updatedAt` on `DestinationBase`; `ApiCredentialsAuth` (added to both `DestinationAuth` and `LookupAuth`); `timeoutMs?` on HTTP destinations + custom lookup sources; `RateLimit` + `rateLimit?` on lookup sources; `responseSnippet?` on `DispatchFailure`. Removed: `DELETE` from `HttpMethod`. Refactored: `ResponseMapping.mappings` from `Record<string,string>` to `ResponseMappingEntry[]` (ordered).
- **Asymmetry to track:** `LookupSourceSuccess.fields` is still a `Record<string, LookupFieldValue>` while `ResponseMapping.mappings` is now an ordered array. The renderer can lose user-defined mapping order through `fields` lookup. Acceptable for v1 (renderer iterates the source's mapping array and looks up each label in `fields`); revisit if it becomes painful.
- **Open questions** raised during review live in `docs/OPEN-QUESTIONS.md` — Q-001 (`payloadContractVersion`), Q-002 (theme/locale/hotkey-modifier), Q-003 (simple→advanced transform conversion — already decided as pre-populate), Q-004 (`extension_version` camelCase rename), Q-005 (`DELETE` excluded), Q-006 (sensitive auth: local-only storage + AES-GCM at rest), Q-007 (per-destination retry policy), Q-008 (Email CC/BCC/multi-to), Q-009 (response-mapping JSONPath dialect / render hints / fallbacks), Q-010 (`BuiltInLookupSource.iocTypes` catalog vs. user-narrowed split).
- `TransformConfig` lives in `settings.ts` (not `destinations.ts`) because it's logically a settings-shaped concept. `destinations.ts` imports it; the import is one-directional, so there is no circular reference.
- `LookupAuth` is intentionally defined as its own union rather than re-using `DestinationAuth`. The two surfaces evolve independently and conflating them would couple the dispatcher and the lookup engine. Confirmed during review.
- The `BuiltInSourceId` literal union is the single source of truth for which built-in adapters exist. Adding a new built-in source means appending to that union, which TypeScript will then force every adapter-dispatch switch to handle.
