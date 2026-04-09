# Braindead Eating - Project Instructions

## Project Overview

Braindead Eating is a calorie tracking app. The tagline is "It's Brain Dead." The app must be usable by someone with learning disabilities. Every design decision must pass one test: "Could someone use this without thinking?"

Read `PROJECT.md` at the repo root for the full specification, including database schema, API routes, design system, wireframes, deficit modes, and all product decisions.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: Mantine v7
- **Mobile**: Capacitor (wraps the web app for iOS/Android)
- **Database**: MongoDB Atlas with Mongoose
- **AI**: OpenAI API (GPT-5.4 nano, structured outputs)
- **Auth**: Auth.js v5 (Google SSO only)
- **Code Quality**: Biome (linting + formatting)
- **Language**: TypeScript (strict mode)
- **Deployment**: Vercel

## Code Standards

- No `any` types. Ever.
- No unused imports or variables.
- Prefer `const` over `let`. Never use `var`.
- Use early returns to reduce nesting.
- One component per file. Name the file after the component.
- No magic numbers -- use named constants.
- No `console.log` in production code.
- Biome handles formatting: tabs, double quotes, semicolons, trailing commas, 80 char line width.
- Imports are sorted by Biome automatically.

## Design Rules

- No emojis. Anywhere. Not in UI, not in code comments, not in commit messages.
- No confirmation dialogs for primary actions. Food logs save immediately.
- Big text, big buttons, big touch targets (48px minimum).
- Single column layout. Maximum content width 480px.
- Calorie numbers rounded to nearest 5. Macro grams rounded to nearest 1.
- Use commas in large numbers (1,340 not 1340).
- Error messages in plain English, never technical jargon.
- Tone is confident and direct. Fitness coach energy, not influencer energy. Not meme-speak.

## Architecture

- All API routes are in `src/app/api/`
- All API routes require authentication (Auth.js middleware)
- Food logging is one API call: parse via OpenAI + save to MongoDB in a single POST to `/api/food/log`
- AI usage is rate-limited to 5 requests per user per day (server-enforced via `aiUsage` collection)
- Sessions use JWT strategy for Capacitor compatibility

## File Organization

- Pages: `src/app/`
- API routes: `src/app/api/`
- Components: `src/components/` (one per file, named after the component)
- Database models: `src/lib/models/`
- Shared utilities: `src/lib/`
- Theme config: `src/theme/`
- Types: `src/types/`
