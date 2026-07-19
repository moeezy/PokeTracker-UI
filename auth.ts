import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
 
// `handlers` (GET/POST) has to be re-exported through app/api/auth/[...nextauth]/route.ts -
// that's the actual HTTP endpoint signIn() talks to internally (e.g.
// /api/auth/callback/credentials). Without that route file, every signIn()
// call 404s partway through, which is what was happening here.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
  Credentials({
    async authorize(credentials) {
      const parsed = z.object({
        username: z.string(),
        password: z.string(),
      }).safeParse(credentials);

      if (!parsed.success) return null;

      const res = await fetch('http://localhost:8080/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      if (!res.ok) return null; // bad credentials -> Spring returns non-2xx

      // AuthResponseDTO now returns { token, username, id } - `id` is the
      // numeric userId our data endpoints (/v1/userPokemon/{userId}, etc.)
      // are keyed on, so we no longer need to fake it with the username.
      const { token, id } = await res.json();

      // NextAuth's `User.id` is typed as a string, so the numeric id from
      // the backend gets stringified here.
      return { id: String(id), username: parsed.data.username, backendToken: token };
    },
  }),
],
  callbacks: {
    // Spreading authConfig.callbacks preserves the `authorized` callback
    // (route protection in proxy.ts) - without this, the object literal
    // below would silently replace it instead of adding to it.
    ...authConfig.callbacks,

    // Runs on sign-in (when `user` is defined, straight from `authorize`
    // above) and on every subsequent request (when it's not). We only need
    // to copy fields across on the first call - after that they just ride
    // along in the encrypted token.
    async jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken;
        token.userId = user.id;
        token.username = user.username;
      }
      return token;
    },

    // The `jwt` token isn't directly readable from Server/Client Components -
    // `session` is what `auth()`/`useSession()` actually return, so the
    // Spring JWT, numeric userId, and username need to be re-exposed here too.
    async session({ session, token }) {
      session.backendToken = token.backendToken as string;
      session.user.id = token.userId as string;
      session.user.username = token.username as string;
      return session;
    },
  },
});