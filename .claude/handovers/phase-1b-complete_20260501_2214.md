## Session: 2026-05-01 22:14 — callisto

**Context:** Resumed Phase 1B (core type definitions) from the previous session's pending handover, wrote all five type files, then walked the user through a 19-item review of every exported type. Each item gave the user the chance to ship as-is, tweak, or defer. Several types evolved during review and an open-questions log (`docs/OPEN-QUESTIONS.md`) was created to capture deferred design decisions. Committed and pushed Phase 1B as a single combined commit.

---

### Completed

- **Phase 1B shipped** (commit `df74c08` on `main`, pushed to GitHub + Gitea):
  - `src/types/settings.ts` — `PayloadFormat`, `BrowserKind`, `GlobalSettings` (incl. `lookupCacheTtlSeconds`), `DestinationOverrides`, `SimpleTransformConfig`/`AdvancedTransformConfig`/`TransformConfig` union, 7-variant `TransformStep` union (regex_extract, find_replace, case_transform, markdown_to_plain, truncate, prepend_append, defang), `DefangOptions`, `SimpleTransformOptions`, `CaseMode`.
  - `src/types/payload.ts` — `SlingPayload` + `SlingPayloadSource` + `SlingPayloadMetadata` (matches SPEC schema verbatim, with `extension_version` snake_case per Q-004), `TemplateVariables`, `DispatchResult` (success | failure with `responseSnippet?` on both), `DispatchErrorCode`.
  - `src/types/destinations.ts` — `DestinationType`, `HttpMethod` (GET/POST/PUT/PATCH only — DELETE excluded per Q-005), `DestinationBase` (id/name/enabled + optional description/icon/color/keyboardShortcut/tags + transforms + overrides + **required** createdAt/updatedAt), 6-variant `DestinationAuth` union (none/bearer/basic/api_key_header/api_key_query/api_credentials), `WebhookDestination` + `RestApiDestination` (with `payloadFormat`, optional `timeoutMs`), `ClipboardPlusDestination`, `LocalFileDestination`, `EmailDestination`, top-level `Destination` union.
  - `src/types/lookup.ts` — `IOCType`, `HashAlgorithm`, `DetectedIndicator`, 6-variant `LookupAuth` (matches `DestinationAuth`), `ResponseMappingEntry` + `ResponseMapping` (ordered array — was `Record`, flipped during review), `RateLimit` + per-source optional `rateLimit`, `BuiltInSourceId` (7 SPEC built-ins), `BuiltInLookupSource`, `CustomLookupSource` (with optional `timeoutMs`), `LookupSource` union, `LookupSourceResult` (pending|ok|error), `LookupFieldValue`, `LookupErrorCode`, `LookupResult`.
  - `src/types/index.ts` — pure `export *` barrel.
- **`docs/OPEN-QUESTIONS.md` created** — running log of design decisions consciously deferred. 10 entries (Q-001 through Q-010), each with Raised/Question/Current decision/Revisit when sections.
- **`docs/tests/PHASE-1B-tests.md` shipped** — manual checklist + Claude Desktop verification prompt, both updated to reflect post-review shapes (covers all new fields like `description?`, `tags?`, `createdAt`, `updatedAt`, `payloadFormat`, `timeoutMs?`, `RateLimit`, `ApiCredentialsAuth`, `DestinationOverrides`, `ResponseMappingEntry[]`, plus the Open Questions check).
- **Verification all green:**
  - `npx tsc --noEmit` → exit 0, zero output (multiple times during review).
  - `npm run build` → `build/chrome-mv3/{manifest.json, background.js}` (10.62 kB total).
  - `grep -RnE ':\s*any\b' src/types/` → empty.
  - `grep -RnE '^(const|let|var|function|class)\b' src/types/` → empty (no runtime code).
- **Push fanned out** to both GitHub `origin` and the Gitea mirror at `192.168.240.87:3000/rookdynamics/SLINGSHOT.git` via the dual push URL on `origin`.

---

### Review-driven changes (vs. initial Phase 1B draft)

The initial Phase 1B prompt deliverable list grew during review. Captured here so future sessions know which fields/types are review-driven additions:

- **Added:**
  - `payloadFormat: PayloadFormat` on `WebhookDestination` and `RestApiDestination` (drives Content-Type, UI editor)
  - `DestinationOverrides` interface in `settings.ts` + optional `overrides?` on `DestinationBase`
  - `description?`, `tags?: string[]` on `DestinationBase`
  - `createdAt`, `updatedAt` (required, ISO-8601) on `DestinationBase`
  - `ApiCredentialsAuth` (apiId / apiUrl / apiSecret) added to both `DestinationAuth` and `LookupAuth` unions
  - `timeoutMs?: number` on `WebhookDestination`, `RestApiDestination`, `CustomLookupSource`
  - `RateLimit` interface + optional `rateLimit?` on `LookupSourceBase`
  - `responseSnippet?: string` on `DispatchFailure` (for symmetry with `DispatchSuccess`)
- **Removed:**
  - `'DELETE'` from `HttpMethod` (per Q-005 — semantically unclear for a "send text" extension)
- **Refactored:**
  - `ResponseMapping.mappings` flipped from `Record<string, string>` to `ResponseMappingEntry[]` (ordered array — guarantees render order)

---

### In-Flight

- **Branch:** `main` — clean, up to date with both remotes.
- **Modified files:** none. Working tree is clean.
- **Last command:** `git push origin HEAD` (fanned out to GitHub + Gitea).

---

### Next

Begin **Phase 2A — Storage Abstraction** (or whichever phase the user picks next). Phase 2 in the prompts directory (`docs/prompts/PHASE-2A-*.md`) is the natural next step now that types exist; it should implement the storage layer that:
- Splits sensitive auth fields from non-sensitive destination/source fields at the `chrome.storage` boundary (sync vs. local — per Q-006).
- Encrypts secret fields at rest using Web Crypto API AES-GCM with an AES-256 key generated on first install and stored in `chrome.storage.local` (lightweight mode; master-password mode deferred).
- Provides typed read/write helpers (`getDestinations()`, `setDestination(d: Destination)`, etc.) that return plaintext to callers — encryption is invisible above the abstraction.

Confirm with the user which phase they want next before starting; the prompts directory has phases through 9A queued.

---

### Decisions Made (this session)

- **Per-destination overrides shape** — chose a `DestinationOverrides` bag (optional `overrides?: DestinationOverrides`) on `DestinationBase` over flat optional fields. Bag scales without churning every variant when new override targets land.
- **`SimpleTransformOptions` toggles stay as booleans** — even for trim/strip/normalize that SPEC says are "always on" — so a power user can override. Misconfiguration risk accepted; JSDoc flags SPEC defaults as true.
- **Simple → Advanced transform conversion is pre-populate** — when the user flips a destination's transforms from simple to advanced, the resulting `steps[]` is seeded with equivalent steps (e.g. simple's `defangIocs: true` becomes a `DefangStep`). Logged as Q-003. Implementation lands in Phase 6A or whichever phase first executes transforms.
- **`extension_version` snake_case stays for now** — SPEC-verbatim. Renamed deferred to Q-004; will land bundled with Q-001 (`payloadContractVersion`) or any other wire-shape change.
- **`DELETE` removed from `HttpMethod`** — semantic ambiguity ("delete what?"). Q-005 documents the criteria for reintroducing it.
- **Sensitive auth fields: `chrome.storage.local` only, AES-GCM at rest** — Q-006. Lightweight mode (key in storage.local alongside ciphertext) for v1; master-password mode deferred.
- **`DestinationAuth` and `LookupAuth` stay split** — confirmed during review. Same shape today, but the two surfaces are allowed to diverge as vendor APIs grow specialized auth modes.
- **`ResponseMapping.mappings` flipped to ordered array** — was `Record<string, string>`, now `ResponseMappingEntry[]`. Guarantees render order matches user intent. Asymmetry noted: `LookupSourceSuccess.fields` is still a `Record` — renderer iterates the source's mapping array and looks up each label.
- **`RateLimit` lands in Phase 1B** — declared on `LookupSourceBase`, optional. Built-ins seed from adapter catalog (e.g. VirusTotal `{maxRequests: 4, windowSeconds: 60}`); custom users fill in if known.
- **One combined Phase 1B commit** — all five type files, OPEN-QUESTIONS.md, and the test doc shipped together as `df74c08`.

---

### Blockers

None. Phase 1B is complete, verified, committed, and pushed. Phase 2 (or whichever phase the user picks) is fully unblocked.

---

### Open Items

- **`docs/OPEN-QUESTIONS.md` has 10 entries** (Q-001..Q-010) that future phases need to honor or resolve:
  - Q-001 — `payloadContractVersion` (defer until first wire-shape change)
  - Q-002 — theme/locale/hotkey-modifier global settings (defer)
  - Q-003 — Simple→Advanced transform conversion: **decided as pre-populate**, lands in Phase 6A
  - Q-004 — `extension_version` → `extensionVersion` (defer, bundle with payload-shape changes)
  - Q-005 — `DELETE` exclusion (decided; revisit only with concrete user need + documented semantics)
  - Q-006 — sensitive auth: local-only storage + AES-GCM (decided; lands in storage abstraction phase)
  - Q-007 — per-destination retry policy (defer until UI exists)
  - Q-008 — Email multi-recipient + CC/BCC (defer until first user request)
  - Q-009 — Response mapping: JSONPath dialect, render hints, fallbacks (defer to lookup-engine phase)
  - Q-010 — `BuiltInLookupSource.iocTypes` catalog vs. user-narrowed split (defer to adapter-registry phase)
- **Asymmetry in `lookup.ts`:** `LookupSourceSuccess.fields` is `Record<string, LookupFieldValue>` while `ResponseMapping.mappings` is now an ordered array. Renderer can preserve order by iterating mappings and looking up each label in `fields`. Ship-as-is per user; revisit if it becomes painful.
- **Original scaffold's empty entrypoint files** at `src/{background,popup,options,content}/` — still leftover stubs; delete or repurpose during phases 5A/5B/6A/7A.
- **Two npm-warned deprecated transitive deps** from WXT (`tar@6.2.1`, `uuid@8.3.2`) — not actionable.

---

### Context Files

```
~/.claude/projects/-Users-claude-repos-slingshot/memory/MEMORY.md
~/.claude/projects/-Users-claude-repos-slingshot/memory/feedback_phase_test_docs.md
~/.claude/projects/-Users-claude-repos-slingshot/memory/project_toolchain.md
~/repos/slingshot/docs/SPEC.md
~/repos/slingshot/docs/DIRECTIVES.md
~/repos/slingshot/docs/OPEN-QUESTIONS.md
~/repos/slingshot/docs/tests/PHASE-1A-tests.md
~/repos/slingshot/docs/tests/PHASE-1B-tests.md
~/repos/slingshot/src/types/index.ts
~/repos/slingshot/src/types/settings.ts
~/repos/slingshot/src/types/payload.ts
~/repos/slingshot/src/types/destinations.ts
~/repos/slingshot/src/types/lookup.ts
~/repos/slingshot/src/entrypoints/background.ts
~/repos/slingshot/wxt.config.ts
~/repos/slingshot/tsconfig.json
~/repos/slingshot/package.json
```
