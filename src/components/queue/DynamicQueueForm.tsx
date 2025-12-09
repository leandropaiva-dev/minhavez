'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import DynamicField from './DynamicField'
import { getQueueFormConfig, getDefaultQueueFormConfig } from '@/lib/config/storage'
import { validateDynamicForm } from '@/lib/utils/validation'
import { formatCurrency } from '@/lib/utils/currency'
import type { QueueFormConfig } from '@/types/config.types'

interface DynamicQueueFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (formData: Record<string, any>) => void
  loading?: boolean
  config?: QueueFormConfig
}

export default function DynamicQueueForm({
  onSubmit,
  loading = false,
  config: propConfig,
}: DynamicQueueFormProps) {
  const [config] = useState<QueueFormConfig>(() => {
    if (propConfig) return propConfig
    return getQueueFormConfig() || getDefaultQueueFormConfig()
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({
    customer_name: '',
    party_size: 1,
    selected_service: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const errorMap: Record<string, string> = {}

    // Validate service selection if enabled and required
    if (config.enableServiceSelection && config.serviceSelectionRequired && (config.services || []).length > 0 && !formData.selected_service) {
      errorMap.selected_service = 'Selecione um serviço'
    }

    // Validate form
    const validation = validateDynamicForm(formData, config)

    if (!validation.valid) {
      validation.errors.forEach((err) => {
        errorMap[err.field] = err.message
      })
    }

    // If there are any errors, show them and return
    if (Object.keys(errorMap).length > 0) {
      setErrors(errorMap)
      return
    }

    // Clear errors and submit
    setErrors({})
    onSubmit(formData)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFieldChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value })
    // Clear error for this field
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  const sortedCustomFields = [...config.customFields].sort(
    (a, b) => a.order - b.order
  )

  const sortedServices = [...(config.services || [])].sort((a, b) => a.order - b.order)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            Número de Pessoas {config.fields.partySize.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="party_size"
            type="number"
            value={formData.party_size || 1}
            onChange={(e) => handleFieldChange('party_size', Number(e.target.value))}
            placeholder="1"
            min={1}
            className={`mt-2 ${errors.party_size ? 'border-red-500' : ''}`}
            disabled={loading}
          />
          {errors.party_size && (
            <p className="text-red-500 text-sm mt-1">{errors.party_size}</p>
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
            placeholder="Informações adicionais..."
            rows={4}
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

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Entrando na fila...' : 'Entrar na Fila'}
      </Button>
    </form>
  )
}
