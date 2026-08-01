import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/db/schema/auth";

export const auth = betterAuth({
  // ── Database ──────────────────────────────────────────────────────────────
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // ── Session ───────────────────────────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 30,      // 30 days
    updateAge: 60 * 60 * 24,            // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                   // 5-minute client-side cache
    },
  },

  // ── Email + Password ──────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    // Email verification disabled for Phase 1 — no SMTP configured yet.
    // Enable this and add an `emailVerification` block when Resend/SMTP is set up.
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },

  // ── Social Providers ──────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  // ── App URL ───────────────────────────────────────────────────────────────
  // Used for OAuth redirect URIs
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",

  // ── Security ──────────────────────────────────────────────────────────────
  // trustedOrigins is automatically derived from baseURL.
  // Add additional origins here for staging/production splits.
});

// Export inferred types for use in Server Actions
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
