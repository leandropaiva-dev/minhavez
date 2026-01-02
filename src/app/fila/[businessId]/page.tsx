import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QueueFormWrapper from '@/components/queue/QueueFormWrapper'
import PublicHeader from '@/components/public/PublicHeader'
import Stepper from '@/components/public/Stepper'
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

      {/* Stepper - Apenas 1 step para fila */}
      <Stepper
        steps={[
          { number: 1, label: 'Entrar na Fila', completed: false, current: true },
        ]}
      />

      {/* Main Content - 2 Colunas (mobile: 1 col, desktop: 2 cols) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de Status da Fila */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Pessoas na fila
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
                    {queueLength}
                  </p>
                </div>
                <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-1">
                    Tempo estimado
                  </p>
                  <p className="text-3xl sm:text-4xl font-bold text-teal-600 dark:text-teal-400">
                    {estimatedWaitTime}<span className="text-lg">min</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Card do Formulário */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white truncate">
                    {isTotallyOpen ? 'Entrar na Fila' : 'Fila Fechada'}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">
                    {isTotallyOpen ? 'Preencha seus dados abaixo' : !isQueueOpen ? 'Temporariamente fechada' : 'Fora do horário'}
                  </p>
                </div>
              </div>

              {isTotallyOpen ? (
                <QueueFormWrapper businessId={businessId} businessName={business.name} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
