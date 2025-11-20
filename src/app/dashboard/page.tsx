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

    // Atendidos hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count: todayAttended } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', business.id)
      .in('status', ['completed', 'attending'])
      .gte('joined_at', today.toISOString())

    // Tempo médio de espera (calculado baseado em entradas concluídas hoje)
    const { data: completedToday } = await supabase
      .from('queue_entries')
      .select('joined_at, attended_at')
      .eq('business_id', business.id)
      .eq('status', 'completed')
      .gte('joined_at', today.toISOString())
      .not('attended_at', 'is', null)

    let avgWaitTime = 15 // padrão
    if (completedToday && completedToday.length > 0) {
      const totalWaitMinutes = completedToday.reduce((sum, entry) => {
        const joined = new Date(entry.joined_at).getTime()
        const attended = new Date(entry.attended_at!).getTime()
        return sum + (attended - joined) / 60000 // converter para minutos
      }, 0)
      avgWaitTime = Math.round(totalWaitMinutes / completedToday.length)
    }

    queueStats = {
      currentQueue: currentQueue || 0,
      todayAttended: todayAttended || 0,
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
