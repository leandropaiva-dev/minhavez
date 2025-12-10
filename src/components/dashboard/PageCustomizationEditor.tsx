'use client'

import { useState, useEffect } from 'react'
import { Save, Check, Smartphone, Monitor } from 'react-feather'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import ImageUploader from '@/components/linkpage/ImageUploader'
import type { PageCustomization, PageType } from '@/types/page-customization.types'
import { DEFAULT_PAGE_CUSTOMIZATION } from '@/types/page-customization.types'

interface PageCustomizationEditorProps {
  businessId: string
  pageType: PageType
  title: string
  description: string
}

const BORDER_RADIUS_OPTIONS = [
  { value: 'sm', label: 'Pequeno' },
  { value: 'md', label: 'Médio' },
  { value: 'lg', label: 'Grande' },
  { value: 'xl', label: 'Extra Grande' },
  { value: '2xl', label: 'Muito Grande' },
]

const BUTTON_STYLE_OPTIONS = [
  { value: 'rounded', label: 'Arredondado' },
  { value: 'pill', label: 'Pílula' },
  { value: 'square', label: 'Quadrado' },
]

const DEFAULT_VALUES = DEFAULT_PAGE_CUSTOMIZATION

export default function PageCustomizationEditor({
  businessId,
  pageType,
  title,
  description,
}: PageCustomizationEditorProps) {
  const [customization, setCustomization] = useState<Partial<PageCustomization>>(DEFAULT_VALUES)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile')

  useEffect(() => {
    loadCustomization()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId, pageType])

  const loadCustomization = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('page_customizations')
      .select('*')
      .eq('business_id', businessId)
      .eq('page_type', pageType)
      .single()

    if (data) {
      setCustomization(data)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()

      const payload = {
        business_id: businessId,
        page_type: pageType,
        ...customization,
        updated_at: new Date().toISOString(),
      }

      console.log('[PageCustomization] Saving:', { pageType, businessId, payload })

      if (customization.id) {
        const { data, error } = await supabase
          .from('page_customizations')
          .update(payload)
          .eq('id', customization.id)
          .select()

        console.log('[PageCustomization] Update result:', { data, error })

        if (error) {
          console.error('[PageCustomization] Update error:', error)
          alert('Erro ao salvar: ' + error.message)
          return
        }
      } else {
        const { data, error } = await supabase
          .from('page_customizations')
          .insert(payload)
          .select()
          .single()

        console.log('[PageCustomization] Insert result:', { data, error })

        if (error) {
          console.error('[PageCustomization] Insert error:', error)
          alert('Erro ao criar: ' + error.message)
          return
        }

        if (data) {
          setCustomization(data)
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('[PageCustomization] Exception:', error)
      alert('Erro inesperado: ' + (error as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const getBackgroundStyle = () => {
    if (customization.background_type === 'image' && customization.background_image_url) {
      return {
        backgroundImage: `url(${customization.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    if (customization.background_type === 'gradient') {
      return {
        background: `linear-gradient(${customization.background_gradient_direction || 'to bottom'}, ${customization.background_gradient_start || '#000'}, ${customization.background_gradient_end || '#333'})`,
      }
    }
    return { backgroundColor: customization.background_color || '#000000' }
  }

  const getButtonStyle = () => {
    const base = {
      backgroundColor: customization.button_color || '#3b82f6',
      color: customization.button_text_color || '#ffffff',
    }
    switch (customization.button_style) {
      case 'pill': return { ...base, borderRadius: '9999px' }
      case 'square': return { ...base, borderRadius: '4px' }
      default: return { ...base, borderRadius: '8px' }
    }
  }

  const getCardRadius = () => {
    switch (customization.card_border_radius) {
      case 'sm': return '0.25rem'
      case 'md': return '0.375rem'
      case 'lg': return '0.5rem'
      case 'xl': return '0.75rem'
      case '2xl': return '1rem'
      default: return '0.75rem'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-6">
          <Tabs defaultValue="branding" className="w-full">
            <TabsList className={`grid w-full ${(pageType === 'queue_completed' || pageType === 'reservation_confirm') ? 'grid-cols-4' : 'grid-cols-3'} mb-4`}>
              <TabsTrigger value="branding">Marca</TabsTrigger>
              <TabsTrigger value="colors">Cores</TabsTrigger>
              <TabsTrigger value="style">Estilo</TabsTrigger>
              {(pageType === 'queue_completed' || pageType === 'reservation_confirm') && (
                <TabsTrigger value="review">Review</TabsTrigger>
              )}
            </TabsList>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
                <ImageUploader
                  label="Logo"
                  value={customization.logo_url || null}
                  onChange={(url) => setCustomization(prev => ({ ...prev, logo_url: url }))}
                  businessId={businessId}
                  folder="page-logos"
                  aspectRatio="aspect-square"
                  maxWidth="max-w-[120px]"
                />

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300">Mostrar nome do negócio</Label>
                    <p className="text-xs text-zinc-500">Exibe o nome abaixo do logo</p>
                  </div>
                  <Switch
                    checked={customization.show_business_name ?? true}
                    onCheckedChange={(checked) => setCustomization(prev => ({ ...prev, show_business_name: checked }))}
                  />
                </div>

                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">Título personalizado</Label>
                  <Input
                    value={customization.custom_title || ''}
                    onChange={(e) => setCustomization(prev => ({ ...prev, custom_title: e.target.value }))}
                    placeholder="Ex: Entre na nossa fila"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">Subtítulo</Label>
                  <Input
                    value={customization.custom_subtitle || ''}
                    onChange={(e) => setCustomization(prev => ({ ...prev, custom_subtitle: e.target.value }))}
                    placeholder="Ex: Preencha seus dados abaixo"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300">Mostrar &quot;Powered by&quot;</Label>
                    <p className="text-xs text-zinc-500">Exibe o rodapé MinhaVez</p>
                  </div>
                  <Switch
                    checked={customization.show_powered_by ?? true}
                    onCheckedChange={(checked) => setCustomization(prev => ({ ...prev, show_powered_by: checked }))}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300 mb-2 block">Tipo de Fundo</Label>
                  <div className="flex gap-2">
                    {['solid', 'gradient', 'image'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setCustomization(prev => ({ ...prev, background_type: type as 'solid' | 'gradient' | 'image' }))}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          customization.background_type === type
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {type === 'solid' ? 'Sólido' : type === 'gradient' ? 'Gradiente' : 'Imagem'}
                      </button>
                    ))}
                  </div>
                </div>

                {customization.background_type === 'solid' && (
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300">Cor de Fundo</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={customization.background_color || '#000000'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, background_color: e.target.value }))}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input
                        value={customization.background_color || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, background_color: e.target.value }))}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                )}

                {customization.background_type === 'gradient' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300 text-xs">Cor Inicial</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={customization.background_gradient_start || '#1e3a8a'}
                          onChange={(e) => setCustomization(prev => ({ ...prev, background_gradient_start: e.target.value }))}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <Input
                          value={customization.background_gradient_start || ''}
                          onChange={(e) => setCustomization(prev => ({ ...prev, background_gradient_start: e.target.value }))}
                          className="text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300 text-xs">Cor Final</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={customization.background_gradient_end || '#7c3aed'}
                          onChange={(e) => setCustomization(prev => ({ ...prev, background_gradient_end: e.target.value }))}
                          className="w-10 h-8 rounded cursor-pointer"
                        />
                        <Input
                          value={customization.background_gradient_end || ''}
                          onChange={(e) => setCustomization(prev => ({ ...prev, background_gradient_end: e.target.value }))}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {customization.background_type === 'image' && (
                  <ImageUploader
                    label="Imagem de Fundo"
                    value={customization.background_image_url || null}
                    onChange={(url) => setCustomization(prev => ({ ...prev, background_image_url: url }))}
                    businessId={businessId}
                    folder="page-backgrounds"
                    aspectRatio="aspect-video"
                    maxWidth="max-w-full"
                  />
                )}

                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">Cor do Texto</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={customization.text_color || '#ffffff'}
                      onChange={(e) => setCustomization(prev => ({ ...prev, text_color: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customization.text_color || ''}
                      onChange={(e) => setCustomization(prev => ({ ...prev, text_color: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">Cor Primária (acentos)</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={customization.primary_color || '#3b82f6'}
                      onChange={(e) => setCustomization(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={customization.primary_color || ''}
                      onChange={(e) => setCustomization(prev => ({ ...prev, primary_color: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Style Tab */}
            <TabsContent value="style" className="space-y-4">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300 mb-2 block">Estilo do Botão</Label>
                  <div className="flex gap-2">
                    {BUTTON_STYLE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setCustomization(prev => ({ ...prev, button_style: opt.value as 'rounded' | 'pill' | 'square' }))}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                          customization.button_style === opt.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300 text-xs">Cor do Botão</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={customization.button_color || '#3b82f6'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, button_color: e.target.value }))}
                        className="w-10 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={customization.button_color || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, button_color: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300 text-xs">Cor do Texto do Botão</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={customization.button_text_color || '#ffffff'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, button_text_color: e.target.value }))}
                        className="w-10 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={customization.button_text_color || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, button_text_color: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300 mb-2 block">Arredondamento do Card</Label>
                  <div className="flex gap-2 flex-wrap">
                    {BORDER_RADIUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setCustomization(prev => ({ ...prev, card_border_radius: opt.value as 'sm' | 'md' | 'lg' | 'xl' | '2xl' }))}
                        className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                          customization.card_border_radius === opt.value
                            ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300 text-xs">Fundo do Card</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={customization.card_background || '#18181b'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, card_background: e.target.value }))}
                        className="w-10 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={customization.card_background || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, card_background: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300 text-xs">Borda do Card</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="color"
                        value={customization.card_border_color || '#27272a'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, card_border_color: e.target.value }))}
                        className="w-10 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={customization.card_border_color || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, card_border_color: e.target.value }))}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Review/Feedback Tab (only for completion pages) */}
            {(pageType === 'queue_completed' || pageType === 'reservation_confirm') && (
              <TabsContent value="review" className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4">
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300">Mensagem de Agradecimento</Label>
                    <textarea
                      value={customization.thank_you_message || ''}
                      onChange={(e) => setCustomization(prev => ({ ...prev, thank_you_message: e.target.value }))}
                      placeholder="Obrigado por nos visitar! Esperamos vê-lo novamente em breve."
                      className="w-full mt-2 p-3 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-black text-zinc-900 dark:text-white text-sm min-h-[80px]"
                    />
                    <p className="text-xs text-zinc-500 mt-1">Mensagem personalizada exibida após conclusão</p>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-3">Link de Avaliação/Review</h4>

                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300 text-sm">URL da Avaliação</Label>
                      <Input
                        value={customization.review_link || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, review_link: e.target.value }))}
                        placeholder="https://g.page/r/..."
                        className="mt-2"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Ex: Google Reviews, Facebook, TripAdvisor</p>
                    </div>

                    <div className="mt-3">
                      <Label className="text-zinc-700 dark:text-zinc-300 text-sm">Texto do Botão</Label>
                      <Input
                        value={customization.review_button_text || 'Avaliar Atendimento'}
                        onChange={(e) => setCustomization(prev => ({ ...prev, review_button_text: e.target.value }))}
                        placeholder="Avaliar Atendimento"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-3">Call-to-Action Adicional</h4>

                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300 text-sm">URL do CTA</Label>
                      <Input
                        value={customization.cta_link || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, cta_link: e.target.value }))}
                        placeholder="https://instagram.com/..."
                        className="mt-2"
                      />
                      <p className="text-xs text-zinc-500 mt-1">Link para Instagram, WhatsApp, site, etc.</p>
                    </div>

                    <div className="mt-3">
                      <Label className="text-zinc-700 dark:text-zinc-300 text-sm">Texto do Botão CTA</Label>
                      <Input
                        value={customization.cta_button_text || ''}
                        onChange={(e) => setCustomization(prev => ({ ...prev, cta_button_text: e.target.value }))}
                        placeholder="Siga-nos no Instagram"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-white mb-3">Redirecionamento Automático</h4>

                    <div className="flex items-center gap-2 mb-3">
                      <Switch
                        checked={customization.auto_redirect_enabled || false}
                        onCheckedChange={(checked) => setCustomization(prev => ({ ...prev, auto_redirect_enabled: checked }))}
                      />
                      <Label className="text-zinc-700 dark:text-zinc-300 text-sm">Ativar redirecionamento automático</Label>
                    </div>

                    {customization.auto_redirect_enabled && (
                      <>
                        <div>
                          <Label className="text-zinc-700 dark:text-zinc-300 text-sm">URL de Destino</Label>
                          <Input
                            value={customization.auto_redirect_url || ''}
                            onChange={(e) => setCustomization(prev => ({ ...prev, auto_redirect_url: e.target.value }))}
                            placeholder="https://seusite.com"
                            className="mt-2"
                          />
                        </div>

                        <div className="mt-3">
                          <Label className="text-zinc-700 dark:text-zinc-300 text-sm">Delay (segundos)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="30"
                            value={customization.auto_redirect_delay || 5}
                            onChange={(e) => setCustomization(prev => ({ ...prev, auto_redirect_delay: parseInt(e.target.value) || 5 }))}
                            className="mt-2"
                          />
                          <p className="text-xs text-zinc-500 mt-1">Tempo antes de redirecionar (1-30 segundos)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Save Button */}
          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-4 h-fit">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Preview</span>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewDevice === 'mobile'
                      ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md transition-colors ${
                    previewDevice === 'desktop'
                      ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="flex justify-center">
              <div
                className={`${previewDevice === 'mobile' ? 'w-[280px]' : 'w-full'} rounded-xl overflow-hidden border border-zinc-300 dark:border-zinc-700`}
                style={{ height: previewDevice === 'mobile' ? '500px' : '350px' }}
              >
                <div className="h-full overflow-auto" style={getBackgroundStyle()}>
                  <div className="min-h-full flex flex-col items-center justify-center p-4">
                    {/* Logo & Title */}
                    <div className="text-center mb-6">
                      {customization.logo_url && (
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={customization.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {customization.show_business_name && (
                        <h1 className="text-xl font-bold" style={{ color: customization.text_color }}>
                          Nome do Negócio
                        </h1>
                      )}
                      {customization.custom_title && (
                        <p className="text-lg font-medium mt-1" style={{ color: customization.text_color }}>
                          {customization.custom_title}
                        </p>
                      )}
                      {customization.custom_subtitle && (
                        <p className="text-sm opacity-70 mt-1" style={{ color: customization.text_color }}>
                          {customization.custom_subtitle}
                        </p>
                      )}
                    </div>

                    {/* Card Preview */}
                    <div
                      className="w-full max-w-sm p-4"
                      style={{
                        backgroundColor: customization.card_background,
                        borderColor: customization.card_border_color,
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        borderRadius: getCardRadius(),
                      }}
                    >
                      <div className="space-y-3">
                        <div className="h-10 rounded bg-white/10" />
                        <div className="h-10 rounded bg-white/10" />
                        <button
                          className="w-full py-2.5 font-medium text-sm"
                          style={getButtonStyle()}
                        >
                          Botão de Ação
                        </button>
                      </div>
                    </div>

                    {/* Powered By */}
                    {customization.show_powered_by && (
                      <p className="text-xs mt-4 opacity-50" style={{ color: customization.text_color }}>
                        Powered by MinhaVez
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
