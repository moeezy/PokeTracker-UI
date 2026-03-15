import { UserPokemon } from "@/app/lib/definitions";

export default function PokemonIdentifier({pokemon}: { pokemon: UserPokemon}){

    return(
        <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold md:text-base">
                {pokemon.name}
            </p>
            <p className="hidden text-sm font-semibold sm:block">
                {pokemon.pokedexNumber}
            </p>
        </div>
    );
}