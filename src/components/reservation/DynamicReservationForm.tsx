'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import DynamicField from '../queue/DynamicField'
import TimeSlotPicker from './TimeSlotPicker'
import { getReservationFormConfig, getDefaultReservationFormConfig } from '@/lib/config/storage'
import { formatCurrency } from '@/lib/utils/currency'
import type { ReservationFormConfig } from '@/types/config.types'

interface DynamicReservationFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (formData: Record<string, any>) => void
  loading?: boolean
  config?: ReservationFormConfig
  businessId?: string
}

export default function DynamicReservationForm({
  onSubmit,
  loading = false,
  config: propConfig,
  businessId,
}: DynamicReservationFormProps) {
  const [config] = useState<ReservationFormConfig>(() => {
    if (propConfig) return propConfig
    return getReservationFormConfig() || getDefaultReservationFormConfig()
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({
    customer_name: '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
    selected_service: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}

    // Validate service selection if enabled and required
    if (config.enableServiceSelection && config.serviceSelectionRequired && (config.services || []).length > 0 && !formData.selected_service) {
      newErrors.selected_service = 'Selecione um serviço'
    }

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

  const sortedServices = [...(config.services || [])].sort((a, b) => a.order - b.order)

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Service Selection */}
      {config.enableServiceSelection && sortedServices.length > 0 && (
        <div>
          <Label className="text-zinc-300">
            Escolha o Serviço <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-1 gap-3 mt-2">
            {sortedServices.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => handleFieldChange('selected_service', service.id)}
                className={`border rounded-lg p-4 text-left transition-all ${
                  formData.selected_service === service.id
                    ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50'
                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
                } ${errors.selected_service ? 'border-red-500' : ''}`}
                disabled={loading}
              >
                <div className="flex gap-4">
                  {service.imageUrl && (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-zinc-400 text-sm mb-2 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 text-sm">
                      {service.duration && (
                        <span className="text-zinc-400">
                          ⏱️ {service.duration} min
                        </span>
                      )}
                      {service.price && (
                        <span className="text-green-400 font-semibold">
                          {formatCurrency(service.price, config.currency || 'BRL')}
                        </span>
                      )}
                    </div>
                  </div>
                  {formData.selected_service === service.id && (
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          {errors.selected_service && (
            <p className="text-red-500 text-sm mt-2">{errors.selected_service}</p>
          )}
        </div>
      )}

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
      <div className="relative">
        <Label htmlFor="reservation_date" className="text-zinc-300">
          Data <span className="text-red-500">*</span>
        </Label>
        <input
          id="reservation_date"
          type="date"
          value={formData.reservation_date}
          onChange={(e) => {
            const newDate = e.target.value
            console.log('Date changed:', newDate)

            // Only update if it's a valid date (YYYY-MM-DD format)
            if (!newDate || newDate.length === 10) {
              setFormData(prev => ({
                ...prev,
                reservation_date: newDate,
                // Only clear time if date actually changed
                ...(prev.reservation_date !== newDate ? { reservation_time: '' } : {})
              }))
              if (errors.reservation_date) {
                setErrors({ ...errors, reservation_date: '' })
              }
            }
          }}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
          min={today}
          className={`h-10 w-full rounded-md border px-3 py-2 text-sm mt-2 ${
            errors.reservation_date
              ? 'border-red-500'
              : 'border-zinc-700'
          } bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
          disabled={loading}
          style={{
            colorScheme: 'dark',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 50,
            pointerEvents: 'auto',
            touchAction: 'auto'
          }}
        />
        {errors.reservation_date && (
          <p className="text-red-500 text-sm mt-1">{errors.reservation_date}</p>
        )}
      </div>

      {/* Time Slot Picker */}
      {businessId ? (
        <TimeSlotPicker
          businessId={businessId}
          selectedDate={formData.reservation_date}
          selectedTime={formData.reservation_time}
          onTimeChange={(time) => handleFieldChange('reservation_time', time)}
          error={errors.reservation_time}
          disabled={loading}
        />
      ) : (
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
      )}

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
