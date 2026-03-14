'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import Image from "next/image";

const links = [
  { name: 'Home', href: '/', icon: '/heartgold-soulsilver/shiny/1.png'},
  {
    name: 'Map',
    href: '/map',
    icon: '/heartgold-soulsilver/shiny/76.png',
  },
  { name: 'Pokedex', href: '/pokedex/1', icon: '/heartgold-soulsilver/shiny/200.png' },
];

export default function NavLinks(){
  const pathname = usePathname();
  return(
    <>
       {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'grow items-center justify-center rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}   
          >
            <Image src={link.icon} width={240} height={240} alt={link.name} />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}