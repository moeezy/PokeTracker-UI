'use client';

export type PokedexFilter = 'all' | 'caught' | 'missing';

const OPTIONS: { value: PokedexFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'caught', label: 'Caught' },
    { value: 'missing', label: 'Missing' },
];

export default function PokedexFilters({
    filter,
    onChange,
}: {
    filter: PokedexFilter;
    onChange: (filter: PokedexFilter) => void;
}) {
    return (
        <div className="flex gap-2">
            {OPTIONS.map((option) => (
                <button
                    key={option.value}
                    onClick={() => onChange(option.value)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        filter === option.value
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
