import { defineConfig } from 'wxt';

// SLINGSHOT — WXT configuration
// Targets Chrome Manifest V3 by default. Firefox is an alternate build target
// (see `dev:firefox` / `build:firefox` scripts) and will be wired up properly
// once the v1 Chrome build is stable.
//
// Source layout:
//   src/                       ← srcDir
//     entrypoints/             ← WXT scans this dir (background, popup, options, content)
//     lib/, types/, components/  ← shared modules imported by entrypoints
//
// We use WXT's default `entrypointsDir: 'entrypoints'`. Phase 1A leaves the dir
// empty (the build is intentionally a no-op skeleton); subsequent phases add
// the actual background script (5A), content script (5B), options page (6A/6B),
// and popup (7A). See https://wxt.dev/guide/directory-structure/entrypoints.html

export default defineConfig({
  srcDir: 'src',

  // Build output goes to `build/` (non-hidden) instead of WXT's default `.output/`,
  // so it shows up in Finder and is easy to point Chrome's "Load unpacked" at.
  // The unpacked extension lives at `build/chrome-mv3/`.
  outDir: 'build',

  // React-only modules at the moment; future phases may add Tailwind module if
  // we move off the manual postcss + globals.css approach.
  modules: ['@wxt-dev/module-react'],

  manifest: {
    name: 'SLINGSHOT',
    description:
      'Highlight text → right-click → send to configurable destinations. Plus IOC lookups for cybersecurity workflows.',
    // Permissions are intentionally minimal for v1. We will reassess as
    // transport types come online (e.g. nativeMessaging for local file destinations).
    permissions: ['contextMenus', 'storage', 'activeTab', 'clipboardWrite'],
    host_permissions: ['<all_urls>'],
  },
});
