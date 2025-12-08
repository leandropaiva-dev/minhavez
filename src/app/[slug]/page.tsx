import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LinkPageView from '@/components/linkpage/LinkPageView'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Rotas reservadas que não devem ser tratadas como slugs de link pages
const RESERVED_ROUTES = [
  'auth',
  'dashboard',
  'fila',
  'reserva',
  'onboarding',
  'termos',
  'privacidade',
  'api',
]

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  if (RESERVED_ROUTES.includes(slug)) {
    return {}
  }

  const supabase = await createClient()
  const { data: linkPage } = await supabase
    .from('link_pages')
    .select('title, bio, seo_title, seo_description, avatar_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!linkPage) {
    return {}
  }

  return {
    title: linkPage.seo_title || linkPage.title || slug,
    description: linkPage.seo_description || linkPage.bio || undefined,
    openGraph: {
      title: linkPage.seo_title || linkPage.title || slug,
      description: linkPage.seo_description || linkPage.bio || undefined,
      images: linkPage.avatar_url ? [linkPage.avatar_url] : undefined,
    },
  }
}

export default async function LinkPageRoute({ params }: PageProps) {
  const { slug } = await params

  // Ignora rotas reservadas
  if (RESERVED_ROUTES.includes(slug)) {
    notFound()
  }

  const supabase = await createClient()

  // Busca a link page
  const { data: linkPage, error } = await supabase
    .from('link_pages')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !linkPage) {
    notFound()
  }

  // Busca os links
  const { data: links } = await supabase
    .from('link_page_links')
    .select('*')
    .eq('link_page_id', linkPage.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  // Busca info do business para links integrados
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', linkPage.business_id)
    .single()

  return (
    <LinkPageView
      linkPage={linkPage}
      links={links || []}
      businessId={business?.id}
      enableTracking={true}
    />
  )
}
