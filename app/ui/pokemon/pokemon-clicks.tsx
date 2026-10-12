import clsx from "clsx";

// Presentational only - state and the API call live in PokemonCard.
export default function PokemonClicks({
    caught,
    shiny,
    onToggleCaught,
    onToggleShiny,
    name,
}: {
    caught: boolean;
    shiny: boolean;
    onToggleCaught: () => void;
    onToggleShiny: () => void;
    name: string;
}){
    return(
        <div className="flex shrink-0 flex-col gap-1">
            <button
                onClick={onToggleCaught}
                aria-pressed={caught}
                aria-label={`Mark ${name} as caught`}
                title={caught ? 'Caught' : 'Not caught'}
                className="rounded-full p-1 transition-transform hover:scale-110 hover:bg-ink/5"
            >
                <PokeBallIcon filled={caught} />
            </button>
            <button
                onClick={onToggleShiny}
                aria-pressed={shiny}
                aria-label={`Mark ${name} as shiny`}
                title={shiny ? 'Shiny' : 'Not shiny'}
                className={clsx(
                    'rounded-full p-1 text-lg leading-none transition hover:scale-110 hover:bg-ink/5',
                    !shiny && 'opacity-30 grayscale',
                )}
            >
                ✨
            </button>
        </div>
    );
}

// Inline SVG rather than an image file - no extra request, and it can be
// recolored for the on/off states with CSS.
function PokeBallIcon({ filled }: { filled: boolean }) {
    // Fills first, outlines on top, so the red half doesn't cover the rim.
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" className={filled ? 'text-ink' : 'text-ink/30'}>
            {filled && (
                <>
                    <circle cx="12" cy="12" r="10.5" fill="#ffffff" />
                    <path d="M1.5 12a10.5 10.5 0 0 1 21 0Z" fill="#e3350d" />
                </>
            )}
            <g fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10.5" />
                <line x1="1.5" y1="12" x2="22.5" y2="12" />
                <circle cx="12" cy="12" r="3" fill={filled ? '#ffffff' : 'none'} />
            </g>
        </svg>
    );
}
