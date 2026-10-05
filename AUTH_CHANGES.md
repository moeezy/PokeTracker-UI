# Auth Integration — What Changed and Why

This document walks through everything that changed today to connect the
poketracker-ui frontend to the PokeTracker backend's new login system. It's
written assuming you don't already know how any of this works.

## The problem we started with

The backend (PokeTracker, a separate Spring Boot project) added a login
system. Before today, every page in this app just fetched data from the
backend with no login step at all. Once the backend started requiring a
login token on every request, all of those old fetches started failing,
and the login page itself was just an empty shell — nothing was wired up.

## A few concepts, explained plainly

You don't need to be an expert in these to follow the rest of the
document, but they come up a lot:

- **JWT (JSON Web Token)** — a signed string the backend hands you after
  you log in successfully. Think of it like a wristband from a concert:
  you show it on your way back in instead of paying again. The frontend
  has to attach it to every request after login, in a header that looks
  like `Authorization: Bearer <the token>`.
- **Session** — the frontend's own record of "who is currently logged
  in." It's built and managed by a library called **Auth.js** (also
  called NextAuth), which is separate from the backend's JWT — Auth.js
  has its own internal token for its own cookie, and we had to make it
  carry the backend's JWT around inside it too (more on this below).
- **Middleware** — code that runs before a page loads, on every matching
  request. In this project it's called `proxy.ts`, and its job is to
  check "is this person logged in?" before letting them see `/pokedex`
  or `/map`, redirecting to `/login` if not.
- **Server Component vs. Client Component** — Next.js pages default to
  rendering on the server (fast, but no access to browser-only things
  like React state or `localStorage`). Anything marked `'use client'` at
  the top of the file runs in the browser instead. This matters because
  the two have *different ways of finding out who's logged in*
  (`auth()` server-side, `useSession()` client-side) — mixing them up is
  a common source of bugs, and several bugs today were exactly this.
- **CORS / preflight request** — a browser security rule: when a page on
  `localhost:3000` (the frontend) wants to send certain kinds of
  requests to `localhost:8080` (the backend), the browser first sends a
  test request called a "preflight" (an `OPTIONS` request) asking "am I
  allowed to do this?" If the backend doesn't answer that test request
  correctly, the browser blocks the real request entirely — the backend
  never even sees it. This was the cause of two of today's bugs.

## Frontend changes (poketracker-ui)

### 1. `auth.ts` — the core login logic

This file tells Auth.js how to check a username/password. When someone
submits the login form, this code runs:

1. It sends the username/password to the backend's `POST
   /v1/users/login`.
2. The backend replies with `{ token, username, id }` — the JWT, and the
   user's identity.
3. We hand that back to Auth.js as the "logged in user," including the
   raw backend JWT.

The tricky part: Auth.js doesn't automatically know it should hold onto
that backend JWT for us — its default behavior only tracks a
name/email/picture. We added two extra blocks (`jwt` and `session`
callbacks) whose whole job is: *copy the backend JWT, the numeric user
id, and the username into Auth.js's own session, so every other part of
the app can read them later via `auth()` or `useSession()`.* Without
this, the login would "work" but the token would just be thrown away
immediately after.

### 2. `types/next-auth.d.ts` (new file) — teaching TypeScript about our extra fields

Auth.js ships with its own built-in types that only know about
name/email/picture. Since we're stuffing extra fields (the backend
token, the numeric id, the username) into the session, TypeScript needs
to be told about them or it refuses to compile. This file does nothing
at runtime — it's purely so the code in step 1 is allowed to compile.

### 3. `app/api/auth/[...nextauth]/route.ts` (new file) — the missing piece that caused the original bug

This was the actual root cause of the very first bug you reported
("login redirects to a 404"). Auth.js needs an actual URL endpoint on
the frontend (`/api/auth/...`) to talk to internally while processing a
login — think of it as Auth.js's own private API route. That endpoint
didn't exist at all, so partway through logging in, the browser tried to
reach it and got a 404. This one-line file just exposes it:

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### 4. `.env.local` — `AUTH_SECRET` (you added this one)

Auth.js encrypts its session cookie using a secret key, which has to be
set as an environment variable. Without it, every login attempt failed
with a vague "server configuration" error. This is a random value
generated once and kept out of git (`.env.local` is in `.gitignore`).

### 5. `app/ui/login-form.tsx` — building the actual login form

This file used to be an empty placeholder. It's now a real form with
username/password fields that, on submit, calls the `authenticate`
server action (in `app/lib/actions.ts`, which was already written) and
shows an error message if login fails.

### 6. `app/lib/api.ts` — attaching the token to every backend request

All four functions here (`getRoutes`, `getUserPokemonById`,
`getMapPokemonById`, `updateUserPokemon`) talk to the backend. Before
today, none of them sent the JWT, so the backend rejected every one of
them once it started requiring login. Two changes:

- Every function now takes a `token` parameter and sends it as
  `Authorization: Bearer <token>`.
- Every function now checks `res.ok` before trying to read the response
  as JSON. This mattered because when the backend rejects a request, it
  sends back an *empty* response body — and the old code tried to
  parse that empty body as JSON unconditionally, crashing with a
  confusing `Unexpected end of JSON input` error instead of a clear
  "this request was rejected" message.

### 7. `app/pokedex/[userId]/page.tsx` — fetching the token server-side

This page runs on the server (no `'use client'` at the top), so it uses
`auth()` to get the current session, pulls out `backendToken`, and
passes it into `getUserPokemonById`.

### 8. `app/providers.tsx` (new file) + `app/layout.tsx` — making the session available to client components

`useSession()` (the client-side way of reading who's logged in) only
works inside a `<SessionProvider>`. Server Components like `layout.tsx`
can't use that provider directly, so this new file is a small
`'use client'` wrapper around it, mounted once in `layout.tsx` around
the whole app. Without this step, any client component calling
`useSession()` would crash immediately with "`useSession` must be
wrapped in a `<SessionProvider>`" — which is exactly the error we hit
partway through today's work, before this was added.

### 9. `app/ui/pokemon/pokemon-clicks.tsx` — sending the token when you click caught/shiny

This is the button component on the Pokédex grid. It's a Client
Component, so it uses `useSession()` (not `auth()`) to get the token,
and now passes it into `updateUserPokemon`. Before this, clicking
caught/shiny called the backend with no token at all, so the update was
silently rejected.

### 10. `app/ui/map/MapViewer.tsx` — same problem, plus a hardcoded user id

The map page had two separate problems:

- Like the pokedex button, it wasn't sending the token.
- It also had `/1` hardcoded directly in the fetch URL — meaning it
  always loaded route data for user #1, regardless of who was actually
  logged in.

Both are fixed by pulling `session.user.id` and `session.backendToken`
from `useSession()` and using them in the fetch instead. Since `/map`
has no `[userId]` in its URL, the logged-in user's id from the session
is the only place this can come from.

### 11. `app/map/page.tsx` — removed a leftover dead fetch

This page used to fetch all routes (`getRoutes()`) and then never used
the result — the value was thrown away. Since I was already touching
this file to fix a type error caused by the `api.ts` changes above, this
unused fetch (and its now-unused imports) were removed rather than
patched to also send a token for no reason.

### 12. `auth.config.ts` — fixing the "can't get back to Home" bug

This file's job is deciding which pages require login. It had one rule
that said: "if you're logged in and you're not on `/pokedex` or `/map`,
redirect to `/pokedex/1`." The intent was to bounce you away from the
*login page* specifically once you're already logged in (so you don't
see the login form again) — but as written, it applied to *every*
non-protected page, including Home (`/`). So visiting Home while logged
in immediately redirected you away from it. The fix narrows that rule to
only apply when you're actually on `/login`.

## Backend changes (PokeTracker)

### `WebSecurityConfig.java` — the CORS preflight fix

This is the one backend file I changed today (the earlier addition of
`username`/`id` to the login response was already done on your end
before we started this part).

**The bug:** both the map and the "mark as caught" button were failing
with a browser error like:

```
Access to fetch at 'http://localhost:8080/...' from origin
'http://localhost:3000' has been blocked by CORS policy: Response to
preflight request doesn't pass access control check
```

**Why it happened:** the backend already had `@CrossOrigin(origins =
"http://localhost:3000")` on its controllers, which normally tells
Spring "allow requests from the frontend." But Spring Security's login
check runs *before* a request ever reaches a controller. The browser's
preflight `OPTIONS` request doesn't carry a login token (it's not
supposed to — it's just asking permission), so Spring Security was
rejecting it as "not logged in" before the `@CrossOrigin` annotation
ever got a chance to answer it. The browser then saw a preflight with no
permission granted, and blocked the real request — so the actual login
token never even got sent.

**The fix:** one line added to the security configuration:

```java
httpSecurity.cors(Customizer.withDefaults());
```

This tells Spring Security to look at the existing `@CrossOrigin`
annotations and treat preflight requests as a special case that's
allowed through *before* the login check, so they get answered properly
and the real, authenticated request can then go through normally.

## Bugs encountered along the way (and how they were tracked down)

Worth recording since the same debugging approach will apply next time
something like this happens:

1. **"Login redirects to a 404."** Traced by actually driving the app in
   a real browser (via Playwright) and watching the network requests —
   found a `404` on `/api/auth/callback/credentials`, which pointed
   straight at the missing route handler (change #3 above).
2. **"Server configuration" 500 error.** Same technique — the error
   message itself is Auth.js's generic message for a missing
   `AUTH_SECRET`.
3. **`Unexpected end of JSON input` crashing pages.** Found by reading
   the backend server's own log output, not just the browser — it
   pointed at `JSON.parse` failing inside `api.ts`, which led to the
   "always check `res.ok` first" fix (change #6 above).
4. **CORS failures on map/caught-update.** The browser console error
   message named the exact problem ("blocked by CORS policy... preflight
   request") — from there it was a matter of knowing that Spring
   Security's filter chain runs before `@CrossOrigin` unless you
   explicitly tell it to handle CORS.

In general: when something silently "doesn't work," the browser's
console and network tab (or the server's own log) almost always say
exactly what failed — the debugging in each case above was really just
reading that output carefully rather than guessing.
