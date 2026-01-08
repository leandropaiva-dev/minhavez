import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import NewReservationWrapper from '@/components/reservation/NewReservationWrapper'
import PublicHeader from '@/components/public/PublicHeader'
import PageTracker from '@/components/analytics/PageTracker'
import { getBusinessCustomization } from '@/lib/customization/actions'

interface PageProps {
  params: Promise<{
    businessId: string
  }>
}

export default async function ReservationPage({ params }: PageProps) {
  const { businessId } = await params
  const supabase = await createClient()

  // Busca informações do negócio
  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, business_type, address, is_reservation_open')
    .eq('id', businessId)
    .single()

  if (error || !business) {
    notFound()
  }

  // Busca customização (capa, perfil, contatos)
  const { data: customization } = await getBusinessCustomization(businessId)

  // Verifica apenas se as reservas estão abertas (toggle manual)
  const isReservationOpen = business.is_reservation_open ?? true

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PageTracker businessId={businessId} pageType="reservation" pagePath={`/reserva/${businessId}`} />

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-10/12 mx-auto">
          {isReservationOpen ? (
            <NewReservationWrapper businessId={businessId} businessName={business.name} />
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Reservas Temporariamente Fechadas
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              As reservas serão reabertas em breve. Tente novamente mais tarde.
            </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
