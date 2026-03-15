import { UserPokemon } from "@/app/lib/definitions";
import PokemonSprite  from "@/app/ui/pokemon/pokemon-sprite";
import PokemonIdentifier from "@/app/ui/pokemon/pokemon-identifier";
import PokemonClicks from "@/app/ui/pokemon/pokemon-clicks";

export default function PokemonCard({pokemon}: {pokemon: UserPokemon}){
    return(
        <div className="w-[280px] h-[96px] flex items-center bg-gray-400 border-6 border-amber-300 rounded-2xl px-4 space-y-3">
            <PokemonSprite pokemon={pokemon} />
            <PokemonIdentifier pokemon={pokemon} />
            <PokemonClicks pokemon={pokemon} />
        </div>
    );
}