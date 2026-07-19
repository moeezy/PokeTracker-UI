// Catch-all route that exposes Auth.js's internal endpoints
// (/api/auth/callback/credentials, /api/auth/session, /api/auth/signout, etc.)
// to Next.js. signIn()/signOut() from auth.ts call these under the hood.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
