import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/privacy",
  "/cookies",
];

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch {
    return true; // Treat malformed tokens as expired
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
  const isRoot = pathname === "/";
  const isValidToken = token && !isTokenExpired(token);

  console.log(`MIDDLEWARE: path=${pathname} hasToken=${!!token} isValid=${isValidToken}`);

  // 1. If user is logged in, they shouldn't see Login/Register or the Landing Page
  if ((isRoot || isPublicRoute) && isValidToken) {
    console.log(`MIDDLEWARE: Redirecting auth user from public ${pathname} to /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Protect all other routes (except public and root)
  if (!isRoot && !isPublicRoute && !isValidToken) {
    console.log(`MIDDLEWARE: Redirecting unauth user from protected ${pathname} to /login`);
    const response = NextResponse.redirect(new URL("/login", request.url));
    if (token) {
      response.cookies.delete("token");
    }
    return response;
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
