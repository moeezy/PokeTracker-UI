import clsx from 'clsx';
import Image from 'next/image';
import { UserPokemon } from "@/app/lib/definitions";

export default function AllPokemonAllPokemon({ allPokemon }: { allPokemon: UserPokemon[] }){
  //take input in like this so we can destructure(allPokemon instead of props.allPokemon)
    return(
    //Parent controls layout
    //Child controls appearance
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 p-6">
          {allPokemon.map((pokemon, i) => {
            return (
              <div 
                key={pokemon.pokedexNumber}
              >
                <div className="flex bg-gray-400 border-6 border-amber-300 rounded-2xl items-center px-4 space-y-3">
                  <Image
                    src={pokemon.shiny ? `/heartgold-soulsilver/shiny/${pokemon.pokedexNumber}.png` : `/heartgold-soulsilver/${pokemon.pokedexNumber}.png`} 
                    alt={`${pokemon.name}'s profile picture`}
                    className="mr-4"
                    width={64}
                    height={64}
                  />
                  <div className="min-w-280">
                    <p className="truncate text-sm font-semibold md:text-base">
                      {pokemon.name}
                    </p>
                    <p className="hidden text-sm font-semibold sm:block">
                      {pokemon.pokedexNumber}
                    </p>
                  </div>
                </div>
                <p
                  className={` truncate text-sm font-medium md:text-base`}
                >
                  {pokemon.caught}
                </p>
              </div>
            );
          })}
        </div>
  )
}