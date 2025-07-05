import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // HTTPS enforcement
  if (process.env.NODE_ENV === 'production' && 
      req.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(
      new URL(`https://${req.headers.get('host')}${req.nextUrl.pathname}`),
      301 // Permanent redirect
    )
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect to login if no session and trying to access protected route
  if (!session && req.nextUrl.pathname.startsWith('/profile')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/profile/:path*'],
}