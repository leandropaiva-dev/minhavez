'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Edit2 as Pencil, Trash2 } from 'react-feather'
import FieldToggle from '../form-config/FieldToggle'
import CustomFieldBuilder from '../form-config/CustomFieldBuilder'
import FormPreview from '../form-config/FormPreview'
import type { QueueFormConfig, CustomField } from '@/types/config.types'
import { getDefaultQueueFormConfig } from '@/lib/config/storage'

interface FormConfigStepProps {
  onNext: (data: QueueFormConfig) => void
  onBack: () => void
  initialData?: QueueFormConfig
}

export default function FormConfigStep({
  onNext,
  onBack,
  initialData,
}: FormConfigStepProps) {
  const [config, setConfig] = useState<QueueFormConfig>(
    initialData || getDefaultQueueFormConfig()
  )
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | undefined>()

  const handleFieldToggle = (
    field: keyof QueueFormConfig['fields'],
    enabled: boolean
  ) => {
    setConfig({
      ...config,
      fields: {
        ...config.fields,
        [field]: { ...config.fields[field], enabled },
      },
    })
  }

  const handleRequiredToggle = (
    field: keyof QueueFormConfig['fields'],
    required: boolean
  ) => {
    setConfig({
      ...config,
      fields: {
        ...config.fields,
        [field]: { ...config.fields[field], required },
      },
    })
  }

  const handleAddCustomField = () => {
    setEditingField(undefined)
    setBuilderOpen(true)
  }

  const handleEditCustomField = (field: CustomField) => {
    setEditingField(field)
    setBuilderOpen(true)
  }

  const handleDeleteCustomField = (fieldId: string) => {
    setConfig({
      ...config,
      customFields: config.customFields.filter((f) => f.id !== fieldId),
    })
  }

  const handleSaveCustomField = (field: CustomField) => {
    if (editingField) {
      // Update existing
      setConfig({
        ...config,
        customFields: config.customFields.map((f) =>
          f.id === field.id ? field : f
        ),
      })
    } else {
      // Add new with order
      setConfig({
        ...config,
        customFields: [
          ...config.customFields,
          { ...field, order: config.customFields.length },
        ],
      })
    }
  }

  const handleSubmit = () => {
    onNext(config)
  }

  const sortedCustomFields = [...config.customFields].sort(
    (a, b) => a.order - b.order
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Configuração do Formulário
        </h2>
        <p className="text-zinc-400">
          Personalize os campos que seus clientes preencherão ao entrar na fila
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Configuration */}
        <div className="space-y-6">
          {/* Standard Fields */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Campos Padrão
            </h3>
            <div className="space-y-3">
              <FieldToggle
                label="Telefone"
                enabled={config.fields.phone.enabled}
                required={config.fields.phone.required}
                onEnabledChange={(enabled) => handleFieldToggle('phone', enabled)}
                onRequiredChange={(required) =>
                  handleRequiredToggle('phone', required)
                }
              />
              <FieldToggle
                label="Email"
                enabled={config.fields.email.enabled}
                required={config.fields.email.required}
                onEnabledChange={(enabled) => handleFieldToggle('email', enabled)}
                onRequiredChange={(required) =>
                  handleRequiredToggle('email', required)
                }
              />
              <FieldToggle
                label="Número de Pessoas"
                enabled={config.fields.partySize.enabled}
                required={config.fields.partySize.required}
                onEnabledChange={(enabled) =>
                  handleFieldToggle('partySize', enabled)
                }
                onRequiredChange={(required) =>
                  handleRequiredToggle('partySize', required)
                }
              />
              <FieldToggle
                label="Observações"
                enabled={config.fields.notes.enabled}
                required={config.fields.notes.required}
                onEnabledChange={(enabled) => handleFieldToggle('notes', enabled)}
                onRequiredChange={(required) =>
                  handleRequiredToggle('notes', required)
                }
              />
            </div>
          </div>

          {/* Custom Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Campos Personalizados
              </h3>
              <Button
                size="sm"
                onClick={handleAddCustomField}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>

            {sortedCustomFields.length === 0 ? (
              <div className="border border-dashed border-zinc-700 rounded-lg p-8 text-center">
                <p className="text-zinc-500 text-sm">
                  Nenhum campo personalizado adicionado
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedCustomFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 border border-zinc-800 rounded-lg bg-zinc-950"
                  >
                    <div>
                      <p className="text-zinc-300 font-medium">{field.label}</p>
                      <p className="text-zinc-500 text-sm">
                        {field.type} {field.required && '• Obrigatório'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditCustomField(field)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCustomField(field.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="lg:sticky lg:top-4 h-fit">
          <FormPreview config={config} />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Voltar
        </Button>
        <Button onClick={handleSubmit} className="flex-1">
          Continuar
        </Button>
      </div>

      <CustomFieldBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={handleSaveCustomField}
        editField={editingField}
      />
    </div>
  )
}
