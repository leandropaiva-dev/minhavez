'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import DynamicField from './DynamicField'
import { getQueueFormConfig, getDefaultQueueFormConfig } from '@/lib/config/storage'
import { validateDynamicForm } from '@/lib/utils/validation'
import type { QueueFormConfig } from '@/types/config.types'

interface DynamicQueueFormProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (formData: Record<string, any>) => void
  loading?: boolean
}

export default function DynamicQueueForm({
  onSubmit,
  loading = false,
}: DynamicQueueFormProps) {
  const [config] = useState<QueueFormConfig>(() => {
    return getQueueFormConfig() || getDefaultQueueFormConfig()
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<Record<string, any>>({
    customer_name: '',
    party_size: 1,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validation = validateDynamicForm(formData, config)

    if (!validation.valid) {
      const errorMap: Record<string, string> = {}
      validation.errors.forEach((err) => {
        errorMap[err.field] = err.message
      })
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
