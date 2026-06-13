import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthed = request.cookies.get("seri-auth")?.value === "1";
  const role = request.cookies.get("seri-role")?.value;
  const isLogin = request.nextUrl.pathname === "/login";
  const isAdminLogin = request.nextUrl.pathname === "/admin-login";
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");

  if (!isAuthed && !isLogin && !isAdminLogin) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAdminPage && role !== "admin") {
    const url = new URL("/admin-login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthed && (isLogin || isAdminLogin)) {
    const url = new URL(role === "admin" ? "/admin" : "/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/admin-login", "/dashboard", "/dashboard/:path*", "/learning-center", "/learning-center/:path*", "/market-maps", "/market-maps/:path*", "/chatbot", "/chatbot/:path*", "/admin", "/admin/:path*"],
};
