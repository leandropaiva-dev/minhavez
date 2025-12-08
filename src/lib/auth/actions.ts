'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/security/logger'
import { getSafeRedirectUrl } from '@/lib/security/redirect'

export async function signIn(formData: FormData, redirectTo?: string) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    logger.security('Failed login attempt', { email: email?.substring(0, 3) + '***' })
    return { error: error.message }
  }

  logger.info('Successful login', { userId: data.user?.id })

  revalidatePath('/', 'layout')

  // ✅ SECURITY: Validate redirect URL to prevent open redirect
  const safeRedirect = getSafeRedirectUrl(redirectTo, '/dashboard')
  redirect(safeRedirect)
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string

  // ✅ SECURITY: Basic input validation
  if (!email || !password || !name) {
    return { error: 'Todos os campos são obrigatórios' }
  }

  if (password.length < 8) {
    return { error: 'Senha deve ter no mínimo 8 caracteres' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Email inválido' }
  }

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  })

  if (error) {
    logger.security('Failed signup attempt', { email: email?.substring(0, 3) + '***' })
    return { error: error.message }
  }

  logger.info('Successful signup', { userId: data.user?.id })

  revalidatePath('/', 'layout')
  redirect('/onboarding')
}

export async function signOut() {
  const supabase = await createClient()
  // ✅ SECURITY FIX: Invalidate session globally across all devices
  await supabase.auth.signOut({ scope: 'global' })
  revalidatePath('/', 'layout')
  redirect('/')
}
