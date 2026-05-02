/**
 * SLINGSHOT — Destination configuration types.
 *
 * Every named destination the user creates is one variant of the
 * {@link Destination} discriminated union. New transport types are added by:
 *   1. Defining a `*Destination` interface that extends {@link DestinationBase}
 *      and pins `type` to a new string literal.
 *   2. Adding the variant to the {@link Destination} union.
 *   3. Implementing a transport handler keyed off the same literal.
 *
 * SPEC's v1 transports are: webhook, REST API, Clipboard+, Local File, Email.
 * Future transports (Slack, Discord, Obsidian, …) follow the same pattern.
 *
 * No runtime code — type definitions only.
 */

import type {
  DestinationOverrides,
  PayloadFormat,
  TransformConfig,
} from './settings';

// ---------------------------------------------------------------------------
// Discriminator + base
// ---------------------------------------------------------------------------

/**
 * String-literal discriminator for the {@link Destination} union. Mirrors
 * the SPEC's "Destination Types (v1 Target)" table.
 */
export type DestinationType =
  | 'webhook'
  | 'rest_api'
  | 'clipboard_plus'
  | 'local_file'
  | 'email';

/**
 * HTTP methods supported by webhook + REST API destinations. Body templates
 * are ignored for `GET` to match standard HTTP semantics. `DELETE` is
 * intentionally excluded — see Q-005 in `docs/OPEN-QUESTIONS.md`.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH';

/**
 * Common fields shared by every destination variant. Concrete variants
 * extend this and pin `type` to one of the {@link DestinationType} literals.
 */
export interface DestinationBase {
  /** Stable UUID generated when the destination is created. */
  id: string;
  /** User-facing name shown in the context menu and settings list. */
  name: string;
  /**
   * Optional free-form note explaining what this destination does
   * (e.g. "prod alerting webhook", "personal Obsidian inbox"). Shown in
   * the settings UI; never sent in dispatched payloads.
   */
  description?: string;
  /** When false, the destination is hidden from the context menu. */
  enabled: boolean;
  /** Optional emoji or icon identifier shown next to the name. */
  icon?: string;
  /** Optional CSS color used for the icon / row accent. */
  color?: string;
  /**
   * Optional Chrome commands-API shortcut string (e.g. `Ctrl+Shift+1`) that
   * fires this destination directly without opening the context menu.
   */
  keyboardShortcut?: string;
  /**
   * Optional user-assigned tags for grouping / filtering destinations in
   * the settings UI. Free-form strings (e.g. `["work", "alerts"]`).
   * No semantic meaning to the dispatcher.
   */
  tags?: string[];
  /** Per-destination payload transform pipeline. */
  transforms: TransformConfig;
  /**
   * Optional per-destination overrides for {@link DestinationOverrides}
   * fields (source URL inclusion, page title inclusion, notifications).
   * Any field left `undefined` falls back to the corresponding
   * {@link import('./settings').GlobalSettings} value.
   */
  overrides?: DestinationOverrides;
  /** ISO-8601 UTC timestamp the destination was first created. */
  createdAt: string;
  /**
   * ISO-8601 UTC timestamp the destination was last edited (any field
   * change). Equal to {@link createdAt} until the first modification.
   */
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Authentication (HTTP-bound transports)
// ---------------------------------------------------------------------------

/** No authentication is applied to outgoing requests. */
export interface NoAuth {
  type: 'none';
}

/** `Authorization: Bearer <token>` header. */
export interface BearerAuth {
  type: 'bearer';
  token: string;
}

/** `Authorization: Basic <base64(user:pass)>` header. */
export interface BasicAuth {
  type: 'basic';
  username: string;
  password: string;
}

/**
 * API-key passed via a custom HTTP header (e.g. `X-Api-Key: <value>`).
 * Header name is configurable to fit arbitrary vendor conventions.
 */
export interface ApiKeyHeaderAuth {
  type: 'api_key_header';
  headerName: string;
  value: string;
}

/**
 * API-key passed as a query-string parameter on the request URL.
 * Parameter name is configurable.
 */
export interface ApiKeyQueryAuth {
  type: 'api_key_query';
  paramName: string;
  value: string;
}

/**
 * Three-field credential set required by vendor APIs that pair an
 * identifier with a secret bound to an account / endpoint URL (common in
 * security platforms like XSOAR, vault-style services, and HMAC-signed
 * APIs). The runtime applies the credential according to the vendor's
 * scheme; the type captures the credential shape only.
 *
 * SECURITY: {@link apiSecret} is sensitive — see Q-006 in
 * `docs/OPEN-QUESTIONS.md`. Persisted to `chrome.storage.local` only,
 * never to `chrome.storage.sync`, and encrypted at rest.
 */
export interface ApiCredentialsAuth {
  type: 'api_credentials';
  /** Account / client / key identifier. Not sensitive. */
  apiId: string;
  /** API base or auth-endpoint URL the credential is bound to. */
  apiUrl: string;
  /** Shared secret. Sensitive — see Q-006. */
  apiSecret: string;
}

/**
 * Discriminated union of every authentication mode supported by HTTP-bound
 * transports (webhook + REST API). Switch on `auth.type` to narrow.
 */
export type DestinationAuth =
  | NoAuth
  | BearerAuth
  | BasicAuth
  | ApiKeyHeaderAuth
  | ApiKeyQueryAuth
  | ApiCredentialsAuth;

// ---------------------------------------------------------------------------
// HTTP-bound destinations
// ---------------------------------------------------------------------------

/**
 * Generic webhook destination — fires an HTTP request at an arbitrary URL.
 * Headers and body support the placeholder syntax described in
 * {@link import('./payload').TemplateVariables}.
 */
export interface WebhookDestination extends DestinationBase {
  type: 'webhook';
  url: string;
  method: HttpMethod;
  /**
   * How {@link bodyTemplate} should be interpreted. Drives the default
   * `Content-Type` header and the UI editor (JSON lint vs. markdown
   * preview vs. plain textarea). Seeded from
   * {@link import('./settings').GlobalSettings.defaultPayloadFormat} when
   * the destination is first created.
   */
  payloadFormat: PayloadFormat;
  /** Custom headers as a flat key/value map. Values may include placeholders. */
  headers: Record<string, string>;
  /**
   * Body template (shape determined by {@link payloadFormat}). Placeholders
   * are expanded before the request is sent. Ignored for `GET`.
   */
  bodyTemplate: string;
  /**
   * Optional per-destination request timeout in milliseconds. When unset,
   * the dispatcher applies its default (e.g. 10000ms). Applied via
   * `AbortSignal.timeout(timeoutMs)` on the underlying `fetch()`.
   */
  timeoutMs?: number;
}

/**
 * REST API destination — same wire-shape as a webhook, but with an explicit
 * authentication mode that the transport applies before sending.
 */
export interface RestApiDestination extends DestinationBase {
  type: 'rest_api';
  url: string;
  method: HttpMethod;
  /** See {@link WebhookDestination.payloadFormat}. */
  payloadFormat: PayloadFormat;
  headers: Record<string, string>;
  bodyTemplate: string;
  auth: DestinationAuth;
  /** See {@link WebhookDestination.timeoutMs}. */
  timeoutMs?: number;
}

// ---------------------------------------------------------------------------
// Local-side destinations
// ---------------------------------------------------------------------------

/**
 * Clipboard+ destination — writes the payload to the system clipboard using
 * the configured format template (richer than the OS default copy).
 */
export interface ClipboardPlusDestination extends DestinationBase {
  type: 'clipboard_plus';
  /** Template expanded against {@link TemplateVariables} before copying. */
  formatTemplate: string;
  /**
   * When true, the new entry is appended to the existing clipboard contents
   * (separated by `\n`) rather than overwriting them.
   */
  appendToExisting: boolean;
}

/**
 * Local File destination — appends the payload to a file on disk via the
 * native messaging host. Requires the host to be installed; surfaces
 * `permission_denied` from the dispatcher when the host is missing.
 */
export interface LocalFileDestination extends DestinationBase {
  type: 'local_file';
  /** Absolute filesystem path the host will append to. */
  filePath: string;
  /** Per-record format template, expanded against {@link TemplateVariables}. */
  formatTemplate: string;
}

/**
 * Email destination — opens the user's default mail client via a `mailto:`
 * URL with the recipient, subject, and body pre-filled. Subject and body
 * support template placeholders.
 */
export interface EmailDestination extends DestinationBase {
  type: 'email';
  /** Recipient address (the `to` part of the `mailto:` URL). */
  to: string;
  /** Subject template expanded against {@link TemplateVariables}. */
  subjectTemplate: string;
  /** Body template expanded against {@link TemplateVariables}. */
  bodyTemplate: string;
}

// ---------------------------------------------------------------------------
// Top-level union
// ---------------------------------------------------------------------------

/**
 * Discriminated union of every supported destination kind. Switch on
 * `destination.type` to narrow to a concrete variant.
 *
 * Add new transports by appending their interface here — TypeScript will
 * then force every transport-handler switch in the codebase to handle the
 * new variant via exhaustiveness checking.
 */
export type Destination =
  | WebhookDestination
  | RestApiDestination
  | ClipboardPlusDestination
  | LocalFileDestination
  | EmailDestination;
