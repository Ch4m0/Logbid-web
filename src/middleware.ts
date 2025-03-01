// middleware.ts
'use client'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value
  console.log(token, 'tokeen')

  if (!token) {
    const loginUrl = new URL('/auth', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Verifica la validez del token aquí si es necesario

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/history'],
}
