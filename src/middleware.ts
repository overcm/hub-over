import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  const isPublicRoute = pathname === "/login";
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isLoggedIn && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicRoute) {
    const homeUrl = new URL(role === "ADMIN" ? "/admin" : "/", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  if (isAdminRoute && role !== "ADMIN") {
    const homeUrl = new URL("/", req.nextUrl.origin);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
