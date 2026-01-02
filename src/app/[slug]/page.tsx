import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LinkPageContent from '@/components/linkpage/LinkPageContent'
import PublicHeader from '@/components/public/PublicHeader'
import PageTracker from '@/components/analytics/PageTracker'
import { getBusinessCustomization } from '@/lib/customization/actions'
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

  // Busca info do business para usar o novo header unificado
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', linkPage.business_id)
    .single()

  if (!business) {
    notFound()
  }

  // Busca customização (capa, perfil, contatos)
  const { data: customization } = await getBusinessCustomization(business.id)

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PageTracker businessId={business.id} pageType="links" pagePath={`/${slug}`} />

      {/* Header com Capa + Avatar + Contatos */}
      <PublicHeader
        businessName={business.name}
        coverPhotoUrl={customization?.cover_photo_url}
        profilePhotoUrl={customization?.profile_picture_url}
        phone={customization?.phone}
        email={customization?.email}
        instagramUrl={customization?.instagram_url}
        websiteUrl={customization?.website_url}
        address={customization?.address}
        showPhone={customization?.show_phone}
        showEmail={customization?.show_email}
        showInstagram={customization?.show_instagram}
        showWebsite={customization?.show_website}
        showAddress={customization?.show_address}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <LinkPageContent
          linkPage={linkPage}
          links={links || []}
          businessId={business.id}
          enableTracking={true}
        />
      </div>
    </div>
  )
}
