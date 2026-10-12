'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import { UserPokemon } from "@/app/lib/definitions";
import { updateUserPokemon } from "@/app/lib/api";
import PokemonSprite  from "@/app/ui/pokemon/pokemon-sprite";
import PokemonIdentifier from "@/app/ui/pokemon/pokemon-identifier";
import PokemonClicks from "@/app/ui/pokemon/pokemon-clicks";

export default function PokemonCard({pokemon, userId}: {pokemon: UserPokemon, userId: string}){
    // Caught/shiny live here (not in PokemonClicks) so the card border,
    // sprite and buttons all update together the moment you click, instead
    // of the sprite waiting for router.refresh() to bring back new props.
    const [caught, setCaught] = useState(pokemon.caught);
    const [shiny, setShiny] = useState(pokemon.shiny);
    const router = useRouter();
    // Client component - needs useSession() (via the SessionProvider in
    // app/providers.tsx) rather than auth(), which only works server-side.
    const { data: session } = useSession();

    async function save(next: { caught: boolean; shiny: boolean }, revert: () => void) {
        if (!session?.backendToken) return;
        try {
            await updateUserPokemon(Number(userId), { ...pokemon, ...next }, session.backendToken);
            // Refresh only after the POST lands - refreshing before it
            // finished could re-fetch the old value from the server.
            router.refresh();
        } catch (error) {
            console.error(error);
            revert();
        }
    }

    const toggleCaught = () => {
        const newCaught = !caught;
        setCaught(newCaught);
        save({ caught: newCaught, shiny }, () => setCaught(!newCaught));
    };

    const toggleShiny = () => {
        const newShiny = !shiny;
        setShiny(newShiny);
        save({ caught, shiny: newShiny }, () => setShiny(!newShiny));
    };

    return(
        // content-visibility: auto lets the browser skip layout/paint for
        // off-screen cards; contain-intrinsic-size reserves their 96px height
        // so the scrollbar doesn't jump as they render in.
        <div
            className={clsx(
                'flex h-24 w-full items-center gap-3 rounded-2xl border-2 bg-panel pr-3 transition-colors [content-visibility:auto] [contain-intrinsic-size:auto_96px]',
                caught ? 'border-caught' : 'border-panel-border',
            )}
        >
            <PokemonSprite pokemon={pokemon} shiny={shiny} caught={caught} />
            <PokemonIdentifier pokemon={pokemon} />
            <PokemonClicks caught={caught} shiny={shiny} onToggleCaught={toggleCaught} onToggleShiny={toggleShiny} name={pokemon.name} />
        </div>
    );
}
