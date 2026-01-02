'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Upload, DollarSign, Clock, Image as ImageIcon, Check } from 'react-feather'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createService, updateService, uploadServicePhoto, type Service } from '@/lib/services/actions'

interface ServiceModalProps {
  isOpen: boolean
  onClose: () => void
  businessId: string
  service?: Service | null
}

export default function ServiceModal({ isOpen, onClose, businessId, service }: ServiceModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [availableInQueue, setAvailableInQueue] = useState(true)
  const [availableInReservations, setAvailableInReservations] = useState(true)
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Carregar dados do serviço ao editar
  useEffect(() => {
    if (service) {
      setName(service.name)
      setDescription(service.description || '')
      setPhotoPreview(service.photo_url)
      setAvailableInQueue(service.available_in_queue)
      setAvailableInReservations(service.available_in_reservations)
      setDuration(service.estimated_duration_minutes?.toString() || '')
      setPrice(service.price_cents ? (service.price_cents / 100).toFixed(2) : '')
      setIsActive(service.is_active)
    } else {
      resetForm()
    }
  }, [service])

  const resetForm = () => {
    setName('')
    setDescription('')
    setPhoto(null)
    setPhotoPreview('')
    setAvailableInQueue(true)
    setAvailableInReservations(true)
    setDuration('')
    setPrice('')
    setIsActive(true)
    setUploadProgress(0)
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione uma imagem')
        return
      }

      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB')
        return
      }

      setPhoto(file)

      // Preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    // Validações
    if (!name.trim()) {
      alert('Nome do serviço é obrigatório')
      return
    }

    if (!service && !photo) {
      alert('Foto é obrigatória')
      return
    }

    if (!availableInQueue && !availableInReservations) {
      alert('O serviço deve estar disponível em pelo menos uma opção (Fila ou Reservas)')
      return
    }

    setSaving(true)
    setUploadProgress(0)

    try {
      let photoUrl = service?.photo_url || ''

      // Upload da foto se houver
      if (photo) {
        setUploadProgress(30)

        // Gerar ID temporário se for novo serviço
        const serviceId = service?.id || crypto.randomUUID()

        const { url, error } = await uploadServicePhoto(businessId, serviceId, photo)

        if (error || !url) {
          alert(`Erro ao fazer upload da foto: ${error}`)
          setSaving(false)
          return
        }

        photoUrl = url
        setUploadProgress(60)
      }

      // Criar ou atualizar serviço
      if (service) {
        // Atualizar
        const { error } = await updateService({
          id: service.id,
          name: name.trim(),
          description: description.trim() || undefined,
          photoUrl: photoUrl || undefined,
          isActive,
          availableInQueue,
          availableInReservations,
          estimatedDurationMinutes: duration ? parseInt(duration) : undefined,
          priceCents: price ? Math.round(parseFloat(price) * 100) : undefined,
        })

        if (error) {
          alert(`Erro ao atualizar serviço: ${error}`)
          setSaving(false)
          return
        }
      } else {
        // Criar
        const { error } = await createService({
          businessId,
          name: name.trim(),
          description: description.trim() || undefined,
          photoUrl,
          availableInQueue,
          availableInReservations,
          estimatedDurationMinutes: duration ? parseInt(duration) : undefined,
          priceCents: price ? Math.round(parseFloat(price) * 100) : undefined,
        })

        if (error) {
          alert(`Erro ao criar serviço: ${error}`)
          setSaving(false)
          return
        }
      }

      setUploadProgress(100)
      resetForm()
      onClose()
    } catch (error) {
      console.error('Error saving service:', error)
      alert('Erro ao salvar serviço')
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    if (!saving) {
      resetForm()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {service ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Foto - DESTAQUE */}
          <div>
            <Label className="text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Foto do Serviço <span className="text-red-500">*</span>
            </Label>
            <div className="space-y-3">
              {/* Preview */}
              {photoPreview && (
                <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => {
                      setPhoto(null)
                      setPhotoPreview('')
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2"
              >
                <Upload className="w-4 h-4" />
                {photoPreview ? 'Trocar Foto' : 'Escolher Foto'}
              </Button>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Imagem até 5MB. Formatos: JPG, PNG, WEBP
              </p>
            </div>
          </div>

          {/* Nome */}
          <div>
            <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">
              Nome do Serviço <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Corte Masculino"
              maxLength={100}
              className="mt-2"
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="description" className="text-zinc-700 dark:text-zinc-300">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrição do serviço..."
              rows={3}
              maxLength={500}
              className="mt-2"
            />
          </div>

          {/* Duração e Preço */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duração */}
            <div>
              <Label htmlFor="duration" className="text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duração (minutos)
              </Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="30"
                min="1"
                max="999"
                className="mt-2"
              />
            </div>

            {/* Preço */}
            <div>
              <Label htmlFor="price" className="text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Preço (R$)
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="50.00"
                min="0"
                step="0.01"
                className="mt-2"
              />
            </div>
          </div>

          {/* Disponibilidade */}
          <div>
            <Label className="text-zinc-700 dark:text-zinc-300 mb-3 block">
              Disponibilidade
            </Label>
            <div className="space-y-3">
              {/* Fila */}
              <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={availableInQueue}
                  onChange={(e) => setAvailableInQueue(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    Disponível na Fila
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Clientes poderão escolher este serviço ao entrar na fila
                  </p>
                </div>
              </label>

              {/* Reservas */}
              <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={availableInReservations}
                  onChange={(e) => setAvailableInReservations(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    Disponível nas Reservas
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Clientes poderão escolher este serviço ao fazer reserva
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Status (apenas ao editar) */}
          {service && (
            <div>
              <Label className="text-zinc-700 dark:text-zinc-300 mb-3 block">
                Status
              </Label>
              <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    Serviço Ativo
                  </span>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Desative para ocultar temporariamente dos formulários
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Progress bar durante upload */}
          {saving && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
                <span>Fazendo upload...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 p-6 flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={saving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || (!service && !photo)}
            className="flex-1 gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {service ? 'Salvar Alterações' : 'Criar Serviço'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
