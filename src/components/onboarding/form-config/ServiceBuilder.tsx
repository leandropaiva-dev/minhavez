'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, DollarSign, Clock } from 'react-feather'
import type { ServiceOption } from '@/types/config.types'
import { getCurrencySymbol } from '@/lib/utils/currency'

interface ServiceBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (service: ServiceOption) => void
  editService?: ServiceOption
  currency?: 'BRL' | 'EUR'
}

export default function ServiceBuilder({
  open,
  onOpenChange,
  onSave,
  editService,
  currency = 'BRL',
}: ServiceBuilderProps) {
  const currencySymbol = getCurrencySymbol(currency)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [duration, setDuration] = useState<number | undefined>(undefined)
  const [price, setPrice] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (editService) {
      setName(editService.name)
      setDescription(editService.description || '')
      setImageUrl(editService.imageUrl || '')
      setDuration(editService.duration)
      setPrice(editService.price)
    } else {
      setName('')
      setDescription('')
      setImageUrl('')
      setDuration(undefined)
      setPrice(undefined)
    }
  }, [editService, open])

  const handleSave = () => {
    if (!name.trim()) return

    const service: ServiceOption = {
      id: editService?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      duration,
      price,
      order: editService?.order || 0,
    }

    onSave(service)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editService ? 'Editar Serviço' : 'Adicionar Serviço'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="service-name">
              Nome do Serviço <span className="text-red-500">*</span>
            </Label>
            <Input
              id="service-name"
              placeholder="Ex: Corte Masculino, Rodízio, Massagem Relaxante"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="service-description">Descrição</Label>
            <Textarea
              id="service-description"
              placeholder="Descreva o serviço (opcional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Imagem */}
          <div className="space-y-2">
            <Label htmlFor="service-image">URL da Imagem</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  id="service-image"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" type="button">
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {imageUrl && (
              <div className="mt-2 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
            )}
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Cole o link de uma imagem ou faça upload (funcionalidade em breve)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Duração */}
            <div className="space-y-2">
              <Label htmlFor="service-duration">
                <Clock className="w-4 h-4 inline mr-1" />
                Duração (minutos)
              </Label>
              <Input
                id="service-duration"
                type="number"
                placeholder="Ex: 30"
                value={duration || ''}
                onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
                min="0"
              />
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="service-price">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Preço ({currencySymbol})
              </Label>
              <Input
                id="service-price"
                type="number"
                placeholder={currency === 'BRL' ? 'Ex: 50.00' : 'Ex: 25.00'}
                value={price || ''}
                onChange={(e) => setPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {editService ? 'Salvar Alterações' : 'Adicionar Serviço'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
