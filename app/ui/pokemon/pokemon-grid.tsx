'use client';

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { UserPokemon } from "@/app/lib/definitions";
import { Generation, GENERATIONS, getGeneration, matchesSearch } from "@/app/lib/pokedex";
import PokemonCard from "@/app/ui/pokemon/pokemon-card";
import PokedexStats from "@/app/ui/pokemon/pokedex-stats";
import PokedexSearch from "@/app/ui/pokemon/pokedex-search";
import PokedexFilters, { PokedexFilter } from "@/app/ui/pokemon/pokedex-filters";

const VIEWS: PokedexFilter[] = ['all', 'caught', 'missing'];

// Reads ?gen=1,3 back into a Set, ignoring anything that isn't 1-4.
function parseGenerations(param: string | null): Set<Generation> {
    const valid = new Set<number>(GENERATIONS.map((g) => g.value));
    return new Set(
        (param ?? '').split(',').map(Number).filter((n): n is Generation => valid.has(n))
    );
}

export default function PokemonGrid({allPokemon, userId}: {allPokemon: UserPokemon[], userId: string}){
    // Filter state is initialised from the URL so refresh, back/forward and
    // shared links all keep the same view.
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get('q') ?? '');
    const [view, setView] = useState<PokedexFilter>(() => {
        const v = searchParams.get('view') as PokedexFilter;
        return VIEWS.includes(v) ? v : 'all';
    });
    const [generations, setGenerations] = useState(() => parseGenerations(searchParams.get('gen')));

    // Typing updates the input immediately, but the 493-card grid re-renders
    // from this deferred copy at lower priority, so keystrokes never wait on it.
    const deferredSearch = useDeferredValue(search);

    // Mirror filter state into the URL. replaceState (not router.push/replace)
    // updates the address bar without a server round-trip or a history entry
    // per keystroke - Next keeps useSearchParams in sync with it.
    useEffect(() => {
        const params = new URLSearchParams();
        if (search) params.set('q', search);
        if (view !== 'all') params.set('view', view);
        if (generations.size > 0) params.set('gen', [...generations].sort().join(','));
        const query = params.toString();
        window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
    }, [search, view, generations]);

    const toggleGeneration = (gen: Generation) => {
        setGenerations((prev) => {
            const next = new Set(prev);
            if (next.has(gen)) next.delete(gen);
            else next.add(gen);
            return next;
        });
    };

    const clearAll = () => {
        setSearch('');
        setView('all');
        setGenerations(new Set());
    };

    // Category filters only (REDESIGN_PLAN.md Q8) - this list drives the
    // completion graph, so Caught/Missing and search never skew it.
    const categoryFiltered = useMemo(() => {
        if (generations.size === 0) return allPokemon;
        return allPokemon.filter((pokemon) => {
            const gen = getGeneration(pokemon.pokedexNumber);
            return gen !== null && generations.has(gen);
        });
    }, [allPokemon, generations]);

    // Derived from categoryFiltered, so the second pass is over the smaller list.
    const visiblePokemon = useMemo(() => {
        return categoryFiltered.filter((pokemon) => {
            if (view === 'caught' && !pokemon.caught) return false;
            if (view === 'missing' && pokemon.caught) return false;
            return matchesSearch(pokemon, deferredSearch);
        });
    }, [categoryFiltered, view, deferredSearch]);

    const statsLabel = generations.size === 0
        ? 'All Pokémon'
        : GENERATIONS.filter((g) => generations.has(g.value)).map((g) => g.label).join(' · ');

    const hasFilters = search !== '' || view !== 'all' || generations.size > 0;

    return(
        <div className="mx-auto max-w-6xl space-y-6 p-6">
            <h1 className="text-logo text-5xl">Pokédex</h1>

            <PokedexStats pokemon={categoryFiltered} label={statsLabel} />

            <section aria-label="Search and filters" className="space-y-4 rounded-2xl border border-panel-border bg-panel p-4">
                <PokedexSearch value={search} onChange={setSearch} />
                <PokedexFilters
                    view={view}
                    onViewChange={setView}
                    generations={generations}
                    onToggleGeneration={toggleGeneration}
                />
                <div className="flex items-center justify-between text-sm text-ink-muted">
                    <span aria-live="polite">
                        Showing {visiblePokemon.length} of {allPokemon.length}
                    </span>
                    {hasFilters && (
                        <button onClick={clearAll} className="font-semibold text-accent-strong hover:underline">
                            Clear all filters
                        </button>
                    )}
                </div>
            </section>

            {visiblePokemon.length === 0 ? (
                <p className="rounded-2xl bg-panel/85 p-8 text-center text-ink-muted">
                    No Pokémon match these filters.
                </p>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                    {visiblePokemon.map((pokemon) => (
                        <PokemonCard key={pokemon.pokedexNumber} pokemon={pokemon} userId={userId} />
                    ))}
                </div>
            )}
        </div>
    );
}
