import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DynamicDashboard from '@/components/dashboard/DynamicDashboard'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: business } = await getBusiness()

  // Buscar dados reais da fila
  let queueStats = {
    currentQueue: 0,
    todayAttended: 0,
    avgWaitTime: 0,
  }

  if (business?.id) {
    // Fila atual (pessoas esperando)
    const { count: currentQueue } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .eq('status', 'waiting')

    // Atendidos hoje - FILA + RESERVAS
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayStr = today.toISOString().split('T')[0]

    const { count: queueAttended } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .in('status', ['completed', 'attending'])
      .gte('joined_at', today.toISOString())

    const { count: reservationsCompleted } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .in('status', ['completed', 'seated', 'arrived'])
      .eq('reservation_date', todayStr)

    const todayAttended = (queueAttended || 0) + (reservationsCompleted || 0)

    // Tempo médio de espera - FILA + RESERVAS
    const { data: completedQueue } = await supabase
      .from('queue_entries')
      .select('joined_at, attended_at, completed_at')
      .eq('business_id', business.id)
      .in('status', ['completed', 'attending'])
      .gte('joined_at', today.toISOString())

    const { data: completedReservations } = await supabase
      .from('reservations')
      .select('created_at, updated_at')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .eq('reservation_date', todayStr)

    let avgWaitTime = 0
    let totalMinutes = 0
    let totalCount = 0

    if (completedQueue && completedQueue.length > 0) {
      const validEntries = completedQueue.filter(entry => entry.attended_at || entry.completed_at)
      validEntries.forEach(entry => {
        const joined = new Date(entry.joined_at).getTime()
        const endTime = entry.completed_at || entry.attended_at
        const ended = new Date(endTime!).getTime()
        totalMinutes += (ended - joined) / 60000
        totalCount++
      })
    }

    if (completedReservations && completedReservations.length > 0) {
      completedReservations.forEach(entry => {
        const created = new Date(entry.created_at).getTime()
        const updated = new Date(entry.updated_at).getTime()
        totalMinutes += (updated - created) / 60000
        totalCount++
      })
    }

    if (totalCount > 0) {
      avgWaitTime = Math.round(totalMinutes / totalCount)
    }

    queueStats = {
      currentQueue: currentQueue || 0,
      todayAttended,
      avgWaitTime,
    }
  }

  // Fetch queue entries for DynamicDashboard
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let queueEntries: any[] = []
  if (business?.id) {
    const { data } = await supabase
      .from('queue_entries')
      .select('id, customer_name, customer_phone, position, joined_at, status')
      .eq('business_id', business.id)
      .eq('status', 'waiting')
      .order('position', { ascending: true })
      .limit(10)

    queueEntries = data || []
  }

  // Debug log
  console.log('Dashboard Page - business:', business?.id, business?.name)

  return (
    <DashboardLayout
      userName={user.user_metadata?.name}
      userEmail={user.email}
      profilePictureUrl={business?.profile_picture_url}
    >
      <main className="p-4 lg:p-8">
        {!business && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
            <p className="text-yellow-500 text-sm">
              ⚠️ Nenhum negócio encontrado. Complete o onboarding em /onboarding
            </p>
          </div>
        )}
        <DynamicDashboard
          businessId={business?.id}
          businessName={business?.name}
          queueStats={queueStats}
          queueEntries={queueEntries}
        />
      </main>
    </DashboardLayout>
  )
}
