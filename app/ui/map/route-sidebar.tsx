import { Encounter, RouteWithArea } from "@/app/lib/definitions";
import RouteProgress from "@/app/ui/map/route-progress";
import EncounterMethodGroup from "@/app/ui/map/encounter-method-group";

export default function RouteSidebar({
    route,
    pinned,
    onUnpin,
}: {
    route: RouteWithArea | null;
    pinned: boolean;
    onUnpin: () => void;
}) {
    if (!route) {
        return <p className="text-sm text-gray-500">Hover over a route, or click to pin it.</p>;
    }

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold capitalize">{route.routeName.replace(/-/g, ' ')}</h2>
                {pinned && (
                    <button
                        onClick={onUnpin}
                        className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        📌 Unpin
                    </button>
                )}
            </div>

            <RouteProgress route={route} />

            {route.areas.map((area) => {
                const groups = new Map<string, Encounter[]>();
                area.encounters.forEach((encounter) => {
                    const list = groups.get(encounter.encounterMethod) ?? [];
                    list.push(encounter);
                    groups.set(encounter.encounterMethod, list);
                });

                return (
                    <div key={area.areaId} className="mb-4">
                        <h3 className="mb-2 text-sm font-semibold capitalize text-gray-500">
                            {area.areaName.replace(/-/g, ' ')}
                        </h3>
                        {Array.from(groups.entries()).map(([method, encounters]) => (
                            <EncounterMethodGroup key={method} method={method} encounters={encounters} />
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
