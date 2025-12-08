'use server'

import { createClient } from '@/lib/supabase/server'
import type { QueueFormConfig, ReservationFormConfig } from '@/types/config.types'
import { getDefaultQueueFormConfig, getDefaultReservationFormConfig } from './storage'

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

  if (error) {
    console.error('Error fetching form config:', error)
    // Return default config on error
    return formType === 'queue'
      ? getDefaultQueueFormConfig()
      : getDefaultReservationFormConfig()
  }

  if (!data) {
    // No config found, return default
    return formType === 'queue'
      ? getDefaultQueueFormConfig()
      : getDefaultReservationFormConfig()
  }

  // Map database fields to config object
  const config = {
    businessId,
    enableServiceSelection: data.enable_service_selection || false,
    serviceSelectionRequired: data.service_selection_required || false,
    services: data.services || [],
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

  if (error || !data) {
    // Return default config
    return formType === 'queue'
      ? getDefaultQueueFormConfig()
      : getDefaultReservationFormConfig()
  }

  return {
    businessId,
    enableServiceSelection: data.enable_service_selection || false,
    serviceSelectionRequired: data.service_selection_required || false,
    services: data.services || [],
    fields: data.fields || (formType === 'queue'
      ? getDefaultQueueFormConfig().fields
      : getDefaultReservationFormConfig().fields),
    customFields: data.custom_fields || [],
  } as QueueFormConfig | ReservationFormConfig
}
