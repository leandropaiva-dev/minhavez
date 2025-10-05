'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { BusinessType } from '@/types/database.types'

export interface BusinessData {
  name: string
  businessType: BusinessType
  phone: string
  address?: string
}

export async function saveBusinessInfo(data: BusinessData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Usuário não autenticado' }
  }

  // Check if user already has a business
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingBusiness) {
    // Update existing business
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        name: data.name,
        business_type: data.businessType,
        phone: data.phone,
        address: data.address,
      })
      .eq('user_id', user.id)

    if (updateError) {
      return { error: updateError.message }
    }
  } else {
    // Create new business
    const { error: insertError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: data.name,
        business_type: data.businessType,
        phone: data.phone,
        address: data.address,
      })

    if (insertError) {
      return { error: insertError.message }
    }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

export async function completeOnboarding() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Usuário não autenticado' }
  }

  // Verify that business exists
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (businessError || !business) {
    return { error: 'Complete as informações do negócio primeiro' }
  }

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

export async function getBusiness() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { data: null, error: 'Usuário não autenticado' }
  }

  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (businessError) {
    return { data: null, error: businessError.message }
  }

  return { data: business, error: null }
}
