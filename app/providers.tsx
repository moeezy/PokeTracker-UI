'use client';

import { SessionProvider } from 'next-auth/react';

// layout.tsx is a Server Component and can't use context providers directly -
// this thin client wrapper is the standard way to make useSession() work in
// any client component further down the tree (PokemonClicks, MapViewer).
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
