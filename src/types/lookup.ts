/**
 * SLINGSHOT — IOC Lookup types.
 *
 * Models the right-click "Lookup" feature described in the SPEC: indicator
 * detection, built-in vs. custom source configuration, response mapping for
 * arbitrary APIs, and per-source result envelopes streamed into the in-page
 * overlay.
 *
 * The {@link LookupSource} discriminated union splits sources by origin:
 * - `built_in` — first-party adapters that ship with the extension
 * - `custom` — user-defined HTTP queries against any REST endpoint
 *
 * No runtime code — type definitions only.
 */

import type { HttpMethod } from './destinations';

// ---------------------------------------------------------------------------
// Indicators
// ---------------------------------------------------------------------------

/**
 * Indicator-of-compromise types the extension auto-detects from highlighted
 * text. Detection precedence when multiple types match: URL > domain > IP.
 */
export type IOCType = 'ipv4' | 'ipv6' | 'domain' | 'url' | 'hash' | 'email';

/**
 * Hash sub-type used to disambiguate hex strings of varying lengths.
 * Determined by length: 32 = MD5, 40 = SHA1, 64 = SHA256.
 */
export type HashAlgorithm = 'md5' | 'sha1' | 'sha256';

/**
 * A detected indicator with its raw text and identified type. Hash variants
 * carry an additional {@link HashAlgorithm} so the right adapters can be
 * selected without re-running length checks.
 */
export interface DetectedIndicator {
  /** The literal text the user highlighted (or a normalized form). */
  value: string;
  /** Detected IOC type. */
  type: IOCType;
  /** Hash algorithm when {@link type} is `hash`; absent otherwise. */
  hashAlgorithm?: HashAlgorithm;
}

// ---------------------------------------------------------------------------
// Lookup-source authentication
// ---------------------------------------------------------------------------

/**
 * Authentication modes accepted by lookup sources. Mirrors
 * {@link import('./destinations').DestinationAuth} but kept as its own union
 * so lookup-only modes can be added (or dropped) without churning the
 * dispatch path.
 */
export type LookupAuth =
  | { type: 'none' }
  | { type: 'bearer'; token: string }
  | { type: 'basic'; username: string; password: string }
  | { type: 'api_key_header'; headerName: string; value: string }
  | { type: 'api_key_query'; paramName: string; value: string }
  | {
      type: 'api_credentials';
      /** Account / client / key identifier. Not sensitive. */
      apiId: string;
      /** API base or auth-endpoint URL the credential is bound to. */
      apiUrl: string;
      /** Shared secret. Sensitive — see Q-006 in `docs/OPEN-QUESTIONS.md`. */
      apiSecret: string;
    };

// ---------------------------------------------------------------------------
// Response mapping (custom sources)
// ---------------------------------------------------------------------------

/**
 * One entry in a {@link ResponseMapping} — pairs a display label with a
 * JSONPath into the API response. The special {@link path} value `"$"`
 * dumps the entire response into a collapsible "Raw" section in the
 * overlay.
 */
export interface ResponseMappingEntry {
  /** Human-readable label rendered above the extracted value. */
  label: string;
  /** JSONPath into the response (e.g. `$.data.verdict`, or `$` for raw). */
  path: string;
}

/**
 * Ordered list of label → JSONPath mappings used to extract human-readable
 * fields from an arbitrary JSON response. Render order matches array
 * order so users control how the overlay rows are stacked.
 *
 * Example:
 * ```ts
 * {
 *   mappings: [
 *     { label: 'Verdict', path: '$.data.verdict' },
 *     { label: 'Score',   path: '$.data.score' },
 *     { label: 'Raw',     path: '$' },
 *   ]
 * }
 * ```
 */
export interface ResponseMapping {
  mappings: ResponseMappingEntry[];
}

// ---------------------------------------------------------------------------
// Sources
// ---------------------------------------------------------------------------

/**
 * Built-in source identifiers. Each value corresponds to a first-party
 * adapter compiled into the extension; only the API key (when required)
 * is user-configurable.
 */
export type BuiltInSourceId =
  | 'whois_rdap'
  | 'virustotal'
  | 'abuseipdb'
  | 'shodan'
  | 'urlscan'
  | 'malwarebazaar'
  | 'ipinfo';

/**
 * Published rate limit for a lookup source. Drives client-side throttling
 * (lookup engine queues requests to stay under the limit) and "X of Y
 * used in the last N seconds" UI affordances in the overlay.
 *
 * Examples from SPEC built-ins: VirusTotal free tier
 * `{ maxRequests: 4, windowSeconds: 60 }`; AbuseIPDB free tier
 * `{ maxRequests: 1000, windowSeconds: 86400 }`.
 *
 * For built-in sources this is pre-populated from the compiled adapter
 * catalog. For custom sources the user fills it in (or leaves it unset
 * for "no client-side limit").
 */
export interface RateLimit {
  /** Maximum requests permitted per window. */
  maxRequests: number;
  /** Window length in seconds (e.g. 60 for "per minute", 86400 for "per day"). */
  windowSeconds: number;
}

/**
 * Common fields every {@link LookupSource} variant carries.
 */
interface LookupSourceBase {
  /** Stable UUID for reordering / removal in settings. */
  id: string;
  /** User-facing name shown in the overlay's section header. */
  name: string;
  /** When false, this source is skipped during lookup runs. */
  enabled: boolean;
  /** IOC types this source can answer for. */
  iocTypes: IOCType[];
  /**
   * Optional published rate limit. When set, the lookup engine queues
   * requests to stay under it. When unset, no client-side throttling.
   */
  rateLimit?: RateLimit;
}

/**
 * A first-party lookup source. The {@link sourceId} picks the compiled
 * adapter; the only user-supplied secret is the optional {@link apiKey}
 * (some built-ins like WHOIS/RDAP and MalwareBazaar don't need one).
 */
export interface BuiltInLookupSource extends LookupSourceBase {
  origin: 'built_in';
  sourceId: BuiltInSourceId;
  /** API key when the source requires authentication. */
  apiKey?: string;
}

/**
 * A user-defined HTTP lookup source. The URL and (optional) body templates
 * support `{{indicator}}` and `{{type}}` placeholders that are substituted
 * before the request is sent.
 */
export interface CustomLookupSource extends LookupSourceBase {
  origin: 'custom';
  /** URL template, e.g. `https://api.example.com/lookup?q={{indicator}}`. */
  urlTemplate: string;
  /** HTTP method used for the request. */
  method: HttpMethod;
  /** Custom request headers (placeholder substitution applies to values). */
  headers: Record<string, string>;
  /**
   * Body template for methods that support a body. Placeholders:
   * `{{indicator}}`, `{{type}}`. Ignored for `GET`.
   */
  bodyTemplate?: string;
  /** Authentication mode. */
  auth: LookupAuth;
  /** Display-label → JSONPath mapping for extracting fields from the response. */
  responseMapping: ResponseMapping;
  /**
   * Optional per-source request timeout in milliseconds. When unset, the
   * lookup engine applies its default (e.g. 10000ms). Applied via
   * `AbortSignal.timeout(timeoutMs)` on the underlying `fetch()`.
   */
  timeoutMs?: number;
}

/**
 * Discriminated union over the two source origins. Switch on `source.origin`
 * to narrow to {@link BuiltInLookupSource} or {@link CustomLookupSource}.
 */
export type LookupSource = BuiltInLookupSource | CustomLookupSource;

// ---------------------------------------------------------------------------
// Results
// ---------------------------------------------------------------------------

/**
 * Per-source result envelope. The overlay renders one of these per source,
 * streaming them in as queries complete. Discriminated on `status`.
 */
export type LookupSourceResult =
  | LookupSourceSuccess
  | LookupSourceError
  | LookupSourcePending;

/** A source that has not yet returned (rendered as a spinner row). */
export interface LookupSourcePending {
  sourceId: string;
  sourceName: string;
  status: 'pending';
  /** Wall-clock time the request was issued (ISO-8601). */
  startedAt: string;
}

/** A source that returned successfully. */
export interface LookupSourceSuccess {
  sourceId: string;
  sourceName: string;
  status: 'ok';
  /** ISO-8601 completion time. */
  completedAt: string;
  /** HTTP status when applicable (absent for non-HTTP built-ins). */
  httpStatus?: number;
  /**
   * Display label → extracted value pairs. Values are rendered as-is in the
   * overlay; the renderer chooses pretty-printing per value type.
   */
  fields: Record<string, LookupFieldValue>;
  /** Raw response text, retained for the "Raw" mapping and debugging. */
  raw?: string;
}

/**
 * Permitted shapes for a single extracted field. Strings and numbers are the
 * common case; arrays appear for tag-like fields; objects appear when a
 * mapping points at a nested object (or for the `"$"` raw dump).
 */
export type LookupFieldValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | Record<string, unknown>;

/** A source that failed to return a usable response. */
export interface LookupSourceError {
  sourceId: string;
  sourceName: string;
  status: 'error';
  completedAt: string;
  /** Machine-readable error category. */
  errorCode: LookupErrorCode;
  /** Human-readable error message safe for surfacing in the overlay. */
  error: string;
  httpStatus?: number;
}

/** Categorized failure reasons reported by the lookup engine. */
export type LookupErrorCode =
  | 'network'
  | 'http_status'
  | 'auth_failed'
  | 'rate_limited'
  | 'timeout'
  | 'mapping_miss'
  | 'invalid_config'
  | 'unknown';

/**
 * Aggregate result for one indicator across all queried sources. Held in the
 * lookup cache (TTL'd by {@link import('./settings').GlobalSettings.lookupCacheTtlSeconds})
 * so the overlay can re-open without re-querying.
 */
export interface LookupResult {
  /** The indicator that was looked up. */
  indicator: DetectedIndicator;
  /** ISO-8601 timestamp of when the aggregate result was first produced. */
  startedAt: string;
  /** Per-source results in the order they were queried. */
  sources: LookupSourceResult[];
}
