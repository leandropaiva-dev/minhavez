'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import DynamicField from '../queue/DynamicField'
import { getReservationFormConfig, getDefaultReservationFormConfig } from '@/lib/config/storage'
import type { ReservationFormConfig } from '@/types/config.types'

interface DynamicReservationFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (formData: Record<string, any>) => void
  loading?: boolean
}

export default function DynamicReservationForm({
  onSubmit,
  loading = false,
}: DynamicReservationFormProps) {
  const [config] = useState<ReservationFormConfig>(() => {
    return getReservationFormConfig() || getDefaultReservationFormConfig()
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({
    customer_name: '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}

    if (!formData.customer_name?.trim()) {
      newErrors.customer_name = 'Nome é obrigatório'
    }

    if (!formData.reservation_date) {
      newErrors.reservation_date = 'Data é obrigatória'
    }

    if (!formData.reservation_time) {
      newErrors.reservation_time = 'Horário é obrigatório'
    }

    if (config.fields.phone.required && !formData.customer_phone?.trim()) {
      newErrors.customer_phone = 'Telefone é obrigatório'
    }

    if (config.fields.email.required && !formData.customer_email?.trim()) {
      newErrors.customer_email = 'Email é obrigatório'
    }

    if (config.fields.partySize.required && !formData.party_size) {
      newErrors.party_size = 'Número de pessoas é obrigatório'
    }

    // Validate custom fields
    config.customFields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} é obrigatório`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit(formData)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const sortedCustomFields = [...config.customFields].sort(
    (a, b) => a.order - b.order
  )

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Customer Name - Always required */}
      <div>
        <Label htmlFor="customer_name" className="text-zinc-300">
          Nome Completo <span className="text-red-500">*</span>
        </Label>
        <Input
          id="customer_name"
          type="text"
          value={formData.customer_name}
          onChange={(e) => handleFieldChange('customer_name', e.target.value)}
          placeholder="Seu nome completo"
          className={`mt-2 ${errors.customer_name ? 'border-red-500' : ''}`}
          disabled={loading}
        />
        {errors.customer_name && (
          <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
        )}
      </div>

      {/* Phone */}
      {config.fields.phone.enabled && (
        <div>
          <Label htmlFor="customer_phone" className="text-zinc-300">
            Telefone {config.fields.phone.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="customer_phone"
            type="tel"
            value={formData.customer_phone || ''}
            onChange={(e) => handleFieldChange('customer_phone', e.target.value)}
            placeholder="(11) 98765-4321"
            className={`mt-2 ${errors.customer_phone ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.customer_phone && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_phone}</p>
          )}
        </div>
      )}

      {/* Email */}
      {config.fields.email.enabled && (
        <div>
          <Label htmlFor="customer_email" className="text-zinc-300">
            Email {config.fields.email.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="customer_email"
            type="email"
            value={formData.customer_email || ''}
            onChange={(e) => handleFieldChange('customer_email', e.target.value)}
            placeholder="seu@email.com"
            className={`mt-2 ${errors.customer_email ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.customer_email && (
            <p className="text-red-500 text-sm mt-1">{errors.customer_email}</p>
          )}
        </div>
      )}

      {/* Party Size */}
      {config.fields.partySize.enabled && (
        <div>
          <Label htmlFor="party_size" className="text-zinc-300">
            Pessoas {config.fields.partySize.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="party_size"
            type="number"
            value={formData.party_size || 2}
            onChange={(e) => handleFieldChange('party_size', Number(e.target.value))}
            min={1}
            max={20}
            className={`mt-2 ${errors.party_size ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.party_size && (
            <p className="text-red-500 text-sm mt-1">{errors.party_size}</p>
          )}
        </div>
      )}

      {/* Date & Time - Always required */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reservation_date" className="text-zinc-300">
            Data <span className="text-red-500">*</span>
          </Label>
          <Input
            id="reservation_date"
            type="date"
            value={formData.reservation_date}
            onChange={(e) => handleFieldChange('reservation_date', e.target.value)}
            min={today}
            className={`mt-2 ${errors.reservation_date ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.reservation_date && (
            <p className="text-red-500 text-sm mt-1">{errors.reservation_date}</p>
          )}
        </div>
        <div>
          <Label htmlFor="reservation_time" className="text-zinc-300">
            Horário <span className="text-red-500">*</span>
          </Label>
          <Input
            id="reservation_time"
            type="time"
            value={formData.reservation_time}
            onChange={(e) => handleFieldChange('reservation_time', e.target.value)}
            className={`mt-2 ${errors.reservation_time ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.reservation_time && (
            <p className="text-red-500 text-sm mt-1">{errors.reservation_time}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      {config.fields.notes.enabled && (
        <div>
          <Label htmlFor="notes" className="text-zinc-300">
            Observações {config.fields.notes.required && <span className="text-red-500">*</span>}
          </Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Preferências, alergias, ocasião especial..."
            rows={3}
            className={`mt-2 ${errors.notes ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.notes && (
            <p className="text-red-500 text-sm mt-1">{errors.notes}</p>
          )}
        </div>
      )}

      {/* Custom Fields */}
      {sortedCustomFields.map((field) => (
        <DynamicField
          key={field.id}
          field={field}
          value={formData[field.id]}
          onChange={(value) => handleFieldChange(field.id, value)}
          error={errors[field.id]}
        />
      ))}

      <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
        {loading ? 'Enviando...' : 'Confirmar Reserva'}
      </Button>

      <p className="text-xs text-center text-zinc-500">
        * Campos obrigatórios
      </p>
    </form>
  )
}
