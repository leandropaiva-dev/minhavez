'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from './permissions'

export interface DashboardStats {
  totalUsers: number
  totalBusinesses: number
  activeCoupons: number
  totalRedemptions: number
  recentSignups: number
  recentReservations: number
  activeSubscriptions: number
  trialUsers: number
}

/**
 * Get dashboard statistics (super admin only)
 */
export async function getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
  await requireSuperAdmin()

  const supabase = await createClient()

  try {
    // Get all businesses
    const { data: businesses, error: businessError } = await supabase
      .from('businesses')
      .select('*')

    if (businessError) throw businessError

    // Get all coupons
    const { data: coupons, error: couponsError } = await supabase
      .from('coupons')
      .select('*')

    if (couponsError) throw couponsError

    // Get coupon redemptions
    const { data: redemptions, error: redemptionsError } = await supabase
      .from('coupon_redemptions')
      .select('*')

    if (redemptionsError) throw redemptionsError

    // Calculate stats
    const totalBusinesses = businesses?.length || 0
    const uniqueUserIds = new Set(businesses?.map(b => b.user_id) || [])
    const totalUsers = uniqueUserIds.size

    const activeCoupons = coupons?.filter(c => c.is_active).length || 0
    const totalRedemptions = redemptions?.length || 0

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const recentSignups = businesses?.filter(b =>
      new Date(b.created_at) >= sevenDaysAgo
    ).length || 0

    const activeSubscriptions = businesses?.filter(b =>
      b.subscription_status === 'active'
    ).length || 0

    const trialUsers = businesses?.filter(b =>
      b.subscription_status === 'trial'
    ).length || 0

    // For reservations, we'd need to query the reservations table
    // For now, setting to 0 as placeholder
    const recentReservations = 0

    return {
      success: true,
      data: {
        totalUsers,
        totalBusinesses,
        activeCoupons,
        totalRedemptions,
        recentSignups,
        recentReservations,
        activeSubscriptions,
        trialUsers
      }
    }
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
