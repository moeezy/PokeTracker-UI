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

**Pokédex grid flow:** `pokedex/[userId]/page.tsx` (server, fetches data) → `PokemonGrid` → `PokemonCard` → composed of `PokemonSprite`, `PokemonIdentifier`, `PokemonClicks`. `PokemonClicks` is the only stateful/interactive piece (`'use client'`): it optimistically toggles caught/shiny state, calls `updateUserPokemon`, then `router.refresh()` to resync with the server. `all-pokemon.tsx` is an older/alternate version of the grid rendering (not wired into any route currently — `PokemonGrid`/`PokemonCard` is the one in use).

**Map flow (`app/ui/map/MapViewer.tsx`, client component):** Renders a static PNG map image and overlays an interactive SVG (`public/route-overlays/hgss_map_routes_test.svg`) fetched at runtime and injected via `innerHTML` into a ref'd container (not imported as a React SVG component). Route data (`RouteWithArea[]`) is fetched separately from `/v1/RouteEncounter/{userId}` (userId currently hardcoded to `1`). Paths in the SVG are matched to fetched routes by `inkscape:label` attribute (falling back to path `id`) via a `routeLookup` map keyed on route name. Hover/click on an SVG path highlights it and populates the sidebar with that route's areas and encounters.

**Sprites (`public/heartgold-soulsilver/`):** Pokémon sprite images named by Pokédex number (`{pokedexNumber}.png`), with `shiny/`, `female/`, and `shiny/female/` subfolders for variants. Sprites sourced from PokeAPI/sprites. Components pick the sprite path directly from `pokemon.pokedexNumber` and `pokemon.shiny`.

**Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`, `@import "tailwindcss"` in `globals.css`), utility classes used inline throughout; `clsx` for conditional classes (see `nav-links.tsx` for the active-route pattern). No component library.

**Path alias:** `@/*` maps to the repo root (e.g. `@/app/lib/definitions`, `@/public/map/...`).

## Known rough edges (don't "fix" silently — flag/ask if relevant to the task)

- Backend base URL is hardcoded as `http://localhost:8080` in multiple places in `app/lib/api.ts` and `MapViewer.tsx`, rather than using the `Poketracker_API_URL` env var already defined in `.env.local`.
- `MapViewer.tsx` and the `/pokedex/[userId]` route both hardcode userId in places (`RouteEncounter/1`) — the real per-user userId from routing isn't threaded through everywhere yet.
- `app/map/page.tsx` fetches `getRoutes()` but never passes it to `MapViewer` (which does its own separate fetch instead).
- `app/ui/all-pokemon.tsx` and `app/ui/header.tsx` appear to be earlier/unused versions superseded by `PokemonGrid`/`PokemonCard` and `Navbar`/`NavLinks` respectively.
