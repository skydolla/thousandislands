# Thousand Islands

A map of every island I've visited on the way to a bucket-list goal of 1,000 islands.
Click a pin to see the trip(s) that reached that island, who came along, and photos.

## Stack

- Next.js (App Router) + React + Tailwind CSS
- MapLibre GL with CARTO dark basemap tiles
- Data: currently seeded from `lib/data/seed.ts`; Postgres schema in `db/schema.sql`

## Development

Requires Node 20.9+ (`nvm use` picks up `.nvmrc`).

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (Vitest)
npm run lint
npm run build
```

## Layout

| Path | What |
|---|---|
| `app/page.tsx` | Map page: loads pins, opens the trip modal |
| `app/api/*` | Read API: `map-pins`, `progress`, `trips/[tripId]` |
| `lib/services/*` | Data access behind the API routes |
| `lib/types.ts` | Domain and API response types |
| `components/*` | Map, trip modal, photo carousel, progress widget |
| `db/schema.sql` | Postgres schema |
