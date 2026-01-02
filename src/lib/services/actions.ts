'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Service {
  id: string
  business_id: string
  name: string
  description: string | null
  photo_url: string
  is_active: boolean
  available_in_queue: boolean
  available_in_reservations: boolean
  estimated_duration_minutes: number | null
  price_cents: number | null
  position: number
  created_at: string
  updated_at: string
}

export interface CreateServiceData {
  businessId: string
  name: string
  description?: string
  photoUrl: string
  availableInQueue: boolean
  availableInReservations: boolean
  estimatedDurationMinutes?: number
  priceCents?: number
}

export interface UpdateServiceData {
  id: string
  name?: string
  description?: string
  photoUrl?: string
  isActive?: boolean
  availableInQueue?: boolean
  availableInReservations?: boolean
  estimatedDurationMinutes?: number
  priceCents?: number
}

/**
 * Buscar todos os serviços de um negócio
 */
export async function getServices(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching services:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Buscar serviços ativos disponíveis para fila
 */
export async function getQueueServices(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .eq('available_in_queue', true)
    .order('position', { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Buscar serviços ativos disponíveis para reservas
 */
export async function getReservationServices(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .eq('available_in_reservations', true)
    .order('position', { ascending: true })

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Criar novo serviço
 */
export async function createService(serviceData: CreateServiceData) {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Não autenticado' }
  }

  // Verificar se o usuário é dono do negócio
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', serviceData.businessId)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return { data: null, error: 'Negócio não encontrado ou sem permissão' }
  }

  // Buscar próxima posição
  const { data: services } = await supabase
    .from('services')
    .select('position')
    .eq('business_id', serviceData.businessId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = services && services.length > 0 ? services[0].position + 1 : 0

  // Criar serviço
  const { data, error } = await supabase
    .from('services')
    .insert({
      business_id: serviceData.businessId,
      name: serviceData.name,
      description: serviceData.description || null,
      photo_url: serviceData.photoUrl,
      available_in_queue: serviceData.availableInQueue,
      available_in_reservations: serviceData.availableInReservations,
      estimated_duration_minutes: serviceData.estimatedDurationMinutes || null,
      price_cents: serviceData.priceCents || null,
      position: nextPosition,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating service:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard/fila')
  revalidatePath('/dashboard/reservas')

  return { data, error: null }
}

/**
 * Atualizar serviço existente
 */
export async function updateService(serviceData: UpdateServiceData) {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Não autenticado' }
  }

  // Verificar permissão
  const { data: service } = await supabase
    .from('services')
    .select('business_id, businesses!inner(user_id)')
    .eq('id', serviceData.id)
    .single()

  const businesses = service?.businesses as unknown as { user_id: string } | undefined
  if (!service || !businesses || businesses.user_id !== user.id) {
    return { data: null, error: 'Serviço não encontrado ou sem permissão' }
  }

  // Preparar dados para update
  const updateData: Record<string, string | number | boolean | null> = {}
  if (serviceData.name !== undefined) updateData.name = serviceData.name
  if (serviceData.description !== undefined) updateData.description = serviceData.description || null
  if (serviceData.photoUrl !== undefined) updateData.photo_url = serviceData.photoUrl
  if (serviceData.isActive !== undefined) updateData.is_active = serviceData.isActive
  if (serviceData.availableInQueue !== undefined) updateData.available_in_queue = serviceData.availableInQueue
  if (serviceData.availableInReservations !== undefined) updateData.available_in_reservations = serviceData.availableInReservations
  if (serviceData.estimatedDurationMinutes !== undefined) updateData.estimated_duration_minutes = serviceData.estimatedDurationMinutes || null
  if (serviceData.priceCents !== undefined) updateData.price_cents = serviceData.priceCents || null

  const { data, error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', serviceData.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating service:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard/fila')
  revalidatePath('/dashboard/reservas')

  return { data, error: null }
}

/**
 * Deletar serviço
 */
export async function deleteService(serviceId: string) {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Buscar serviço para verificar permissão e pegar foto
  const { data: service } = await supabase
    .from('services')
    .select('business_id, photo_url, businesses!inner(user_id)')
    .eq('id', serviceId)
    .single()

  const businessesDelete = service?.businesses as unknown as { user_id: string } | undefined
  if (!service || !businessesDelete || businessesDelete.user_id !== user.id) {
    return { error: 'Serviço não encontrado ou sem permissão' }
  }

  // Deletar foto do storage
  if (service.photo_url) {
    const urlParts = service.photo_url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `${service.business_id}/${fileName}`

    await supabase.storage
      .from('service-photos')
      .remove([filePath])
  }

  // Deletar serviço
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)

  if (error) {
    console.error('Error deleting service:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard/fila')
  revalidatePath('/dashboard/reservas')

  return { error: null }
}

/**
 * Reordenar serviços (drag and drop)
 */
export async function reorderServices(businessId: string, serviceIds: string[]) {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Atualizar posições
  const updates = serviceIds.map((id, index) => ({
    id,
    position: index,
  }))

  for (const update of updates) {
    await supabase
      .from('services')
      .update({ position: update.position })
      .eq('id', update.id)
      .eq('business_id', businessId)
  }

  revalidatePath('/dashboard/servicos')

  return { error: null }
}

/**
 * Upload de foto de serviço
 */
export async function uploadServicePhoto(
  businessId: string,
  serviceId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()

  try {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return { url: null, error: 'Arquivo deve ser uma imagem' }
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { url: null, error: 'Imagem deve ter no máximo 5MB' }
    }

    // Gerar nome único
    const fileExt = file.name.split('.').pop()
    const fileName = `${serviceId}.${fileExt}`
    const filePath = `${businessId}/${fileName}`

    // Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('service-photos')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { url: null, error: uploadError.message }
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('service-photos')
      .getPublicUrl(filePath)

    return { url: publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading photo:', error)
    return { url: null, error: 'Erro ao fazer upload da foto' }
  }
}
