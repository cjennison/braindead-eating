# Brain Dead Eating

> **It's Brain Dead.**

A calorie tracking app so simple that anyone can use it. No food databases. No barcode scanners. No complexity. Just tell it what you ate.

---

## Problem Statement

Tracking calories is important but existing apps make it painfully hard. They require searching databases, scanning barcodes, measuring portions, and navigating complex interfaces. Most people give up within a week.

Brain Dead Eating solves this by removing every possible barrier. You open the app, you say what you ate, and AI does the rest. That's it.

---

## Philosophy

**Brain dead.** This app must be usable by someone with learning disabilities. Every design decision must pass one test: _"Could someone use this without thinking?"_

- No menus to navigate to find the input
- No setup wizards with 15 steps
- No tiny text or cramped interfaces
- No ambiguous icons or jargon
- Big numbers. Big inputs. Big buttons.
- The first thing you see is: **"What did you eat?"**

---

## Core Features

### 1. Food Logging (Primary Screen)

The app opens directly to the food input. No home screen. No dashboard-first. The **very first thing** on screen is a large text input asking: **"What did you eat?"**

- User types natural language: _"2 eggs, toast with butter, and a coffee with cream"_
- Tap "Log it"
- AI parses and **saves immediately** — no confirmation screen
- Parsed items appear in today's log with calories and macros
- Daily totals update instantly
- If AI got it wrong? Swipe to delete, try again. That's it.

### 2. Daily Dashboard

Visible after logging or by scrolling/swiping:

- **Calories remaining today** — enormous number, impossible to miss
- **Calories consumed today** — clear running total
- **Calorie deficit status** — are you on track?
- **Macro breakdown** — protein / carbs / fat split (simple bar or ring)

### 3. Weight Tracking

- Simple weight entry (just a number)
- Shows current weight vs. target weight
- Trend over time (simple line chart, nothing fancy)

### 4. User Profile / Onboarding

Dead-simple onboarding for new users:

1. Sign in with Google (one tap)
2. **"What's your current weight?"** — single input, big number pad
3. **"What's your goal weight?"** — single input, big number pad
4. **"Pick your intensity"** — choose a deficit mode (see Deficit Modes below)
5. Done. Go to food input.

Each step is its own full screen. No cramped forms. One question per screen.

#### Deficit Modes

Instead of asking "what's your daily calorie target?" (which nobody knows), the app calculates a recommended target based on the user's current weight and goal weight, then presents it through one of these intensity levels:

| Mode               | Label            | Subtitle                                 | Deficit                     | Vibe                |
| ------------------ | ---------------- | ---------------------------------------- | --------------------------- | ------------------- |
| **Cruise Control** | "Cruise Control" | "Slow and steady. You'll barely notice." | ~250 cal/day (~0.5 lb/week) | Chill, sustainable  |
| **Locked In**      | "Locked In"      | "Real results. Real discipline."         | ~500 cal/day (~1 lb/week)   | Serious, focused    |
| **Beast Mode**     | "Beast Mode"     | "Maximum effort. Not for the faint."     | ~750 cal/day (~1.5 lb/week) | Intense, no excuses |
| **Maintaining**    | "Holding Steady" | "You're good where you are."             | 0 (maintenance)             | Confident, stable   |

The app uses a simple BMR estimate (Mifflin-St Jeor) to calculate maintenance calories from the user's weight, then subtracts the deficit. The user sees the deficit mode name and the resulting daily calorie number, e.g.:

> **Locked In** — 1,850 cal/day
> Real results. Real discipline. You'll lose about 1 lb/week.

Users can also tap "Custom" to enter their own number. But most won't need to — the modes do the thinking for them.

The tone is confident and direct without being cringe. Professional wording, not meme-speak. Think fitness coach energy, not influencer energy.

### 5. History

- Simple list of past days
- Tap a day to see what you ate
- That's it

---

## What Is NOT In Scope

- Food databases or barcode scanning
- Recipe builders
- Meal planning
- Social features
- Exercise tracking
- Integration with fitness devices
- Complex analytics or reports
- Meal photos (future maybe)
- Username/password authentication (Google SSO only for now)

---

## Tech Stack

### Framework & Platform

| Layer            | Technology               | Reason                                                    |
| ---------------- | ------------------------ | --------------------------------------------------------- |
| **Framework**    | Next.js 15 (App Router)  | Modern React framework, SSR, API routes, Vercel-native    |
| **UI Library**   | Mantine v7               | Clean, accessible components out of the box               |
| **Mobile**       | Capacitor (by Ionic)     | Wraps the web app as native iOS/Android — single codebase |
| **Deployment**   | Vercel                   | Web app hosting, serverless API routes                    |
| **Database**     | MongoDB (Atlas)          | Flexible schema, cheap at low scale, generous free tier   |
| **AI**           | OpenAI API (GPT-4o-mini) | Structured output for food parsing, cost-effective        |
| **Auth**         | Auth.js v5 (NextAuth)    | Google SSO, session management                            |
| **Code Quality** | Biome                    | Linting + formatting in one tool, fast                    |
| **Language**     | TypeScript               | Type safety across the stack                              |

### Why Capacitor for Mobile?

- **Single codebase**: The Next.js web app IS the mobile app
- **Mantine works as-is**: No rewriting UI components for mobile
- **Auth.js works as-is**: OAuth flows work identically in the WebView
- **Minimal setup**: `npx cap add ios && npx cap add android`
- **App store distribution**: Produces real native apps for App Store and Google Play
- **No React Native tax**: No second codebase, no platform-specific UI rewrites

### Why NOT React Native / Expo?

- Mantine components are web-only — you'd rewrite the entire UI
- Two codebases to maintain
- Auth.js doesn't work natively in React Native
- Massively more complex for a simple app

---

## AI Integration

### How It Works

1. User enters text: _"chicken sandwich and a coke"_
2. App sends text to API route → OpenAI API
3. OpenAI returns structured JSON (using structured outputs / function calling):

```json
{
  "items": [
    {
      "name": "Chicken Sandwich",
      "calories": 450,
      "protein_g": 30,
      "carbs_g": 40,
      "fat_g": 18
    },
    {
      "name": "Coca-Cola (12 oz)",
      "calories": 140,
      "protein_g": 0,
      "carbs_g": 39,
      "fat_g": 0
    }
  ],
  "total": {
    "calories": 590,
    "protein_g": 30,
    "carbs_g": 79,
    "fat_g": 18
  }
}
```

4. Items are saved to MongoDB immediately — no confirmation step
5. Parsed items appear in today's log on the main screen

### Abuse Prevention

Every user is limited to **5 AI requests per day**. This protects against:

- Runaway OpenAI costs if the app gets traction
- Abuse from malicious users
- Unexpected billing spikes

The limit is enforced server-side via a daily counter in MongoDB. The counter resets at midnight UTC (or user's local midnight if we store timezone).

5 requests/day is plenty for a calorie tracker — most people eat 3-5 times a day.

### Model Selection

- **GPT-4o-mini** for cost efficiency — food parsing doesn't need the full model
- Structured outputs ensure consistent JSON responses
- System prompt tuned for accurate calorie/macro estimation
- Fallback: if AI is unavailable, show a friendly error, not a crash

---

## Authentication

### Auth.js v5 with Google SSO

- **Sign in with Google** — one tap, no forms
- No username/password flows (reduces complexity, eliminates password security concerns)
- Session stored in MongoDB (adapter)
- Protected API routes via Auth.js middleware

### Why SSO Only?

- Brain dead to use: tap Google, done
- No password reset flows to build
- No email verification to build
- No security concerns around password storage
- Users already have Google accounts

---

## Database Schema (MongoDB)

### Collections

#### `users`

```
{
  _id: ObjectId,
  email: string,
  name: string,
  image: string,           // Google profile picture
  currentWeight: number,   // in lbs (or kg, user preference)
  goalWeight: number,
  deficitMode: "cruise" | "locked-in" | "beast" | "maintaining" | "custom",
  dailyCalorieTarget: number,  // calculated from mode + weight, or custom
  unit: "lbs" | "kg",
  timezone: string,        // for daily reset
  createdAt: Date,
  updatedAt: Date
}
```

#### `foodLogs`

```
{
  _id: ObjectId,
  userId: ObjectId,
  date: string,            // "2026-04-08" — for easy daily grouping
  rawInput: string,        // what the user typed
  items: [
    {
      name: string,
      calories: number,
      protein_g: number,
      carbs_g: number,
      fat_g: number
    }
  ],
  totalCalories: number,
  totalProtein_g: number,
  totalCarbs_g: number,
  totalFat_g: number,
  createdAt: Date
}
```

#### `weightLogs`

```
{
  _id: ObjectId,
  userId: ObjectId,
  weight: number,
  date: string,            // "2026-04-08"
  createdAt: Date
}
```

#### `aiUsage`

```
{
  _id: ObjectId,
  userId: ObjectId,
  date: string,            // "2026-04-08"
  count: number,           // incremented per request, max 5
}
```

_Auth.js also creates `accounts` and `sessions` collections automatically._

---

## Design System

### Colors

Easy on the eyes. Calming. No harsh reds or aggressive colors.

| Role                 | Color           | Hex       | Usage                                       |
| -------------------- | --------------- | --------- | ------------------------------------------- |
| **Primary**          | Soft Sage Green | `#7CB77C` | Buttons, active states, positive indicators |
| **Background**       | Warm Off-White  | `#FAF9F6` | Page background                             |
| **Surface**          | Clean White     | `#FFFFFF` | Cards, inputs                               |
| **Text Primary**     | Charcoal        | `#2D2D2D` | Main text                                   |
| **Text Secondary**   | Warm Gray       | `#8E8E8E` | Labels, hints                               |
| **Accent**           | Muted Coral     | `#E88D7A` | Warnings, over-budget indicator             |
| **Success**          | Calm Teal       | `#5BAFA8` | On-track indicator                          |
| **Deficit Positive** | Soft Blue       | `#6BA3D6` | Under calorie target                        |

### Typography

- **Large numbers** (calories remaining): 48-64px, bold
- **Input text**: 20-24px, comfortable to type and read
- **Body text**: 16-18px
- **Labels**: 14px, secondary color
- All text high contrast for readability

### Layout Principles

- Maximum width of content: 480px (phone-optimized, centered on desktop)
- Generous padding and spacing (minimum 16px between elements)
- No side-by-side layouts that cramp content
- Touch targets: minimum 48x48px
- Single column layout everywhere
- Cards with rounded corners (12-16px radius)

---

## Screen Designs (Wireframes)

### Screen 1: Food Input (HOME — What you see first)

```
┌──────────────────────────────┐
│  Brain Dead Eating           │
│                              │
│  ┌────────────────────────┐  │
│  │  1,340                 │  │
│  │  calories remaining    │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │                        │  │
│  │  What did you eat?     │  │
│  │                        │  │
│  │  [                   ] │  │
│  │  [    big textarea   ] │  │
│  │  [                   ] │  │
│  │                        │  │
│  │  [     Log it      ]   │  │
│  └────────────────────────┘  │
│                              │
│  Today's Macros:             │
│  Protein ████████░░  80g     │
│  Carbs   ██████░░░░  120g    │
│  Fat     ████░░░░░░  45g     │
│                              │
│  --- Today's Log ----------- │
│  2 eggs, toast          350   │
│  Coffee w/ cream         60   │
│  Chicken salad          450   │
│                              │
│  ┌─────┐  ┌─────┐  ┌─────┐   │
│  │ Eat │  │ Wt  │  │ Me  │   │
│  └─────┘  └─────┘  └─────┘   │
└──────────────────────────────┘
```

### Screen 2: Weight

```
┌──────────────────────────────┐
│  Your Weight                 │
│                              │
│       ┌──────────┐           │
│       │  185.2   │ lbs       │
│       └──────────┘           │
│  [ Log today's weight ]      │
│                              │
│  Goal: 175 lbs               │
│  To go: 10.2 lbs             │
│                              │
│  ┌────────────────────────┐  │
│  │  Simple trend chart    │  │
│  │     over past 30 days  │  │
│  └────────────────────────┘  │
│                              │
│  ┌─────┐  ┌─────┐  ┌─────┐   │
│  │ Eat │  │ Wt  │  │ Me  │   │
│  └─────┘  └─────┘  └─────┘   │
└──────────────────────────────┘
```

### Screen 3: Profile

```
┌──────────────────────────────┐
│  Profile                     │
│                              │
│  Chris                       │
│  chris@gmail.com             │
│                              │
│  Mode: Locked In             │
│  Daily Calorie Target        │
│  ┌──────────┐                │
│  │   1,850  │                │
│  └──────────┘                │
│                              │
│  Goal Weight                 │
│  ┌──────────┐                │
│  │    175   │ lbs            │
│  └──────────┘                │
│                              │
│  Unit Preference             │
│  [ lbs ] [ kg ]              │
│                              │
│  [ Sign Out ]                │
│                              │
│  ┌─────┐  ┌─────┐  ┌─────┐   │
│  │ Eat │  │ Wt  │  │ Me  │   │
│  └─────┘  └─────┘  └─────┘   │
└──────────────────────────────┘
```

---

## Onboarding Flow (New Users)

After Google sign-in, if no profile data exists:

**Step 1 of 3:**

```
┌──────────────────────────────┐
│                              │
│  Welcome to                  │
│  Brain Dead Eating            │
│                              │
│  Let's get you set up.       │
│  3 quick questions.          │
│                              │
│  What's your current weight? │
│                              │
│       ┌──────────┐           │
│       │   ___    │ lbs       │
│       └──────────┘           │
│                              │
│  [ Next → ]                  │
│                              │
└──────────────────────────────┘
```

**Step 2 of 3:**

```
┌──────────────────────────────┐
│                              │
│  What's your goal weight?    │
│                              │
│       ┌──────────┐           │
│       │   ___    │ lbs       │
│       └──────────┘           │
│                              │
│  [ Next → ]                  │
│                              │
└──────────────────────────────┘
```

**Step 3 of 3:**

```
┌──────────────────────────────┐
│                              │
│  Pick your intensity.        │
│                              │
│  Based on your numbers,      │
│  here's what we recommend:   │
│                              │
│  ┌────────────────────────┐  │
│  │ Cruise Control         │  │
│  │ 2,100 cal/day          │  │
│  │ Slow and steady.       │  │
│  │ You'll barely notice.  │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ Locked In          <<  │  │
│  │ 1,850 cal/day          │  │
│  │ Real results.          │  │
│  │ Real discipline.       │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ Beast Mode             │  │
│  │ 1,600 cal/day          │  │
│  │ Maximum effort.        │  │
│  │ Not for the faint.     │  │
│  └────────────────────────┘  │
│                              │
│  [ Custom: _____ ]           │
│                              │
│  [ Let's go ]                │
│                              │
└──────────────────────────────┘
```

---

## Project Structure

```
braindead-eating/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with Mantine provider
│   │   ├── page.tsx            # Home — food input (THE screen)
│   │   ├── weight/
│   │   │   └── page.tsx        # Weight tracking
│   │   ├── profile/
│   │   │   └── page.tsx        # User profile / settings
│   │   ├── history/
│   │   │   └── page.tsx        # Past days log
│   │   ├── onboarding/
│   │   │   └── page.tsx        # New user setup
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       │   └── route.ts    # Auth.js handler
│   │       ├── food/
│   │       │   └── log/
│   │       │       └── route.ts    # POST: parse via AI + save (one step, no confirm)
│   │       ├── weight/
│   │       │   └── route.ts    # GET/POST weight entries
│   │       └── user/
│   │           └── route.ts    # GET/PATCH user profile
│   ├── components/
│   │   ├── FoodInput.tsx       # The big textarea + button
│   │   ├── CalorieDisplay.tsx  # Big calorie remaining number
│   │   ├── MacroBar.tsx        # Macro nutrient bars
│   │   ├── FoodLogItem.tsx     # Single food log entry
│   │   ├── WeightInput.tsx     # Weight entry component
│   │   ├── WeightChart.tsx     # Simple trend line
│   │   ├── BottomNav.tsx       # Eat / Weight / Profile tabs
│   │   └── OnboardingStep.tsx  # Reusable onboarding step layout
│   ├── lib/
│   │   ├── auth.ts             # Auth.js configuration
│   │   ├── db.ts               # MongoDB connection
│   │   ├── openai.ts           # OpenAI client + food parsing (parse & save in one call)
│   │   └── models/
│   │       ├── User.ts         # Mongoose user model
│   │       ├── FoodLog.ts      # Mongoose food log model
│   │       ├── WeightLog.ts    # Mongoose weight log model
│   │       └── AiUsage.ts      # Mongoose AI usage counter
│   ├── theme/
│   │   └── index.ts            # Mantine theme customization
│   └── types/
│       └── index.ts            # Shared TypeScript types
├── ios/                        # Capacitor iOS project (generated)
├── android/                    # Capacitor Android project (generated)
├── public/
│   └── icons/                  # App icons, PWA manifest icons
├── capacitor.config.ts         # Capacitor configuration
├── next.config.ts              # Next.js configuration
├── biome.json                  # Biome linting/formatting config
├── tsconfig.json               # TypeScript configuration
├── package.json
├── .env.example                # Environment variable template
├── .github/
│   └── CONTRIBUTING.md         # Contribution guidelines
├── PROJECT.md                  # This file
└── README.md                   # Setup + run instructions
```

---

## API Routes

| Method | Route                           | Description                                        | Auth Required |
| ------ | ------------------------------- | -------------------------------------------------- | ------------- |
| POST   | `/api/food/log`                 | Send text to OpenAI, parse, and save in one step   | Yes           |
| GET    | `/api/food/log?date=2026-04-08` | Get food logs for a specific date                  | Yes           |
| DELETE | `/api/food/log/:id`             | Delete a food log entry                            | Yes           |
| GET    | `/api/weight`                   | Get weight history                                 | Yes           |
| POST   | `/api/weight`                   | Log a weight entry                                 | Yes           |
| GET    | `/api/user`                     | Get current user profile                           | Yes           |
| PATCH  | `/api/user`                     | Update profile (calorie target, goal weight, etc.) | Yes           |

---

## Rate Limiting (AI Abuse Prevention)

- **5 AI requests per user per day** (server-enforced)
- Tracked in `aiUsage` collection: `{ userId, date, count }`
- Before each OpenAI call, check if `count < 5` for today
- If limit reached, return friendly message: _"You've logged all your meals for today. Resets at midnight."_
- The limit is per-user, not global — authenticated users only
- Unauthenticated requests to `/api/food/parse` are rejected (401)

---

## Deployment

### Web (Vercel)

- Connect GitHub repo to Vercel
- Set environment variables in Vercel dashboard
- Automatic deployments on push to `main`
- API routes run as Vercel Serverless Functions

### iOS (App Store)

1. `npx cap sync ios`
2. Open in Xcode: `npx cap open ios`
3. Build and submit to App Store via Xcode

### Android (Google Play)

1. `npx cap sync android`
2. Open in Android Studio: `npx cap open android`
3. Build APK/AAB and submit to Google Play

---

## Development Workflow

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Lint and format
npx @biomejs/biome check --write .

# Build for production
npm run build

# Sync mobile projects
npx cap sync
```

---

## Decisions

Every gap, edge case, and open question has been resolved. These are final for v1.

### Calorie Display States

Three visual states based on how much of the daily target has been consumed:

- **On track** (sage green): "1,340 calories remaining"
- **Getting close** (amber, triggers at 15% or less remaining): "200 calories remaining -- almost there"
- **Over budget** (muted coral): "150 over -- no worries, tomorrow's a new day"

The threshold for "getting close" is 15% of the daily target. For a 2,000 cal target, that's 300 cal or less remaining. Tone is always encouraging. No guilt.

### AI Errors

No confirmation screen. Food logs immediately. If the AI got it wrong, the user deletes the entry and types it again. Delete costs nothing. Re-entry costs one AI request. The system prompt will instruct the AI to make reasonable assumptions about portion sizes (e.g., "a coffee" means 8oz drip coffee with nothing added, "a beer" means 12oz regular beer). When in doubt, the AI should pick the most common interpretation and note it in the item name (e.g., "Coffee (black, 8oz)").

### Garbage Input

If the user enters non-food text, the API returns a specific error type. The UI shows: "I couldn't find any food in that. Try something like '2 eggs and toast'." This counts against the rate limit to prevent abuse. The system prompt explicitly tells the model to reject non-food input with a structured error response rather than guessing.

### Drink Reminders

The placeholder text in the food input rotates through examples that include drinks. Rotation set:

1. "a bowl of cereal and OJ"
2. "leftover pizza, 2 slices"
3. "grande iced coffee with oat milk"
4. "2 beers and some chips"
5. "chicken sandwich and a coke"
6. "3 glasses of red wine"
7. "protein shake and a banana"

Picks one at random on each screen load. This passively reminds users that drinks count.

### Quick-Log (Repeated Meals)

Not in v1. Every entry goes through AI. In v1.1, the app will show the user's 3 most recent unique meals above the input as tap-to-re-log buttons. Tapping one re-logs it directly from the stored data without spending an AI request.

### Loading State

After tapping "Log it":

1. Button text changes to "Logging..." and is disabled
2. A skeleton card appears at the top of today's log with shimmer animation
3. On success: skeleton is replaced with the real parsed items, calorie display updates
4. On failure: skeleton disappears, a toast notification slides in from the top with the error message and a "Try again" link that refocuses the input

No spinners anywhere in the app.

### Empty State (No Food Logged Today)

When no food has been logged today:

- Calorie display shows the full daily target (e.g., "2,000 calories remaining")
- Today's log section is hidden entirely (no "nothing here yet" message)
- The screen is just: calorie number + input + button
- Maximum focus on the one thing the user should do: enter food

### Deleting Food Entries

Each entry in today's log has a delete affordance:

- On mobile: swipe left reveals a red "Delete" button
- On desktop: a subtle X appears on hover in the top-right corner of the entry card
- Tapping delete shows an inline confirmation within the card: "Remove? Yes / No"
- If confirmed, the entry is deleted, calorie display recalculates immediately
- Deleted entries are hard-deleted from MongoDB (no soft delete for v1)
- AI requests are never refunded on deletion

### Account Deletion

Required for App Store and GDPR compliance. Located at the bottom of the Profile screen:

- Red text link: "Delete my account"
- Tapping it shows a full-screen confirmation: "This will permanently delete your account and all your data. This cannot be undone."
- Two buttons: "Delete everything" (red) and "Never mind" (default style)
- On confirmation: all user data is hard-deleted from every collection (users, foodLogs, weightLogs, aiUsage, accounts, sessions)
- User is signed out and redirected to the sign-in screen

### Error Messages

Every error the user can encounter and the exact copy:

| Scenario        | Message                                                                    |
| --------------- | -------------------------------------------------------------------------- |
| No internet     | "No connection. Check your wifi and try again."                            |
| AI service down | "Our food brain is taking a nap. Try again in a minute."                   |
| Server error    | "Something went wrong. Try again."                                         |
| Rate limit hit  | "You've logged all your meals for today. Resets at midnight."              |
| Non-food input  | "I couldn't find any food in that. Try something like '2 eggs and toast'." |
| Account deleted | "Your account has been deleted. Take care."                                |

Every error includes a "Try again" action except rate limit (which shows when it resets) and account deletion (which redirects to sign-in).

### Deficit Display

The app does not show a separate "deficit" number. The concept is baked into one number: **calories remaining**. The user picked their target during onboarding (via a deficit mode that did the math for them). The app just tracks against that number. Simple.

- Daily target: 1,850 (set by "Locked In" mode)
- Eaten today: 1,050
- Display: "800 calories remaining"

No TDEE charts, no deficit graphs, no maintenance vs. deficit breakdowns. Just the one number.

### Session / Auth Behavior

- JWT strategy (not database sessions) for Capacitor compatibility
- Tokens last 30 days, refresh automatically
- Users stay logged in permanently on mobile -- they should never see a sign-in screen after first login
- On web, same behavior -- 30-day persistent session
- If the JWT expires, the user is silently redirected to Google SSO which auto-signs them back in (no password re-entry since it's SSO)

### Midnight Reset

Daily totals reset based on the user's timezone, which is auto-detected from the browser on first login and stored in the user profile.

- At midnight (user's local time), the food log view switches to the new day
- The calorie display resets to the full daily target
- Yesterday's log moves to history
- AI usage counter resets
- Implementation: the API uses the user's stored timezone to determine "today" for all queries. No cron jobs. The date boundary is computed per-request.

### Timezone Detection

Auto-detected from `Intl.DateTimeFormat().resolvedOptions().timeZone` on first login. Stored in the user profile. The user never sees or configures this. If for some reason it can't be detected, default to UTC.

### Accessibility

Non-negotiable for v1:

- All interactive elements have ARIA labels
- Color is never the only indicator (always paired with text)
- WCAG AA contrast (4.5:1 minimum)
- Minimum font size: 14px
- Tab order is logical on all screens
- Screen reader announces calorie updates when food is logged (ARIA live region)
- Mantine provides most of this out of the box

### OpenAI Billing Protection

Two layers of protection:

1. **App-level**: 5 AI requests per user per day, enforced server-side via `aiUsage` collection
2. **OpenAI-level**: Create a dedicated OpenAI Project, set a $10/month spending cap in the project settings, use a project-scoped API key

If the app-level limit somehow fails, the OpenAI project cap catches it. Belt and suspenders.

### Onboarding Skip Behavior

Every onboarding step has a "Skip" link at the bottom. Behavior when skipped:

- **Skip current weight**: No weight tracking shown. Weight tab shows "Add your weight to start tracking."
- **Skip goal weight**: No "to go" display on weight screen. Deficit modes show calorie targets based on current weight only (maintenance estimate).
- **Skip deficit mode**: Default to "Locked In" (500 cal deficit). This is the most common choice and a safe default.

Skipping any step does not block food logging. The user can always fill in skipped values later from the Profile screen.

### Macros Below the Fold

Macros (protein, carbs, fat) are shown on the main screen but below the fold. The visible area without scrolling is:

1. Calorie remaining (big number)
2. Food input + "Log it" button
3. Today's log entries

Scroll down to see macro bars. This keeps the primary view dead simple while still surfacing macro data for users who want it. No toggle, no setting. Always there, just not in your face.

### Weight Screen Behavior

- Shows the most recent logged weight with the date: "185.2 lbs -- logged 3 days ago"
- A single large number input and "Log weight" button
- Below that: goal weight and "to go" amount (if goal weight is set)
- Below that: a simple line chart of the last 30 days of weight entries
- If no weight has ever been logged: just the input and button, no chart, no "to go"
- No nagging. No streaks. No "you haven't logged in X days" messages.

### History Access

History is not a nav tab. Two ways to access it:

1. **Main screen**: below today's log, a "View past days" link shows a simple date list
2. **Profile screen**: "Food history" link

Each history entry shows: date, total calories, number of items. Tap to expand and see individual items. That's it.

### Calorie Target Changes

When a user changes their deficit mode or calorie target in Profile:

- The change takes effect immediately for today
- The calorie remaining display recalculates against the new target
- Past days are not retroactively recalculated -- they keep the target that was active when they were logged
- The `dailyCalorieTarget` on the user model is the current/active target

---

## Implementation Rules

Non-negotiable constraints for v1 development:

1. **No confirmation screens.** Food logs immediately on tap. Delete and redo if wrong.
2. **Bottom nav is exactly 3 items.** Eat / Weight / Profile. Nothing else.
3. **Macros live below the fold.** Visible on scroll, not in the primary viewport.
4. **Placeholder text rotates.** Random example on each screen load. Always includes drink examples.
5. **Numbers are rounded and formatted.** Calories to nearest 5 with commas. Grams to nearest 1.
6. **Rate limit messaging is friendly.** "You've logged all your meals for today. Resets at midnight." Never "rate limit exceeded."
7. **Weight logging is optional.** No nagging, no streaks, no shame.
8. **Onboarding is skippable.** Every step has a "Skip" link. Skipping defaults to "Locked In" mode. Food logging is never blocked.
9. **No emojis.** Anywhere. Not in UI, not in code, not in comments, not in commit messages.
10. **Errors are plain English.** Every error has a human-readable message and a clear next action.

### Brain Dead Scorecard

| Flow                  | Steps                                  | Verdict               |
| --------------------- | -------------------------------------- | --------------------- |
| Sign up               | 1 tap (Google) + 3 screens (skippable) | Brain dead            |
| Log food              | Type + tap "Log it"                    | Brain dead (2 steps)  |
| Check calories left   | Open app                               | Brain dead (0 taps)   |
| Check macros          | Scroll down                            | Brain dead (1 scroll) |
| Log weight            | Tap Weight + type + tap "Log"          | Brain dead (3 taps)   |
| Change calorie target | Profile + select mode                  | Acceptable (3 taps)   |
| View yesterday        | Scroll + tap "View past days"          | Acceptable (2 taps)   |
| Delete food entry     | Swipe + confirm                        | Brain dead (2 taps)   |

---

## Version Roadmap

### v1.0 — MVP (Current)

- Google SSO login
- Food logging via AI
- Daily calorie tracking
- Macro display
- Weight tracking
- Profile management
- Web + iOS + Android

### v1.1 — Polish

- Dark mode
- Edit food entries
- Push notification reminders
- Improved AI accuracy with portion size prompts

### v2.0 — Growth

- Apple SSO
- Email/password auth option
- Data export (CSV)
- Weekly/monthly summaries
- Meal photo input (send photo to AI)
- Shared accountability (optional)
