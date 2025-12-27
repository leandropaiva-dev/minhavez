'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Check, X, Clock, User, Users, CheckCircle, Settings, Lock, Unlock } from 'react-feather'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import ReservationGridWrapper from './ReservationGridWrapper'
import ReservationScheduleModal from './ReservationScheduleModal'
import ReservationAppearanceModal from './ReservationAppearanceModal'
import { sendReservationConfirmation } from '@/lib/email/send-reservation-confirmation'

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

const CANCELLATION_REASONS = [
  'Cliente não apareceu',
  'Cliente pediu para cancelar',
  'Mudança de planos',
  'Reserva duplicada',
  'Horário indisponível',
  'Outro motivo',
]

export default function ReservationsManager({ businessId }: ReservationsManagerProps) {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [updating, setUpdating] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false)
  const [isReservationOpen, setIsReservationOpen] = useState(true)
  const [stats, setStats] = useState({
    today: 0,
    confirmed: 0,
    pending: 0,
    completedToday: 0,
  })

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancellingReservation, setCancellingReservation] = useState<Reservation | null>(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const fetchReservations = useCallback(async () => {
    const supabase = createClient()

    // Fetch reservation open status
    const { data: businessData } = await supabase
      .from('businesses')
      .select('is_reservation_open')
      .eq('id', businessId)
      .single()

    if (businessData) {
      setIsReservationOpen(businessData.is_reservation_open ?? true)
    }

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
  }, [businessId])

  const fetchScheduleStatus = useCallback(async () => {
    // Schedule status checking removed - not needed without scheduleStatus state
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


  const updateStatus = async (id: string, status: string, cancellationReason?: string) => {
    if (updating) return

    try {
      setUpdating(true)
      const supabase = createClient()
      const updates: Record<string, string | null> = { status }

      if (status === 'cancelled' || status === 'no_show') {
        if (cancellationReason) {
          updates.cancellation_reason = cancellationReason
        }
      }

      const { error } = await supabase.from('reservations').update(updates).eq('id', id)

      if (error) {
        console.error('Erro ao atualizar status:', error)
        alert('Erro ao atualizar reserva. Tente novamente.')
        return
      }

      await fetchReservations()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      alert('Erro ao atualizar reserva. Tente novamente.')
    } finally {
      setUpdating(false)
    }
  }

  const openCancelModal = (reservation: Reservation) => {
    setCancellingReservation(reservation)
    setSelectedReason('')
    setCustomReason('')
    setCancelModalOpen(true)
  }

  const closeCancelModal = () => {
    setCancelModalOpen(false)
    setCancellingReservation(null)
    setSelectedReason('')
    setCustomReason('')
  }

  const confirmCancellation = async () => {
    if (!cancellingReservation) return

    const reason = selectedReason === 'Outro motivo' ? customReason : selectedReason
    if (!reason.trim()) return

    await updateStatus(cancellingReservation.id, 'cancelled', reason)
    closeCancelModal()
  }

  const toggleReservationStatus = async () => {
    const supabase = createClient()
    const newStatus = !isReservationOpen

    const { error } = await supabase
      .from('businesses')
      .update({ is_reservation_open: newStatus })
      .eq('id', businessId)

    if (!error) {
      setIsReservationOpen(newStatus)
    }
  }

  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    confirmed: { label: 'Confirmada', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    arrived: { label: 'Chegou', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    seated: { label: 'Sentado', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    completed: { label: 'Concluída', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
  }

  return (
    <div className="space-y-6">
      {/* Modals */}
      <ReservationScheduleModal
        businessId={businessId}
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false)
          fetchScheduleStatus()
        }}
      />
      <ReservationAppearanceModal
        businessId={businessId}
        isOpen={isAppearanceModalOpen}
        onClose={() => setIsAppearanceModalOpen(false)}
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

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap sm:justify-end">
        <button
          onClick={() => setIsAppearanceModalOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all font-medium border-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-0"
          title="Aparência e Configurações"
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Aparência</span>
        </button>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all font-medium border-2 text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 min-w-0"
          title="Configurar Escala de Horários"
        >
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Escala</span>
        </button>
        <button
          onClick={toggleReservationStatus}
          className={cn(
            "flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all font-medium border-2 text-xs sm:text-sm min-w-0",
            isReservationOpen
              ? "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
              : "bg-red-50 dark:bg-red-950 border-red-500 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
          )}
        >
          {isReservationOpen ? (
            <>
              <Unlock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Aberta</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Fechada</span>
            </>
          )}
        </button>
      </div>

      {/* Reservation Grid with integrated view selector */}
      <ReservationGridWrapper
        reservations={reservations}
        onReservationClick={setSelectedReservation}
      />

      {/* Reservation Management Modal */}
      {selectedReservation && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 w-full sm:max-w-2xl sm:rounded-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                    {selectedReservation.customer_name}
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {new Date(selectedReservation.reservation_date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às {selectedReservation.reservation_time.slice(0, 5)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      selectedReservation.status === 'pending' && "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
                      selectedReservation.status === 'confirmed' && "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
                      selectedReservation.status === 'arrived' && "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300",
                      selectedReservation.status === 'seated' && "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
                      selectedReservation.status === 'completed' && "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                    )}>
                      {statusConfig[selectedReservation.status]?.label || 'Pendente'}
                    </span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      <Users className="w-3 h-3 inline mr-1" />
                      {selectedReservation.party_size} {selectedReservation.party_size === 1 ? 'pessoa' : 'pessoas'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReservation(null)}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {selectedReservation.customer_phone && (
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium mb-1">Telefone</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{selectedReservation.customer_phone}</p>
                  </div>
                )}

                {selectedReservation.customer_email && (
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium mb-1">Email</p>
                    <p className="text-sm font-medium text-zinc-900 dark:text-white break-all">{selectedReservation.customer_email}</p>
                  </div>
                )}
              </div>

              {selectedReservation.notes && (
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg mb-6">
                  <p className="text-xs text-blue-600 dark:text-blue-400 uppercase font-medium mb-1">Observações</p>
                  <p className="text-sm text-blue-900 dark:text-blue-300">{selectedReservation.notes}</p>
                </div>
              )}

              {/* Action Flow */}
              <div className="space-y-3">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-medium">Gerenciar Reserva</p>

                {/* Pending -> Confirmed */}
                {selectedReservation.status === 'pending' && (
                  <>
                    <Button
                      onClick={async () => {
                        await updateStatus(selectedReservation.id, 'confirmed')

                        // Enviar email de confirmação se houver email cadastrado
                        if (selectedReservation.customer_email) {
                          const result = await sendReservationConfirmation(selectedReservation.id)
                          if (result.success) {
                            console.log('Email de confirmação enviado com sucesso')
                          } else {
                            console.error('Erro ao enviar email:', result.error)
                          }
                        }

                        setSelectedReservation(null)
                      }}
                      disabled={updating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start disabled:opacity-50"
                      size="lg"
                    >
                      <Check className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">{updating ? 'Confirmando...' : 'Confirmar Reserva'}</div>
                        <div className="text-xs opacity-80">Cliente confirmou presença</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        openCancelModal(selectedReservation)
                        setSelectedReservation(null)
                      }}
                      disabled={updating}
                      variant="outline"
                      className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 justify-start disabled:opacity-50"
                      size="lg"
                    >
                      <X className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Cancelar Reserva</div>
                        <div className="text-xs opacity-80">Cliente não virá</div>
                      </div>
                    </Button>
                  </>
                )}

                {/* Confirmed -> Arrived */}
                {selectedReservation.status === 'confirmed' && (
                  <>
                    <Button
                      onClick={async () => {
                        await updateStatus(selectedReservation.id, 'arrived')
                        setSelectedReservation(null)
                      }}
                      disabled={updating}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start disabled:opacity-50"
                      size="lg"
                    >
                      <User className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">{updating ? 'Atualizando...' : 'Cliente Chegou'}</div>
                        <div className="text-xs opacity-80">Marcar presença</div>
                      </div>
                    </Button>
                    <Button
                      onClick={() => {
                        openCancelModal(selectedReservation)
                        setSelectedReservation(null)
                      }}
                      disabled={updating}
                      variant="outline"
                      className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 justify-start disabled:opacity-50"
                      size="lg"
                    >
                      <X className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Cancelar Reserva</div>
                        <div className="text-xs opacity-80">Cliente não apareceu</div>
                      </div>
                    </Button>
                  </>
                )}

                {/* Arrived -> Seated */}
                {selectedReservation.status === 'arrived' && (
                  <Button
                    onClick={async () => {
                      await updateStatus(selectedReservation.id, 'seated')
                      setSelectedReservation(null)
                    }}
                    disabled={updating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start disabled:opacity-50"
                    size="lg"
                  >
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">{updating ? 'Atualizando...' : 'Sentar Cliente'}</div>
                      <div className="text-xs opacity-80">Mesa disponibilizada</div>
                    </div>
                  </Button>
                )}

                {/* Seated -> Completed */}
                {selectedReservation.status === 'seated' && (
                  <Button
                    onClick={async () => {
                      await updateStatus(selectedReservation.id, 'completed')
                      setSelectedReservation(null)
                    }}
                    disabled={updating}
                    className="w-full bg-green-600 hover:bg-green-700 text-white justify-start disabled:opacity-50"
                    size="lg"
                  >
                    <Check className="w-5 h-5 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">{updating ? 'Concluindo...' : 'Concluir Atendimento'}</div>
                      <div className="text-xs opacity-80">Cliente finalizou</div>
                    </div>
                  </Button>
                )}

                {/* Completed - Read only */}
                {selectedReservation.status === 'completed' && (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">Reserva Concluída</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Atendimento finalizado com sucesso</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalOpen && cancellingReservation && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeCancelModal}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Cancelar reserva
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Por favor, selecione o motivo do cancelamento de <span className="font-medium text-zinc-900 dark:text-white">{cancellingReservation.customer_name}</span>:
            </p>

            <div className="space-y-2 mb-4">
              {CANCELLATION_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-lg border transition-all text-sm",
                    selectedReason === reason
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400"
                      : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white"
                  )}
                >
                  {reason}
                </button>
              ))}
            </div>

            {selectedReason === 'Outro motivo' && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Descreva o motivo..."
                className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm resize-none mb-4"
                rows={3}
              />
            )}

            <div className="flex gap-3">
              <Button
                onClick={closeCancelModal}
                variant="outline"
                className="flex-1 border-zinc-300 dark:border-zinc-700"
              >
                Voltar
              </Button>
              <Button
                onClick={confirmCancellation}
                disabled={!selectedReason || (selectedReason === 'Outro motivo' && !customReason.trim())}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
