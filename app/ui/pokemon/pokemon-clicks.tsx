'use client';

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { UserPokemon } from "@/app/lib/definitions";
import clsx from "clsx";
import { updateUserPokemon } from "@/app/lib/api";

export default function PokemonClicks({pokemon, userId}: { pokemon: UserPokemon, userId: string}){
    const [caught, setCaught] = useState(pokemon.caught);
    const [shiny, setShiny] = useState(pokemon.shiny);
    const userIdNum: number = Number(userId);
    const router = useRouter();
    const caughtClick = () => {
        const newCaught = !caught;
        setCaught(newCaught);
        updateUserPokemon(userIdNum, {...pokemon, caught: newCaught});
        router.refresh();
    }

    const shinyClick = () => {
       const newShiny = !shiny;
       setShiny(newShiny);
       updateUserPokemon(userIdNum, {...pokemon, shiny: newShiny});
       router.refresh();
    }

    return(
        <div className="flex-col ">
            <button 
            onClick={shinyClick}
            className={`p-2 rounded hover:scale-125 ${
             shiny ? "hover:bg-amber-200" : "hover:bg-gray-200"}`}>
                ✨
            </button>
            <button 
            onClick={caughtClick}
            className={`p-2 rounded hover:scale-125 ${
             caught ? "hover:bg-green-200" : "hover:bg-gray-200"}`}>
                🐱‍👤
            </button>
        </div>
    );
}