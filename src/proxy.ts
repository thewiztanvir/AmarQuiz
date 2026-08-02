import { auth } from "@/lib/auth";

export const proxy = auth.middleware({
  loginUrl: "/sign-in",
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
