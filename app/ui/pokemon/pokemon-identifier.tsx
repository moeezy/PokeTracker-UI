import { UserPokemon } from "@/app/lib/definitions";

export default function PokemonIdentifier({pokemon}: { pokemon: UserPokemon}){

    return(
        <div className="flex-1 min-w-0">
            <p className="text-xs font-bold tracking-wide text-ink-muted">
                #{String(pokemon.pokedexNumber).padStart(3, '0')}
            </p>
            <p className="truncate font-semibold capitalize text-ink">
                {pokemon.name}
            </p>
        </div>
    );
}
