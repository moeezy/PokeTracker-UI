import { RouteWithArea } from "@/app/lib/definitions";

export default function RouteProgress({ route }: { route: RouteWithArea }) {
    const caughtByDexNumber = new Map<string, boolean>();

    route.areas.forEach((area) =>
        area.encounters.forEach((encounter) => {
            const alreadyCaught = caughtByDexNumber.get(encounter.pokedexNumber) ?? false;
            caughtByDexNumber.set(encounter.pokedexNumber, alreadyCaught || encounter.caught);
        })
    );

    const total = caughtByDexNumber.size;
    const caught = Array.from(caughtByDexNumber.values()).filter(Boolean).length;
    const percent = total === 0 ? 0 : Math.round((caught / total) * 100);

    return (
        <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
                <span>{caught}/{total} caught</span>
                <span>{percent}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-ink/10">
                <div
                    className="h-full rounded-full bg-caught transition-all"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
