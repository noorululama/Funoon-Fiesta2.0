import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_CREDENTIALS, JURY_COOKIE, TEAM_COOKIE } from "./src/lib/config";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Handle admin routes
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (token !== ADMIN_CREDENTIALS.username) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Handle jury routes
  if (pathname.startsWith("/jury")) {
    if (pathname === "/jury/login") {
      return NextResponse.next();
    }
    const token = request.cookies.get(JURY_COOKIE)?.value;
    if (!token?.startsWith("jury:")) {
      const url = new URL("/jury/login", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Handle team routes
  if (pathname.startsWith("/team")) {
    if (pathname === "/team/login") {
      return NextResponse.next();
    }
    const token = request.cookies.get(TEAM_COOKIE)?.value;
    if (!token?.startsWith("team:")) {
      const url = new URL("/team/login", request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Allow root page (which shows coming soon) and coming-soon route
  if (pathname === "/" || pathname === "/coming-soon") {
    return NextResponse.next();
  }

  // Redirect all other public routes to root (which shows coming soon)
  return NextResponse.redirect(new URL("/", request.url));
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

