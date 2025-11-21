'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Check, X, Clock, User, Users, CheckCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import ReservationCalendar from './ReservationCalendar'
import ReservationScheduleModal from './ReservationScheduleModal'

interface Reservation {
  id: string
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  party_size: number
  reservation_date: string
  reservation_time: string
  status: string
  notes: string | null
}

interface ReservationsManagerProps {
  businessId: string
}

export default function ReservationsManager({ businessId }: ReservationsManagerProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleStatus, setScheduleStatus] = useState<string>('Sem horários configurados')
  const [stats, setStats] = useState({
    today: 0,
    confirmed: 0,
    pending: 0,
    completedToday: 0,
  })

  const fetchReservations = useCallback(async () => {
    const supabase = createClient()

    // Fetch all future reservations
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('business_id', businessId)
      .gte('reservation_date', today.toISOString().split('T')[0])
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true })

    if (data) setReservations(data)

    // Fetch stats
    const todayStr = today.toISOString().split('T')[0]

    const { count: todayCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('reservation_date', todayStr)

    const { count: confirmedCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'confirmed')
      .gte('reservation_date', todayStr)

    const { count: pendingCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'pending')
      .gte('reservation_date', todayStr)

    const { count: completedCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'completed')
      .eq('reservation_date', todayStr)

    setStats({
      today: todayCount || 0,
      confirmed: confirmedCount || 0,
      pending: pendingCount || 0,
      completedToday: completedCount || 0,
    })

    setLoading(false)
  }, [businessId])

  const fetchScheduleStatus = useCallback(async () => {
    const supabase = createClient()

    // Get current day and time
    const now = new Date()
    const dayOfWeek = now.getDay()
    const currentTime = now.toTimeString().slice(0, 5)

    // Fetch active schedules for today
    const { data: schedules } = await supabase
      .from('reservation_schedule')
      .select('*')
      .eq('business_id', businessId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .lte('start_time', currentTime)
      .gte('end_time', currentTime)

    if (schedules && schedules.length > 0) {
      setScheduleStatus('Aceitando reservas agora')
    } else {
      // Check if there are any schedules configured
      const { count } = await supabase
        .from('reservation_schedule')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('is_active', true)

      if (count && count > 0) {
        // Find next available slot
        const { data: nextSlot } = await supabase
          .from('reservation_schedule')
          .select('day_of_week, start_time')
          .eq('business_id', businessId)
          .eq('is_active', true)
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true })
          .limit(1)

        if (nextSlot && nextSlot.length > 0) {
          const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
          const dayName = days[nextSlot[0].day_of_week]
          setScheduleStatus(`Próximo: ${dayName} às ${nextSlot[0].start_time}`)
        } else {
          setScheduleStatus('Fechado no momento')
        }
      } else {
        setScheduleStatus('Sem horários configurados')
      }
    }
  }, [businessId])

  useEffect(() => {
    fetchReservations()

    const supabase = createClient()

    // Subscribe to reservations changes
    const reservationsChannel = supabase
      .channel('reservations-manager-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservations',
        filter: `business_id=eq.${businessId}`
      }, () => {
        fetchReservations()
      })
      .subscribe()

    // Subscribe to reservation_schedule changes
    const scheduleChannel = supabase
      .channel('schedule-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'reservation_schedule',
        filter: `business_id=eq.${businessId}`
      }, () => {
        fetchScheduleStatus()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(reservationsChannel)
      supabase.removeChannel(scheduleChannel)
    }
  }, [businessId, fetchReservations, fetchScheduleStatus])


  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('reservations').update({ status }).eq('id', id)
    fetchReservations()
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    confirmed: { label: 'Confirmada', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    arrived: { label: 'Chegou', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    seated: { label: 'Sentado', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    completed: { label: 'Concluída', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
  }

  // Get reservations count per date for calendar
  const reservationsByDate = reservations.reduce((acc, res) => {
    acc[res.reservation_date] = (acc[res.reservation_date] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Filter reservations by selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0]
  const filteredReservations = reservations.filter(res => res.reservation_date === selectedDateStr)

  return (
    <div className="space-y-6">
      {/* Schedule Modal */}
      <ReservationScheduleModal
        businessId={businessId}
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false)
          fetchScheduleStatus()
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Hoje</p>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {stats.today}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Confirmadas</p>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {stats.confirmed}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Pendentes</p>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {stats.pending}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Check className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Concluídas Hoje</p>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {stats.completedToday}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar & List Grid - Desktop: side by side, Mobile: stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Calendar Column */}
        <ReservationCalendar
          reservations={reservationsByDate}
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />

        {/* Reservations List Column */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col">
          {/* Header inside card */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">
                {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {scheduleStatus}
              </p>
            </div>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors text-xs font-medium"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Configurar</span>
            </button>
          </div>

          {/* Reservations List */}
          <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="p-12 text-center"><p className="text-zinc-400 dark:text-zinc-500">Carregando...</p></div>
        ) : filteredReservations.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">Nenhuma reserva para esta data</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredReservations.map((reservation) => {
              const status = statusConfig[reservation.status] || statusConfig.pending

              return (
                <div
                  key={reservation.id}
                  className="p-4 sm:p-6 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-all duration-300"
                >
                  <div className="flex flex-col gap-4">
                    {/* Info Row */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-base font-bold text-white">{reservation.reservation_time.slice(0, 5)}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">{reservation.customer_name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                          {reservation.customer_phone && <span>{reservation.customer_phone}</span>}
                          {reservation.customer_email && <span>• {reservation.customer_email}</span>}
                          <span>• <Users className="w-3 h-3 inline" /> {reservation.party_size} {reservation.party_size === 1 ? 'pessoa' : 'pessoas'}</span>
                        </div>
                        {reservation.notes && (
                          <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 mt-2 break-words">
                            📝 {reservation.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-medium border text-center', status.color)}>
                        {status.label}
                      </span>

                      {reservation.status === 'pending' && (
                        <Button
                          onClick={() => updateStatus(reservation.id, 'confirmed')}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                        >
                          <Check className="w-4 h-4 mr-2" />Confirmar
                        </Button>
                      )}

                      {reservation.status === 'confirmed' && (
                        <Button onClick={() => updateStatus(reservation.id, 'arrived')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                          <User className="w-4 h-4 mr-2" />Cliente Chegou
                        </Button>
                      )}

                      {reservation.status === 'arrived' && (
                        <Button onClick={() => updateStatus(reservation.id, 'seated')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                          <CheckCircle className="w-4 h-4 mr-2" />Sentar
                        </Button>
                      )}

                      {reservation.status === 'seated' && (
                        <Button onClick={() => updateStatus(reservation.id, 'completed')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                          <Check className="w-4 h-4 mr-2" />Concluir
                        </Button>
                      )}

                      {['pending', 'confirmed'].includes(reservation.status) && (
                        <Button onClick={() => updateStatus(reservation.id, 'cancelled')} size="sm" variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full sm:w-auto">
                          <X className="w-4 h-4 mr-1 sm:mr-0" />
                          <span className="sm:hidden">Cancelar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}
