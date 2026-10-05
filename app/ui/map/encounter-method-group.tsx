'use client';

import { useState } from "react";
import { Encounter } from "@/app/lib/definitions";
import EncounterSprite from "@/app/ui/map/encounter-sprite";

export default function EncounterMethodGroup({
    method,
    encounters,
}: {
    method: string;
    encounters: Encounter[];
}) {
    const [open, setOpen] = useState(true);
    const caught = encounters.filter((encounter) => encounter.caught).length;

    return (
        <div className="mb-2 border-b border-gray-200 pb-2 dark:border-gray-700">
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between py-1 text-left text-sm font-medium"
            >
                <span className="flex items-center gap-1.5 capitalize">
                    <span className={`inline-block text-xs transition-transform ${open ? 'rotate-90' : ''}`}>
                        ›
                    </span>
                    {method.replace(/-/g, ' ')}
                </span>
                <span className="text-xs text-gray-500">{caught}/{encounters.length}</span>
            </button>
            {open && (
                <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2">
                    {encounters.map((encounter) => (
                        <EncounterSprite
                            key={`${encounter.pokedexNumber}-${encounter.timeOfDay}-${encounter.radio ?? ''}-${encounter.swarm ?? ''}`}
                            encounter={encounter}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
