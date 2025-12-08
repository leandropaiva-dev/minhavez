'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/security/logger'
import { headers } from 'next/headers'

/**
 * Check if the current user is a super admin
 * This is the ONLY way to verify admin status - never trust client-side checks
 */
export async function isSuperAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    // Use the secure database function
    const { data, error } = await supabase.rpc('is_super_admin')

    if (error) {
      logger.error('Error checking super admin status', error, { userId: user.id })
      return false
    }

    return data === true
  } catch (error) {
    logger.error('Error in isSuperAdmin', error)
    return false
  }
}

/**
 * Get super admin details (only if user is super admin)
 */
export async function getSuperAdminDetails() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('super_admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (error) return null

  return data
}

/**
 * Require super admin - throws error if not authorized
 * Use this in admin API routes
 */
export async function requireSuperAdmin() {
  const isAdmin = await isSuperAdmin()

  if (!isAdmin) {
    throw new Error('Acesso negado. Apenas super administradores podem acessar.')
  }

  return true
}

/**
 * Log admin action for audit trail with IP and User-Agent
 */
export async function logAdminAction(
  action: string,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = await createClient()
    const adminDetails = await getSuperAdminDetails()

    if (!adminDetails) return

    // ✅ SECURITY: Capture IP and User-Agent for audit trail
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for')?.split(',')[0].trim() ||
               headersList.get('x-real-ip') ||
               null
    const userAgent = headersList.get('user-agent') || null

    await supabase
      .from('admin_audit_log')
      .insert({
        admin_id: adminDetails.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
        ip_address: ip,
        user_agent: userAgent,
      })

    // Also log to structured logger
    logger.info('Admin action', {
      adminId: adminDetails.id,
      action,
      targetType,
      targetId,
      ip,
    })
  } catch (error) {
    logger.error('Error logging admin action', error, { action, targetType, targetId })
  }
}
