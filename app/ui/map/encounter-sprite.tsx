import Image from "next/image";
import { Encounter } from "@/app/lib/definitions";

export default function EncounterSprite({ encounter }: { encounter: Encounter }) {
    return (
        <div
            title={`${encounter.name}${encounter.caught ? ' (caught)' : ''}`}
            className={`flex flex-col items-center rounded-lg border p-1 text-center ${
                encounter.caught
                    ? 'border-caught/50 bg-caught/10'
                    : 'border-ink/10 bg-ink/5 opacity-60 grayscale'
            }`}
        >
            <div className="relative">
                <Image
                    src={`/heartgold-soulsilver/${encounter.pokedexNumber}.png`}
                    alt={encounter.name}
                    width={40}
                    height={40}
                />
                {encounter.caught && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-caught text-[10px] text-white">
                        ✓
                    </span>
                )}
            </div>
            <span className="mt-0.5 w-full truncate text-[10px] capitalize">{encounter.name}</span>
        </div>
    );
}
