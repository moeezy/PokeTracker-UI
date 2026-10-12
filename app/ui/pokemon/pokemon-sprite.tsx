import Image from "next/image";
import clsx from "clsx";
import { UserPokemon } from "@/app/lib/definitions";

export default function PokemonSprite({pokemon, shiny, caught}: { pokemon: UserPokemon, shiny: boolean, caught: boolean }){

    return(
        <div className="shrink-0">
            <Image
                src={shiny ? `/heartgold-soulsilver/shiny/${pokemon.pokedexNumber}.png` : `/heartgold-soulsilver/${pokemon.pokedexNumber}.png`}
                alt={`${pokemon.name}${shiny ? ' (shiny)' : ''}`}
                // Uncaught Pokémon are dimmed; caught ones in full color.
                className={clsx('pixelated transition-opacity', !caught && 'opacity-50')}
                // Sprites are 80x80 source pixels - rendering at exactly 80
                // keeps the pixel art 1:1. `unoptimized` serves the PNG as-is:
                // Next's resizer would re-encode a ~2KB sprite for no real
                // saving and smooth its pixels in the process.
                width={80}
                height={80}
                unoptimized
            />
        </div>
    );
}
