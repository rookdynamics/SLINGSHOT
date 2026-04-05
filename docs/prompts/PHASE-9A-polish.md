# SLINGSHOT Build Prompt — Phase 9A: Polish & Release Prep

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — full spec
- All `src/` files

## Goal
Final polish: extension icons/branding, error handling audit, README finalization, Chrome Web Store manifest requirements, build verification.

## Current State
- Phases 1-8 complete: Full extension with tests passing

## Deliverables (max 5 files touched)
1. `src/assets/` — Extension icons (16, 32, 48, 128px). Simple, recognizable slingshot icon. SVG source + PNG exports.
2. `README.md` — Update with actual installation instructions, screenshots section (placeholder), development guide, contributing guidelines
3. `CHANGELOG.md` — Initial changelog entry for v0.1.0
4. Manifest updates — Verify all required Chrome Web Store fields: name, description, permissions (minimal), icons, version
5. `.github/workflows/ci.yml` — GitHub Actions: lint, type-check, test, build on push/PR

## Acceptance Criteria
- [ ] `npm run build` produces a clean production build
- [ ] Extension loads in Chrome with proper icon and name
- [ ] All permissions are minimal and justified
- [ ] CI pipeline passes
- [ ] README is accurate and complete
- [ ] No console errors or warnings in production build

## Constraints
- Permissions must be minimal: contextMenus, storage, activeTab, clipboardWrite. No broad host permissions unless justified.
- Icons should be simple and work at all sizes
- Description under 132 chars for Chrome Web Store
