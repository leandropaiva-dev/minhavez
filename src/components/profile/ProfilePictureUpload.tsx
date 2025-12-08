'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Upload } from 'react-feather'
import { Button } from '@/components/ui/button'

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  businessId: string
  onUploadComplete: (url: string) => void
}

export default function ProfilePictureUpload({
  currentImageUrl,
  businessId,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione uma imagem')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB')
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      // Create file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/profile.${fileExt}`
      const filePath = fileName

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)

      // Update business with new profile picture URL
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ profile_picture_url: publicUrl })
        .eq('id', businessId)

      if (updateError) throw updateError

      setPreviewUrl(publicUrl)
      onUploadComplete(publicUrl)
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      alert('Erro ao fazer upload da foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        {/* Profile Picture Circle */}
        <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border-4 border-white dark:border-zinc-900 shadow-lg">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-12 h-12 text-zinc-400" />
          )}
        </div>

        {/* Overlay on hover */}
        <div
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Upload Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="gap-2"
      >
        <Camera className="w-4 h-4" />
        {uploading ? 'Enviando...' : previewUrl ? 'Alterar Foto' : 'Adicionar Foto'}
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
        Imagens JPG, PNG ou GIF. Máximo 5MB.
      </p>
    </div>
  )
}
