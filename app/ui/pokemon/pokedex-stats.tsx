import { UserPokemon } from "@/app/lib/definitions";

export default function PokedexStats({ pokemon }: { pokemon: UserPokemon[] }) {
    const total = pokemon.length;
    const caught = pokemon.filter((p) => p.caught).length;
    const missing = total - caught;
    const percent = total === 0 ? 0 : Math.round((caught / total) * 100);

    const radius = 54;
    const strokeWidth = 12;
    const circumference = 2 * Math.PI * radius;
    const dash = (percent / 100) * circumference;

    return (
        <div className="flex flex-wrap items-center gap-8 rounded-2xl border border-gray-200 bg-white/60 p-6 dark:border-gray-700 dark:bg-gray-900/40">
            <div className="relative shrink-0">
                <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                    <circle
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        className="text-gray-200 dark:text-gray-700"
                    />
                    {dash > 0 && (
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={strokeWidth}
                            strokeLinecap="round"
                            strokeDasharray={`${dash} ${circumference - dash}`}
                            className="text-emerald-500"
                        />
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{percent}%</span>
                    <span className="text-xs text-gray-500">owned</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-8">
                <Stat label="Caught" value={caught} colorClass="bg-emerald-500" />
                <Stat label="Missing" value={missing} colorClass="bg-gray-300 dark:bg-gray-600" />
                <Stat label="Total" value={total} />
            </div>
        </div>
    );
}

function Stat({ label, value, colorClass }: { label: string; value: number; colorClass?: string }) {
    return (
        <div className="flex items-center gap-2">
            {colorClass && <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />}
            <div>
                <p className="text-lg font-semibold">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
            </div>
        </div>
    );
}
