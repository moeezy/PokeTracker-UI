import { DefaultSession } from "next-auth";

// Augments NextAuth's built-in types with the fields our jwt/session
// callbacks in auth.ts actually put on the token and session -
// `backendToken` (the Spring JWT), `user.id` (the numeric userId our data
// endpoints are keyed on), and `user.username`. Without this, TS only knows
// about the default shape (name/email/image) and rejects any reference to
// these fields even though they exist fine at runtime.
declare module "next-auth" {
  interface Session {
    backendToken: string;
    user: {
      id: string;
      username: string;
    } & DefaultSession["user"];
  }

  // This is the shape `authorize()` in auth.ts returns, and what the `user`
  // parameter of the `jwt` callback receives on sign-in.
  interface User {
    username: string;
    backendToken: string;
  }
}

declare module "next-auth/jwt" {
  // This is the shape of the encrypted token itself - what `token` looks
  // like inside the `jwt`/`session` callbacks on every request, not just
  // sign-in.
  interface JWT {
    backendToken: string;
    userId: string;
    username: string;
  }
}
