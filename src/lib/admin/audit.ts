'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from './permissions'

export interface AuditLogEntry {
  id: string
  admin_user_id: string
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

/**
 * Get audit log (super admin only)
 */
export async function getAuditLog(filters?: {
  action?: string
  resourceType?: string
  adminUserId?: string
  startDate?: string
  endDate?: string
  limit?: number
}) {
  await requireSuperAdmin()

  const supabase = await createClient()

  let query = supabase
    .from('admin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters?.action) {
    query = query.eq('action', filters.action)
  }

  if (filters?.resourceType) {
    query = query.eq('resource_type', filters.resourceType)
  }

  if (filters?.adminUserId) {
    query = query.eq('admin_user_id', filters.adminUserId)
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  } else {
    query = query.limit(100)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  // Get admin emails for each entry
  const adminIds = [...new Set(data.map(entry => entry.admin_user_id))]
  const adminEmails = new Map<string, string>()

  for (const adminId of adminIds) {
    const { data: { user } } = await supabase.auth.admin.getUserById(adminId)
    if (user) {
      adminEmails.set(adminId, user.email || 'N/A')
    }
  }

  const enrichedData = data.map(entry => ({
    ...entry,
    admin_email: adminEmails.get(entry.admin_user_id) || 'Desconhecido'
  }))

  return { success: true, data: enrichedData }
}

/**
 * Get audit statistics (super admin only)
 */
export async function getAuditStats() {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { data: allLogs } = await supabase
    .from('admin_audit_log')
    .select('action, created_at')

  if (!allLogs) {
    return {
      success: true,
      data: {
        totalActions: 0,
        actionsToday: 0,
        actionsThisWeek: 0,
        actionsByType: {}
      }
    }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const actionsToday = allLogs.filter(log => new Date(log.created_at) >= today).length
  const actionsThisWeek = allLogs.filter(log => new Date(log.created_at) >= weekAgo).length

  const actionsByType = allLogs.reduce((acc, log) => {
    acc[log.action] = (acc[log.action] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    success: true,
    data: {
      totalActions: allLogs.length,
      actionsToday,
      actionsThisWeek,
      actionsByType
    }
  }
}
