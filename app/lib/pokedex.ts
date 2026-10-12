import { UserPokemon } from "@/app/lib/definitions";

// Pure helpers for Pokédex search/filtering - kept out of the components so
// they can be unit tested on their own later.

export type Generation = 1 | 2 | 3 | 4;

export const GENERATIONS: { value: Generation; label: string }[] = [
    { value: 1, label: 'GEN I' },
    { value: 2, label: 'GEN II' },
    { value: 3, label: 'GEN III' },
    { value: 4, label: 'GEN IV' },
];

// National Dex ranges. Returns null for anything outside #1-493 (e.g.
// alternate-form ids >= 10000 - see BACKEND_DATA_NEEDS.md 2.3).
export function getGeneration(pokedexNumber: string | number): Generation | null {
    const n = Number(pokedexNumber);
    if (n >= 1 && n <= 151) return 1;
    if (n >= 152 && n <= 251) return 2;
    if (n >= 252 && n <= 386) return 3;
    if (n >= 387 && n <= 493) return 4;
    return null;
}

// All digits (optionally prefixed with #) is an exact Pokédex number match,
// so "25", "#25" and "#025" all find Pikachu. Anything else is a
// case-insensitive substring match on the name ("char" -> the Charmander line).
export function matchesSearch(pokemon: UserPokemon, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (q === '') return true;

    const numberMatch = q.match(/^#?(\d+)$/);
    if (numberMatch) return Number(pokemon.pokedexNumber) === Number(numberMatch[1]);

    return pokemon.name.toLowerCase().includes(q);
}
