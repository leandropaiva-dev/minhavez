'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { LinkPageInsert, LinkPageUpdate, LinkPageLinkInsert, LinkPageLinkUpdate } from '@/types/linkpage.types'

export async function getLinkPage(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('link_pages')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching link page:', error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getLinkPageBySlug(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('link_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getLinkPageLinks(linkPageId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('link_page_links')
    .select('*')
    .eq('link_page_id', linkPageId)
    .eq('is_active', true)
    .order('position', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data || [], error: null }
}

export async function createLinkPage(data: LinkPageInsert) {
  const supabase = await createClient()

  const { data: linkPage, error } = await supabase
    .from('link_pages')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating link page:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/minha-pagina')
  return { data: linkPage, error: null }
}

export async function updateLinkPage(id: string, data: LinkPageUpdate) {
  const supabase = await createClient()

  const { data: linkPage, error } = await supabase
    .from('link_pages')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating link page:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/minha-pagina')
  if (linkPage?.slug) {
    revalidatePath(`/${linkPage.slug}`)
  }

  return { data: linkPage, error: null }
}

export async function createLink(data: LinkPageLinkInsert) {
  const supabase = await createClient()

  // Get max position
  const { data: maxPos } = await supabase
    .from('link_page_links')
    .select('position')
    .eq('link_page_id', data.link_page_id)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = (maxPos?.position ?? -1) + 1

  const { data: link, error } = await supabase
    .from('link_page_links')
    .insert({ ...data, position })
    .select()
    .single()

  if (error) {
    console.error('Error creating link:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/minha-pagina')
  return { data: link, error: null }
}

export async function updateLink(id: string, data: LinkPageLinkUpdate) {
  const supabase = await createClient()

  const { data: link, error } = await supabase
    .from('link_page_links')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating link:', error)
    return { data: null, error: error.message }
  }

  revalidatePath('/dashboard/minha-pagina')
  return { data: link, error: null }
}

export async function deleteLink(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('link_page_links')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting link:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/minha-pagina')
  return { error: null }
}

export async function reorderLinks(linkPageId: string, linkIds: string[]) {
  const supabase = await createClient()

  const updates = linkIds.map((id, index) =>
    supabase
      .from('link_page_links')
      .update({ position: index })
      .eq('id', id)
  )

  await Promise.all(updates)

  revalidatePath('/dashboard/minha-pagina')
  return { error: null }
}

export async function incrementLinkClick(linkId: string) {
  const supabase = await createClient()

  await supabase.rpc('increment_link_click', { p_link_id: linkId })
}

export async function checkSlugAvailable(slug: string, excludeId?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('link_pages')
    .select('id')
    .eq('slug', slug)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data } = await query.single()

  return !data
}
