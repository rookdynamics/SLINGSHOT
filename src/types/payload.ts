/**
 * SLINGSHOT — Payload schema for dispatched text + lookup results.
 *
 * Every dispatch (right-click → destination) sends a {@link SlingPayload}.
 * The shape mirrors the SPEC's "Payload Schema" section verbatim. Body
 * templates configured per-destination expand placeholders defined by
 * {@link TemplateVariables}.
 *
 * No runtime code — type definitions only.
 */

import type { BrowserKind } from './settings';

// ---------------------------------------------------------------------------
// Source / metadata sub-objects
// ---------------------------------------------------------------------------

/**
 * Source-page identification captured at dispatch time. Used to populate
 * the `{{url}}`, `{{title}}`, and `{{domain}}` template variables.
 */
export interface SlingPayloadSource {
  /** Full page URL the highlighted text was captured from. */
  url: string;
  /** Page `<title>` at capture time. */
  title: string;
  /** Hostname-only convenience field (e.g. `example.com`). */
  domain: string;
}

/**
 * Runtime-context metadata attached to every dispatch so receiving systems
 * can audit which extension build / browser produced the payload.
 */
export interface SlingPayloadMetadata {
  /** Semver of the SLINGSHOT extension at dispatch time. */
  extension_version: string;
  /** Browser the extension is running in. */
  browser: BrowserKind;
}

// ---------------------------------------------------------------------------
// Top-level payload
// ---------------------------------------------------------------------------

/**
 * The standardized payload object every transport handler receives. JSON
 * destinations stringify this directly; text/template destinations expand
 * placeholders against {@link TemplateVariables} derived from these fields.
 *
 * Shape is locked to the SPEC's Payload Schema example — do not reorder or
 * rename fields without bumping the extension's payload contract version.
 */
export interface SlingPayload {
  /** The highlighted text, after applicable transforms have been applied. */
  text: string;
  /** Source page identification. */
  source: SlingPayloadSource;
  /** ISO-8601 UTC timestamp of dispatch (e.g. `2026-04-04T18:45:00Z`). */
  timestamp: string;
  /** Display name of the destination this payload is being sent to. */
  destination: string;
  /** Build / runtime metadata. */
  metadata: SlingPayloadMetadata;
}

// ---------------------------------------------------------------------------
// Template expansion
// ---------------------------------------------------------------------------

/**
 * Flat key/value map used to expand `{{placeholder}}` tokens in a
 * destination's URL, header, or body template. Keys mirror the SPEC's
 * supported placeholders.
 */
export interface TemplateVariables {
  text: string;
  url: string;
  title: string;
  domain: string;
  /** ISO-8601 UTC timestamp string. */
  timestamp: string;
  destination: string;
}

// ---------------------------------------------------------------------------
// Dispatch result
// ---------------------------------------------------------------------------

/**
 * Outcome reported by a transport handler after attempting a dispatch. Used
 * by the dispatch router to populate history, drive notifications, and
 * surface errors to the popup / options UI.
 *
 * Discriminated on `ok`:
 * - `ok: true` — success path; HTTP transports include the response status.
 * - `ok: false` — failure path; carries a human-readable {@link error}
 *   message and an optional machine-grade {@link errorCode}.
 */
export type DispatchResult = DispatchSuccess | DispatchFailure;

/** Successful dispatch outcome. */
export interface DispatchSuccess {
  ok: true;
  /** ID of the destination this dispatch targeted. */
  destinationId: string;
  /** ISO-8601 timestamp of completion. */
  completedAt: string;
  /** HTTP status for HTTP-bound transports; absent for clipboard / mailto. */
  httpStatus?: number;
  /**
   * Verbatim response body for HTTP-bound transports, capped to a sensible
   * length by the dispatcher (avoids storing megabytes of HTML in history).
   * Absent for non-HTTP transports.
   */
  responseSnippet?: string;
}

/**
 * Machine-readable failure reason. Used to drive UI affordances (e.g. show
 * a "re-authenticate" hint for `auth_failed`).
 */
export type DispatchErrorCode =
  | 'network'
  | 'http_status'
  | 'auth_failed'
  | 'timeout'
  | 'invalid_config'
  | 'permission_denied'
  | 'unknown';

/** Failed dispatch outcome. */
export interface DispatchFailure {
  ok: false;
  destinationId: string;
  completedAt: string;
  /** Machine-readable error category. */
  errorCode: DispatchErrorCode;
  /** Human-readable error message safe for surfacing in the UI. */
  error: string;
  /** HTTP status when the failure was an unsuccessful response. */
  httpStatus?: number;
  /**
   * Verbatim response body when the failure carries one (e.g. an HTTP
   * non-2xx with a JSON error envelope). Capped to a sensible length by the
   * dispatcher. Absent when there is no body to surface (network errors,
   * timeouts, non-HTTP transports).
   */
  responseSnippet?: string;
}
