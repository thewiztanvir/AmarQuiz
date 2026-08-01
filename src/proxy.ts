import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ── Route definitions ────────────────────────────────────────────────────────
const PUBLIC_ROUTES = ["/", "/sign-in", "/sign-up"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];
const API_AUTH_PREFIX = "/api/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Better Auth API routes
  if (pathname.startsWith(API_AUTH_PREFIX)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check session via Better Auth
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isAuthenticated = !!session?.user;
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isAuthRoute = AUTH_ROUTES.includes(pathname);

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to sign-in for protected routes
  if (!isAuthenticated && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", request.url);
    // Preserve the intended destination for post-login redirect
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
