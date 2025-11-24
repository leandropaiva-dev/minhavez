'use client'

import { useState, useEffect, useCallback } from 'react'
import { Phone, Check, X, Clock, User, Bell, TrendingUp, Lock, Unlock } from 'react-feather'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface QueueEntry {
  id: string
  customer_name: string
  customer_phone: string | null
  party_size: number
  position: number | null
  status: string
  joined_at: string
  notes: string | null
}

interface QueueManagerProps {
  businessId: string
}

const CANCELLATION_REASONS = [
  'Cliente não apareceu',
  'Cliente pediu para cancelar',
  'Saiu da fila por conta própria',
  'Tempo de espera excedido',
  'Desistiu após ser chamado',
  'Outro motivo',
]

export default function QueueManager({ businessId }: QueueManagerProps) {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [callingId, setCallingId] = useState<string | null>(null)
  const [isQueueOpen, setIsQueueOpen] = useState(true)
  const [todayAttended, setTodayAttended] = useState(0)

  // Cancellation modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancellingEntry, setCancellingEntry] = useState<QueueEntry | null>(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')

  const fetchQueue = useCallback(async () => {
    const supabase = createClient()

    // Fetch queue entries
    const { data } = await supabase
      .from('queue_entries')
      .select('*')
      .eq('business_id', businessId)
      .in('status', ['waiting', 'called', 'attending'])
      .order('position', { ascending: true })

    if (data) setQueue(data)

    // Fetch today attended count
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const { count } = await supabase
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .in('status', ['completed', 'attending'])
      .gte('joined_at', today.toISOString())

    setTodayAttended(count || 0)

    // Fetch queue status
    const { data: business } = await supabase
      .from('businesses')
      .select('is_queue_open')
      .eq('id', businessId)
      .single()

    if (business) setIsQueueOpen(business.is_queue_open ?? true)

    setLoading(false)
  }, [businessId])

  useEffect(() => {
    fetchQueue()

    const supabase = createClient()
    const channel = supabase
      .channel('queue-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'queue_entries',
        filter: `business_id=eq.${businessId}`
      }, () => {
        fetchQueue()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [businessId, fetchQueue])

  const updateStatus = async (id: string, status: string, cancellationReason?: string) => {
    const supabase = createClient()
    const updates: Record<string, string | null> = { status }

    if (status === 'called') {
      updates.called_at = new Date().toISOString()
      setCallingId(id)
      setTimeout(() => setCallingId(null), 2000)
    } else if (status === 'attending') {
      updates.attended_at = new Date().toISOString()
    } else if (status === 'completed') {
      updates.completed_at = new Date().toISOString()
    } else if (status === 'cancelled' || status === 'no_show') {
      updates.completed_at = new Date().toISOString()
      if (cancellationReason) {
        updates.cancellation_reason = cancellationReason
      }
    }

    await supabase.from('queue_entries').update(updates).eq('id', id)
    fetchQueue()
  }

  const openCancelModal = (entry: QueueEntry) => {
    setCancellingEntry(entry)
    setSelectedReason('')
    setCustomReason('')
    setCancelModalOpen(true)
  }

  const closeCancelModal = () => {
    setCancelModalOpen(false)
    setCancellingEntry(null)
    setSelectedReason('')
    setCustomReason('')
  }

  const confirmCancellation = async () => {
    if (!cancellingEntry) return

    const reason = selectedReason === 'Outro motivo' ? customReason : selectedReason
    if (!reason.trim()) return

    await updateStatus(cancellingEntry.id, 'cancelled', reason)
    closeCancelModal()
  }

  const calculateWaitTime = (joinedAt: string): string => {
    const joined = new Date(joinedAt)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - joined.getTime()) / 60000)
    if (diffMinutes < 60) return `${diffMinutes}min`
    return `${Math.floor(diffMinutes / 60)}h${diffMinutes % 60}min`
  }

  const toggleQueueStatus = async () => {
    const supabase = createClient()
    const newStatus = !isQueueOpen

    await supabase
      .from('businesses')
      .update({ is_queue_open: newStatus })
      .eq('id', businessId)

    setIsQueueOpen(newStatus)
  }


  const statusConfig: Record<string, { label: string; color: string }> = {
    waiting: { label: 'Aguardando', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    called: { label: 'Chamado', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
    attending: { label: 'Atendendo', color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-zinc-300 dark:border-zinc-700' },
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Na Fila</p>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {queue.filter((c) => c.status === 'waiting').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Chamados</p>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {queue.filter((c) => c.status === 'called').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Atendendo</p>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {queue.filter((c) => c.status === 'attending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm">Atendidos Hoje</p>
              <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {todayAttended}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Clientes na Fila</h2>
        <button
          onClick={toggleQueueStatus}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium border-2 text-sm",
            isQueueOpen
              ? "bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
              : "bg-red-50 dark:bg-red-950 border-red-500 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
          )}
        >
          {isQueueOpen ? (
            <>
              <Unlock className="w-4 h-4" />
              <span>Fila Aberta</span>
              <span className="hidden sm:inline opacity-75">• Clique para fechar</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Fila Fechada</span>
              <span className="hidden sm:inline opacity-75">• Clique para abrir</span>
            </>
          )}
        </button>
      </div>

      {/* Queue List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><p className="text-zinc-400 dark:text-zinc-500">Carregando...</p></div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">Nenhum cliente na fila</p>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-2">Clientes entram via QR code</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {queue.map((entry) => {
              const status = statusConfig[entry.status] || statusConfig.waiting
              const waitTime = calculateWaitTime(entry.joined_at)

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "p-4 sm:p-6 transition-all duration-300",
                    callingId === entry.id
                      ? "bg-blue-50 dark:bg-blue-950 border-l-4 border-l-blue-500"
                      : "hover:bg-zinc-50 dark:hover:bg-zinc-950"
                  )}
                >
                  <div className="flex flex-col gap-4">
                    {/* Info Row */}
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-lg sm:text-xl font-bold text-white">{entry.position}</span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base">{entry.customer_name}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                          {entry.customer_phone && <span>{entry.customer_phone}</span>}
                          <span>• {entry.party_size} {entry.party_size === 1 ? 'pessoa' : 'pessoas'}</span>
                          <span>• {waitTime}</span>
                        </div>
                        {entry.notes && (
                          <p className="text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 mt-2 break-words">
                            📝 {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto sm:ml-auto">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-medium border text-center', status.color)}>
                        {status.label}
                      </span>

                      {entry.status === 'waiting' && (
                        <Button
                          onClick={() => updateStatus(entry.id, 'called')}
                          size="sm"
                          disabled={callingId === entry.id}
                          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
                        >
                          <Bell className={cn("w-4 h-4 mr-2", callingId === entry.id && "animate-bounce")} />
                          {callingId === entry.id ? 'Chamando...' : 'Chamar'}
                        </Button>
                      )}

                      {entry.status === 'called' && (
                        <Button onClick={() => updateStatus(entry.id, 'attending')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                          <User className="w-4 h-4 mr-2" />Atender
                        </Button>
                      )}

                      {entry.status === 'attending' && (
                        <Button onClick={() => updateStatus(entry.id, 'completed')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                          <Check className="w-4 h-4 mr-2" />Concluir
                        </Button>
                      )}

                      {(entry.status === 'waiting' || entry.status === 'called') && (
                        <Button onClick={() => openCancelModal(entry)} size="sm" variant="outline" className="border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 w-full sm:w-auto">
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
      {/* Cancellation Modal */}
      {cancelModalOpen && cancellingEntry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeCancelModal}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Cancelar atendimento
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
              Por favor, selecione o motivo do cancelamento de <span className="font-medium text-zinc-900 dark:text-white">{cancellingEntry.customer_name}</span>:
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
