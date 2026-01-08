'use client'

import { createClient } from '@/lib/supabase/client'

/**
 * Upload de foto de perfil (client-side)
 */
export async function uploadProfilePhotoClient(
  businessId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient()

  try {
    console.log('[uploadProfilePhotoClient] Starting upload for business:', businessId)

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      console.error('[uploadProfilePhotoClient] Invalid file type:', file.type)
      return { url: null, error: 'Arquivo deve ser uma imagem' }
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('[uploadProfilePhotoClient] File too large:', file.size)
      return { url: null, error: 'Imagem deve ter no máximo 5MB' }
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `profile.${fileExt}`
    const filePath = `${businessId}/${fileName}`

    console.log('[uploadProfilePhotoClient] Uploading to path:', filePath)

    // Upload para Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('[uploadProfilePhotoClient] Upload error:', uploadError)
      return { url: null, error: uploadError.message }
    }

    console.log('[uploadProfilePhotoClient] Upload successful:', uploadData)

    // Obter URL pública com cache busting
    const timestamp = Date.now()
    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath)

    const urlWithCacheBusting = `${publicUrl}?t=${timestamp}`

    console.log('[uploadProfilePhotoClient] Public URL:', urlWithCacheBusting)

    // Verificar se usuário é dono do negócio
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('[uploadProfilePhotoClient] User not authenticated')
      return { url: null, error: 'Não autenticado' }
    }

    console.log('[uploadProfilePhotoClient] User ID:', user.id)

    // Atualizar banco
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ profile_picture_url: urlWithCacheBusting })
      .eq('id', businessId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[uploadProfilePhotoClient] Database update error:', updateError)
      return { url: null, error: updateError.message }
    }

    console.log('[uploadProfilePhotoClient] Successfully updated database')

    return { url: urlWithCacheBusting, error: null }
  } catch (error) {
    console.error('[uploadProfilePhotoClient] Unexpected error:', error)
    return { url: null, error: error instanceof Error ? error.message : 'Erro ao fazer upload da foto de perfil' }
  }
}

/**
 * Upload de foto de capa (client-side)
 */
export async function uploadCoverPhotoClient(
  businessId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const supabase = createClient()

  try {
    console.log('[uploadCoverPhotoClient] Starting upload for business:', businessId)

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

    // Upload para Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('cover-photos')
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      })

    if (uploadError) {
      console.error('[uploadCoverPhotoClient] Upload error:', uploadError)
      return { url: null, error: uploadError.message }
    }

    // Obter URL pública com cache busting
    const timestamp = Date.now()
    const { data: { publicUrl } } = supabase.storage
      .from('cover-photos')
      .getPublicUrl(filePath)

    const urlWithCacheBusting = `${publicUrl}?t=${timestamp}`

    // Verificar se usuário é dono do negócio
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { url: null, error: 'Não autenticado' }
    }

    // Atualizar banco
    const { error: updateError } = await supabase
      .from('businesses')
      .update({ cover_photo_url: urlWithCacheBusting })
      .eq('id', businessId)
      .eq('user_id', user.id)

    if (updateError) {
      console.error('[uploadCoverPhotoClient] Database update error:', updateError)
      return { url: null, error: updateError.message }
    }

    return { url: urlWithCacheBusting, error: null }
  } catch (error) {
    console.error('[uploadCoverPhotoClient] Unexpected error:', error)
    return { url: null, error: error instanceof Error ? error.message : 'Erro ao fazer upload da foto de capa' }
  }
}
