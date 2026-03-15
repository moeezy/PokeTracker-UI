'use client';

import { useState } from "react";
import { UserPokemon } from "@/app/lib/definitions";
import clsx from "clsx";

export default function PokemonClicks({pokemon}: { pokemon: UserPokemon}){
    const [caught, setCaught] = useState(pokemon.caught);
    const [shiny, setShiny] = useState(pokemon.shiny);

    const caughtClick = () => {
        setCaught(!caught)
    }

    const shinyClick = () => {
        setShiny(!shiny)
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