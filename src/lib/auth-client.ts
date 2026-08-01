"use client";

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // baseURL defaults to the current origin in the browser — no config needed.
  // Explicitly set for SSR and cross-origin scenarios:
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
});

// Re-export hooks and methods for convenience
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
