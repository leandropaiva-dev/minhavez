'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Save, Check, Plus, Edit2, Trash2 } from 'react-feather'
import FieldToggle from '../onboarding/form-config/FieldToggle'
import CustomFieldBuilder from '../onboarding/form-config/CustomFieldBuilder'
import ServiceBuilder from '../onboarding/form-config/ServiceBuilder'
import FormPreview from '../onboarding/form-config/FormPreview'
import { getDefaultQueueFormConfig, getDefaultReservationFormConfig } from '@/lib/config/storage'
import { getFormConfig, saveFormConfig } from '@/lib/config/form-config-api'
import { getBusiness } from '@/lib/onboarding/actions'
import { getCurrencyFromCountry, formatCurrency } from '@/lib/utils/currency'
import type { QueueFormConfig, ReservationFormConfig, CustomField, FormFieldsConfig, ServiceOption } from '@/types/config.types'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

type FormType = 'queue' | 'reservation'

interface ConfigurationsTabsProps {
  formType?: FormType
  businessId: string
}

export default function ConfigurationsTabs({ formType = 'queue', businessId }: ConfigurationsTabsProps) {
  const activeFormType = formType
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currency, setCurrency] = useState<'BRL' | 'EUR'>('BRL')

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
  const [serviceBuilderOpen, setServiceBuilderOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceOption | undefined>()

  useEffect(() => {
    async function loadConfigs() {
      setLoading(true)
      try {
        const [queueConfig, reservationConfig, businessData] = await Promise.all([
          getFormConfig(businessId, 'queue'),
          getFormConfig(businessId, 'reservation'),
          getBusiness(),
        ])

        // Set currency from business country
        if (businessData.data?.country) {
          const businessCurrency = getCurrencyFromCountry(businessData.data.country)
          setCurrency(businessCurrency)
        }

        setQueueFormConfig({ ...queueConfig, currency } as QueueFormConfig)
        setReservationFormConfig({ ...reservationConfig, currency } as ReservationFormConfig)
      } catch (error) {
        console.error('Error loading form configs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadConfigs()
  }, [businessId])

  // Get current form config based on active type
  const currentFormConfig = activeFormType === 'queue' ? queueFormConfig : reservationFormConfig
  const setCurrentFormConfig = activeFormType === 'queue' ? setQueueFormConfig : setReservationFormConfig


  const handleSaveFormConfig = async () => {
    setSaving(true)
    try {
      const config = activeFormType === 'queue' ? queueFormConfig : reservationFormConfig
      await saveFormConfig(businessId, activeFormType, config)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving form config:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setSaving(false)
    }
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

  const handleAddService = () => {
    setEditingService(undefined)
    setServiceBuilderOpen(true)
  }

  const handleEditService = (service: ServiceOption) => {
    setEditingService(service)
    setServiceBuilderOpen(true)
  }

  const handleDeleteService = (serviceId: string) => {
    if (activeFormType === 'reservation') {
      setReservationFormConfig({
        ...reservationFormConfig,
        services: reservationFormConfig.services.filter((s) => s.id !== serviceId),
      })
    } else if (activeFormType === 'queue') {
      setQueueFormConfig({
        ...queueFormConfig,
        services: queueFormConfig.services.filter((s) => s.id !== serviceId),
      })
    }
  }

  const handleSaveService = (service: ServiceOption) => {
    if (activeFormType === 'reservation') {
      if (editingService) {
        setReservationFormConfig({
          ...reservationFormConfig,
          services: reservationFormConfig.services.map((s) =>
            s.id === service.id ? service : s
          ),
        })
      } else {
        setReservationFormConfig({
          ...reservationFormConfig,
          services: [
            ...reservationFormConfig.services,
            { ...service, order: reservationFormConfig.services.length },
          ],
        })
      }
    } else if (activeFormType === 'queue') {
      if (editingService) {
        setQueueFormConfig({
          ...queueFormConfig,
          services: queueFormConfig.services.map((s) =>
            s.id === service.id ? service : s
          ),
        })
      } else {
        setQueueFormConfig({
          ...queueFormConfig,
          services: [
            ...queueFormConfig.services,
            { ...service, order: queueFormConfig.services.length },
          ],
        })
      }
    }
  }

  const handleToggleServiceSelection = (enabled: boolean) => {
    if (activeFormType === 'reservation') {
      setReservationFormConfig({
        ...reservationFormConfig,
        enableServiceSelection: enabled,
      })
    } else if (activeFormType === 'queue') {
      setQueueFormConfig({
        ...queueFormConfig,
        enableServiceSelection: enabled,
      })
    }
  }

  const sortedCustomFields = [...currentFormConfig.customFields].sort(
    (a, b) => a.order - b.order
  )

  const sortedServices = activeFormType === 'reservation'
    ? [...(reservationFormConfig.services || [])].sort((a, b) => a.order - b.order)
    : [...(queueFormConfig.services || [])].sort((a, b) => a.order - b.order)

  const serviceSelectionEnabled = activeFormType === 'reservation'
    ? (reservationFormConfig.enableServiceSelection || false)
    : (queueFormConfig.enableServiceSelection || false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Service Selection Toggle - For both queue and reservation forms */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-1">
              Seleção de Serviços
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {activeFormType === 'queue'
                ? 'Permitir que clientes escolham serviços antes de entrar na fila (ideal para barbearias, salões, etc)'
                : 'Permitir que clientes escolham serviços antes de reservar (ideal para barbearias, salões, restaurantes com opções, etc)'}
            </p>
          </div>
          <Switch
            checked={serviceSelectionEnabled}
            onCheckedChange={handleToggleServiceSelection}
          />
        </div>

        {/* Required Toggle - Only show if service selection is enabled */}
        {serviceSelectionEnabled && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex-1">
              <Label className="text-sm font-medium text-zinc-900 dark:text-white">
                Seleção Obrigatória
              </Label>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Clientes devem escolher um serviço para continuar
              </p>
            </div>
            <Switch
              checked={activeFormType === 'reservation'
                ? reservationFormConfig.serviceSelectionRequired
                : queueFormConfig.serviceSelectionRequired}
              onCheckedChange={(checked) => {
                if (activeFormType === 'reservation') {
                  setReservationFormConfig({
                    ...reservationFormConfig,
                    serviceSelectionRequired: checked,
                  })
                } else {
                  setQueueFormConfig({
                    ...queueFormConfig,
                    serviceSelectionRequired: checked,
                  })
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Services Management - Show if service selection is enabled */}
      {serviceSelectionEnabled && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Serviços Disponíveis
            </h3>
            <Button size="sm" onClick={handleAddService} className="gap-2">
              <Plus className="w-4 h-4" />
              Adicionar Serviço
            </Button>
          </div>

          {sortedServices.length === 0 ? (
            <div className="border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-8 text-center">
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                Nenhum serviço cadastrado. Adicione serviços para permitir que clientes escolham.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sortedServices.map((service) => (
                <div
                  key={service.id}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-950"
                >
                  {service.imageUrl && (
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-zinc-900 dark:text-white font-medium">
                          {service.name}
                        </h4>
                        {service.description && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                            {service.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
                      <div className="flex gap-3">
                        {service.duration && (
                          <span>{service.duration} min</span>
                        )}
                        {service.price && (
                          <span>{formatCurrency(service.price, currency)}</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

      <Button onClick={handleSaveFormConfig} className="w-full gap-2" disabled={saving}>
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
      </Button>

      <CustomFieldBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={handleSaveCustomField}
        editField={editingField}
      />

      <ServiceBuilder
        open={serviceBuilderOpen}
        onOpenChange={setServiceBuilderOpen}
        onSave={handleSaveService}
        editService={editingService}
        currency={currency}
        businessId={businessId}
      />
    </div>
  )
}
