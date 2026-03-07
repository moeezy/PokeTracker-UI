import { Route, UserPokemon } from "../lib/definitions"

export  async function getRoutes() {
  const res = await fetch('http://localhost:8080/v1/Routes')
  const routes: Route[] = await res.json()
  return routes;
}

export async function getUserPokemonById(userId: string | number) {
  const res = await fetch(`http://localhost:8080/v1/userPokemon/${userId}`)
  const userPokemon: UserPokemon[] = await res.json()
  console.log("Fetched userPokemon:", userPokemon); 
  return userPokemon;
}