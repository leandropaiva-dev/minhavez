'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, Check, Trash2, MoreVertical, ExternalLink, Image as ImageIcon, Sliders as Palette, Type, Link as LinkIconLucide, Smartphone, Tablet, Monitor } from 'react-feather'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import LinkPagePreview from './LinkPagePreview'
import AddLinkModal from './AddLinkModal'
import ImageUploader from './ImageUploader'
import type { LinkPage, LinkPageLink, LinkPageTheme, BackgroundType, ButtonStyle, GradientDirection, BackgroundImageSize } from '@/types/linkpage.types'
import { LINK_PAGE_THEMES } from '@/types/linkpage.types'

interface LinkPageEditorProps {
  businessId: string
  businessName: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialLinkPage: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialLinks: any[]
}

export default function LinkPageEditor({
  businessId,
  businessName,
  initialLinkPage,
  initialLinks,
}: LinkPageEditorProps) {
  const [linkPage, setLinkPage] = useState<Partial<LinkPage>>(
    initialLinkPage || {
      business_id: businessId,
      slug: businessName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      title: businessName,
      bio: '',
      background_type: 'solid' as BackgroundType,
      background_color: '#0a0a0a',
      button_style: 'rounded' as ButtonStyle,
      button_color: '#3b82f6',
      button_text_color: '#ffffff',
      text_color: '#ffffff',
      social_links: {},
      is_published: true,
    }
  )

  const [links, setLinks] = useState<Partial<LinkPageLink>[]>(initialLinks || [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Partial<LinkPageLink> | null>(null)
  const [slugError, setSlugError] = useState('')
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile')

  // Generate slug from business name on first load
  useEffect(() => {
    if (!initialLinkPage && businessName) {
      const slug = businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      setLinkPage(prev => ({ ...prev, slug }))
    }
  }, [businessName, initialLinkPage])

  const handleSave = async () => {
    setSaving(true)
    setSlugError('')

    const supabase = createClient()

    try {
      // Validate slug
      if (!linkPage.slug || linkPage.slug.length < 3) {
        setSlugError('O slug deve ter pelo menos 3 caracteres')
        setSaving(false)
        return
      }

      // Check slug availability
      const { data: existingSlug } = await supabase
        .from('link_pages')
        .select('id')
        .eq('slug', linkPage.slug)
        .neq('id', linkPage.id || '')
        .single()

      if (existingSlug) {
        setSlugError('Este slug já está em uso')
        setSaving(false)
        return
      }

      let pageId = linkPage.id

      if (pageId) {
        // Update
        const { error } = await supabase
          .from('link_pages')
          .update({
            ...linkPage,
            updated_at: new Date().toISOString(),
          })
          .eq('id', pageId)

        if (error) throw error
      } else {
        // Create
        const { data, error } = await supabase
          .from('link_pages')
          .insert({
            ...linkPage,
            business_id: businessId,
          })
          .select()
          .single()

        if (error) throw error
        pageId = data.id
        setLinkPage(prev => ({ ...prev, id: pageId }))
      }

      // Save links
      for (const link of links) {
        if (link.id) {
          await supabase
            .from('link_page_links')
            .update({
              title: link.title,
              url: link.url,
              icon: link.icon,
              link_type: link.link_type,
              icon_style: link.icon_style || 'default',
              icon_color: link.icon_color,
              custom_color: link.custom_color,
              custom_text_color: link.custom_text_color,
              thumbnail_url: link.thumbnail_url,
              position: link.position,
              is_active: link.is_active,
            })
            .eq('id', link.id)
        } else {
          const { data } = await supabase
            .from('link_page_links')
            .insert({
              link_page_id: pageId,
              title: link.title,
              url: link.url || '',
              icon: link.icon,
              link_type: link.link_type || 'custom',
              icon_style: link.icon_style || 'default',
              icon_color: link.icon_color,
              custom_color: link.custom_color,
              custom_text_color: link.custom_text_color,
              thumbnail_url: link.thumbnail_url,
              position: link.position || links.indexOf(link),
              is_active: link.is_active ?? true,
            })
            .select()
            .single()

          if (data) {
            setLinks(prev =>
              prev.map(l => (l === link ? { ...l, id: data.id } : l))
            )
          }
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error: unknown) {
      const err = error as { message?: string; details?: string; hint?: string }
      console.error('Error saving:', err?.message || err, err?.details, err?.hint)
      alert(`Erro ao salvar: ${err?.message || 'Erro desconhecido'}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAddLink = (link: Partial<LinkPageLink>) => {
    if (editingLink) {
      setLinks(prev =>
        prev.map(l => (l === editingLink ? { ...l, ...link } : l))
      )
    } else {
      setLinks(prev => [...prev, { ...link, position: prev.length, is_active: true }])
    }
    setEditingLink(null)
    setAddLinkOpen(false)
  }

  const handleDeleteLink = async (link: Partial<LinkPageLink>) => {
    if (link.id) {
      const supabase = createClient()
      await supabase.from('link_page_links').delete().eq('id', link.id)
    }
    setLinks(prev => prev.filter(l => l !== link))
  }

  const _handleReorder = (dragIndex: number, dropIndex: number) => {
    const newLinks = [...links]
    const [dragged] = newLinks.splice(dragIndex, 1)
    newLinks.splice(dropIndex, 0, dragged)
    setLinks(newLinks.map((l, i) => ({ ...l, position: i })))
  }

  const applyTheme = (theme: LinkPageTheme) => {
    setLinkPage(prev => ({
      ...prev,
      background_type: theme.background_type,
      background_color: theme.background_color,
      background_gradient_start: theme.background_gradient_start,
      background_gradient_end: theme.background_gradient_end,
      background_gradient_direction: theme.background_gradient_direction as GradientDirection,
      button_style: theme.button_style,
      button_color: theme.button_color,
      button_text_color: theme.button_text_color,
      text_color: theme.text_color,
    }))
  }

  const pageUrl = linkPage.slug ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${linkPage.slug}` : ''

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-6 order-2 lg:order-1">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="content" className="gap-2">
              <Type className="w-4 h-4" />
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="style" className="gap-2">
              <Palette className="w-4 h-4" />
              Estilo
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <LinkIconLucide className="w-4 h-4" />
              Links
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Informações Básicas</h3>

              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">URL da Página</Label>
                <div className="flex mt-2">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-sm">
                    minhavez.com/
                  </span>
                  <Input
                    value={linkPage.slug || ''}
                    onChange={(e) => {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      setLinkPage(prev => ({ ...prev, slug }))
                      setSlugError('')
                    }}
                    className="rounded-l-none"
                    placeholder="seu-negocio"
                  />
                </div>
                {slugError && <p className="text-red-500 text-sm mt-1">{slugError}</p>}
              </div>

              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">Título</Label>
                <Input
                  value={linkPage.title || ''}
                  onChange={(e) => setLinkPage(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nome do seu negócio"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">Bio</Label>
                <Textarea
                  value={linkPage.bio || ''}
                  onChange={(e) => setLinkPage(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Uma breve descrição..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Imagens
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  label="Avatar"
                  value={linkPage.avatar_url || null}
                  onChange={(url) => setLinkPage(prev => ({ ...prev, avatar_url: url }))}
                  businessId={businessId}
                  folder="avatars"
                  aspectRatio="aspect-square"
                  maxWidth="max-w-[150px]"
                />

                <ImageUploader
                  label="Capa"
                  value={linkPage.cover_url || null}
                  onChange={(url) => setLinkPage(prev => ({ ...prev, cover_url: url }))}
                  businessId={businessId}
                  folder="covers"
                  aspectRatio="aspect-[3/1]"
                  maxWidth="max-w-[200px]"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Redes Sociais</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">Instagram</Label>
                  <Input
                    value={linkPage.social_links?.instagram || ''}
                    onChange={(e) => setLinkPage(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, instagram: e.target.value }
                    }))}
                    placeholder="@usuario"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">WhatsApp</Label>
                  <Input
                    value={linkPage.social_links?.whatsapp || ''}
                    onChange={(e) => setLinkPage(prev => ({
                      ...prev,
                      social_links: { ...prev.social_links, whatsapp: e.target.value }
                    }))}
                    placeholder="5511999999999"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Temas Prontos</h3>
              <div className="grid grid-cols-3 gap-3">
                {LINK_PAGE_THEMES.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => applyTheme(theme)}
                    className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 transition-colors text-left"
                  >
                    <div
                      className="w-full h-12 rounded-md mb-2"
                      style={{
                        background: theme.background_type === 'gradient'
                          ? `linear-gradient(${theme.background_gradient_direction}, ${theme.background_gradient_start}, ${theme.background_gradient_end})`
                          : theme.background_color
                      }}
                    />
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Fundo</h3>

              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">Tipo de Fundo</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['solid', 'gradient', 'image'] as BackgroundType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setLinkPage(prev => ({ ...prev, background_type: type }))}
                      className={`p-2 rounded-lg border text-sm ${
                        linkPage.background_type === type
                          ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {type === 'solid' ? 'Cor Sólida' : type === 'gradient' ? 'Gradiente' : 'Imagem'}
                    </button>
                  ))}
                </div>
              </div>

              {linkPage.background_type === 'solid' && (
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">Cor de Fundo</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={linkPage.background_color || '#0a0a0a'}
                      onChange={(e) => setLinkPage(prev => ({ ...prev, background_color: e.target.value }))}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={linkPage.background_color || ''}
                      onChange={(e) => setLinkPage(prev => ({ ...prev, background_color: e.target.value }))}
                      placeholder="#0a0a0a"
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {linkPage.background_type === 'gradient' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300">Cor Inicial</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={linkPage.background_gradient_start || '#1e3a8a'}
                          onChange={(e) => setLinkPage(prev => ({ ...prev, background_gradient_start: e.target.value }))}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={linkPage.background_gradient_start || ''}
                          onChange={(e) => setLinkPage(prev => ({ ...prev, background_gradient_start: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-zinc-700 dark:text-zinc-300">Cor Final</Label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="color"
                          value={linkPage.background_gradient_end || '#7c3aed'}
                          onChange={(e) => setLinkPage(prev => ({ ...prev, background_gradient_end: e.target.value }))}
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={linkPage.background_gradient_end || ''}
                          onChange={(e) => setLinkPage(prev => ({ ...prev, background_gradient_end: e.target.value }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label className="text-zinc-700 dark:text-zinc-300">Direção</Label>
                    <select
                      value={linkPage.background_gradient_direction || 'to bottom'}
                      onChange={(e) => setLinkPage(prev => ({ ...prev, background_gradient_direction: e.target.value as GradientDirection }))}
                      className="w-full mt-2 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    >
                      <option value="to bottom">De cima para baixo</option>
                      <option value="to right">Da esquerda para direita</option>
                      <option value="to bottom right">Diagonal</option>
                      <option value="to top right">Diagonal inverso</option>
                    </select>
                  </div>
                </>
              )}

              {linkPage.background_type === 'image' && (
                <ImageUploader
                  label="Imagem de Fundo"
                  value={linkPage.background_image_url || null}
                  onChange={(url) => setLinkPage(prev => ({ ...prev, background_image_url: url }))}
                  businessId={businessId}
                  folder="backgrounds"
                  aspectRatio="aspect-[9/16]"
                  showSizeOptions
                  imageSize={(linkPage.background_image_size as BackgroundImageSize) || 'cover'}
                  onImageSizeChange={(size) => setLinkPage(prev => ({ ...prev, background_image_size: size }))}
                  maxWidth="max-w-[180px]"
                />
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Botões</h3>

              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">Estilo dos Botões</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(['rounded', 'pill', 'square'] as ButtonStyle[]).map((style) => (
                    <button
                      key={style}
                      onClick={() => setLinkPage(prev => ({ ...prev, button_style: style }))}
                      className={`p-2 rounded-lg border text-sm ${
                        linkPage.button_style === style
                          ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {style === 'rounded' ? 'Arredondado' : style === 'pill' ? 'Pílula' : 'Quadrado'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">Cor do Botão</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={linkPage.button_color || '#3b82f6'}
                      onChange={(e) => setLinkPage(prev => ({ ...prev, button_color: e.target.value }))}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={linkPage.button_color || ''}
                      onChange={(e) => setLinkPage(prev => ({ ...prev, button_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">Cor do Texto</Label>
                  <div className="flex gap-2 mt-2">
                    <input
                      type="color"
                      value={linkPage.button_text_color || '#ffffff'}
                      onChange={(e) => setLinkPage(prev => ({ ...prev, button_text_color: e.target.value }))}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={linkPage.button_text_color || ''}
                      onChange={(e) => setLinkPage(prev => ({ ...prev, button_text_color: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Texto</h3>
              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">Cor do Texto</Label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="color"
                    value={linkPage.text_color || '#ffffff'}
                    onChange={(e) => setLinkPage(prev => ({ ...prev, text_color: e.target.value }))}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={linkPage.text_color || ''}
                    onChange={(e) => setLinkPage(prev => ({ ...prev, text_color: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links" className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-zinc-900 dark:text-white">Seus Links</h3>
                <Button size="sm" onClick={() => { setEditingLink(null); setAddLinkOpen(true) }} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Adicionar
                </Button>
              </div>

              {links.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <LinkIconLucide className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum link adicionado</p>
                  <p className="text-sm">Clique em &quot;Adicionar&quot; para começar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {links.map((link, index) => (
                    <div
                      key={link.id || index}
                      className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800"
                    >
                      <button
                        className="cursor-grab text-zinc-400 hover:text-zinc-600"
                        onDragStart={() => {}}
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-zinc-900 dark:text-white truncate">{link.title}</p>
                        <p className="text-sm text-zinc-500 truncate">{link.url || `[${link.link_type}]`}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingLink(link); setAddLinkOpen(true) }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteLink(link)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Salvo!' : saving ? 'Salvando...' : 'Salvar'}
          </Button>
          {linkPage.id && pageUrl && (
            <Button variant="outline" asChild className="gap-2">
              <a href={pageUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Ver Página
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="order-1 lg:order-2 lg:sticky lg:top-4 h-fit">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800">
          {/* Header with device selector */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Preview</span>
            <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-md transition-colors ${
                  previewDevice === 'mobile'
                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                title="Celular"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-md transition-colors ${
                  previewDevice === 'tablet'
                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-md transition-colors ${
                  previewDevice === 'desktop'
                    ? 'bg-white dark:bg-zinc-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Link to page */}
          {pageUrl && (
            <div className="mb-3 text-center">
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 inline-flex items-center gap-1"
              >
                <span className="truncate max-w-[180px]">{linkPage.slug}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            </div>
          )}

          {/* Device Mockup */}
          <div className="flex justify-center">
            {/* Mobile Mockup */}
            {previewDevice === 'mobile' && (
              <div className="relative">
                {/* Phone frame */}
                <div className="relative bg-zinc-900 rounded-[2.5rem] p-2 shadow-xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-zinc-900 rounded-b-2xl z-10" />
                  {/* Screen */}
                  <div className="relative bg-black rounded-[2rem] overflow-hidden w-[240px] h-[520px]">
                    {/* Status bar */}
                    <div className="absolute top-0 left-0 right-0 h-6 bg-black/50 z-20 flex items-center justify-between px-6 text-white text-[10px]">
                      <span>9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-white rounded-sm">
                          <div className="w-3 h-1 bg-white rounded-sm m-[1px]" />
                        </div>
                      </div>
                    </div>
                    {/* Content */}
                    <div className="h-full pt-6">
                      <LinkPagePreview linkPage={linkPage as LinkPage} links={links as LinkPageLink[]} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tablet Mockup */}
            {previewDevice === 'tablet' && (
              <div className="relative">
                {/* Tablet frame */}
                <div className="relative bg-zinc-900 rounded-[1.5rem] p-3 shadow-xl">
                  {/* Camera */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-700 rounded-full" />
                  {/* Screen */}
                  <div className="relative bg-black rounded-xl overflow-hidden w-[320px] h-[450px]">
                    <LinkPagePreview linkPage={linkPage as LinkPage} links={links as LinkPageLink[]} />
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Mockup */}
            {previewDevice === 'desktop' && (
              <div className="relative w-full max-w-[400px]">
                {/* Monitor frame */}
                <div className="relative bg-zinc-900 rounded-xl p-2 shadow-xl">
                  {/* Screen */}
                  <div className="relative bg-black rounded-lg overflow-hidden w-full aspect-[16/10]">
                    <LinkPagePreview linkPage={linkPage as LinkPage} links={links as LinkPageLink[]} />
                  </div>
                </div>
                {/* Stand */}
                <div className="flex flex-col items-center">
                  <div className="w-16 h-6 bg-zinc-800 rounded-b-lg" />
                  <div className="w-24 h-2 bg-zinc-700 rounded-full mt-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Link Modal */}
      <AddLinkModal
        open={addLinkOpen}
        onOpenChange={setAddLinkOpen}
        onSave={handleAddLink}
        editLink={editingLink}
        businessId={businessId}
      />
    </div>
  )
}
