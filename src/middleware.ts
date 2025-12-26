import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (e) {
    return true; // Treat malformed tokens as expired
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Protected Routes (Dashboard, etc.)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
    if (!token || isTokenExpired(token)) {
      // If token is expired, we should also probably clear the cookie,
      // but we can't easily modify the response here if we are redirecting.
      // The login page should handle clearing invalid tokens or the new login will overwrite it.
      const response = NextResponse.redirect(new URL("/login", request.url));
      if (token && isTokenExpired(token)) {
        response.cookies.delete("token");
      }
      return response;
    }
  }

  // 2. Public Routes (Login, Register, Root)
  // If user is logged in, they shouldn't see Login/Register or the Landing Page (at root)
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    if (token && !isTokenExpired(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
