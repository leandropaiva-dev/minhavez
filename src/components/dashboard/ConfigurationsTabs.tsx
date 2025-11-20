'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, Check } from 'lucide-react'
import FieldToggle from '../onboarding/form-config/FieldToggle'
import CustomFieldBuilder from '../onboarding/form-config/CustomFieldBuilder'
import FormPreview from '../onboarding/form-config/FormPreview'
import SegmentConfigStep from '../onboarding/steps/SegmentConfigStep'
import {
  getQueueFormConfig,
  saveQueueFormConfig,
  getSegmentConfig,
  saveSegmentConfig,
  getDefaultQueueFormConfig,
  getOnboardingProgress,
} from '@/lib/config/storage'
import type { QueueFormConfig, CustomField, SegmentConfig } from '@/types/config.types'
import { Plus, Pencil, Trash2 } from 'lucide-react'

export default function ConfigurationsTabs() {
  const [activeTab, setActiveTab] = useState('basic')
  const [saved, setSaved] = useState(false)

  // Basic Info State
  const [basicInfo, setBasicInfo] = useState({
    name: '',
    phone: '',
    address: '',
  })

  // Form Config State
  const [formConfig, setFormConfig] = useState<QueueFormConfig>(
    getDefaultQueueFormConfig()
  )
  const [builderOpen, setBuilderOpen] = useState(false)
  const [editingField, setEditingField] = useState<CustomField | undefined>()

  // Segment Config State
  const [segmentConfig, setSegmentConfig] = useState<SegmentConfig | null>(null)

  useEffect(() => {
    // Load saved configs
    const savedFormConfig = getQueueFormConfig()
    if (savedFormConfig) {
      setFormConfig(savedFormConfig)
    }

    const savedSegmentConfig = getSegmentConfig()
    if (savedSegmentConfig) {
      setSegmentConfig(savedSegmentConfig)
    }

    const onboardingProgress = getOnboardingProgress()
    if (onboardingProgress?.basicInfo) {
      setBasicInfo(onboardingProgress.basicInfo)
    }
  }, [])

  const handleSaveBasicInfo = () => {
    // Save to localStorage (in a real app, this would go to Supabase)
    const progress = getOnboardingProgress() || { currentStep: 0 }
    progress.basicInfo = basicInfo
    localStorage.setItem('minhavez_onboarding_progress', JSON.stringify(progress))

    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveFormConfig = () => {
    saveQueueFormConfig(formConfig)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleSaveSegmentConfig = (config: SegmentConfig) => {
    saveSegmentConfig(config)
    setSegmentConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Form config handlers
  const handleFieldToggle = (
    field: keyof QueueFormConfig['fields'],
    enabled: boolean
  ) => {
    setFormConfig({
      ...formConfig,
      fields: {
        ...formConfig.fields,
        [field]: { ...formConfig.fields[field], enabled },
      },
    })
  }

  const handleRequiredToggle = (
    field: keyof QueueFormConfig['fields'],
    required: boolean
  ) => {
    setFormConfig({
      ...formConfig,
      fields: {
        ...formConfig.fields,
        [field]: { ...formConfig.fields[field], required },
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
    setFormConfig({
      ...formConfig,
      customFields: formConfig.customFields.filter((f) => f.id !== fieldId),
    })
  }

  const handleSaveCustomField = (field: CustomField) => {
    if (editingField) {
      setFormConfig({
        ...formConfig,
        customFields: formConfig.customFields.map((f) =>
          f.id === field.id ? field : f
        ),
      })
    } else {
      setFormConfig({
        ...formConfig,
        customFields: [
          ...formConfig.customFields,
          { ...field, order: formConfig.customFields.length },
        ],
      })
    }
  }

  const sortedCustomFields = [...formConfig.customFields].sort(
    (a, b) => a.order - b.order
  )

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
          <TabsTrigger value="form">Formulário</TabsTrigger>
          <TabsTrigger value="segment">Segmento</TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-zinc-300">
                Nome do Estabelecimento
              </Label>
              <Input
                id="name"
                value={basicInfo.name}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, name: e.target.value })
                }
                placeholder="Ex: Restaurante Sabor & Cia"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-zinc-300">
                Telefone
              </Label>
              <Input
                id="phone"
                value={basicInfo.phone}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, phone: e.target.value })
                }
                placeholder="(11) 98765-4321"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="address" className="text-zinc-300">
                Endereço
              </Label>
              <Input
                id="address"
                value={basicInfo.address}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, address: e.target.value })
                }
                placeholder="Rua, Número, Bairro, Cidade"
                className="mt-2"
              />
            </div>
          </div>

          <Button onClick={handleSaveBasicInfo} className="w-full gap-2">
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Salvo!' : 'Salvar Alterações'}
          </Button>
        </TabsContent>

        {/* Form Config Tab */}
        <TabsContent value="form" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Standard Fields */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Campos Padrão
                </h3>
                <div className="space-y-3">
                  <FieldToggle
                    label="Telefone"
                    enabled={formConfig.fields.phone.enabled}
                    required={formConfig.fields.phone.required}
                    onEnabledChange={(enabled) =>
                      handleFieldToggle('phone', enabled)
                    }
                    onRequiredChange={(required) =>
                      handleRequiredToggle('phone', required)
                    }
                  />
                  <FieldToggle
                    label="Email"
                    enabled={formConfig.fields.email.enabled}
                    required={formConfig.fields.email.required}
                    onEnabledChange={(enabled) =>
                      handleFieldToggle('email', enabled)
                    }
                    onRequiredChange={(required) =>
                      handleRequiredToggle('email', required)
                    }
                  />
                  <FieldToggle
                    label="Número de Pessoas"
                    enabled={formConfig.fields.partySize.enabled}
                    required={formConfig.fields.partySize.required}
                    onEnabledChange={(enabled) =>
                      handleFieldToggle('partySize', enabled)
                    }
                    onRequiredChange={(required) =>
                      handleRequiredToggle('partySize', required)
                    }
                  />
                  <FieldToggle
                    label="Observações"
                    enabled={formConfig.fields.notes.enabled}
                    required={formConfig.fields.notes.required}
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
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Campos Personalizados
                  </h3>
                  <Button size="sm" onClick={handleAddCustomField} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar
                  </Button>
                </div>

                {sortedCustomFields.length === 0 ? (
                  <div className="border border-dashed border-zinc-700 rounded-lg p-8 text-center">
                    <p className="text-zinc-500 text-sm">
                      Nenhum campo personalizado
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
                          <p className="text-zinc-300 font-medium">
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

            {/* Preview */}
            <div className="lg:sticky lg:top-4 h-fit">
              <FormPreview config={formConfig} />
            </div>
          </div>

          <Button onClick={handleSaveFormConfig} className="w-full gap-2">
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Salvo!' : 'Salvar Alterações'}
          </Button>
        </TabsContent>

        {/* Segment Config Tab */}
        <TabsContent value="segment">
          {segmentConfig ? (
            <SegmentConfigStep
              onNext={handleSaveSegmentConfig}
              onBack={() => {}}
              initialData={segmentConfig}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-zinc-400">
                Complete o onboarding primeiro para configurar seu segmento
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CustomFieldBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={handleSaveCustomField}
        editField={editingField}
      />
    </div>
  )
}
