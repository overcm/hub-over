import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isPublicRoute = pathname === "/" || pathname === "/login";
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicRoute) {
    const homeUrl = new URL(role === "ADMIN" ? "/admin" : "/inicio", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  if (isAdminRoute && role !== "ADMIN") {
    const homeUrl = new URL("/inicio", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Excludes API routes, Next.js internals, and any static file (images, icons,
  // fonts, etc.) served from /public — those must stay reachable without auth.
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
