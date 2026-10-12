import type { Metadata } from "next";
import { Geist, Lilita_One } from "next/font/google";
import "./globals.css";
import Navbar from "./ui/navbar";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Stand-in for the Pokémon logo font until its file is added. To swap:
// replace this with next/font/local pointing at the file, keeping the
// same `variable` name so globals.css doesn't need to change.
const displayFont = Lilita_One({
  variable: "--font-display-placeholder",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PokeTracker",
  description: "Track your HeartGold & SoulSilver Pokédex and route encounters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${displayFont.variable}`}>
      <body className="font-sans antialiased">
        <div className="sky" aria-hidden="true" />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
