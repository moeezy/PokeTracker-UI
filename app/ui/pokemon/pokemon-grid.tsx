'use client';

import { useMemo, useState } from "react";
import { UserPokemon } from "@/app/lib/definitions";
import PokemonCard from "@/app/ui/pokemon/pokemon-card";
import PokedexStats from "@/app/ui/pokemon/pokedex-stats";
import PokedexFilters, { PokedexFilter } from "@/app/ui/pokemon/pokedex-filters";

export default function PokemonGrid({allPokemon, userId}: {allPokemon: UserPokemon[], userId: string}){
    const [filter, setFilter] = useState<PokedexFilter>('all');

    const filteredPokemon = useMemo(() => {
        if (filter === 'caught') return allPokemon.filter((pokemon) => pokemon.caught);
        if (filter === 'missing') return allPokemon.filter((pokemon) => !pokemon.caught);
        return allPokemon;
    }, [allPokemon, filter]);

    return(
        <div className="space-y-6 p-6">
            <PokedexStats pokemon={allPokemon} />
            <PokedexFilters filter={filter} onChange={setFilter} />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {filteredPokemon.map((pokemon) => (
                    <PokemonCard key={pokemon.pokedexNumber} pokemon={pokemon} userId={userId} />
                ))}
            </div>
        </div>
    );
}
