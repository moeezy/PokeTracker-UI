'use client';

export default function PokedexSearch({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="relative">
            <label htmlFor="pokedex-search" className="sr-only">
                Search by name or number
            </label>
            <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
                🔍
            </span>
            <input
                id="pokedex-search"
                type="search"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search by name or number (e.g. pikachu, 25)"
                autoComplete="off"
                className="w-full rounded-full border-2 border-panel-border bg-white py-2.5 pl-11 pr-4 text-ink placeholder:text-ink-muted/70 focus:border-accent focus:outline-none"
            />
        </div>
    );
}
