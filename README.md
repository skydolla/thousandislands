# Thousand Islands

A map of every island I've visited on the way to a bucket-list goal of 1,000 islands.
Click a pin to see the trip(s) that reached that island, who came along, and photos.

## Stack

- **Web:** Next.js (App Router) + React + Tailwind CSS, hosted on Vercel
- **Map:** MapLibre GL with OpenFreeMap's dark vector style (free, no API key)
- **Data + login:** Supabase (Postgres, Row Level Security, email/password auth)
- **Photos:** Cloudflare R2. Browsers resize photos to 2048px and upload them straight to R2 via presigned URLs

Anyone can view the map. Only accounts listed in the `owners` table can edit, and the
database enforces that for every write.

## Setup

Requires Node 20.9+ (`nvm use` picks up `.nvmrc`).

```bash
npm install
cp .env.example .env.local   # then fill in the Supabase and R2 values (see comments in the file)
npm run check:env            # verifies every key against the live services
npm run db:migrate           # applies supabase/migrations
npm run create-owner         # creates your login (prompts for email and password)
npm run dev                  # http://localhost:3000 — edit trips at /admin
```

## Scripts

| Command | What |
|---|---|
| `npm run dev` / `build` / `start` | Next.js |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npm run check:env` | Checks `.env.local` credentials against Supabase and R2 (prints pass/fail only) |
| `npm run db:migrate` | Applies pending SQL migrations in `supabase/migrations` |
| `npm run db:seed` | Loads sample trips from `lib/data/seed.ts` (development only) |
| `npm run db:wipe -- --yes` | Deletes all trip data (photos in R2 are not touched) |
| `npm run create-owner` | Creates the owner login, or resets its password |

## API

Reads are public; writes need the owner's session cookie (web) or `Authorization: Bearer <access token>` (iOS).

| Route | Methods |
|---|---|
| `/api/map-pins` | `GET` one pin per visited island |
| `/api/progress` | `GET` unique islands visited / goal |
| `/api/trips` | `GET` list, `POST` create |
| `/api/trips/[tripId]` | `GET` detail, `PUT` replace, `DELETE` |
| `/api/islands` | `GET ?q=` search, `POST` create |
| `/api/islands/[islandId]` | `PUT`, `DELETE` (only if no trip uses it) |
| `/api/uploads` | `POST` presigned R2 upload URL (step 1 of a photo upload) |
| `/api/pictures` | `POST` record an uploaded photo (step 2) |
| `/api/pictures/[pictureId]` | `PATCH` caption, `DELETE` |
| `/api/pictures/order` | `PUT` reorder an island's photos |

## Layout

| Path | What |
|---|---|
| `app/page.tsx` | Public map page |
| `app/admin/*`, `app/login` | Owner editing UI |
| `app/api/*` | JSON API used by the web app and the iOS app |
| `lib/services/*` | Read queries and response shaping |
| `lib/validation.ts` | Request schemas (zod) |
| `lib/supabase/*`, `lib/r2.ts`, `lib/auth.ts` | Supabase clients, R2 storage, owner check |
| `components/*` | Map, trip modal, photo carousel, progress widget; `components/admin/*` editing UI |
| `supabase/migrations/*` | Database schema, security policies and functions |
| `proxy.ts` | Refreshes the login session; sends signed-out visitors from `/admin` to `/login` |
