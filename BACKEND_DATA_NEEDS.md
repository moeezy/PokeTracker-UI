# Backend Data Needs for the UI Redesign

Companion to [REDESIGN_PLAN.md](REDESIGN_PLAN.md). This covers what the frontend calls today, and what data the redesign needs that it doesn't currently get.

> Response shapes below come from the frontend's TypeScript types (`app/lib/definitions.ts`), i.e. what the UI *expects*. They haven't been verified against the Spring backend's actual DTOs.

---

## 1. Current API calls

Base URL: `http://localhost:8080` (hardcoded in each call, see "Notes" at the end).
Auth: every endpoint except `/v1/users/login` (and `/v1/users/register`, unused by the UI) requires `Authorization: Bearer <JWT>`.

### `POST /v1/users/login`
- **Called from:** `auth.ts` (NextAuth Credentials `authorize`)
- **Request body:**
  ```json
  { "username": "string", "password": "string" }
  ```
- **Response used:** `{ token, username, id }`. Only `token` and `id` are read. `id` is the numeric userId used by every endpoint below.
- **Non-2xx** is treated as invalid credentials.

### `GET /v1/userPokemon/{userId}`
- **Called from:** `app/lib/api.ts` → `getUserPokemonById`, used by `app/pokedex/[userId]/page.tsx`
- **Response:** `UserPokemon[]`
  ```json
  [
    { "pokedexNumber": 25, "name": "pikachu", "caught": true, "shiny": false }
  ]
  ```
  (`pokedexNumber` is typed `string | number` on the frontend, so the actual type isn't pinned down.)

### `POST /v1/userPokemon/{userId}`
- **Called from:** `app/lib/api.ts` → `updateUserPokemon`, used by `app/ui/pokemon/pokemon-clicks.tsx`
- **Request body:**
  ```json
  { "pokedexNumber": 25, "caught": true, "shiny": false }
  ```
- **Response:** body not read, only `res.ok` is checked.

### `GET /v1/RouteEncounter/{userId}`
- **Called from:**
  - `app/ui/map/MapViewer.tsx`, with its own inline `fetch`
  - `app/lib/api.ts` → `getMapPokemonById`, which is defined but currently unused
- **Response:** `RouteWithArea[]`
  ```json
  [
    {
      "routeId": "string",
      "routeName": "route-29",
      "areas": [
        {
          "areaId": "string",
          "areaName": "route-29-area",
          "encounters": [
            {
              "pokedexNumber": "16",
              "name": "pidgey",
              "caught": false,
              "encounterMethod": "walk",
              "timeOfDay": "morning",
              "radio": null,
              "swarm": null
            }
          ]
        }
      ]
    }
  ]
  ```
  `routeName` must match the `inkscape:label` (or `id`) of the path in the map SVG.

### `GET /v1/Routes`
- **Called from:** `app/lib/api.ts` → `getRoutes`. Currently **not used anywhere** in the UI.
- **Response:** `Route[]`, i.e. `{ routeId, routeName }`

---

## 2. New data needed

### 2.1 Pokémon species metadata (Pokédex filters)
**Needed now: `types` only.** The Type filter can't be built without it. `genderRate`, `isLegendary` and `isMythical` are for filters **deferred** to a later phase. They're listed so that if you add a species table, you can include them in one go. Search and the Generation filter don't need any of this.

| Field | Type | Example | Notes |
|---|---|---|---|
| `types` | `string[]` (1–2 items) | `["electric"]`, `["water", "flying"]` | **Gen 4 typing.** Some Pokémon changed type in Gen 6, when Fairy was added: Clefairy, Jigglypuff, Togepi, Marill, Snubbull, Mr. Mime, Gardevoir, etc. were Normal/other in Gen 4, and Fairy didn't exist yet. PokeAPI's `past_types` field has the Gen 4 values. |
| `genderRate` | `number` | `-1`, `0`, `4`, `8` | PokeAPI convention: chance of being female in eighths. `-1` = genderless, `0` = male-only, `8` = female-only. The UI only needs to tell those three apart from "mixed", so an enum like `"MALE_ONLY" \| "FEMALE_ONLY" \| "GENDERLESS" \| "MIXED"` also works. |
| `isLegendary` | `boolean` | `true` | PokeAPI species `is_legendary` |
| `isMythical` | `boolean` | `false` | PokeAPI species `is_mythical` |

**Two ways to provide it (your call):**

- **A. Add the fields to `GET /v1/userPokemon/{userId}`'s response**, so each `UserPokemon` gets `types`, `genderRate`, `isLegendary`, `isMythical`.
  - ➕ One source of truth. The frontend needs no extra work.
  - ➖ Backend work (a species table/columns plus a DTO change). Every Pokédex load sends this static data again. That's small: roughly +30–50 bytes per Pokémon, about +20 KB uncompressed for 493 entries, much less gzipped.
- **B. A separate endpoint**, e.g. `GET /v1/pokemon` returning static species data without per-user fields.
  - ➕ Cacheable (`Cache-Control: max-age=...`), so it's fetched once, not on every visit.
  - ➖ The frontend makes two requests and merges them.
- **C. No backend change:** the frontend ships a static JSON file generated once from PokeAPI.
  - ➕ Zero backend work. The data never changes.
  - ➖ Pokémon data lives in two places (backend for names, frontend for everything else).

### 2.2 `Encounter.timeOfDay` values, confirmation only (deferred)
*Deferred: the toggle ships as theme-only first.* When encounter filtering is added, the time-of-day toggle (Any / Morning / Day / Night) filters map encounters by `timeOfDay`. To do that, the frontend needs to know:
1. **The exact set of strings** the backend sends (e.g. `"morning" | "day" | "night"`), plus whatever means "any time" (`"any"`? `null`? empty string?).
2. **How an all-day encounter is stored:** one row with an "any" value, or three separate rows (morning, day, night)? This affects both filtering and the current React list key in `encounter-method-group.tsx`.
3. Whether `radio` / `swarm` encounters also carry a `timeOfDay`.

No change needed if the values are already consistent. Just tell me what they are.

### 2.3 Pokédex ID range, confirmation only
The sprite folder includes alternate-form images with IDs ≥ 10000 (e.g. `10013.png`). The Generation filter computes the generation from `pokedexNumber` (1–151 → I, 152–251 → II, 252–386 → III, 387–493 → IV). Please confirm `/v1/userPokemon` only returns #1–493. Form IDs would fall outside every range.

### 2.4 User's game version (HG / SS), deferred
Needed later for the version-exclusive filter, not part of the current redesign.
- A per-user field, e.g. `gameVersion: "HEARTGOLD" | "SOULSILVER"`, plus a way to read and update it. That could be on the login response, a `GET/PUT /v1/users/{id}` endpoint, or similar.
- Plus a per-species `versionExclusive: "HEARTGOLD" | "SOULSILVER" | null`. This fits naturally alongside the 2.1 metadata, wherever that ends up.

---

## 3. Notes (existing, not caused by the redesign)
- **Hardcoded base URL.** `http://localhost:8080` appears in `auth.ts`, `app/lib/api.ts` (4×) and `app/ui/map/MapViewer.tsx`, instead of the `Poketracker_API_URL` env var in `.env.local`.
- **Duplicate fetch.** `MapViewer.tsx` fetches `/v1/RouteEncounter` itself, bypassing `getMapPokemonById` and its `res.ok` error handling. The redesign plan switches it to the shared function.
- **Pokédex link.** The navbar's Pokédex link points at `/pokedex/1`. The backend should already reject a JWT for user A reading user B's data. Worth confirming that it does, since the frontend currently allows navigating to any userId.
