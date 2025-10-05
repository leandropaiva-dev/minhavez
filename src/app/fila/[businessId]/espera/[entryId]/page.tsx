import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import QueueWaitView from '@/components/queue/QueueWaitView'

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
    <QueueWaitView
      entry={entry}
      currentPosition={currentPosition}
      estimatedWaitTime={estimatedWaitTime}
    />
  )
}
