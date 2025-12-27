'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { BusinessType, Country, DocumentType } from '@/types/database.types'

export interface BusinessData {
  name: string
  businessType?: BusinessType
  phone: string
  address?: string
  country: Country
  documentType?: DocumentType
  documentNumber?: string
}

export async function saveBusinessInfo(data: BusinessData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Usuário não autenticado', businessId: null }
  }

  // Check if user already has a business
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let businessId: string

  if (existingBusiness) {
    // Update existing business
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        name: data.name,
        business_type: data.businessType || null,
        phone: data.phone,
        address: data.address,
        country: data.country,
        document_type: data.documentType || null,
        document_number: data.documentNumber || null,
      })
      .eq('user_id', user.id)

    if (updateError) {
      return { error: updateError.message, businessId: null }
    }

    businessId = existingBusiness.id
  } else {
    // Create new business
    const { data: newBusiness, error: insertError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: data.name,
        business_type: data.businessType || null,
        phone: data.phone,
        address: data.address,
        country: data.country,
        document_type: data.documentType || null,
        document_number: data.documentNumber || null,
      })
      .select('id')
      .single()

    if (insertError || !newBusiness) {
      return { error: insertError?.message || 'Erro ao criar negócio', businessId: null }
    }

    businessId = newBusiness.id
  }

  revalidatePath('/dashboard')
  return { success: true, businessId }
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

// Helper function to generate slug from business name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

export interface SimpleOnboardingData {
  businessName: string
  phone: string
  country: Country
  segment: 'health' | 'food' | 'beauty'
  avgServiceTime: number
  serviceMode: 'queue' | 'reservation' | 'both'
}

export async function completeSimpleOnboarding(data: SimpleOnboardingData) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Usuário não autenticado' }
  }

  // Check if user already has a business
  const { data: existingBusiness } = await supabase
    .from('businesses')
    .select('id, slug')
    .eq('user_id', user.id)
    .single()

  let businessId: string
  let slug: string

  if (existingBusiness) {
    // Update existing business
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        name: data.businessName,
        phone: data.phone,
        country: data.country,
        segment: data.segment,
        avg_service_time: data.avgServiceTime,
        service_mode: data.serviceMode,
      })
      .eq('user_id', user.id)

    if (updateError) {
      return { error: updateError.message }
    }

    businessId = existingBusiness.id
    slug = existingBusiness.slug
  } else {
    // Generate unique slug
    const baseSlug = generateSlug(data.businessName)
    let finalSlug = baseSlug
    let counter = 1

    // Check if slug exists
    while (true) {
      const { data: existingSlug } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', finalSlug)
        .single()

      if (!existingSlug) break
      finalSlug = `${baseSlug}-${counter}`
      counter++
    }

    slug = finalSlug

    // Create new business
    const { data: newBusiness, error: insertError } = await supabase
      .from('businesses')
      .insert({
        user_id: user.id,
        name: data.businessName,
        phone: data.phone,
        country: data.country,
        segment: data.segment,
        avg_service_time: data.avgServiceTime,
        service_mode: data.serviceMode,
        slug,
      })
      .select('id')
      .single()

    if (insertError || !newBusiness) {
      return { error: insertError?.message || 'Erro ao criar negócio' }
    }

    businessId = newBusiness.id
  }

  // Create default form configuration (basic: name + phone)
  const { error: formError } = await supabase
    .from('form_configurations')
    .upsert({
      business_id: businessId,
      form_type: 'queue',
      fields: {
        phone: { enabled: true, required: true },
        email: { enabled: false, required: false },
        partySize: { enabled: false, required: false },
        notes: { enabled: false, required: false },
      },
      custom_fields: [],
      enable_service_selection: false,
      service_selection_required: false,
      services: [],
    })

  if (formError) {
    console.error('Error creating form config:', formError)
    // Don't fail the whole onboarding for this
  }

  // Create default link page
  const { error: linkPageError } = await supabase
    .from('link_pages')
    .upsert({
      business_id: businessId,
      slug,
      title: data.businessName,
      bio: `Entre na fila de ${data.businessName}`,
      is_published: true,
    })

  if (linkPageError) {
    console.error('Error creating link page:', linkPageError)
    // Don't fail the whole onboarding for this
  }

  revalidatePath('/dashboard')
  return { success: true }
}
