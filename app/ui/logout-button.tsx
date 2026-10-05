'use client';

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="rounded-md bg-gray-50 p-3 text-sm font-medium text-gray-700 hover:bg-sky-100 hover:text-blue-600 md:p-2 md:px-3"
        >
            Log out
        </button>
    );
}
