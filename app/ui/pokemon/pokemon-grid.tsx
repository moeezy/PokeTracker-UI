import { UserPokemon } from "@/app/lib/definitions";
import PokemonCard from "@/app/ui/pokemon/pokemon-card";

export default function PokemonGrid({allPokemon}: {allPokemon: UserPokemon[]}){
    return(
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 p-6">
            {allPokemon.map((pokemon) => (
                <PokemonCard key={pokemon.pokedexNumber} pokemon={pokemon} />
            ))}
        </div>
    );
}