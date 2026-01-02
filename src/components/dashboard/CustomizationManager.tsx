'use client'

import { useState } from 'react'
import { Camera, Upload, Save, AlertCircle } from 'react-feather'
import Image from 'next/image'
import {
  updateBusinessCustomization,
  uploadCoverPhoto,
  uploadProfilePhoto,
  type BusinessCustomization,
} from '@/lib/customization/actions'

interface BusinessData {
  id: string
  name: string
  phone?: string | null
  email?: string | null
  cover_photo_url?: string | null
  profile_picture_url?: string | null
  show_phone?: boolean
  show_email?: boolean
  show_instagram?: boolean
  show_website?: boolean
  show_address?: boolean
  instagram_url?: string | null
  website_url?: string | null
  address?: string | null
}

interface CustomizationManagerProps {
  businessId: string
  initialData: BusinessData
}

export default function CustomizationManager({
  businessId,
  initialData,
}: CustomizationManagerProps) {
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(initialData.cover_photo_url || null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(initialData.profile_picture_url || null)

  const [formData, setFormData] = useState<Partial<BusinessCustomization>>({
    show_phone: initialData.show_phone ?? true,
    show_email: initialData.show_email ?? true,
    show_instagram: initialData.show_instagram ?? false,
    show_website: initialData.show_website ?? false,
    show_address: initialData.show_address ?? true,
    instagram_url: initialData.instagram_url || '',
    website_url: initialData.website_url || '',
    address: initialData.address || '',
    email: initialData.email || '',
  })

  const businessName = initialData.name || 'Seu Negócio'
  const initials = businessName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)

  const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    setMessage(null)

    try {
      const { url, error } = await uploadCoverPhoto(businessId, file)
      if (error) {
        setMessage({ type: 'error', text: error })
      } else if (url) {
        setCoverPhotoUrl(url)
        setMessage({ type: 'success', text: 'Foto de capa atualizada!' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao fazer upload da foto de capa' })
    } finally {
      setUploadingCover(false)
    }
  }

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingProfile(true)
    setMessage(null)

    try {
      const { url, error } = await uploadProfilePhoto(businessId, file)
      if (error) {
        setMessage({ type: 'error', text: error })
      } else if (url) {
        setProfilePhotoUrl(url)
        setMessage({ type: 'success', text: 'Foto de perfil atualizada!' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao fazer upload da foto de perfil' })
    } finally {
      setUploadingProfile(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await updateBusinessCustomization(businessId, formData)
      if (error) {
        setMessage({ type: 'error', text: error })
      } else {
        setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Preview Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Preview</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Veja como suas páginas públicas vão aparecer
          </p>
        </div>

        <div className="p-6">
          {/* Cover Photo */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-xl overflow-hidden">
            {coverPhotoUrl ? (
              <Image
                src={coverPhotoUrl}
                alt="Cover"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
                {initials}
              </div>
            )}
          </div>

          {/* Profile Photo + Info */}
          <div className="relative px-4 sm:px-6 -mt-12 sm:-mt-16 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Profile Photo */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-zinc-900 bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden flex-shrink-0">
                {profilePhotoUrl ? (
                  <Image
                    src={profilePhotoUrl}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                    {initials}
                  </div>
                )}
              </div>

              {/* Business Name */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white truncate">
                  {businessName}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Negócio verificado
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Photo Upload */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">Foto de Capa</h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Aparece no topo das suas páginas públicas (recomendado: 1200x400px)
            </p>
          </div>
          <label className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 text-sm font-medium w-full sm:w-auto">
            <Upload className="w-4 h-4" />
            <span>{uploadingCover ? 'Enviando...' : 'Upload'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoUpload}
              disabled={uploadingCover}
              className="hidden"
            />
          </label>
        </div>
        {coverPhotoUrl && (
          <div className="relative h-28 sm:h-32 md:h-40 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800">
            <Image
              src={coverPhotoUrl}
              alt="Cover preview"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Profile Photo Upload */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">Foto de Perfil</h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Seu logo ou foto de perfil (recomendado: 400x400px)
            </p>
          </div>
          <label className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-2 text-sm font-medium w-full sm:w-auto">
            <Camera className="w-4 h-4" />
            <span>{uploadingProfile ? 'Enviando...' : 'Upload'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoUpload}
              disabled={uploadingProfile}
              className="hidden"
            />
          </label>
        </div>
        {profilePhotoUrl && (
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-zinc-200 dark:border-zinc-800 mx-auto">
            <Image
              src={profilePhotoUrl}
              alt="Profile preview"
              fill
              className="object-cover"
            />
          </div>
        )}
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Informações de Contato
        </h2>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</span>
              <input
                type="checkbox"
                checked={formData.show_email}
                onChange={(e) => setFormData({ ...formData, show_email: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="seuemail@exemplo.com"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Phone (readonly - from business) */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefone</span>
              <input
                type="checkbox"
                checked={formData.show_phone}
                onChange={(e) => setFormData({ ...formData, show_phone: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <input
              type="text"
              value={initialData.phone || 'Não configurado'}
              disabled
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400"
            />
          </div>

          {/* Instagram */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Instagram</span>
              <input
                type="checkbox"
                checked={formData.show_instagram}
                onChange={(e) => setFormData({ ...formData, show_instagram: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <input
              type="url"
              value={formData.instagram_url || ''}
              onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
              placeholder="https://instagram.com/seuperfil"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Website */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Website</span>
              <input
                type="checkbox"
                checked={formData.show_website}
                onChange={(e) => setFormData({ ...formData, show_website: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <input
              type="url"
              value={formData.website_url || ''}
              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
              placeholder="https://seusite.com"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Endereço</span>
              <input
                type="checkbox"
                checked={formData.show_address}
                onChange={(e) => setFormData({ ...formData, show_address: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua Exemplo, 123 - Cidade, Estado"
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  )
}
