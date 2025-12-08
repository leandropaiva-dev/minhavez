'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin, logAdminAction } from './permissions'

export interface UserData {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  businesses: {
    id: string
    name: string
    business_type: string
    subscription_status: string
    trial_ends_at: string | null
    created_at: string
  }[]
}

/**
 * Get all users with their businesses (super admin only)
 */
export async function getAllUsers() {
  await requireSuperAdmin()

  const supabase = await createClient()

  // Get all businesses with user info
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  // Group businesses by user_id
  const usersMap = new Map<string, UserData>()

  for (const business of businesses) {
    if (!usersMap.has(business.user_id)) {
      // Get user email using safe function
      const { data: email } = await supabase.rpc('get_user_email', {
        p_user_id: business.user_id
      })

      usersMap.set(business.user_id, {
        id: business.user_id,
        email: email || 'N/A',
        created_at: business.created_at,
        last_sign_in_at: null,
        businesses: []
      })
    }

    const userData = usersMap.get(business.user_id)
    if (userData) {
      userData.businesses.push({
        id: business.id,
        name: business.name,
        business_type: business.business_type,
        subscription_status: business.subscription_status,
        trial_ends_at: business.trial_ends_at,
        created_at: business.created_at
      })
    }
  }

  return { success: true, data: Array.from(usersMap.values()) }
}

/**
 * Get user details (super admin only)
 */
export async function getUserDetails(userId: string) {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)

  if (error || !user) {
    return { success: false, error: 'Usuário não encontrado' }
  }

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)

  return {
    success: true,
    data: {
      ...user,
      businesses: businesses || []
    }
  }
}

/**
 * Extend trial for a business (super admin only)
 */
export async function extendTrial(businessId: string, days: number) {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { data: business } = await supabase
    .from('businesses')
    .select('trial_ends_at')
    .eq('id', businessId)
    .single()

  if (!business) {
    return { success: false, error: 'Estabelecimento não encontrado' }
  }

  const currentTrialEnd = business.trial_ends_at ? new Date(business.trial_ends_at) : new Date()
  const newTrialEnd = new Date(currentTrialEnd)
  newTrialEnd.setDate(newTrialEnd.getDate() + days)

  const { error } = await supabase
    .from('businesses')
    .update({ trial_ends_at: newTrialEnd.toISOString() })
    .eq('id', businessId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction('extend_trial', 'business', businessId, { days })

  return { success: true }
}

/**
 * Update subscription status (super admin only)
 */
export async function updateSubscriptionStatus(
  businessId: string,
  status: 'trial' | 'active' | 'canceled' | 'past_due'
) {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from('businesses')
    .update({ subscription_status: status })
    .eq('id', businessId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction('update_subscription', 'business', businessId, { status })

  return { success: true }
}

/**
 * Delete user (super admin only) - DANGEROUS
 */
export async function deleteUser(userId: string) {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction('delete_user', 'user', userId)

  return { success: true }
}
