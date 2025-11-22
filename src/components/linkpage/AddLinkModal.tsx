'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, MessageCircle, Instagram, Facebook, Youtube, MapPin, Mail, Phone, Music2, Link as LinkIcon, UtensilsCrossed, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { LinkPageLink, LinkType } from '@/types/linkpage.types'

interface AddLinkModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (link: Partial<LinkPageLink>) => void
  editLink?: Partial<LinkPageLink> | null
  businessId: string
}

const LINK_TYPES: { type: LinkType; label: string; icon: React.ReactNode; description: string; needsUrl: boolean }[] = [
  { type: 'queue', label: 'Fila de Espera', icon: <Users className="w-5 h-5" />, description: 'Link para entrar na fila do seu negócio', needsUrl: false },
  { type: 'reservation', label: 'Reservas', icon: <Calendar className="w-5 h-5" />, description: 'Link para fazer uma reserva', needsUrl: false },
  { type: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, description: 'Número de telefone com DDD', needsUrl: true },
  { type: 'instagram', label: 'Instagram', icon: <Instagram className="w-5 h-5" />, description: 'Link do seu perfil', needsUrl: true },
  { type: 'facebook', label: 'Facebook', icon: <Facebook className="w-5 h-5" />, description: 'Link da página ou perfil', needsUrl: true },
  { type: 'youtube', label: 'YouTube', icon: <Youtube className="w-5 h-5" />, description: 'Link do canal ou vídeo', needsUrl: true },
  { type: 'tiktok', label: 'TikTok', icon: <Music2 className="w-5 h-5" />, description: 'Link do perfil', needsUrl: true },
  { type: 'menu', label: 'Cardápio', icon: <UtensilsCrossed className="w-5 h-5" />, description: 'Link do cardápio ou menu', needsUrl: true },
  { type: 'location', label: 'Localização', icon: <MapPin className="w-5 h-5" />, description: 'Link do Google Maps', needsUrl: true },
  { type: 'email', label: 'Email', icon: <Mail className="w-5 h-5" />, description: 'Endereço de email', needsUrl: true },
  { type: 'phone', label: 'Telefone', icon: <Phone className="w-5 h-5" />, description: 'Número de telefone', needsUrl: true },
  { type: 'custom', label: 'Link Personalizado', icon: <LinkIcon className="w-5 h-5" />, description: 'Qualquer URL', needsUrl: true },
]

export default function AddLinkModal({ open, onOpenChange, onSave, editLink }: AddLinkModalProps) {
  const [step, setStep] = useState<'type' | 'details'>(editLink ? 'details' : 'type')
  const [linkType, setLinkType] = useState<LinkType>('custom')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [customColor, setCustomColor] = useState('')
  const [customTextColor, setCustomTextColor] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [useCustomColors, setUseCustomColors] = useState(false)

  useEffect(() => {
    if (editLink) {
      setLinkType(editLink.link_type || 'custom')
      setTitle(editLink.title || '')
      setUrl(editLink.url || '')
      setCustomColor(editLink.custom_color || '')
      setCustomTextColor(editLink.custom_text_color || '')
      setThumbnailUrl(editLink.thumbnail_url || '')
      setUseCustomColors(!!editLink.custom_color)
      setStep('details')
    } else {
      setLinkType('custom')
      setTitle('')
      setUrl('')
      setCustomColor('')
      setCustomTextColor('')
      setThumbnailUrl('')
      setUseCustomColors(false)
      setStep('type')
    }
  }, [editLink, open])

  const handleSelectType = (type: LinkType) => {
    setLinkType(type)
    const typeConfig = LINK_TYPES.find(t => t.type === type)
    if (typeConfig) {
      setTitle(typeConfig.label)
    }
    setStep('details')
  }

  const handleSave = () => {
    onSave({
      ...(editLink?.id ? { id: editLink.id } : {}),
      title,
      url,
      link_type: linkType,
      custom_color: useCustomColors ? customColor : undefined,
      custom_text_color: useCustomColors ? customTextColor : undefined,
      thumbnail_url: thumbnailUrl || undefined,
      is_active: editLink?.is_active ?? true,
      position: editLink?.position,
    })
  }

  const selectedType = LINK_TYPES.find(t => t.type === linkType)

  const getUrlPlaceholder = () => {
    switch (linkType) {
      case 'whatsapp': return '5511999999999'
      case 'email': return 'contato@exemplo.com'
      case 'phone': return '(11) 99999-9999'
      case 'instagram': return 'https://instagram.com/seuperfil'
      case 'location': return 'https://goo.gl/maps/...'
      default: return 'https://...'
    }
  }

  const getUrlLabel = () => {
    switch (linkType) {
      case 'whatsapp': return 'Número do WhatsApp'
      case 'email': return 'Endereço de Email'
      case 'phone': return 'Número de Telefone'
      default: return 'URL'
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {editLink ? 'Editar Link' : step === 'type' ? 'Tipo de Link' : 'Detalhes do Link'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {step === 'type' ? (
            <div className="grid grid-cols-2 gap-3">
              {LINK_TYPES.map((type) => (
                <button
                  key={type.type}
                  onClick={() => handleSelectType(type.type)}
                  className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    {type.icon}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-white text-sm">{type.label}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Selected Type */}
              <div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
                <div className="p-2 rounded-lg bg-blue-500 text-white">
                  {selectedType?.icon}
                </div>
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white text-sm">{selectedType?.label}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{selectedType?.description}</p>
                </div>
                {!editLink && (
                  <button
                    onClick={() => setStep('type')}
                    className="ml-auto text-xs text-blue-500 hover:text-blue-600"
                  >
                    Alterar
                  </button>
                )}
              </div>

              {/* Title */}
              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">Título do Link</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Entre na Fila"
                  className="mt-2"
                />
              </div>

              {/* URL (if needed) */}
              {selectedType?.needsUrl && (
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">{getUrlLabel()}</Label>
                  <Input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={getUrlPlaceholder()}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Thumbnail */}
              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">URL da Imagem (opcional)</Label>
                <Input
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="mt-2"
                />
                <p className="text-xs text-zinc-500 mt-1">Exibe uma miniatura ao lado do título</p>
              </div>

              {/* Custom Colors */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300">Cores personalizadas</Label>
                    <p className="text-xs text-zinc-500">Usar cores diferentes do tema</p>
                  </div>
                  <Switch
                    checked={useCustomColors}
                    onCheckedChange={setUseCustomColors}
                  />
                </div>

                {useCustomColors && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300 text-xs">Cor de Fundo</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={customColor || '#3b82f6'}
                          onChange={(e) => setCustomColor(e.target.value)}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <Input
                          value={customColor}
                          onChange={(e) => setCustomColor(e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300 text-xs">Cor do Texto</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={customTextColor || '#ffffff'}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <Input
                          value={customTextColor}
                          onChange={(e) => setCustomTextColor(e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'details' && (
          <div className="flex gap-3 p-4 border-t border-zinc-200 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title || (selectedType?.needsUrl && !url)}
              className="flex-1"
            >
              {editLink ? 'Salvar Alterações' : 'Adicionar Link'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
