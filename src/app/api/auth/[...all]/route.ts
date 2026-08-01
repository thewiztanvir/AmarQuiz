import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Better Auth catch-all route handler.
 * Handles: sign-in, sign-up, sign-out, OAuth callbacks, session refresh.
 * Route: /api/auth/[...all]
 */
export const { POST, GET } = toNextJsHandler(auth);
