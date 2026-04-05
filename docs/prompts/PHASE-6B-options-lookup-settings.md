# SLINGSHOT Build Prompt — Phase 6B: Options Page — Lookup & Global Settings

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Lookup Sources, Custom Lookup Sources, Global Settings sections
- `src/types/lookup.ts` — Lookup source types, response mapping
- `src/types/settings.ts` — GlobalSettings interface

## Goal
Build the options page sections for configuring lookup sources (API keys for built-ins, custom source CRUD with response mapping editor) and global settings.

## Current State
- Phase 6A complete: Destination management UI working
- Options page exists but only has destination management

## Deliverables (max 5 files touched)
1. `src/components/LookupSettings.tsx` — Lookup sources section: toggle built-in sources on/off, API key input per source, custom source list with add/edit/delete.
2. `src/components/CustomSourceForm.tsx` — Custom lookup source editor: name, IOC types checkboxes, URL template, method, auth config, headers key-value editor, body template textarea, response mapping editor (key-value pairs: label → JSONPath). Test button with sample indicator input.
3. `src/components/CustomSourceTest.tsx` — Test results for custom source: raw response (collapsible), parsed fields based on mapping, error display.
4. `src/components/GlobalSettings.tsx` — Global settings panel: default payload format, include URL/title toggles, notification preferences, history retention slider, import/export destinations (JSON download/upload).
5. Update `src/options/Options.tsx` — Integrate lookup settings and global settings sections (tabs or accordion)

## Acceptance Criteria
- [ ] `npx tsc --noEmit` passes
- [ ] Can configure API keys for built-in sources
- [ ] Can add/edit/delete custom lookup sources
- [ ] Response mapping editor allows adding/removing key-value pairs
- [ ] Custom source test fires request and shows parsed results
- [ ] Import/export destinations works (download JSON, upload JSON to restore)
- [ ] Global settings persist to storage
- [ ] All sections integrate cleanly into the options page

## Constraints
- Response mapping editor must be user-friendly — not raw JSON editing
- API keys should be masked in UI (show/hide toggle)
- Import should validate JSON structure before applying
- Export should exclude API keys by default (with option to include)
