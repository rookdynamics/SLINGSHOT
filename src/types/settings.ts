/**
 * SLINGSHOT — Global settings and payload-transform types.
 *
 * Two distinct surfaces live here:
 *
 * 1. {@link GlobalSettings} — extension-wide preferences persisted to
 *    `chrome.storage.sync`. These apply to every dispatch unless a destination
 *    explicitly overrides them.
 *
 * 2. {@link TransformConfig} — per-destination payload transforms. Comes in
 *    "simple" (a few toggles, applied automatically) and "advanced" (an
 *    ordered pipeline of {@link TransformStep}s) flavours, modelled as a
 *    discriminated union on the `mode` field.
 *
 * No runtime code — type definitions only.
 */

// ---------------------------------------------------------------------------
// Global settings
// ---------------------------------------------------------------------------

/**
 * Default serialization format applied to dispatched payloads when a
 * destination does not specify its own body template.
 *
 * - `json`: stringify the {@link import('./payload').SlingPayload} object
 * - `plain`: send only the highlighted text, no metadata
 * - `markdown`: render the payload as a small Markdown block (text + source link)
 */
export type PayloadFormat = 'json' | 'plain' | 'markdown';

/**
 * Browser-runtime identifier captured into payload metadata so destinations
 * can distinguish dispatches originating from Chrome vs. Firefox builds.
 */
export type BrowserKind = 'chrome' | 'firefox';

/**
 * Extension-wide preferences. Persisted to `chrome.storage.sync` so they roam
 * across the user's signed-in browser instances.
 */
export interface GlobalSettings {
  /** Default body format when a destination has no explicit body template. */
  defaultPayloadFormat: PayloadFormat;

  /**
   * When true, the source page URL is included in every dispatch's payload
   * unless the destination opts out. Mirrored into context-menu defaults.
   */
  includeSourceUrl: boolean;

  /** When true, the source page title is included in every dispatch. */
  includePageTitle: boolean;

  /** When true, a toast notification is shown after each dispatch. */
  dispatchNotifications: boolean;

  /**
   * Maximum number of historical dispatches retained in
   * `chrome.storage.local`. The oldest entries are evicted once this cap is
   * hit. Use `0` to disable history entirely.
   */
  historyRetention: number;

  /**
   * Length (in seconds) the in-memory IOC-lookup cache will reuse a result
   * for the same indicator before re-querying. SPEC default is 300 (5 min).
   */
  lookupCacheTtlSeconds: number;
}

/**
 * Per-destination overrides for {@link GlobalSettings} fields. Every key is
 * optional; an `undefined` value means "fall back to the global setting."
 * Attached to a destination via {@link import('./destinations').DestinationBase.overrides}.
 *
 * Keep keys in lockstep with the matching {@link GlobalSettings} fields they
 * shadow — a destination can override any subset of payload-shaping or
 * dispatch-side preferences without re-declaring the others.
 */
export interface DestinationOverrides {
  /** Override {@link GlobalSettings.includeSourceUrl} for this destination. */
  includeSourceUrl?: boolean;
  /** Override {@link GlobalSettings.includePageTitle} for this destination. */
  includePageTitle?: boolean;
  /** Override {@link GlobalSettings.dispatchNotifications} for this destination. */
  dispatchNotifications?: boolean;
}

// ---------------------------------------------------------------------------
// Transform pipeline (advanced mode)
// ---------------------------------------------------------------------------

/**
 * Letter-case transformations applied by a {@link CaseTransformStep}.
 */
export type CaseMode = 'upper' | 'lower' | 'title';

/**
 * Common discriminator field shared by every advanced-mode transform step.
 * Each variant of {@link TransformStep} narrows this with a literal `type`.
 */
interface TransformStepBase {
  /** Stable identifier for UI reordering / removal of pipeline steps. */
  id: string;
  /** Whether this step is currently active. Disabled steps are skipped. */
  enabled: boolean;
}

/**
 * Capture a substring via regex. The first capture group becomes the new
 * payload text; if no groups are defined, the full match is used.
 */
export interface RegexExtractStep extends TransformStepBase {
  type: 'regex_extract';
  /** ECMAScript regex source. Compiled with the {@link flags} string. */
  pattern: string;
  /** Standard regex flags (e.g. `"i"`, `"gm"`). */
  flags: string;
}

/**
 * Find/replace transform. Supports literal or regex find depending on
 * {@link isRegex}. Backreferences (e.g. `$1`) work in regex mode.
 */
export interface FindReplaceStep extends TransformStepBase {
  type: 'find_replace';
  find: string;
  replace: string;
  isRegex: boolean;
  flags: string;
}

/**
 * Apply a letter-case transformation. Title-case follows Unicode word
 * boundaries.
 */
export interface CaseTransformStep extends TransformStepBase {
  type: 'case_transform';
  mode: CaseMode;
}

/**
 * Convert Markdown source text into plain text (strip syntax, keep content).
 * Intended for destinations that don't render Markdown (e.g. plain webhooks).
 */
export interface MarkdownToPlainStep extends TransformStepBase {
  type: 'markdown_to_plain';
}

/**
 * Truncate the payload text to {@link maxLength} characters. When
 * {@link ellipsis} is set, it is appended to truncated values.
 */
export interface TruncateStep extends TransformStepBase {
  type: 'truncate';
  maxLength: number;
  ellipsis?: string;
}

/**
 * Prepend or append static text to the payload. The `position` discriminator
 * picks which end the text is added to.
 */
export interface PrependAppendStep extends TransformStepBase {
  type: 'prepend_append';
  position: 'prepend' | 'append';
  text: string;
}

/**
 * Defang any IOCs found in the payload text. Granular per-IOC-type controls
 * live in {@link DefangOptions}.
 */
export interface DefangStep extends TransformStepBase {
  type: 'defang';
  options: DefangOptions;
}

/**
 * Discriminated union of every advanced-mode transform step. Switch on
 * `step.type` to narrow to the concrete variant.
 */
export type TransformStep =
  | RegexExtractStep
  | FindReplaceStep
  | CaseTransformStep
  | MarkdownToPlainStep
  | TruncateStep
  | PrependAppendStep
  | DefangStep;

// ---------------------------------------------------------------------------
// Transform configuration (simple vs. advanced)
// ---------------------------------------------------------------------------

/**
 * Per-IOC-type toggles for the "Defang IOCs" transform. Defaults are all
 * `true`; users can disable specific kinds (e.g. leave URLs un-defanged).
 */
export interface DefangOptions {
  ipv4: boolean;
  ipv6: boolean;
  domain: boolean;
  url: boolean;
  email: boolean;
}

/**
 * Toggles applied automatically in simple mode. Whitespace trim, HTML strip,
 * and line-break normalization are always-on per SPEC and not exposed here;
 * only the user-facing optional toggles are configurable.
 */
export interface SimpleTransformOptions {
  /** Drop the highlighted text's surrounding whitespace. SPEC: always on. */
  trimWhitespace: boolean;
  /** Strip HTML tags, keeping their text contents. SPEC: always on. */
  stripHtml: boolean;
  /** Collapse `\r\n`/`\r` to `\n`. SPEC: always on. */
  normalizeLineBreaks: boolean;
  /** Optional: defang IOCs as a one-click toggle (uses default DefangOptions). */
  defangIocs: boolean;
}

/**
 * Simple-mode transform configuration: a fixed set of toggles applied in a
 * deterministic order (trim → strip → normalize → defang).
 */
export interface SimpleTransformConfig {
  mode: 'simple';
  options: SimpleTransformOptions;
}

/**
 * Advanced-mode transform configuration: an ordered pipeline of
 * user-defined {@link TransformStep}s. Steps run in array order.
 */
export interface AdvancedTransformConfig {
  mode: 'advanced';
  steps: TransformStep[];
}

/**
 * Per-destination transform configuration. Discriminated on `mode`:
 * - `simple` — fixed toggles, the default for new destinations
 * - `advanced` — user-defined ordered pipeline
 */
export type TransformConfig = SimpleTransformConfig | AdvancedTransformConfig;
