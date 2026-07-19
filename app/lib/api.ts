import { Route, RouteWithArea, UserPokemon } from "../lib/definitions"

// Every endpoint except /v1/users/register and /v1/users/login requires a
// valid JWT (see WebSecurityConfig on the backend), so every function here
// now takes the caller's backendToken - server components get it via
// `(await auth()).backendToken`, client components via `useSession()`.
function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

// Spring's accessDeniedHandler returns an empty body on a 401/403 (it's a
// raw servlet sendError, not routed through Spring MVC's JSON error
// handling), so `res.json()` on a non-ok response throws a confusing
// "Unexpected end of JSON input" instead of surfacing the real problem -
// checking res.ok first gives a much clearer error.
async function parseJsonOrThrow<T>(res: Response, what: string): Promise<T> {
  if (!res.ok) {
    throw new Error(`${what} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function getRoutes(token: string) {
  const res = await fetch('http://localhost:8080/v1/Routes', {
    headers: authHeaders(token),
  });
  return parseJsonOrThrow<Route[]>(res, 'getRoutes');
}

export async function getUserPokemonById(userId: string | number, token: string) {
  const res = await fetch(`http://localhost:8080/v1/userPokemon/${userId}`, {
    headers: authHeaders(token),
  });
  return parseJsonOrThrow<UserPokemon[]>(res, 'getUserPokemonById');
}

export async function getMapPokemonById(userId: string | number, token: string) {
  const res = await fetch(`http://localhost:8080/v1/RouteEncounter/${userId}`, {
    headers: authHeaders(token),
  });
  return parseJsonOrThrow<RouteWithArea[]>(res, 'getMapPokemonById');
}

export async function updateUserPokemon(userId: string | number, pokemon: UserPokemon, token: string) {
  const res = await fetch(`http://localhost:8080/v1/userPokemon/${userId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(token),
    },
    body: JSON.stringify({
      pokedexNumber: pokemon.pokedexNumber,
      caught: pokemon.caught,
      shiny: pokemon.shiny
    }),
  });
  if (!res.ok) {
    throw new Error(`updateUserPokemon failed: ${res.status} ${res.statusText}`);
  }
}