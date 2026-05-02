// SLINGSHOT — Background service worker (Phase 1A skeleton)
//
// This is a placeholder background entrypoint that exists solely so WXT can
// produce a buildable, loadable Manifest V3 extension during Phase 1A.
//
// Real wiring lands in:
//   • Phase 5A — context menu creation + dispatch routing
//   • Phase 3A — transport handlers (webhook / REST API / clipboard / email)
//   • Phase 4B — IOC lookup engine
//
// Until then, this background simply logs that it has booted, which gives us
// a smoke-test signal in `chrome://extensions/ → Inspect views: service worker`.

export default defineBackground(() => {
  // eslint-disable-next-line no-console — intentional dev-only signal
  console.log('[SLINGSHOT] background service worker booted (Phase 1A skeleton)');
});
