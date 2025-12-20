import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 1. Protected Routes (Dashboard, etc.)
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. Public Routes (Login, Register, Root)
  // If user is logged in, they shouldn't see Login/Register or the Landing Page (at root)
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    if (token) {
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
