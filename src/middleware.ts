import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(
          name: string,
          value: string,
          options: {
            path?: string
            domain?: string
            maxAge?: number
            expires?: Date
            httpOnly?: boolean
            secure?: boolean
            sameSite?: boolean | 'lax' | 'strict' | 'none'
          }
        ) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(
          name: string,
          options: {
            path?: string
            domain?: string
          }
        ) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin routes - MAXIMUM SECURITY
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      // Not authenticated - redirect to login
      const redirectUrl = new URL('/auth', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user is super admin using the secure database function
    const { data: isAdmin, error } = await supabase.rpc('is_super_admin')

    if (error || !isAdmin) {
      // Not a super admin - redirect to dashboard with error
      const redirectUrl = new URL('/dashboard', request.url)
      redirectUrl.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(redirectUrl)
    }

    // User is super admin - allow access
    return response
  }

  // ✅ SECURITY FIX: Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!user) {
      // Not authenticated - redirect to login
      const redirectUrl = new URL('/auth', request.url)
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Authenticated user - allow access
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
