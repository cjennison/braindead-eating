---
description: "Use when running terminal commands, installing packages, building the project, running dev server, syncing Capacitor, or any CLI operations."
---

# Terminal Instructions

## Package Manager

Use `npm`. Do not use `yarn`, `pnpm`, or `bun`.

## Core Commands

```bash
# Install dependencies
npm install

# Dev server (web)
npm run dev

# Build for production
npm run build

# Lint and format (Biome)
npx @biomejs/biome check --write .

# Check for issues without fixing
npx @biomejs/biome check .

# TypeScript type checking
npx tsc --noEmit
```

## Capacitor (Mobile)

```bash
# Sync web build to native projects
npx cap sync

# Open iOS project in Xcode
npx cap open ios

# Open Android project in Android Studio
npx cap open android

# Add platforms (first time only)
npx cap add ios
npx cap add android
```

## Environment

- Copy `.env.example` to `.env.local` for local development
- Never commit `.env.local`
- All env vars are documented in `.env.example`

## Code Quality

- Biome handles both linting and formatting. No ESLint. No Prettier.
- Run `npx @biomejs/biome check --write .` before committing
- Biome config is in `biome.json` at the repo root

## Conventions

- Use `npx` for one-off package commands, not global installs
- Prefer Biome CLI over editor-only linting
- Do not use `npm run lint` or `npm run format` -- use Biome directly unless package.json scripts are set up
