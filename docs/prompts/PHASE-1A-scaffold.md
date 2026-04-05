# SLINGSHOT Build Prompt — Phase 1A: Project Scaffolding

## Read First
- `docs/DIRECTIVES.md` — Mechanical overrides (MANDATORY)
- `docs/SPEC.md` — Full project specification

## Goal
Initialize the WXT + TypeScript + React + Tailwind project with working build tooling. No business logic yet — just a compiling, loadable extension skeleton.

## Current State
- Empty scaffolded directory structure under `src/`
- No package.json, no WXT config, no Tailwind config
- Gitea + GitHub repos exist with docs only

## Deliverables (max 5 files touched)
1. `package.json` — WXT, React, Tailwind, TypeScript deps
2. `wxt.config.ts` — WXT configuration for Chrome Manifest V3
3. `tsconfig.json` — Strict TypeScript config
4. `tailwind.config.js` — Tailwind with extension-appropriate settings
5. `postcss.config.js` — PostCSS for Tailwind

## Acceptance Criteria
- [ ] `npm install` completes without errors
- [ ] `npm run dev` launches dev mode and produces a loadable extension
- [ ] `npm run build` produces a production build in `.output/`
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] Extension can be loaded in Chrome (even if it does nothing yet)

## Constraints
- WXT latest stable version
- React 18+
- Tailwind CSS 3+
- Target: Chrome Manifest V3 (Firefox V3 support later)
- No unnecessary deps — keep it lean
