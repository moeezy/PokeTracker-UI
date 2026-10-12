'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useSession } from "next-auth/react";
import clsx from 'clsx';
import Image from "next/image";

export default function NavLinks(){
  const pathname = usePathname();
  const { data: session } = useSession();

  // The Pokédex lives at /pokedex/[userId], so the link has to point at the
  // logged-in user's own id. Logged out, /pokedex is protected anyway, so
  // send them straight to login.
  const pokedexHref = session?.user?.id ? `/pokedex/${session.user.id}` : '/login';

  // TODO: swap for Gen 4 icons (Town Map / Pokédex) once sourced -
  // REDESIGN_PLAN.md 3a. Current sprites are the fallback.
  const links = [
    { name: 'Map', href: '/map', match: '/map', icon: '/heartgold-soulsilver/shiny/76.png' },
    { name: 'Pokédex', href: pokedexHref, match: '/pokedex', icon: '/heartgold-soulsilver/shiny/200.png' },
  ];

  return(
    <>
      {links.map((link) => (
        <Link
          key={link.name}
          href={link.href}
          className={clsx(
            'flex items-center gap-1 rounded-full py-1 pl-1 pr-3 text-sm font-semibold transition-colors',
            pathname.startsWith(link.match)
              ? 'bg-panel text-ink'
              : 'text-white/85 hover:bg-white/15 hover:text-white',
          )}
        >
          {/* Requested at its display size (40px) so the optimizer serves a
              40px image - this used to request 240px for a small icon. */}
          <Image src={link.icon} width={40} height={40} alt="" />
          <span>{link.name}</span>
        </Link>
      ))}
    </>
  );
}
