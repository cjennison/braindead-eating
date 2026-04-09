---
description: "Use when working on UI components, layouts, styling, Mantine theme, colors, typography, spacing, or any visual/UX decisions. Covers the Braindead Eating design system."
applyTo: "src/components/**,src/theme/**,src/app/**/page.tsx"
---

# Design System Instructions

## Philosophy

Brain dead. If a user has to think about what to do, the design failed.

## No Emojis

Never use emojis. Not in UI text, not in code comments, not in alt text, not anywhere. Use plain text labels and icons from a consistent icon set only.

## Colors (Mantine theme)

| Token           | Hex     | Usage                                       |
| --------------- | ------- | ------------------------------------------- |
| primary         | #7CB77C | Buttons, active states, positive indicators |
| background      | #FAF9F6 | Page background                             |
| surface         | #FFFFFF | Cards, inputs                               |
| textPrimary     | #2D2D2D | Main text                                   |
| textSecondary   | #8E8E8E | Labels, hints                               |
| accent          | #E88D7A | Warnings, over-budget indicator             |
| success         | #5BAFA8 | On-track indicator                          |
| deficitPositive | #6BA3D6 | Under calorie target                        |

## Typography

- Calorie remaining number: 48-64px, bold
- Input text: 20-24px
- Body text: 16-18px
- Labels: 14px, secondary color
- Never go below 14px for anything

## Layout

- Max content width: 480px, centered on desktop
- Single column only. No side-by-side layouts.
- Minimum padding: 16px between elements
- Touch targets: minimum 48x48px
- Card border radius: 12-16px
- Bottom nav: exactly 3 items (Eat, Weight, Profile)

## Number Formatting

- Calories: round to nearest 5, use commas (1,340 not 1340)
- Macro grams: round to nearest 1 (45g not 44.7g)
- Weight: one decimal place (185.2 lbs)

## Tone

- Confident and direct
- Fitness coach energy, not influencer energy
- No meme-speak, no cringe
- Error messages in plain English: "Something went wrong. Try again." not "Error 500: Internal Server Error"
- Encouraging, never punishing. No guilt trips about overeating.

## Deficit Modes (used in onboarding and profile)

| Mode        | Label          | Subtitle                               |
| ----------- | -------------- | -------------------------------------- |
| cruise      | Cruise Control | Slow and steady. You'll barely notice. |
| locked-in   | Locked In      | Real results. Real discipline.         |
| beast       | Beast Mode     | Maximum effort. Not for the faint.     |
| maintaining | Holding Steady | You're good where you are.             |

## Loading States

- Use skeleton/shimmer placeholders, never spinners
- Show placeholder text like "Crunching the numbers..." during AI calls

## Component Patterns

- One component per file, file named after the component
- Use Mantine components exclusively -- no custom CSS when Mantine provides it
- All interactive elements must have ARIA labels
- Color is never the only indicator -- pair with text
