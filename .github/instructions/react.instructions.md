---
description: "Use when writing React components, Next.js pages, API routes, hooks, or any TypeScript/React code in this project."
applyTo: "src/**/*.tsx,src/**/*.ts"
---

# React / Next.js Instructions

## Framework

- Next.js 15 with App Router (not Pages Router)
- All pages are in `src/app/`
- All API routes are in `src/app/api/`

## TypeScript

- Strict mode. No `any` types, ever.
- Define types in `src/types/index.ts` for shared types
- Use Mongoose model types for database objects
- Prefer `interface` for object shapes, `type` for unions and intersections

## Components

- One component per file
- File name matches component name: `FoodInput.tsx` exports `FoodInput`
- Components go in `src/components/`
- Use Mantine v7 components -- never raw HTML when Mantine has a component for it
- No emojis in JSX, comments, or string literals

## API Routes

- All routes require authentication via Auth.js
- Check session at the start of every handler
- Return early with 401 if no session
- Use `NextResponse.json()` for responses
- Food logging is a single POST to `/api/food/log` that parses via OpenAI AND saves to MongoDB in one call
- Never expose raw error messages to the client

## Auth

- Auth.js v5 with JWT strategy (not database sessions)
- Google SSO only
- Config lives in `src/lib/auth.ts`

## Database

- MongoDB with Mongoose
- Models in `src/lib/models/`
- Connection helper in `src/lib/db.ts`
- Always await connection before queries

## Patterns

- Prefer `const` over `let`. Never `var`.
- Use early returns to reduce nesting
- No magic numbers -- define named constants
- No `console.log` -- use proper error handling
- Biome handles import sorting automatically

## AI Integration

- OpenAI client in `src/lib/openai.ts`
- Use GPT-4o-mini with structured outputs
- Rate limit: 5 AI requests per user per day (check `aiUsage` collection)
- Always validate AI responses before saving to database
