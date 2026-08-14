import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { User, UserRole } from "@/lib/types";

const ROLE_HOME: Record<UserRole, string> = {
  Admin: "/admin",
  Teacher: "/teacher",
  Student: "/student",
};

function getSessionUser(request: NextRequest): User | null {
  const raw = request.cookies.get("user")?.value;
  if (!raw) return null;
  try {
    const user = JSON.parse(raw) as User;
    if (user && typeof user.role === "string" && user.role in ROLE_HOME) {
      return user;
    }
  } catch {
    // Malformed cookie — treat as unauthenticated.
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = getSessionUser(request);

  const isRoleRoute =
    pathname === "/admin" || pathname.startsWith("/admin/") ||
    pathname === "/teacher" || pathname.startsWith("/teacher/") ||
    pathname === "/student" || pathname.startsWith("/student/");

  if (isRoleRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && user) {
    const url = request.nextUrl.clone();
    url.pathname = ROLE_HOME[user.role];
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
  ],
};
