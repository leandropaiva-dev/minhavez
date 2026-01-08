import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QueueFormWrapper from '@/components/queue/QueueFormWrapper'
import PublicHeader from '@/components/public/PublicHeader'
import PageTracker from '@/components/analytics/PageTracker'
import { getBusinessCustomization } from '@/lib/customization/actions'

interface PageProps {
  params: Promise<{
    businessId: string
  }>
}

export default async function QueuePage({ params }: PageProps) {
  const { businessId } = await params
  const supabase = await createClient()

  // Busca informações do negócio
  const { data: business, error } = await supabase
    .from('businesses')
    .select('id, name, business_type, address, is_queue_open')
    .eq('id', businessId)
    .single()

  if (error || !business) {
    notFound()
  }

  // Busca customização (capa, perfil, contatos)
  const { data: customization } = await getBusinessCustomization(businessId)

  // Verifica se a fila está aberta (toggle manual)
  const isQueueOpen = business.is_queue_open ?? true

  // Verifica se está dentro do horário configurado
  const now = new Date()
  const { data: isTimeOpen } = await supabase
    .rpc('is_queue_time_open', {
      p_business_id: businessId,
      p_datetime: now.toISOString()
    })

  const isOpenBySchedule = isTimeOpen ?? true
  const isTotallyOpen = isQueueOpen && isOpenBySchedule

  // Conta quantas pessoas na fila
  const { count } = await supabase
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'waiting')

  const queueLength = count || 0
  const estimatedWaitTime = queueLength * 15 // 15 min por pessoa

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <PageTracker businessId={businessId} pageType="queue" pagePath={`/fila/${businessId}`} />

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

      {/* Main Content - 2 Colunas (mobile: 1 col, desktop: 2 cols) */}
      <div className="max-w-7xl mx-auto px-1.5 sm:px-6 lg:px-8 py-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full sm:w-10/12 mx-auto">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Card de Status da Fila */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Pessoas na fila
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white">
                    {queueLength}
                  </p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Tempo estimado
                  </p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400">
                    {estimatedWaitTime}<span className="text-base sm:text-lg">min</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8">
              {!isTotallyOpen && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <p className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    {!isQueueOpen ? 'Fila temporariamente fechada' : 'Fora do horário de atendimento'}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {!isQueueOpen ? 'A fila será reaberta em breve.' : 'Volte durante o horário de funcionamento.'}
                  </p>
                </div>
              )}

              {isTotallyOpen && (
                <QueueFormWrapper businessId={businessId} businessName={business.name} />
              )}
            </div>
          </div>

          {/* Coluna Direita - Resumo (Desktop sticky, Mobile no final) */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">
                Informações
              </h3>

              <div className="space-y-4 text-sm">
                {customization?.address && customization?.show_address && (
                  <div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Localização</p>
                    <p className="text-zinc-900 dark:text-white">{customization.address}</p>
                  </div>
                )}

                <div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Status da Fila</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isTotallyOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                    <p className="text-zinc-900 dark:text-white">
                      {isTotallyOpen ? 'Aberta' : 'Fechada'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Tempo de Espera</p>
                  <p className="text-zinc-900 dark:text-white font-semibold text-lg">
                    ~{estimatedWaitTime} minutos
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
                Você receberá atualizações sobre sua posição na fila.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
