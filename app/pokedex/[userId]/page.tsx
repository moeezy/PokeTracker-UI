import { UserPokemon } from "@/app/lib/definitions";
import { getUserPokemonById } from "@/app/lib/api";


export default async function Page(props: { params: Promise<{ userId: string }> }) {
  const params = await props.params; // <-- unwrap the Promise
  //dynamic route parameters (params) in server components are wrapped in a Promise.
  const userId = params.userId;
  const userPokemon : UserPokemon[] = await getUserPokemonById(userId);

  return (
    <div>
      Pokedex Page
      <ul>
        {userPokemon.map((pokemon) => (
          <li key={pokemon.pokedexNumber}>
            {pokemon.pokedexNumber}{pokemon.name}{pokemon.caught}{pokemon.shiny}
          </li>
        ))}
      </ul>
    </div>
  );
}