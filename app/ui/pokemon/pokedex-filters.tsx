'use client';

import clsx from "clsx";
import { Generation, GENERATIONS } from "@/app/lib/pokedex";

export type PokedexFilter = 'all' | 'caught' | 'missing';

const VIEW_OPTIONS: { value: PokedexFilter; label: string }[] = [
    { value: 'all', label: 'ALL' },
    { value: 'caught', label: 'CAUGHT' },
    { value: 'missing', label: 'MISSING' },
];

export default function PokedexFilters({
    view,
    onViewChange,
    generations,
    onToggleGeneration,
}: {
    view: PokedexFilter;
    onViewChange: (view: PokedexFilter) => void;
    generations: Set<Generation>;
    onToggleGeneration: (gen: Generation) => void;
}) {
    return (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
            {/* Caught/Missing is a "view" setting, not a category - a
                segmented control keeps it visually separate from the chips. */}
            <div role="radiogroup" aria-label="Show" className="flex rounded-full bg-ink/10 p-1">
                {VIEW_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        role="radio"
                        aria-checked={view === option.value}
                        onClick={() => onViewChange(option.value)}
                        className={clsx(
                            'rounded-full px-4 py-1 text-xs font-bold tracking-wide transition-colors',
                            view === option.value ? 'bg-ink text-panel' : 'text-ink-muted hover:text-ink',
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <FilterGroup label="Generation">
                {GENERATIONS.map((gen) => {
                    const selected = generations.has(gen.value);
                    return (
                        <button
                            key={gen.value}
                            aria-pressed={selected}
                            onClick={() => onToggleGeneration(gen.value)}
                            // Neutral on purpose so it doesn't compete with the
                            // colored type chips later. Selected state also gets
                            // a check mark so it isn't conveyed by color alone.
                            className={clsx(
                                'rounded-md border-2 px-3 py-1 text-xs font-bold tracking-wide transition-colors',
                                selected
                                    ? 'border-ink bg-ink text-panel'
                                    : 'border-ink/25 text-ink-muted hover:border-ink/50 hover:text-ink',
                            )}
                        >
                            {selected && '✓ '}{gen.label}
                        </button>
                    );
                })}
            </FilterGroup>
        </div>
    );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-semibold uppercase text-ink-muted">{label}</span>
            {children}
        </div>
    );
}
