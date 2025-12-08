'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin, logAdminAction } from './permissions'

export type CouponType = 'percentage' | 'fixed_amount' | 'free_trial'

export interface CreateCouponData {
  code: string
  discountType: CouponType
  discountValue?: number
  trialDays?: number
  maxRedemptions?: number
  validFrom?: string
  validUntil?: string
  description?: string
}

/**
 * Create a new coupon (super admin only)
 */
export async function createCoupon(data: CreateCouponData) {
  await requireSuperAdmin()

  const supabase = await createClient()
  const adminDetails = await getSuperAdminDetails()

  if (!adminDetails) {
    return { success: false, error: 'Admin não encontrado' }
  }

  // Validate coupon code format
  const code = data.code.toUpperCase().trim()
  if (!/^[A-Z0-9_-]{3,50}$/.test(code)) {
    return {
      success: false,
      error: 'Código deve conter apenas letras maiúsculas, números, _ e - (3-50 caracteres)'
    }
  }

  // Validate based on coupon type
  if (data.discountType === 'percentage') {
    if (!data.discountValue || data.discountValue < 0 || data.discountValue > 100) {
      return { success: false, error: 'Desconto percentual deve ser entre 0 e 100' }
    }
  } else if (data.discountType === 'fixed_amount') {
    if (!data.discountValue || data.discountValue <= 0) {
      return { success: false, error: 'Valor de desconto deve ser maior que 0' }
    }
  } else if (data.discountType === 'free_trial') {
    if (!data.trialDays || data.trialDays <= 0) {
      return { success: false, error: 'Dias de trial devem ser maior que 0' }
    }
  }

  const { data: coupon, error } = await supabase
    .from('coupons')
    .insert({
      code,
      discount_type: data.discountType,
      discount_value: data.discountValue,
      trial_days: data.trialDays,
      max_redemptions: data.maxRedemptions,
      valid_from: data.validFrom,
      valid_until: data.validUntil,
      description: data.description,
      created_by: adminDetails.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { success: false, error: 'Código de cupom já existe' }
    }
    return { success: false, error: error.message }
  }

  await logAdminAction('create_coupon', 'coupon', coupon.id, { code })

  return { success: true, data: coupon }
}

/**
 * Get all coupons (super admin only)
 */
export async function getAllCoupons() {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('coupons')
    .select(`
      *,
      creator:created_by(email)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data }
}

/**
 * Update coupon (super admin only)
 */
export async function updateCoupon(couponId: string, updates: Partial<CreateCouponData>) {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('coupons')
    .update({
      description: updates.description,
      max_redemptions: updates.maxRedemptions,
      valid_until: updates.validUntil,
      is_active: true, // Can be used to deactivate
    })
    .eq('id', couponId)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction('update_coupon', 'coupon', couponId, updates)

  return { success: true, data }
}

/**
 * Deactivate coupon (super admin only)
 */
export async function deactivateCoupon(couponId: string) {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { error } = await supabase
    .from('coupons')
    .update({ is_active: false })
    .eq('id', couponId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAdminAction('deactivate_coupon', 'coupon', couponId)

  return { success: true }
}

/**
 * Get coupon redemptions (super admin only)
 */
export async function getCouponRedemptions(couponId?: string) {
  await requireSuperAdmin()

  const supabase = await createClient()

  let query = supabase
    .from('coupon_redemptions')
    .select(`
      *,
      coupon:coupons(code, description),
      business:businesses(name)
    `)
    .order('redeemed_at', { ascending: false })

  if (couponId) {
    query = query.eq('coupon_id', couponId)
  }

  const { data, error } = await query

  if (error) {
    return { success: false, error: error.message, data: [] }
  }

  return { success: true, data }
}

/**
 * Redeem coupon (any authenticated user)
 */
export async function redeemCoupon(code: string, businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('redeem_coupon', {
    p_coupon_code: code.toUpperCase(),
    p_business_id: businessId,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return data
}

// Helper to get admin details
async function getSuperAdminDetails() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('super_admins')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return data
}
