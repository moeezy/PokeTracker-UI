import Image from "next/image";
import { UserPokemon } from "@/app/lib/definitions";

export default function PokemonSprite({pokemon}: { pokemon: UserPokemon}){

    return(
        <div className="shrink-0">
            <Image
                src={pokemon.shiny ? `/heartgold-soulsilver/shiny/${pokemon.pokedexNumber}.png` : `/heartgold-soulsilver/${pokemon.pokedexNumber}.png`} 
                alt={`${pokemon.name}'s profile picture`}
                className="mr-4"
                width={64}
                height={64}
            />
        </div>
    );
}