'use server'

import { createClient } from '@/lib/supabase/server'
import type { QueueFormConfig, ReservationFormConfig } from '@/types/config.types'
import { getDefaultQueueFormConfig, getDefaultReservationFormConfig } from './storage'
import { getQueueServices, getReservationServices } from '@/lib/services/actions'

type FormType = 'queue' | 'reservation'

// Save form configuration to Supabase
export async function saveFormConfig(
  businessId: string,
  formType: FormType,
  config: QueueFormConfig | ReservationFormConfig
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('form_configurations')
    .upsert({
      business_id: businessId,
      form_type: formType,
      enable_service_selection: config.enableServiceSelection,
      service_selection_required: config.serviceSelectionRequired,
      services: config.services,
      fields: config.fields,
      custom_fields: config.customFields,
    }, {
      onConflict: 'business_id,form_type'
    })

  if (error) {
    console.error('Error saving form config:', error)
    throw new Error(`Failed to save ${formType} form configuration`)
  }

  return { success: true }
}

// Get form configuration from Supabase
export async function getFormConfig(
  businessId: string,
  formType: FormType
): Promise<QueueFormConfig | ReservationFormConfig> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_configurations')
    .select('*')
    .eq('business_id', businessId)
    .eq('form_type', formType)
    .maybeSingle()

  // Buscar serviços da nova tabela 'services'
  interface ServiceMapping {
    id: string
    name: string
    description: string
    price: number
    duration: number
    photoUrl: string
    order: number
  }

  let services: ServiceMapping[] = []

  if (formType === 'queue') {
    const { data: queueServices } = await getQueueServices(businessId)
    services = (queueServices || []).map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price_cents ? service.price_cents / 100 : 0,
      duration: service.estimated_duration_minutes || 0,
      photoUrl: service.photo_url,
      order: service.position,
    }))
  } else {
    const { data: reservationServices } = await getReservationServices(businessId)
    services = (reservationServices || []).map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price_cents ? service.price_cents / 100 : 0,
      duration: service.estimated_duration_minutes || 0,
      photoUrl: service.photo_url,
      order: service.position,
    }))
  }

  if (error) {
    console.error('Error fetching form config:', error)
    // Return default config on error com serviços
    const defaultConfig = formType === 'queue'
      ? getDefaultQueueFormConfig()
      : getDefaultReservationFormConfig()

    return {
      ...defaultConfig,
      enableServiceSelection: services.length > 0,
      services,
    }
  }

  if (!data) {
    // No config found, return default com serviços
    const defaultConfig = formType === 'queue'
      ? getDefaultQueueFormConfig()
      : getDefaultReservationFormConfig()

    return {
      ...defaultConfig,
      enableServiceSelection: services.length > 0,
      services,
    }
  }

  // Map database fields to config object
  const config = {
    businessId,
    enableServiceSelection: data.enable_service_selection !== false && services.length > 0,
    serviceSelectionRequired: data.service_selection_required || false,
    services, // Agora vem da tabela 'services'
    fields: data.fields || (formType === 'queue'
      ? getDefaultQueueFormConfig().fields
      : getDefaultReservationFormConfig().fields),
    customFields: data.custom_fields || [],
  }

  return config as QueueFormConfig | ReservationFormConfig
}

// Get form configuration for public forms (no auth required)
export async function getPublicFormConfig(
  businessId: string,
  formType: FormType
): Promise<QueueFormConfig | ReservationFormConfig> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('form_configurations')
    .select('*')
    .eq('business_id', businessId)
    .eq('form_type', formType)
    .maybeSingle()

  // Buscar serviços da nova tabela 'services' ao invés de 'form_configurations'
  interface ServiceMappingSecondary {
    id: string
    name: string
    description: string
    price: number
    duration: number
    photoUrl: string
    order: number
  }

  let services: ServiceMappingSecondary[] = []

  if (formType === 'queue') {
    const { data: queueServices } = await getQueueServices(businessId)
    services = (queueServices || []).map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price_cents ? service.price_cents / 100 : 0,
      duration: service.estimated_duration_minutes || 0,
      photoUrl: service.photo_url,
      order: service.position,
    }))
  } else {
    const { data: reservationServices } = await getReservationServices(businessId)
    services = (reservationServices || []).map((service) => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price_cents ? service.price_cents / 100 : 0,
      duration: service.estimated_duration_minutes || 0,
      photoUrl: service.photo_url,
      order: service.position,
    }))
  }

  if (error || !data) {
    // Return default config com serviços da nova tabela
    const defaultConfig = formType === 'queue'
      ? getDefaultQueueFormConfig()
      : getDefaultReservationFormConfig()

    return {
      ...defaultConfig,
      enableServiceSelection: services.length > 0,
      services,
    }
  }

  return {
    businessId,
    enableServiceSelection: data.enable_service_selection !== false && services.length > 0,
    serviceSelectionRequired: data.service_selection_required || false,
    services, // Agora vem da tabela 'services'
    fields: data.fields || (formType === 'queue'
      ? getDefaultQueueFormConfig().fields
      : getDefaultReservationFormConfig().fields),
    customFields: data.custom_fields || [],
  } as QueueFormConfig | ReservationFormConfig
}
