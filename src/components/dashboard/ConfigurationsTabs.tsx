'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Check, Plus, Edit2, Trash2 } from 'react-feather'
import FieldToggle from '../onboarding/form-config/FieldToggle'
import CustomFieldBuilder from '../onboarding/form-config/CustomFieldBuilder'
import FormPreview from '../onboarding/form-config/FormPreview'
import {
  getQueueFormConfig,
  saveQueueFormConfig,
  getReservationFormConfig,
  saveReservationFormConfig,
  getDefaultQueueFormConfig,
  getDefaultReservationFormConfig,
} from '@/lib/config/storage'
import type { QueueFormConfig, ReservationFormConfig, CustomField, FormFieldsConfig } from '@/types/config.types'

type FormType = 'queue' | 'reservation'

export default function ConfigurationsTabs() {
  const [activeFormType, setActiveFormType] = useState<FormType>('queue')
  const [saved, setSaved] = useState(false)

  // Queue Form Config State
  const [queueFormConfig, setQueueFormConfig] = useState<QueueFormConfig>(
    getDefaultQueueFormConfig()
  )

  // Reservation Form Config State
  const [reservationFormConfig, setReservationFormConfig] = useState<ReservationFormConfig>(
    getDefaultReservationFormConfig()
  )

  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | undefined>()

  useEffect(() => {
    const savedQueueFormConfig = getQueueFormConfig()
    if (savedQueueFormConfig) {
      setQueueFormConfig(savedQueueFormConfig)
    }

    const savedReservationFormConfig = getReservationFormConfig()
    if (savedReservationFormConfig) {
      setReservationFormConfig(savedReservationFormConfig)
    }
  }, [])

  // Get current form config based on active type
  const currentFormConfig = activeFormType === 'queue' ? queueFormConfig : reservationFormConfig
  const setCurrentFormConfig = activeFormType === 'queue' ? setQueueFormConfig : setReservationFormConfig

  const handleSaveFormConfig = () => {
    if (activeFormType === 'queue') {
      saveQueueFormConfig(queueFormConfig)
    } else {
      saveReservationFormConfig(reservationFormConfig)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Form config handlers
  const handleFieldToggle = (
    field: keyof FormFieldsConfig,
    enabled: boolean
  ) => {
    setCurrentFormConfig({
      ...currentFormConfig,
      fields: {
        ...currentFormConfig.fields,
        [field]: { ...currentFormConfig.fields[field], enabled },
      },
    })
  }

  const handleRequiredToggle = (
    field: keyof FormFieldsConfig,
    required: boolean
  ) => {
    setCurrentFormConfig({
      ...currentFormConfig,
      fields: {
        ...currentFormConfig.fields,
        [field]: { ...currentFormConfig.fields[field], required },
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
    setCurrentFormConfig({
      ...currentFormConfig,
      customFields: currentFormConfig.customFields.filter((f) => f.id !== fieldId),
    })
  }

  const handleSaveCustomField = (field: CustomField) => {
    if (editingField) {
      setCurrentFormConfig({
        ...currentFormConfig,
        customFields: currentFormConfig.customFields.map((f) =>
          f.id === field.id ? field : f
        ),
      })
    } else {
      setCurrentFormConfig({
        ...currentFormConfig,
        customFields: [
          ...currentFormConfig.customFields,
          { ...field, order: currentFormConfig.customFields.length },
        ],
      })
    }
  }

  const sortedCustomFields = [...currentFormConfig.customFields].sort(
    (a, b) => a.order - b.order
  )

  return (
    <div className="space-y-6">
      {/* Form Type Selector */}
      <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-lg">
        <button
          onClick={() => setActiveFormType('queue')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeFormType === 'queue'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Formulário da Fila
        </button>
        <button
          onClick={() => setActiveFormType('reservation')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeFormType === 'reservation'
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          Formulário de Reserva
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Standard Fields */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Campos Padrão
            </h3>
            <div className="space-y-3">
              <FieldToggle
                label="Telefone"
                enabled={currentFormConfig.fields.phone.enabled}
                required={currentFormConfig.fields.phone.required}
                onEnabledChange={(enabled) =>
                  handleFieldToggle('phone', enabled)
                }
                onRequiredChange={(required) =>
                  handleRequiredToggle('phone', required)
                }
              />
              <FieldToggle
                label="Email"
                enabled={currentFormConfig.fields.email.enabled}
                required={currentFormConfig.fields.email.required}
                onEnabledChange={(enabled) =>
                  handleFieldToggle('email', enabled)
                }
                onRequiredChange={(required) =>
                  handleRequiredToggle('email', required)
                }
              />
              <FieldToggle
                label="Número de Pessoas"
                enabled={currentFormConfig.fields.partySize.enabled}
                required={currentFormConfig.fields.partySize.required}
                onEnabledChange={(enabled) =>
                  handleFieldToggle('partySize', enabled)
                }
                onRequiredChange={(required) =>
                  handleRequiredToggle('partySize', required)
                }
              />
              <FieldToggle
                label="Observações"
                enabled={currentFormConfig.fields.notes.enabled}
                required={currentFormConfig.fields.notes.required}
                onEnabledChange={(enabled) =>
                  handleFieldToggle('notes', enabled)
                }
                onRequiredChange={(required) =>
                  handleRequiredToggle('notes', required)
                }
              />
            </div>
          </div>

          {/* Custom Fields */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Campos Personalizados
              </h3>
              <Button size="sm" onClick={handleAddCustomField} className="gap-2">
                <Plus className="w-4 h-4" />
                Adicionar
              </Button>
            </div>

            {sortedCustomFields.length === 0 ? (
              <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center">
                <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                  Nenhum campo personalizado
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedCustomFields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-zinc-50 dark:bg-zinc-950"
                  >
                    <div>
                      <p className="text-zinc-700 dark:text-zinc-300 font-medium">
                        {field.label}
                      </p>
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
                        <Edit2 className="w-4 h-4" />
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

        {/* Preview */}
        <div className="lg:sticky lg:top-4 h-fit">
          <FormPreview config={currentFormConfig} />
        </div>
      </div>

      <Button onClick={handleSaveFormConfig} className="w-full gap-2">
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? 'Salvo!' : 'Salvar Alterações'}
      </Button>

      <CustomFieldBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={handleSaveCustomField}
        editField={editingField}
      />
    </div>
  )
}
