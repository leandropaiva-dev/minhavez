'use client'

import { useState } from 'react'
import { Plus, Save, Trash2, ExternalLink, Menu } from 'react-feather'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import LinkPageFullPreview from './LinkPageFullPreview'
import type { LinkPage, LinkPageLink } from '@/types/linkpage.types'

interface SimpleLinkPageEditorProps {
  businessId: string
  businessName: string
  initialLinkPage: Partial<LinkPage> | null
  initialLinks: Partial<LinkPageLink>[]
  coverPhotoUrl?: string | null
  profilePictureUrl?: string | null
}

export default function SimpleLinkPageEditor({
  businessId,
  businessName,
  initialLinkPage,
  initialLinks,
  coverPhotoUrl,
  profilePictureUrl,
}: SimpleLinkPageEditorProps) {
  const [linkPage, setLinkPage] = useState<Partial<LinkPage>>(
    initialLinkPage || {
      business_id: businessId,
      slug: businessName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      title: businessName,
      bio: '',
      is_published: true,
    }
  )

  const [links, setLinks] = useState<Partial<LinkPageLink>[]>(initialLinks || [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Link icons available
  const LINK_ICONS = [
    { value: 'link', label: 'Link', icon: '🔗' },
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { value: 'email', label: 'Email', icon: '📧' },
    { value: 'phone', label: 'Telefone', icon: '📞' },
    { value: 'map', label: 'Localização', icon: '📍' },
    { value: 'calendar', label: 'Agenda', icon: '📅' },
    { value: 'shopping', label: 'Loja', icon: '🛒' },
    { value: 'menu', label: 'Cardápio', icon: '🍽️' },
    { value: 'youtube', label: 'YouTube', icon: '▶️' },
    { value: 'facebook', label: 'Facebook', icon: '👥' },
    { value: 'twitter', label: 'Twitter', icon: '🐦' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  ]

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      let pageId = linkPage.id

      // Upsert link page
      if (pageId) {
        await supabase
          .from('link_pages')
          .update({
            title: linkPage.title,
            bio: linkPage.bio,
            is_published: linkPage.is_published,
          })
          .eq('id', pageId)
      } else {
        const { data, error } = await supabase
          .from('link_pages')
          .insert({
            business_id: businessId,
            slug: linkPage.slug,
            title: linkPage.title,
            bio: linkPage.bio,
            is_published: linkPage.is_published,
          })
          .select()
          .single()

        if (error) throw error
        pageId = data.id
        setLinkPage(prev => ({ ...prev, id: pageId }))
      }

      // Delete removed links
      const existingIds = links.filter(l => l.id).map(l => l.id)
      const initialIds = initialLinks.map(l => l.id)
      const deletedIds = initialIds.filter(id => !existingIds.includes(id))

      if (deletedIds.length > 0) {
        await supabase
          .from('link_page_links')
          .delete()
          .in('id', deletedIds)
      }

      // Upsert links
      for (let i = 0; i < links.length; i++) {
        const link = links[i]
        if (link.id) {
          await supabase
            .from('link_page_links')
            .update({
              title: link.title,
              url: link.url,
              icon: link.icon,
              position: i,
            })
            .eq('id', link.id)
        } else {
          await supabase
            .from('link_page_links')
            .insert({
              link_page_id: pageId,
              title: link.title,
              url: link.url,
              icon: link.icon,
              position: i,
            })
        }
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving:', error)
      alert('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const addLink = () => {
    setLinks([...links, { title: '', url: '', icon: 'link' }])
  }

  const updateLink = (index: number, field: keyof LinkPageLink, value: string) => {
    const newLinks = [...links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setLinks(newLinks)
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const moveLink = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === links.length - 1)
    ) {
      return
    }

    const newLinks = [...links]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    ;[newLinks[index], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[index]]
    setLinks(newLinks)
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Editor */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Informações Básicas
          </h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={linkPage.title || ''}
                onChange={(e) => setLinkPage({ ...linkPage, title: e.target.value })}
                placeholder="Nome do seu negócio"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                value={linkPage.bio || ''}
                onChange={(e) => setLinkPage({ ...linkPage, bio: e.target.value })}
                placeholder="Descrição breve"
              />
            </div>

            <div>
              <Label htmlFor="slug">URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">organizy.com/</span>
                <Input
                  id="slug"
                  value={linkPage.slug || ''}
                  onChange={(e) => setLinkPage({ ...linkPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="seu-link"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Links ({links.length})
            </h2>
            <Button onClick={addLink} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Link
            </Button>
          </div>

          <div className="space-y-3">
            {links.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-8">
                Nenhum link ainda. Clique em &quot;Adicionar Link&quot; para começar.
              </p>
            ) : (
              links.map((link, index) => (
                <div
                  key={index}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      className="mt-2 cursor-move text-zinc-400 hover:text-zinc-600"
                    >
                      <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Título"
                          value={link.title || ''}
                          onChange={(e) => updateLink(index, 'title', e.target.value)}
                        />
                        <select
                          value={link.icon || 'link'}
                          onChange={(e) => updateLink(index, 'icon', e.target.value)}
                          className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
                        >
                          {LINK_ICONS.map((icon) => (
                            <option key={icon.value} value={icon.value}>
                              {icon.icon} {icon.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Input
                        placeholder="https://..."
                        value={link.url || ''}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveLink(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveLink(index, 'down')}
                        disabled={index === links.length - 1}
                        className="p-1 text-zinc-400 hover:text-zinc-600 disabled:opacity-30"
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar'}
          </Button>

          {linkPage.slug && (
            <Button
              variant="outline"
              onClick={() => window.open(`/${linkPage.slug}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="lg:sticky lg:top-4 lg:self-start">
        <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Preview
          </h2>
          <div className="bg-white dark:bg-zinc-900 rounded-lg overflow-hidden h-[600px]">
            <LinkPageFullPreview
              linkPage={linkPage as LinkPage}
              links={links as LinkPageLink[]}
              businessName={businessName}
              coverPhotoUrl={coverPhotoUrl}
              profilePictureUrl={profilePictureUrl}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
