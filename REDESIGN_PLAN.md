# PokeTracker UI Redesign Plan

Status: **steps 1–4 implemented** (theme foundation, navbar + landing, Pokédex search/generation filter + card restyle, map layout + overlay perf). Next: step 5 (time-of-day toggle).
Each section lists the goal, the proposed implementation, performance tradeoffs, and any flags.

Flag legend:
- ❓ **Unclear**: needs a decision from you before implementing
- 🔧 **Backend**: needs (or could optionally use) a backend change
- ⚠️ **Best practice / perf**: a requested approach that works against best practice or costs performance, with the reason why
- 🚫 **Not feasible**: as written

---

## 0. Decisions & open questions

### Decided
| # | Decision |
|---|---|
| Q1 | Landing page = **"PokeTracker" title in the Pokémon logo font** (anime/logo style). No logged-in vs logged-out variants. |
| Q2 | Font = the **Pokémon logo font** ("Pokémon Solid" style), not the in-game pixel font. |
| Q3 | Time-of-day mode applies **site-wide**. When no time mode is selected, the site shows a **default theme** (the sunset gradient). The toggle also filters map encounters by time (recommended in 3b). |
| Q4 | **No real-clock default.** The toggle starts unselected (default theme, all encounters shown). |
| Q5 | Keep the interactive SVG route overlay (hover/click/pin). |
| Q6 | **Filter categories are visually distinct:** types use the classic in-game colored type blocks, Legendary uses **Luxury Ball** colors, Mythical uses **Premier Ball** colors, gender uses **blue/pink**. |
| Q7 | Version exclusive = HeartGold-only vs SoulSilver-only. **Deferred to a later phase.** |
| Q8 | **Only category filters** (type, generation, legendary/mythical, gender) update the completion graph. Caught/Missing and search text do not. |
| Q9 | Time-of-day themes **replace** OS dark mode. The default theme is always the sunset gradient. |
| Q10 | The logo font is used for **main page titles only** (PokeTracker, Map, Pokédex). Other headers use the body font. |
| Q11 | Toggle is **Any · Morning · Day · Night**, with Any as the default. |
| Q12 | The chosen time mode **persists across reloads** (cookie, read on the server, no theme flash). |
| Q13 | The map sidebar is a **floating panel over the map's right edge**. |
| Q14 | Gender filter includes **Genderless** as a third option (gray). |
| Q15 | Where Pokémon metadata lives is **your call**. The data needed and the current API are documented in [BACKEND_DATA_NEEDS.md](BACKEND_DATA_NEEDS.md). The Pokédex filters (3c) are blocked until it's available from either source. |

No open questions remain.

---

## Backend change summary 🔧

Full details, including current API calls and response shapes, are in [BACKEND_DATA_NEEDS.md](BACKEND_DATA_NEEDS.md). Summary:

1. **Pokémon metadata (types, gender ratio, legendary/mythical, version exclusivity).** `UserPokemon` currently has only `pokedexNumber`, `name`, `caught`, `shiny`.
   - *Option A (recommended): static JSON in the frontend.* This data never changes for Gen 1–4, so a one-time generated file from PokeAPI (~493 entries, roughly 30–40 KB uncompressed, much less gzipped) needs no backend work.
   - *Option B: backend adds these fields to `/v1/userPokemon/{userId}`.* Cleaner single source of truth, but it's backend work plus larger API responses on every Pokédex load.
2. **User's game version (HG or SS)**, *deferred with version-exclusive filtering (Q7)*. It persists across devices only if stored on the backend (user profile field). It could be kept in a cookie/localStorage instead, but then it's per-browser.
3. **Verify `Encounter.timeOfDay` values.** The time-of-day filter needs to know the exact strings the backend sends (e.g. `"morning" | "day" | "night" | "any"`?) and whether "all day" encounters are one row or three. Not a change, just something to confirm.
4. **Forms with IDs ≥ 10000.** The sprite folder includes `10013.png` etc. (alternate forms). If the backend ever returns those in `userPokemon`, "generation from Pokédex number" breaks for them. Confirm the list is only #1–493.

---

## 1. Overall vision

A personalized, nostalgic HGSS-flavored interface that stays easy to use. Two principles to keep checking against:

- **Nostalgia goes on the frame, not the content.** Gradients, pixel fonts and Gen 4 icons belong on headers, nav, backgrounds and accents. Data (names, numbers, counts, search input) stays in a clean, readable font on solid or near-solid panels.
  - ⚠️ Why: pixel fonts and busy gradients behind small text hurt readability and fail WCAG contrast. "Easy to use" and "nostalgic" only conflict if the theme reaches the data.
- **Design tokens first.** All colors, fonts and radii are defined once as CSS variables (Tailwind v4 `@theme`). Components use tokens like `bg-panel` and `text-accent`, never raw `bg-gray-400` or `#aa0000`. This is what makes the 3 time-of-day modes possible without rewriting every component.

---

## 2. General theme

### 2.1 Sunset gradient (HeartGold opening)
Palette direction: deep indigo/purple at the top → magenta → orange → gold near the horizon, with Ho-Oh gold as the accent color.

**Implementation**
- Define palette tokens in `globals.css` under `@theme` (e.g. `--color-sky-top`, `--color-sky-mid`, `--color-horizon`, `--color-accent-gold`, `--color-panel`, `--color-ink`).
- Apply the gradient **once** to `body`/the root layout as a `linear-gradient`, not per component.
- Content sits on semi-opaque panels (`bg-panel/85`) so text contrast doesn't depend on which part of the gradient sits behind it.

**Performance tradeoffs**
- Static CSS gradients are effectively free: painted once, with no image download. Preferred over a background image.
- ⚠️ **Avoid animating the gradient itself** (e.g. animating `background-position` for a "moving sky"). That forces a full-page repaint every frame. If motion is wanted, animate `opacity` or `transform` on a separate layer, which runs on the GPU compositor without repainting.
- ⚠️ **Use `backdrop-filter: blur()` (frosted glass) sparingly.** It looks great on a gradient but is expensive on large or scrolling areas, especially on low-end laptops and phones. Fine on the navbar, avoid on every Pokémon card (493 blurred cards will stutter when scrolling).
- `background-attachment: fixed` (gradient stays still while scrolling) causes repaint-on-scroll in some browsers. Use a `position: fixed` background div instead, which gets its own compositor layer.

### 2.2 Pokémon logo font for main page titles (Q2, Q10 decided)
The anime/logo-style font: yellow fill with a blue outline ("Pokémon Solid" is the common fan-made version).

**Implementation**
- Self-host the font file (`.woff2`) via `next/font/local`, exposed as a CSS variable (`--font-display`).
- Used **only on main page titles**: "PokeTracker" on the landing page and the top title of Map and Pokédex. Section headers, route names, and the sidebar use the body font.
- Remove the OS-dark-mode `@media (prefers-color-scheme: dark)` block from `globals.css` (Q9). Also remove the scattered `dark:` Tailwind classes as components are restyled. Time-of-day themes are the only theme system.
- Logo look: yellow `color` plus a blue outline via `-webkit-text-stroke` and/or layered `text-shadow`.
- Body text stays a readable sans font. Geist is already loaded in `layout.tsx`.

**Performance tradeoffs**
- `next/font` self-hosts the font, preloads it, and sets size-adjusted fallbacks, which avoids layout shift (CLS) when it loads. Loading it from a third-party CDN would add a DNS lookup and a render-blocking request.
- Display fonts like this are small (roughly 20–40 KB), and only one weight is needed, so the cost is minor.
- `-webkit-text-stroke` and `text-shadow` on a few headers are cheap. ⚠️ Avoid them on large amounts of text: big blurred `text-shadow`s repaint on every scroll or transition.
- ⚠️ The logo font only has Latin letters, and many versions lack "é". Check that "Pokédex" renders correctly; otherwise the browser falls back to a different font for that one letter.
- ⚠️ **Licensing:** fan-made Pokémon fonts are typically "free for personal use". Fine for a personal project, but check the license before any public deployment.

### 2.3 Pixel-art rendering (applies everywhere sprites appear)
- Add `image-rendering: pixelated` to sprites, so upscaled Gen 4 sprites stay crisp instead of blurry. This is a big part of the nostalgic look, and it's free.
- Scale sprites by whole numbers (96px sprite → 96 / 192px), not arbitrary sizes.
- ⚠️ **Perf:** for these tiny PNGs, consider `unoptimized` on `next/image` (or a plain `<img>` with `loading="lazy"`). Next's image optimizer re-encodes and resizes on the server. For ~2–5 KB pixel sprites that gains almost nothing, costs server CPU on first request, and can introduce smoothing. Keep `next/image` optimization for the large map PNG (760 KB), where it pays off.

### 2.4 Accessibility notes (best practice)
- Don't communicate caught/shiny with **color alone**. Pair color with an icon or label (Poké Ball icon, ✨). Around 1 in 12 men have some color-vision deficiency, and red/green, the current map hover colors, is the most common confusion.
- Respect `prefers-reduced-motion`: disable theme transitions and animated elements for users who've opted out.

---

## 3a. Landing page & navigation

### Landing page (Q1 decided)
- Replace the default Next.js template in `app/page.tsx` with a big **"PokeTracker" title in the Pokémon logo font** over the sunset gradient. The navbar provides the Map/Pokédex tabs.
- Optional: a Ho-Oh/Lugia silhouette (SVG) for the HGSS-opening feel.
- Also decide what to do with `/home` (`app/home/page.tsx`). Two scaffold pages for one landing page is confusing, so I recommend deleting `/home` or redirecting it to `/`.
- **Performance:** this page needs no data fetch, so it's very cheap. It's rendered per request only because the layout reads the time-mode cookie (see 3b).

### Top toolbar
- Navbar with **Map** and **Pokédex** tabs, keeping the active-tab highlight from `nav-links.tsx`, restyled with theme tokens. Logout stays on the right.
- Make the PokeTracker title in the bar a link home, instead of a separate "Home" tab. That's the standard web convention.
- **Icons (Gen 4 first, current sprites as fallback):**
  - Candidates: HGSS **Pokégear** map card icon / Town Map item for Map; the **Pokédex** item or menu icon for Pokédex.
  - Possible sources: PokeAPI/sprites `items/` folder (e.g. Town Map), The Spriters Resource (HGSS menu icons). Exact files still need to be found and checked.
  - Fallback: keep the current sprites (#76 Golem for Map, #200 Misdreavus for Pokédex).
- ⚠️ **Perf/bug in current code:** nav icons request `width={240} height={240}` for something displayed small. That downloads a much larger image than needed. Set the real display size (e.g. 32 or 48).
- ⚠️ **Existing bug:** the Pokédex link is hardcoded to `/pokedex/1`. It should use the logged-in user's id from the session, otherwise every user lands on user 1's Pokédex.

### Login page
- Not in your list, but it should get the same theme. Otherwise it's the one page that still looks like the old site.

---

## 3b. Map

### Centered layout
- Currently: fixed `1000px × 700px` map plus a `350px` sidebar side by side, using inline `style={{}}`.
- Proposed: map centered in the page, responsive width (`w-full max-w-5xl aspect-[10/7]`), Tailwind classes instead of inline styles. The sidebar becomes:
  - Wide screens: a panel floating over the right edge of the map, or a column beside it, with the pair centered together.
  - Narrow screens: a bottom sheet/drawer below the map.
- **Sidebar (Q13 decided):** a floating panel over the map's right edge (semi-opaque `bg-panel`), so the map stays truly centered.
  - When no route is hovered or pinned, it collapses to a small hint so it doesn't cover the map.
  - On narrow screens it becomes a bottom sheet below the map.
  - ⚠️ The panel covers the eastern part of the map (Kanto side). The panel needs a collapse button, or the routes it covers must stay clickable when it's collapsed.
- ⚠️ Fixed pixel sizes are a best-practice problem: the page breaks below ~1400px wide (most laptops at 125% scaling, and every phone). Responsive sizing fixes this. The SVG overlay already scales with its container since it's set to `width/height: 100%`.

### Time-of-day toggle (Any / Morning / Day / Night) (Q3, Q4, Q11, Q12 decided)
HGSS time periods: **Morning 4:00–9:59, Day 10:00–19:59, Night 20:00–3:59.**

**UI**
- The toggle sits above the map: 4 segments, **Any · Morning · Day · Night**, with Any selected by default (the real clock is not used). Icons could be sunrise / ☀️ / 🌙, or Gen 4 Pokégear-style clock icons. It must be keyboard accessible, implemented as a radio group.
- The mode applies **site-wide**. The toggle lives on the Map page, but the chosen theme carries over to the Pokédex and other pages.
- Themes, all swapping the same tokens:
  - **Any (default):** the sunset gradient from section 2.1
  - **Morning:** soft pink/peach sky
  - **Day:** bright blue/gold
  - **Night:** deep navy with the gold accents turned down
- The map image gets a tint overlay per mode (e.g. a dark-blue semi-transparent layer at night, like the in-game night palette). There's no tint in Any.
- ~~Selecting a time also filters the sidebar encounters by `timeOfDay`.~~ **Deferred.** For now the toggle is theme-only. It will be wired to filter encounters once the `timeOfDay` values are confirmed (backend item 3).

**Implementation**
- Default tokens live on `:root`. Selecting a time sets `data-time="morning|day|night"` on `<html>`, and each `[data-time=...]` block in `globals.css` overrides the tokens. Selecting Any removes the attribute. Components need no changes, since they already use tokens.
- Because the mode is site-wide, the selected value lives in a small React context (or is read from `<html>`) so the map's encounter filter and the toggle stay in sync.
- Map tint: an absolutely positioned `<div>` over the map image with a per-mode color and opacity.

**Performance tradeoffs**
- Swapping CSS variables via one attribute change is about the cheapest theme switch possible: one style recalculation, no React re-render of the tree.
- ⚠️ **Gradients can't be smoothly transitioned** with CSS `transition` (they snap). For a smooth morning→night fade, stack one background layer per mode and crossfade them with `opacity`. Opacity transitions run on the compositor, so they're smooth and cheap. Registering color tokens with `@property` also lets plain colors interpolate smoothly.
- ⚠️ Prefer a **tint overlay div** over `filter: brightness()/hue-rotate()` on the map image. Filters on a large image re-run on every frame of the transition. An overlay's opacity change is compositor-only.
- **Persistence (Q12 decided: keep on reload):**
  - The selection is stored in a `time-mode` **cookie**. `layout.tsx` reads it with `cookies()` and renders `<html data-time=...>` on the server, so the first paint is already in the right theme.
  - ⚠️ Why not `localStorage`: it's only readable in the browser after the page loads. Reading it in a `useEffect` means the page first paints in the default theme, then visibly switches (the "flash of wrong theme").
  - Tradeoff: reading cookies makes the root layout dynamically rendered (no static HTML caching). That's effectively already the case because of auth, so it costs nothing new. The landing page loses its "fully static" status from 3a, which is a negligible cost for a page this small.

### Keep the vector route overlay (Q5 decided)
The SVG hover/click/pin behavior stays. Changes worth making during the redesign:
- Restyle route highlight colors (`#00ff00` hover / `#aa0000` default) with theme tokens per time mode. The current red/green is also a color-blindness issue (see 2.4).
- ⚠️ **Perf: the overlay SVG is 1.08 MB.** It's an Inkscape file with editor metadata. Running it through **SVGO** (or Inkscape "Save as Optimized SVG") typically shrinks such files by 50–80% with no visual change. Keep the `inkscape:label` attributes (or convert them to `id`/`data-route`), since route matching depends on them.
- ⚠️ **Perf/bug: the SVG is fetched and rebuilt twice.** The load-SVG effect in `MapViewer.tsx` depends on `routeLookup`, so it runs once on mount (empty routes) and again after routes load. That means downloading/parsing the 1 MB SVG twice and re-attaching listeners to every `<path>`. Fix: load the SVG **once**, and use **one delegated event listener** on the container (`event.target.closest('path')`) that reads routes from a ref. This drops hundreds of listeners to 3 and removes the second fetch.
- Also in `MapViewer.tsx`: the route fetch skips the `res.ok` check that `api.ts` added (`parseJsonOrThrow`), and hardcodes `localhost:8080` again. Reuse `getMapPokemonById` from `api.ts`.

---

## 3c. Pokédex

### Search bar
- One input that matches **name** (case-insensitive substring: "char" → Charmander, Charmeleon, Charizard) or **number** ("25", "#025" → Pikachu). If the input is all digits (with an optional `#`), match the number; otherwise match the name.
- Data is already present (`name`, `pokedexNumber`), so no backend change.

### Filters 🔧 (data source TBD, see [BACKEND_DATA_NEEDS.md](BACKEND_DATA_NEEDS.md))
| Filter | Data needed | Source | Affects graph? |
|---|---|---|---|
| Caught / Missing / All | `caught` | ✅ already have | No |
| Type (multi-select, 17 Gen 4 types) | types per species | TBD | Yes |
| ~~Gender: Male-only / Female-only / Genderless~~ | gender ratio | **deferred** | Yes, once added |
| ~~Legendary / Mythical~~ | flags | **deferred** | Yes, once added |
| Generation (I–IV) | Pokédex number | ✅ computed: 1–151 I, 152–251 II, 252–386 III, 387–493 IV (see backend item 4) | Yes |
| ~~Version-exclusive (HG / SS)~~ | exclusive lists + user's version | **deferred (Q7)** | Yes, once added |

### Visual style per filter category (Q6 decided)
Each category gets its own instantly recognizable look. **Every filter chip shows its text label/tag.** No icon-only or color-only chips.

| Category | Style | Labels |
|---|---|---|
| **Type** | Classic in-game type blocks: rounded rectangles in the official type color, uppercase label, subtle darker border (Fire = orange-red, Water = blue, Grass = green, …). One Gen 4 type palette defined as tokens (`--type-fire`, etc.) and reused on Pokémon cards. | `FIRE`, `WATER`, … (all 17) |
| **Legendary** | **Luxury Ball:** black tag with gold border/highlights and gold text. | `LEGENDARY` |
| **Mythical** | **Premier Ball:** white tag with red border/highlights and red text. | `MYTHICAL` |
| **Gender** | Male = blue, Female = pink, Genderless = gray, each with its symbol plus a word. | `♂ MALE ONLY`, `♀ FEMALE ONLY`, `GENDERLESS` |
| **Generation** | Neutral chips, kept plain on purpose so they don't compete with the colored categories. | `GEN I` … `GEN IV` |
| **Caught/Missing** | A simple segmented control, since it's a "view" setting rather than a category. | `ALL`, `CAUGHT`, `MISSING` |

- Unselected chips are shown faded or outlined, and selected ones fully colored with a ✓. That way the selected state isn't conveyed by color alone (see 2.4).
- The Premier Ball tag's red border keeps it visible against light panels. Without the border, white-on-light would disappear.
- ⚠️ Check text contrast on a few type colors (Electric yellow, Ice light-blue). White text fails contrast there, so those blocks use dark text, as many games do.
- ⚠️ Check gold-on-black (Luxury) and red-on-white (Premier) text contrast too. Pick a bright gold (e.g. `#E8C547`) and a strong red (e.g. `#D32F2F`), not muted tones, so both pass.
- **Performance:** these are pure CSS (background colors, borders, a gradient stripe for Luxury Ball), so there are no images to download. Ball-icon images would add requests. If wanted, use tiny inline SVGs instead.

### Layout
- Search bar on its own row.
- Filter category rows below it.
- A results count ("Showing 12 of 493") and a "clear all filters" link.
- Active filters stay visible as removable chips.
- **Put filter state in the URL** (`?q=char&type=fire&gen=1`). Best practice: back button, refresh and sharing a link all preserve the view. Use `router.replace` (not `push`) while typing so every keystroke doesn't create a history entry.

### Completion graph reflects the filtered subset (Q8 decided)
- `PokedexStats` currently receives `allPokemon`. Change it to receive the list filtered by **category filters only** (type, gender, legendary/mythical, generation), e.g. "Fire types: 8/14 (57%)".
- Caught/Missing and the search text filter the grid but **not** the graph.
- Implementation: compute two memoized lists in `PokemonGrid`. `categoryFiltered` feeds the graph. `visible` (`categoryFiltered` plus caught/missing plus search) feeds the grid. This adds no cost, since the second list is derived from the first.
- Show context in the label, e.g. "Fire · Gen I — 57% owned", so the user knows the graph is filtered and not their overall progress.

### Performance tradeoffs
- **Filtering 493 items in memory is trivially cheap** (well under 1 ms). No need for a search library, server-side search, or debouncing the filter logic.
- ⚠️ **What can be slow is re-rendering ~493 cards on every keystroke.** Fixes, cheapest first:
  1. `useDeferredValue(searchText)`: React keeps the input responsive and renders the filtered grid at lower priority. Built into React 19, no dependency.
  2. Lazy-load sprites with `loading="lazy"` (as `next/image` does by default), so off-screen sprites aren't downloaded.
  3. CSS `content-visibility: auto` on cards: the browser skips layout/paint for off-screen cards. One line of CSS.
  - **Virtualization** (react-window etc.) is **not** recommended at 493 items. It adds complexity, breaks Ctrl+F, and complicates responsive grids, for little gain at this size.
- Static metadata JSON (Option A) ships in the client bundle (~10 KB gzipped). Alternatively, import it in the server component and merge it into `UserPokemon` before passing it down. Then only the fields used are serialized, at a slight cost to the server-render payload. The server-merge approach is recommended, since it keeps the client bundle smaller.
- Updating the URL on every keystroke triggers a Next.js navigation. Use `window.history.replaceState`, which Next 14.1+ integrates with `useSearchParams`, to avoid a server round-trip per keystroke.

---

## 4. Existing issues to fix along the way
These are small and touch the same files as the redesign:
- `layout.tsx` loads Geist fonts, but `globals.css` sets `body { font-family: Arial }`, so Geist is downloaded and never used. Wasted download (⚠️ perf).
- `layout.tsx` metadata still says "Create Next App".
- `PokemonCard` uses hardcoded `w-[280px]` in a responsive grid, so cards don't flex with the grid columns.
- Unused `app/ui/all-pokemon.tsx` import in `pokedex/[userId]/page.tsx` and `app/ui/header.tsx` (per CLAUDE.md). Candidates for deletion.
- Hardcoded `localhost:8080` in `api.ts` and `MapViewer.tsx` (per CLAUDE.md, not part of this redesign but worth a separate pass).

---

## 5. Suggested implementation order
1. **Theme foundation:** default (sunset) tokens in `globals.css`, gradient, logo font, pixelated sprites, type-color tokens, fix the Geist/Arial conflict. Every later step depends on this.
2. **Navbar + landing page:** small, highly visible, proves out the theme.
3. **Pokédex search + filters + stats subset:** search and the Generation filter can ship right away. The Type filter waits on type data (see [BACKEND_DATA_NEEDS.md](BACKEND_DATA_NEEDS.md)).
4. **Map layout + SVG optimization + delegated listeners:** perf fixes before adding features.
5. **Time-of-day toggle + Morning/Day/Night themes** (theme-only, with the encounter time filter deferred): last, because it re-themes everything built in steps 1–4.
6. **Login page restyle.**
7. **Later:** encounter filtering by time of day, gender and legendary/mythical filters (styles already specified above), plus the version-exclusive filter and storing the user's game version (Q7).

Each step is a good point to commit and to add a Playwright smoke test (see earlier testing discussion).
