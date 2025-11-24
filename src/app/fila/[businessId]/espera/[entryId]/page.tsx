import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QueueWaitViewWithStyles from '@/components/queue/QueueWaitViewWithStyles'
import type { PageCustomization } from '@/types/page-customization.types'

interface PageProps {
  params: Promise<{
    businessId: string
    entryId: string
  }>
}

export default async function QueueWaitPage({ params }: PageProps) {
  const { businessId, entryId } = await params
  const supabase = await createClient()

  // Busca entrada na fila
  const { data: entry, error: entryError } = await supabase
    .from('queue_entries')
    .select(`
      *,
      business:businesses(name, business_type, address, phone)
    `)
    .eq('id', entryId)
    .single()

  if (entryError || !entry) {
    notFound()
  }

  // Determina o tipo de página baseado no status
  let pageType: 'queue_wait' | 'queue_attending' | 'queue_completed' = 'queue_wait'
  if (entry.status === 'called' || entry.status === 'attending') {
    pageType = 'queue_attending'
  } else if (entry.status === 'completed') {
    pageType = 'queue_completed'
  }

  // Busca customização
  const { data: customization } = await supabase
    .from('page_customizations')
    .select('*')
    .eq('business_id', businessId)
    .eq('page_type', pageType)
    .single()

  // Calcula posição atual na fila
  const { count } = await supabase
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('status', 'waiting')
    .lt('position', entry.position || 999999)

  const currentPosition = (count || 0) + 1
  const estimatedWaitTime = count ? count * 15 : 0

  return (
    <QueueWaitViewWithStyles
      entry={entry}
      currentPosition={currentPosition}
      estimatedWaitTime={estimatedWaitTime}
      customization={customization as PageCustomization | null}
    />
  )
}
