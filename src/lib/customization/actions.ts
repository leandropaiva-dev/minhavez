'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BusinessCustomization {
  cover_photo_url: string | null
  profile_picture_url: string | null
  show_phone: boolean
  show_email: boolean
  show_instagram: boolean
  show_website: boolean
  show_address: boolean
  instagram_url: string | null
  website_url: string | null
  address: string | null
  email: string | null
}

/**
 * Buscar customização do negócio
 */
export async function getBusinessCustomization(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('businesses')
    .select('cover_photo_url, profile_picture_url, show_phone, show_email, show_instagram, show_website, show_address, instagram_url, website_url, address, phone, email, name')
    .eq('id', businessId)
    .single()

  if (error) {
    console.error('Error fetching business customization:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Atualizar customização do negócio
 */
export async function updateBusinessCustomization(
  businessId: string,
  customization: Partial<BusinessCustomization>
) {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Não autenticado' }
  }

  // Verificar se o usuário é dono do negócio
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('id', businessId)
    .eq('user_id', user.id)
    .single()

  if (!business) {
    return { error: 'Negócio não encontrado ou sem permissão' }
  }

  // Atualizar
  const { error } = await supabase
    .from('businesses')
    .update(customization)
    .eq('id', businessId)

  if (error) {
    console.error('Error updating business customization:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/fila/${businessId}`)
  revalidatePath('/[slug]/reserva', 'page')

  return { error: null }
}

/**
 * Upload de foto de capa
 */
export async function uploadCoverPhoto(
  businessId: string,
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

    const fileExt = file.name.split('.').pop()
    const fileName = `cover.${fileExt}`
    const filePath = `${businessId}/${fileName}`

    // Upload para Supabase Storage (bucket cover-photos)
    const { error: uploadError } = await supabase.storage
      .from('cover-photos')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { url: null, error: uploadError.message }
    }

    // Obter URL pública com cache busting
    const timestamp = Date.now()
    const { data: { publicUrl } } = supabase.storage
      .from('cover-photos')
      .getPublicUrl(filePath)

    const urlWithCacheBusting = `${publicUrl}?t=${timestamp}`

    // Atualizar banco
    await updateBusinessCustomization(businessId, { cover_photo_url: urlWithCacheBusting })

    return { url: urlWithCacheBusting, error: null }
  } catch (error) {
    console.error('Error uploading cover photo:', error)
    return { url: null, error: 'Erro ao fazer upload da foto de capa' }
  }
}

/**
 * Upload de foto de perfil
 */
export async function uploadProfilePhoto(
  businessId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = await createClient()

  try {
    console.log('[uploadProfilePhoto] Starting upload for business:', businessId)

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      console.error('[uploadProfilePhoto] Invalid file type:', file.type)
      return { url: null, error: 'Arquivo deve ser uma imagem' }
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('[uploadProfilePhoto] File too large:', file.size)
      return { url: null, error: 'Imagem deve ter no máximo 5MB' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `profile.${fileExt}`
    const filePath = `${businessId}/${fileName}`

    console.log('[uploadProfilePhoto] Uploading to path:', filePath)

    // Upload para Supabase Storage (bucket profile-pictures que já existe)
    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('[uploadProfilePhoto] Upload error:', uploadError)
      return { url: null, error: uploadError.message }
    }

    console.log('[uploadProfilePhoto] Upload successful, getting public URL')

    // Obter URL pública com cache busting
    const timestamp = Date.now()
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)

    const urlWithCacheBusting = `${publicUrl}?t=${timestamp}`

    console.log('[uploadProfilePhoto] Public URL:', urlWithCacheBusting)

    // Atualizar banco
    const updateResult = await updateBusinessCustomization(businessId, { profile_picture_url: urlWithCacheBusting })

    if (updateResult.error) {
      console.error('[uploadProfilePhoto] Database update error:', updateResult.error)
      return { url: null, error: updateResult.error }
    }

    console.log('[uploadProfilePhoto] Successfully updated database')

    return { url: urlWithCacheBusting, error: null }
  } catch (error) {
    console.error('[uploadProfilePhoto] Unexpected error:', error)
    return { url: null, error: 'Erro ao fazer upload da foto de perfil' }
  }
}
