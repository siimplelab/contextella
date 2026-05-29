# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ Next.js version warning

This repo uses **Next.js 16** (`next@16.2.6`) with **React 19**. APIs, conventions,
and file structure differ from older Next.js you may know. Before writing Next.js
code, read the relevant guide in `web/node_modules/next/dist/docs/` and heed
deprecation notices. (See `web/AGENTS.md`.)

## Repository layout

The application lives entirely in **`web/`** (a Next.js App Router project). All
commands below must be run from `web/`. The repo root also holds `design-data/`
(exported Figma/design assets, not code) and `.claude/launch.json` (configures the
dev server to run on **port 3002** via `npm --prefix web run dev`).

## Commands (run from `web/`)

```bash
npm run dev      # prisma generate + next dev (port 3000 by default; 3002 via launch.json)
npm run build    # prisma generate + next build
npm run lint     # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npm run test     # vitest run (one-shot)
npx vitest run lib/saju/__tests__/saju.test.ts   # run a single test file
npx vitest watch                                  # watch mode
npx prisma migrate dev      # apply/create migrations against DATABASE_URL
npx prisma generate         # regenerate client (also runs on postinstall/dev/build)
```

Requires Postgres env vars: `DATABASE_URL` (and `SHADOW_DATABASE_URL` for migrations),
plus NextAuth's `AUTH_SECRET`. Env files (`.env*`) are gitignored.

## What this app is

**Contextella** ("read the grain of relationships") is a multilingual Saju (Korean
Four Pillars / 사주) astrology app rendered inside a mobile phone frame. A user enters
birth data for themselves and people in their life ("universes"), and the app computes
elemental profiles, pairwise compatibility, and daily fortune.

## Architecture — the big picture

### 1. The Saju engine (`lib/saju/`) is pure and the source of all astrology truth

Everything astrological is **computed on demand from birth data**; nothing derived is
ever persisted (see the comment at the top of `prisma/schema.prisma`). The engine is
pure, deterministic, and framework-free:

- `astronomy.ts` — Julian Day / solar-longitude / 입춘 calculations (KST-based).
- `pillars.ts` — `parseBirthInput()` + `computeFourPillars()`: the four 천간/지지
  pillars (year/month/day/hour). The day-cycle calibration constant
  `DAY_GANZHI_OFFSET = 49` is verified against reference 만세력 in `__tests__/`.
- `constants.ts` — STEMS, BRANCHES (with 지장간 hidden-stem weights summing to 30),
  and element-relation helpers (`GENERATES`, `CONTROLS`, `inHarmony6`, `isClash`, …).
- `profile.ts` — `dayMaster()` (day-stem element), `elementBalance()` (오행 distribution,
  largest-remainder rounded to sum to 100), `pillarViews()` (display rows).
- `compat.ts` — `compatibility()` (weighted score 5–98 from day-master + branch
  relations + element complement) and `synergyConflict()` (prose from factors).
- `daily.ts` — `dayPillarOf()`, `dailyFlow()` (person × day, 20–98), `dailyAdvice()`.
- `index.ts` re-exports the whole engine and adds `sajuFromBirth()`.

When changing engine math, update/extend `lib/saju/__tests__/saju.test.ts` — it anchors
results to known reference dates (e.g. 1900-01-01 = 갑술, 2000-01-01 = 무오).

### 2. Local-first state with optional cloud backup (`lib/store.ts`)

A Zustand store (`useStore`) persisted to `localStorage` under key `contextella:v1` is
**the single source of truth**. The cloud is only an optional backup for signed-in users.

- **Raw, persisted data**: `profile` (the user) + `rawUniverses` (DB-row-shaped) + UI
  prefs (`lang`, `tweaks`). Only these are persisted (`partialize`).
- **Derived runtime state** (`me`, `meSaju`, `universes`, `status`): never persisted —
  recomputed from raw data via `recompute()`, which runs the Saju engine through the
  serialize layer. Any mutation action calls `recompute()` then `pushCloud()`.
- `status` drives routing: `'onboarding'` (incomplete/unparseable birth data) vs
  `'ready'`. `init()` renders instantly from local data, then reconciles with `/api/sync`.

### 3. The serialize layer (`lib/api/serialize.ts`) bridges DB rows → frontend shapes

Defines structural `DbUser`/`DbUniverse`/`DbPerson` types (deliberately decoupled from
generated Prisma types) and the functions (`serializePerson`, `serializeUniverse`,
`serializeMe`, `meSaju`, `userPillars`) that enrich raw rows with engine-computed values
(element, compatibility score, constellation `angle`/`distance` layout). Used by **both**
the store (local) and API routes (cloud), so derivation stays identical on both sides.

### 4. Persistence & auth (Prisma + NextAuth)

- `prisma/schema.prisma`: `User → Universe → Person`, all cascade-deleting. **Birth data
  is the only thing stored** (`birthDate` "YYYY.MM.DD", `birthTime` "HH:MM"|null).
- `lib/db.ts`: singleton `PrismaClient` with the `@prisma/adapter-pg` Postgres adapter.
- `auth.ts`: NextAuth v5 (beta) Credentials provider, JWT sessions, bcrypt password
  hashing. `lib/api/session.ts#requireUserId()` resolves the signed-in user id in routes.
- `app/api/sync/route.ts`: `GET` returns the cloud snapshot; `PUT` replaces the user's
  universes wholesale from the client snapshot. `app/api/auth/register/route.ts` creates
  accounts; `app/api/auth/[...nextauth]/route.ts` mounts NextAuth handlers.

### 5. UI: phone-frame shell + page→screen indirection

- `app/layout.tsx` → `app/client-shell.tsx`: `ClientShell` wraps everything in
  `<PhoneFrame>`, runs `init()` after hydration, and gates routing — brand-new users go
  `/welcome` → `/onboarding`; standalone pages (`/login`, `/register`, `/welcome`,
  `/onboarding`) render without app data.
- **Pages are thin**: each `app/<route>/page.tsx` just renders a matching
  `components/screens/<name>.tsx`. Put real UI in the screen component, not the page.
- Components are heavily inline-styled (SVG orbs/constellations) and read state via
  `useStore` selectors. `components/primitives.tsx` holds shared visual primitives;
  `lib/tokens.ts` holds the palette/`ELEMENTS`/`cosmicBg`/`ACCENT_PALETTE`.

### 6. Internationalization (`lib/i18n.ts`)

Five languages: `ko | en | ja | zh | es`. `I18N: Record<Lang, Dict>` is the full
dictionary; components do `const t = I18N[lang]`. Use `pick(lang, {...})` for one-off
strings and `relationLabel(relation, lang)` for relation keys. The Saju engine carries
its own localized content tables (advice phrases, pillar labels, compatibility prose).
**When adding user-facing text, add all five languages.**

## Conventions

- Import alias `@/*` maps to `web/` root (e.g. `@/lib/saju`, `@/components/...`).
- Birth dates are strings `"YYYY.MM.DD"`; times `"HH:MM"` or `null` (time unknown →
  hour pillar omitted, broader reading). Always validate via `parseBirthInput()`.
- Keep the Saju engine pure and side-effect-free — no React, no I/O, no `Date.now()`
  except the `daily.ts` "today" defaults.
- Never persist derived Saju values; persist only birth data and recompute.
