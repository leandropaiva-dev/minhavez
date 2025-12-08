'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { QueueFormConfig, ReservationFormConfig } from '@/types/config.types'

interface FormPreviewProps {
  config: QueueFormConfig | ReservationFormConfig
}

export default function FormPreview({ config }: FormPreviewProps) {
  const sortedCustomFields = [...config.customFields].sort(
    (a, b) => a.order - b.order
  )

  const isReservationConfig = 'enableServiceSelection' in config
  const sortedServices = isReservationConfig && config.enableServiceSelection
    ? [...config.services].sort((a, b) => a.order - b.order)
    : []

  return (
    <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-950">
      <h3 className="text-lg font-semibold text-white mb-4">
        Preview do Formulário
      </h3>

      <div className="space-y-4 opacity-60 pointer-events-none">
        {/* Service Selection - Only for reservation forms */}
        {isReservationConfig && config.enableServiceSelection && sortedServices.length > 0 && (
          <div>
            <Label className="text-zinc-300">Escolha o Serviço *</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {sortedServices.slice(0, 3).map((service) => (
                <div
                  key={service.id}
                  className="border border-zinc-700 rounded-lg p-3 flex items-center gap-3 hover:border-zinc-600 transition-colors cursor-pointer"
                >
                  {service.imageUrl && (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{service.name}</p>
                    {service.description && (
                      <p className="text-zinc-400 text-xs truncate">{service.description}</p>
                    )}
                    <div className="flex gap-2 text-xs text-zinc-400 mt-1">
                      {service.duration && <span>{service.duration}min</span>}
                      {service.price && <span>R$ {service.price.toFixed(2)}</span>}
                    </div>
                  </div>
                </div>
              ))}
              {sortedServices.length > 3 && (
                <p className="text-xs text-zinc-500 text-center">
                  +{sortedServices.length - 3} outros serviços
                </p>
              )}
            </div>
          </div>
        )}

        {/* Customer Name - Always visible */}
        <div>
          <Label className="text-zinc-300">Nome *</Label>
          <Input placeholder="Seu nome completo" className="mt-2" />
        </div>

        {/* Phone */}
        {config.fields.phone.enabled && (
          <div>
            <Label className="text-zinc-300">
              Telefone {config.fields.phone.required && '*'}
            </Label>
            <Input placeholder="(11) 98765-4321" className="mt-2" />
          </div>
        )}

        {/* Email */}
        {config.fields.email.enabled && (
          <div>
            <Label className="text-zinc-300">
              Email {config.fields.email.required && '*'}
            </Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              className="mt-2"
            />
          </div>
        )}

        {/* Party Size */}
        {config.fields.partySize.enabled && (
          <div>
            <Label className="text-zinc-300">
              Número de Pessoas {config.fields.partySize.required && '*'}
            </Label>
            <Input type="number" placeholder="1" className="mt-2" />
          </div>
        )}

        {/* Notes */}
        {config.fields.notes.enabled && (
          <div>
            <Label className="text-zinc-300">
              Observações {config.fields.notes.required && '*'}
            </Label>
            <Textarea
              placeholder="Informações adicionais..."
              className="mt-2"
            />
          </div>
        )}

        {/* Custom Fields */}
        {sortedCustomFields.map((field) => (
          <div key={field.id}>
            <Label className="text-zinc-300">
              {field.label} {field.required && '*'}
            </Label>

            {field.type === 'text' && (
              <Input placeholder={field.placeholder} className="mt-2" />
            )}

            {field.type === 'number' && (
              <Input
                type="number"
                placeholder={field.placeholder}
                className="mt-2"
              />
            )}

            {field.type === 'email' && (
              <Input
                type="email"
                placeholder={field.placeholder}
                className="mt-2"
              />
            )}

            {field.type === 'tel' && (
              <Input
                type="tel"
                placeholder={field.placeholder}
                className="mt-2"
              />
            )}

            {field.type === 'textarea' && (
              <Textarea placeholder={field.placeholder} className="mt-2" />
            )}

            {field.type === 'select' && (
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {field.type === 'checkbox' && (
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox />
                <label className="text-sm text-zinc-400">Sim</label>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-500 mt-4 text-center">
        Este é apenas um preview. Os clientes verão este formulário ao entrar na
        fila.
      </p>
    </div>
  )
}
