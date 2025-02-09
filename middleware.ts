import { NextRequest, NextResponse } from "next/server"
import { getCookie } from "./services/cookies/cookies.service"

export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: [
    // "/((login|register).*)"
  ]
}