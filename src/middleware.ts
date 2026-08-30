import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isPublic = isAuthPage || pathname.startsWith("/api/auth") || pathname === "/"

  // NextAuth v5 JWT cookie — __Secure- prefix on HTTPS (production), plain on HTTP (dev)
  const sessionToken =
    request.cookies.get("__Secure-authjs.session-token") ??
    request.cookies.get("authjs.session-token")

  const isAuth = !!sessionToken

  if (!isAuth && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
