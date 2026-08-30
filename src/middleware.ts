import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isAuth = !!req.auth

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register")
  const isAppPage = !isAuthPage && !pathname.startsWith("/api")

  if (!isAuth && isAppPage && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
