# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Next.js (App Router) frontend for tracking Pokémon caught/shiny status across HeartGold/SoulSilver routes. It's a UI layer only — all data (routes, encounters, per-user Pokédex state) is served by a separate backend API expected at `http://localhost:8080` (see Backend API below). There is no database or server logic in this repo.

## Commands

```bash
pnpm dev      # start dev server (Turbopack, localhost:3000)
pnpm build    # production build
pnpm start    # run production build
pnpm lint     # eslint (flat config, eslint-config-next core-web-vitals + typescript)
```

Package manager is **pnpm** (pnpm-lock.yaml is the lockfile; a package-lock.json also exists but pnpm is the one in active use). There is no test runner configured in this project.

## Architecture

**Routing (Next.js App Router, `app/`):**
- `/` and `/home` — placeholder/scaffold pages, not yet built out.
- `/map` — server component (`app/map/page.tsx`) that renders the client-side `MapViewer`.
- `/pokedex/[userId]` — server component that fetches a user's Pokémon via `getUserPokemonById` and renders `PokemonGrid`.

**Data layer (`app/lib/`):**
- `definitions.ts` — shared types: `Route`, `UserPokemon`, `Encounter`, `Area`, `RouteWithArea` (a route composed of areas, each with a list of encounters).
- `api.ts` — thin fetch wrappers against the backend (`getRoutes`, `getUserPokemonById`, `getMapPokemonById`, `updateUserPokemon`). These call `http://localhost:8080/v1/...` directly (hardcoded, not read from `.env.local`'s `Poketracker_API_URL` yet — be aware of this mismatch if touching API code).
- `updateUserPokemon` POSTs `{ pokedexNumber, caught, shiny }` to `/v1/userPokemon/{userId}`.

**Pokédex grid flow:** `pokedex/[userId]/page.tsx` (server, fetches data) → `PokemonGrid` → `PokemonCard` → composed of `PokemonSprite`, `PokemonIdentifier`, `PokemonClicks`. `PokemonGrid` holds search/view/generation filter state (mirrored to the URL via `history.replaceState`; pure helpers in `app/lib/pokedex.ts`). `PokemonCard` (`'use client'`) owns caught/shiny state: it optimistically toggles, awaits `updateUserPokemon`, then `router.refresh()`s (reverting on error); `PokemonClicks` is presentational. `all-pokemon.tsx` is an older/alternate version of the grid rendering (not wired into any route currently — `PokemonGrid`/`PokemonCard` is the one in use).

**Map flow (`app/ui/map/MapViewer.tsx`, client component):** Renders the static PNG map via `next/image` and overlays an interactive SVG fetched once at runtime and injected via `innerHTML` into a ref'd container (not imported as a React SVG component). Route data (`RouteWithArea[]`) comes from `getMapPokemonById` for the logged-in user. Paths are matched to routes by `data-route` (falling back to path `id`) via a `routeLookup` map keyed on route name, read through a ref by one delegated `mouseover`/`click` listener on the container. Hover/pinned styling is CSS (`.route-overlay` in `globals.css`), not JS.

**Map overlay asset:** `public/route-overlays/hgss_map_routes_test.svg` is the Inkscape source (it embeds the map PNG as base64, ~1 MB). The page loads `hgss_map_routes.svg`, generated from it by `pnpm map:overlay` (`scripts/build-map-overlay.mjs`: strips the embedded image, editor metadata and inline styles; converts `inkscape:label` → `data-route`). Re-run after editing routes in Inkscape.

**Theme:** design tokens (colors incl. Gen 4 type colors, fonts) live in `globals.css` `@theme`; use token utilities (`bg-panel`, `text-ink`, `bg-type-fire`, …) rather than raw Tailwind colors. `dark:` is remapped to `[data-time="night"]`, not the OS preference. See `REDESIGN_PLAN.md` for the ongoing redesign.

**Sprites (`public/heartgold-soulsilver/`):** Pokémon sprite images named by Pokédex number (`{pokedexNumber}.png`), with `shiny/`, `female/`, and `shiny/female/` subfolders for variants. Sprites sourced from PokeAPI/sprites. Components pick the sprite path directly from `pokemon.pokedexNumber` and `pokemon.shiny`.

**Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`, `@import "tailwindcss"` in `globals.css`), utility classes used inline throughout; `clsx` for conditional classes (see `nav-links.tsx` for the active-route pattern). No component library.

**Path alias:** `@/*` maps to the repo root (e.g. `@/app/lib/definitions`, `@/public/map/...`).

## Known rough edges (don't "fix" silently — flag/ask if relevant to the task)

- Backend base URL is hardcoded as `http://localhost:8080` in `app/lib/api.ts` and `auth.ts`, rather than using the `Poketracker_API_URL` env var already defined in `.env.local`.
- `MapViewer.tsx` and the `/pokedex/[userId]` route both hardcode userId in places (`RouteEncounter/1`) — the real per-user userId from routing isn't threaded through everywhere yet.
- `app/ui/all-pokemon.tsx` and `app/ui/header.tsx` appear to be earlier/unused versions superseded by `PokemonGrid`/`PokemonCard` and `Navbar`/`NavLinks` respectively.
