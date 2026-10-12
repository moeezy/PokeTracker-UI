'use client';

import { signOut, useSession } from "next-auth/react";

export default function LogoutButton() {
    const { status } = useSession();

    // The navbar also renders on /login and on the public landing page -
    // there's nothing to log out of there.
    if (status !== 'authenticated') return null;

    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold text-white/85 transition-colors hover:bg-white/15 hover:text-white"
        >
            Log out
        </button>
    );
}
