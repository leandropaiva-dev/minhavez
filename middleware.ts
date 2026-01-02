import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/**
 * ✅ SECURITY: Determina a origem permitida baseado no ambiente
 */
function getAllowedOrigin(): string {
  // Em produção, use apenas o domínio de produção
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://minhavez.com'
  }
  // Em desenvolvimento, permite localhost
  return 'http://localhost:3000'
}

/**
 * ✅ SECURITY: Adiciona headers CORS seguros à resposta
 */
function addCorsHeaders(response: NextResponse, origin: string): NextResponse {
  const allowedOrigin = getAllowedOrigin()

  // Só adiciona CORS se a origem for permitida
  if (origin === allowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 horas

  return response
}

export async function middleware(request: NextRequest) {
  const origin = request.headers.get('origin') || ''

  // ✅ SECURITY: Handle preflight requests
  if (request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 204 })
    return addCorsHeaders(preflightResponse, origin)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ✅ SECURITY: Adiciona CORS headers em todas as respostas
  response = addCorsHeaders(response, origin)

  const supabase = createServerClient( 
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Proteger rotas privadas
  if (!user && (
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/onboarding')
  )) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Redirecionar logados que tentam acessar auth
  if (user && request.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth'],
}
