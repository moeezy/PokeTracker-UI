import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith('/pokedex') || nextUrl.pathname.startsWith('/map');
        if (isProtected) return isLoggedIn;
        // Only bounce away from /login itself when already signed in - this
        // used to fire for every non-protected page (including "/"), which
        // made Home unreachable while logged in.
        if (isLoggedIn && nextUrl.pathname === '/login') {
          // Was '/pokedex/1', which sent every user to user 1's Pokédex.
          // The landing page avoids needing the userId here at all.
          return Response.redirect(new URL('/', nextUrl));
        }
        return true; // Redirect unauthenticated users to login page
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

//need to check that this works