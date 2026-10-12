import Link from "next/link";
import NavLinks from "./nav-links";
import LogoutButton from "./logout-button";

export default function Navbar(){
    return(
        // Sticky, translucent bar - backdrop-blur is fine here (one small
        // element), but avoid it on large or repeated elements like cards.
        <header className="sticky top-0 z-20 border-b border-white/10 bg-sky-top/70 backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2">
                <Link href="/" className="text-logo shrink-0 text-2xl">
                    PokeTracker
                </Link>
                <div className="flex flex-1 items-center gap-2">
                    <NavLinks />
                </div>
                <LogoutButton />
            </nav>
        </header>
    )
}
