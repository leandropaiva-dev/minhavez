'use client'

import { useState, useEffect } from 'react'
import { Eye, Plus, Save, Check, Trash2, GripVertical, ExternalLink, Image as ImageIcon, Palette, Type, Link as LinkIconLucide } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import LinkPagePreview from './LinkPagePreview'
import AddLinkModal from './AddLinkModal'
import type { LinkPage, LinkPageLink, LinkPageTheme, BackgroundType, ButtonStyle, GradientDirection } from '@/types/linkpage.types'
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
  const [showPreview, setShowPreview] = useState(false)
  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<Partial<LinkPageLink> | null>(null)
  const [slugError, setSlugError] = useState('')

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
    } catch (error) {
      console.error('Error saving:', error)
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Editor */}
      <div className="space-y-6">
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

              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">URL do Avatar</Label>
                <Input
                  value={linkPage.avatar_url || ''}
                  onChange={(e) => setLinkPage(prev => ({ ...prev, avatar_url: e.target.value }))}
                  placeholder="https://exemplo.com/avatar.jpg"
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-zinc-700 dark:text-zinc-300">URL da Capa</Label>
                <Input
                  value={linkPage.cover_url || ''}
                  onChange={(e) => setLinkPage(prev => ({ ...prev, cover_url: e.target.value }))}
                  placeholder="https://exemplo.com/cover.jpg"
                  className="mt-2"
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
                <div>
                  <Label className="text-zinc-700 dark:text-zinc-300">URL da Imagem de Fundo</Label>
                  <Input
                    value={linkPage.background_image_url || ''}
                    onChange={(e) => setLinkPage(prev => ({ ...prev, background_image_url: e.target.value }))}
                    placeholder="https://exemplo.com/fundo.jpg"
                    className="mt-2"
                  />
                </div>
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
                        <GripVertical className="w-5 h-5" />
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
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="lg:hidden gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
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
      <div className="hidden lg:block sticky top-4 h-fit">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-zinc-400">Preview</span>
            {pageUrl && (
              <a
                href={pageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1"
              >
                {pageUrl}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="aspect-[9/16] max-h-[600px] rounded-lg overflow-hidden border border-zinc-700">
            <LinkPagePreview linkPage={linkPage as LinkPage} links={links as LinkPageLink[]} />
          </div>
        </div>
      </div>

      {/* Mobile Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 lg:hidden flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="flex justify-end mb-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
                Fechar
              </Button>
            </div>
            <div className="aspect-[9/16] rounded-lg overflow-hidden border border-zinc-700">
              <LinkPagePreview linkPage={linkPage as LinkPage} links={links as LinkPageLink[]} />
            </div>
          </div>
        </div>
      )}

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
