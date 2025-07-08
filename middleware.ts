import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (request.nextUrl.pathname.startsWith("/dashboard.png") 
    || request.nextUrl.pathname.startsWith("/extension.png")) {
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access protected routes
  if (!token && request.nextUrl.pathname !== "/auth/signin" && request.nextUrl.pathname !== "/landing") {
    return NextResponse.redirect(new URL("/landing", request.url))
  }

  // If user is authenticated and trying to access signin or landing page, redirect to home
  if (token && (request.nextUrl.pathname === "/auth/signin" || request.nextUrl.pathname === "/landing")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (authentication routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}