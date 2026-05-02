# SLINGSHOT — Open Questions / Deferred Decisions

Running log of design questions raised during development that have been
**consciously deferred** rather than answered. Each entry records what was
asked, the current decision, and the trigger that should bring the question
back to the table.

When a deferred item is resolved, move it to a "Resolved" section at the
bottom (or delete if obvious from the code).

---

## Open

### Q-001 — `GlobalSettings.payloadContractVersion`

**Raised:** Phase 1B review (2026-05-01).
**Question:** Should `GlobalSettings` carry a `payloadContractVersion: number`
so that future changes to {@link SlingPayload}'s wire shape don't silently
break older destinations?
**Current decision:** Defer. Not added in v1. The v1 schema is the only
schema; versioning has nothing to discriminate against yet.
**Revisit when:** the first breaking change to `SlingPayload` (renaming a
field, changing nesting, dropping `metadata`). At that point, add the field
and have transports stamp it onto outgoing payloads.

### Q-002 — Theme / locale / hotkey-modifier global settings

**Raised:** Phase 1B review (2026-05-01).
**Question:** Should `GlobalSettings` include a UI theme (light/dark/auto),
a locale, or a global hotkey-modifier preference?
**Current decision:** Defer. SPEC names none of these. Per-destination
keyboard shortcuts already exist on `DestinationBase.keyboardShortcut`;
theme can be inferred from the user's OS / browser preference until
evidence shows otherwise.
**Revisit when:** the options UI lands (Phase 6A) and we have a concrete
need to persist user-tunable visual preferences, or when an i18n
contributor opens an issue asking for locale support.

---

### Q-010 — `BuiltInLookupSource.iocTypes` — catalog vs. user-narrowed

**Raised:** Phase 1B review (2026-05-01).
**Question:** Built-in sources currently store `iocTypes: IOCType[]`
directly on each configured instance. This conflates two concepts:
- **Catalog capability** — what the compiled adapter *can* handle (e.g.
  VirusTotal handles `[ip, domain, url, hash]`).
- **User narrowing** — what the user wants this *configured instance*
  to handle (e.g. "this VT config only does hashes").
**Cleaner shape:** keep the catalog static (built into the adapter
registry), and add `enabledIocTypes?: IOCType[]` to
`BuiltInLookupSource` for the user override (defaults to the catalog's
full set when unset).
**Current decision:** **Defer.** Phase 1B keeps the conflated form;
it's expressive enough until the adapter registry exists.
**Revisit when:** the built-in adapter registry lands (whichever phase
implements WHOIS/RDAP first). Refactor to the catalog/override split
at that point.

---

### Q-009 — Response mapping: JSONPath dialect, render hints, fallbacks

**Raised:** Phase 1B review (2026-05-01).
**Question:** `ResponseMapping` defines what to extract but not *how* to
extract or render it. Three sub-questions to resolve before the lookup
engine ships:
1. **JSONPath dialect** — the SPEC says "JSONPath or dot-notation."
   Concrete library options: `jsonpath-plus`, `jsonpath-rfc9535`,
   `jsonata`. Each implements a slightly different subset (filters,
   recursive descent, script expressions). Pick one and document the
   exact syntax we support.
2. **Per-mapping render hints** — should `ResponseMappingEntry` carry
   an optional `render?: 'string' | 'list' | 'badge' | 'json'` so the
   user can teach the overlay how to display each extracted value
   (e.g. tags as chips, scores as a colored badge)? Currently the
   renderer introspects {@link LookupFieldValue} at runtime.
3. **Fallback handling** — when the JSONPath misses (key absent,
   wrong shape), behavior is implicit "drop from output." Should
   `ResponseMappingEntry` carry an optional `fallback?: 'omit' | 'null'
   | 'error'`?
**Current decision:** **Defer all three.** The Phase 1B types capture
just the label + path pair. Each of the three additions is purely
additive on `ResponseMappingEntry` and won't break stored configs.
**Revisit when:** the lookup engine lands (Phase 9A or wherever custom
sources execute). Pick the JSONPath library first, then decide render
hints + fallbacks based on what the renderer actually needs.

---

### Q-008 — `EmailDestination` multi-recipient + CC/BCC

**Raised:** Phase 1B review (2026-05-01).
**Question:** Should `EmailDestination` support multiple recipients
(`to: string[]`), CC, and BCC fields?
**Current decision:** **Defer.** v1 ships with a single `to: string`.
The `mailto:` URL spec supports multiple recipients and CC/BCC via
query params, so adding them later is purely additive (`cc?: string |
string[]`, `bcc?: string | string[]`, widen `to`).
**Revisit when:** a user asks, or when the email destination's options
UI lands and we have a place to surface the extra fields without
cluttering the simple case.

---

### Q-007 — Per-destination retry policy

**Raised:** Phase 1B review (2026-05-01).
**Question:** Should HTTP-bound destinations (and lookup sources) carry an
optional `retryPolicy` (max attempts, backoff strategy, retryable status
codes) so the dispatcher can transparently retry transient failures?
**Current decision:** **Defer.** Auto-retry is opinionated UX (silently
re-firing user-initiated dispatches is a footgun: duplicate Slack
messages, repeated webhook fires). Per-destination `timeoutMs` already
landed in Phase 1B. Retry, if it lands, needs UI affordances ("retry on
network failure?" toggle, manual retry button on history rows).
**Revisit when:** users report transient-failure pain, or when the
history/popup UI lands and we know what shape retry-control should take.

---

### Q-006 — Sensitive auth fields: storage location + encryption at rest

**Raised:** Phase 1B review (2026-05-01).
**Question:** How are sensitive auth fields (`BearerAuth.token`,
`BasicAuth.password`, `ApiKey*Auth.value`, `ApiCredentialsAuth.apiSecret`,
and the corresponding `LookupAuth` variants) stored?
**Current decision (confirmed by Steven):**
- **Storage location:** `chrome.storage.local` only. Never
  `chrome.storage.sync` (which round-trips through Google's cloud sync).
  Non-sensitive destination/source fields can still live in `sync`; the
  storage layer must split them at the boundary.
- **Encryption at rest:** secrets are encrypted before persisting using
  Web Crypto API (`SubtleCrypto`) AES-GCM. The AES-256 key is generated
  on first install and stored in `chrome.storage.local` alongside the
  ciphertext. This blocks casual disk-grep / leaked storage exports;
  it does not protect against an attacker with code execution on the
  user's machine.
- **Stronger mode (master password):** deferred. Optional opt-in to
  derive the encryption key from a user-set master password via
  PBKDF2/Argon2id, requiring entry on browser launch. Not in v1.
**Where this lands:** the storage abstraction (likely Phase 2 or 3) must
implement the split + encrypt boundary so callers receive plaintext
auth values without thinking about it. The types intentionally do not
mark sensitive fields with a brand — the convention is "every field
inside an `*Auth` variant other than `type`/`headerName`/`paramName`/
`apiId`/`apiUrl`/`username` is sensitive." Document this in the storage
module's JSDoc.
**Revisit when:** master-password mode is requested, or a stronger key-
derivation scheme becomes necessary (e.g. shared workstation
deployments).

---

### Q-005 — `DELETE` excluded from `HttpMethod`

**Raised:** Phase 1B review (2026-05-01).
**Question:** Should `HttpMethod` include `'DELETE'` for webhook / REST API
destinations?
**Current decision:** **Excluded.** SLINGSHOT's mental model is "send the
highlighted text somewhere"; `DELETE` doesn't map cleanly onto that intent
without forcing the question "delete what — the local destination, the
remote resource identified by the highlighted text, or something else?"
Confirmed by Steven during Phase 1B review.
**Revisit when:** a concrete user workflow requires it. At that point we
must also document precisely what semantics the `DELETE` carries (which
identifier the highlighted text becomes, what the response means, etc.)
before adding it back.

---

### Q-004 — Normalize `SlingPayloadMetadata.extension_version` to camelCase

**Raised:** Phase 1B review (2026-05-01).
**Question:** `SlingPayloadMetadata.extension_version` is `snake_case` to
match the SPEC's payload-schema example verbatim, but the rest of the
codebase is `camelCase`. Should we rename to `extensionVersion` and
update the SPEC?
**Current decision:** **Defer.** Confirmed approach: rename to
`extensionVersion` and update `docs/SPEC.md`'s payload example to match.
Holding off until a payload-shape change pass (likely paired with Q-001's
`payloadContractVersion` work) so wire-shape edits land together.
**Revisit when:** Q-001 is resolved, or any other change to the
`SlingPayload` wire shape — bundle the rename in then.

---

### Q-003 — Simple → Advanced transform conversion

**Raised:** Phase 1B review (2026-05-01).
**Question:** When the user flips a destination's transforms from `simple`
to `advanced`, should the resulting `steps[]` array start empty, or be
pre-populated with `TransformStep`s that mimic the prior simple-mode
options?
**Current decision:** **Pre-populate.** Confirmed by Steven during
Phase 1B review. The conversion must seed the advanced pipeline with the
equivalent step sequence (e.g. simple's `defangIocs: true` becomes a
`DefangStep` with default `DefangOptions`). Trim/strip/normalize translate
to their nearest pipeline equivalents.
**Revisit when:** Phase 6A (options UI) or whichever phase first executes
transforms — not a type concern, this is a runtime/UI requirement to keep
in scope when those phases land.

---

## Resolved

(none yet)
