'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Clock, Users, Share2, Copy, Check, AlertCircle, XCircle } from 'react-feather'
import { createClient } from '@/lib/supabase/client'
import QueueFormWithServices from './QueueFormWithServices'
import { cancelQueueEntry } from '@/lib/queue/actions'
import { Button } from '@/components/ui/button'
import { usePushNotifications } from '@/lib/hooks/usePushNotifications'

interface Service {
  id: string
  name: string
  description?: string | null
  photo_url: string
  price_cents?: number | null
  estimated_duration_minutes?: number | null
}

interface QueueEntry {
  id: string
  business_id: string
  customer_name: string
  party_size: number
  status: string
  position: number | null
  notes: string | null
}

interface QueueFormWrapperProps {
  businessId: string
  businessName: string
}

export default function QueueFormWrapper({
  businessId,
  businessName,
}: QueueFormWrapperProps) {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [entryId, setEntryId] = useState<string | null>(null)
  const [entryData, setEntryData] = useState<QueueEntry | null>(null)
  const [currentPosition, setCurrentPosition] = useState(0)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0)
  const [copied, setCopied] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [canceling, setCanceling] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Use the push notifications hook
  const {
    isSupported: isPushSupported,
    permission: pushPermission,
    isSubscribed: isPushSubscribed,
    isLoading: isPushLoading,
    subscribe: subscribeToPush,
    unsubscribe: unsubscribeFromPush,
  } = usePushNotifications()

  const CUSTOMER_CANCEL_REASONS = [
    'Não posso mais esperar',
    'Mudança de planos',
    'Tempo de espera muito longo',
    'Outro motivo',
  ]

  useEffect(() => {
    loadServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId])

  const loadServices = async () => {
    try {
      const supabase = createClient()

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('available_in_queue', true)
        .order('position')

      setServices(servicesData || [])
    } catch (err) {
      console.error('Error loading services:', err)
      setError('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  // Auto-subscribe to push notifications when joining queue
  useEffect(() => {
    if (success && entryId && isPushSupported && !isPushSubscribed && pushPermission !== 'denied') {
      // Automatically attempt to subscribe when user joins queue
      subscribeToPush()
    }
  }, [success, entryId, isPushSupported, isPushSubscribed, pushPermission, subscribeToPush])

  // Realtime updates quando na fila + Polling como fallback
  useEffect(() => {
    if (!entryId) {
      console.log('[QueueFormWrapper] ❌ No entryId, skipping realtime setup')
      return
    }

    console.log('[QueueFormWrapper] 🔄 Setting up realtime updates for entry:', entryId)

    const supabase = createClient()
    let pollInterval: NodeJS.Timeout
    let previousStatus = entryData?.status || 'waiting'

    // Função para atualizar dados
    const fetchUpdate = async () => {
      console.log('[QueueFormWrapper] 🔍 Fetching update for entry:', entryId)

      const { data: updatedEntry, error } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('id', entryId)
        .single()

      if (error) {
        console.error('[QueueFormWrapper] ❌ Error fetching update:', error)
        return
      }

      console.log('[QueueFormWrapper] ✅ Got update:', {
        previousStatus: previousStatus,
        newStatus: updatedEntry?.status,
        entryId: updatedEntry?.id
      })

      // Update debug info for visual display
      setLastUpdate(new Date().toLocaleTimeString())
      setDebugInfo(`Status: ${updatedEntry?.status || 'unknown'} | Last check: ${new Date().toLocaleTimeString()}`)

      if (updatedEntry) {
        const wasWaiting = previousStatus === 'waiting'
        const nowCalled = updatedEntry.status === 'called'

        console.log('[QueueFormWrapper] 🎯 Status check:', {
          wasWaiting,
          nowCalled,
          shouldNotify: wasWaiting && nowCalled
        })

        // Detecta quando cliente é chamado
        if (wasWaiting && nowCalled) {
          console.log('[QueueFormWrapper] 🔔 CLIENT WAS CALLED! Showing notification...')
          // Notificação
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Você foi chamado!', {
              body: `${businessName} está te chamando`,
              icon: '/icon.png',
              tag: 'queue-call',
              requireInteraction: true
            })
          }
          // Vibra (mobile)
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200, 100, 200])
          }
          // Som
          try {
            const audio = new Audio('/notification.mp3')
            audio.play().catch(() => {
              const ctx = new AudioContext()
              const oscillator = ctx.createOscillator()
              const gainNode = ctx.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(ctx.destination)
              oscillator.frequency.value = 800
              gainNode.gain.value = 0.3
              oscillator.start()
              setTimeout(() => oscillator.stop(), 500)
            })
          } catch {
            console.log('Audio não disponível')
          }
        }

        console.log('[QueueFormWrapper] 💾 Updating entryData state with new status:', updatedEntry.status)

        // Update previous status for next comparison
        previousStatus = updatedEntry.status

        setEntryData(updatedEntry as QueueEntry)

        // Recalcula posição se ainda waiting
        if (updatedEntry.status === 'waiting') {
          console.log('[QueueFormWrapper] 📍 Recalculating position...')
          const { count } = await supabase
            .from('queue_entries')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', businessId)
            .eq('status', 'waiting')
            .lt('position', updatedEntry.position || 999999)

          const newPosition = (count || 0) + 1
          setCurrentPosition(newPosition)
          setEstimatedWaitTime((count || 0) * 15)
        }
      }
    }

    // Tenta usar realtime
    const channel = supabase
      .channel(`queue-entry-${entryId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `id=eq.${entryId}`,
        },
        () => {
          fetchUpdate()
        }
      )
      .subscribe((status) => {
        console.log('[QueueFormWrapper] 📡 Realtime subscription status:', status)

        // Se realtime falhar, usa polling
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.log('[QueueFormWrapper] ⚠️ Realtime failed, using polling fallback')
          pollInterval = setInterval(fetchUpdate, 3000) // Poll a cada 3s
        }
      })

    // Polling como fallback imediato para mobile
    console.log('[QueueFormWrapper] ⏱️ Starting polling every 3 seconds')
    pollInterval = setInterval(fetchUpdate, 3000)

    return () => {
      console.log('[QueueFormWrapper] 🧹 Cleaning up realtime subscription')
      supabase.removeChannel(channel)
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [entryId, businessId, businessName]) // Removed entryData?.status from dependencies!

  const handleSubmit = async (formData: {
    customer_name: string
    customer_phone: string
    party_size: number
    selected_service: string | null
    notes: string
  }) => {
    try {
      const supabase = createClient()

      // Get current user if logged in (optional - for push notifications)
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error: insertError } = await supabase
        .from('queue_entries')
        .insert({
          business_id: businessId,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          party_size: formData.party_size,
          selected_service: formData.selected_service,
          notes: formData.notes || null,
          status: 'waiting',
          user_id: user?.id || null, // Save user_id for push notifications
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Calcula posição inicial
      const { count } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'waiting')
        .lt('position', data.position || 999999)

      const position = (count || 0) + 1
      setCurrentPosition(position)
      setEstimatedWaitTime((count || 0) * 15)

      setEntryId(data.id)
      setEntryData(data)
      setSuccess(true)
    } catch (err) {
      const error = err as Error
      console.error('Error joining queue:', error)
      setError(error.message || 'Erro ao entrar na fila. Tente novamente.')
      throw err
    }
  }

  const handleCopyLink = async () => {
    if (!entryId) return
    const url = `${window.location.origin}/fila/${businessId}/espera/${entryId}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
    }
  }

  const handleShare = async () => {
    if (!entryId) return
    const url = `${window.location.origin}/fila/${businessId}/espera/${entryId}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fila - ${businessName}`,
          text: `Estou na posição ${currentPosition} da fila em ${businessName}`,
          url,
        })
      } catch (error) {
        console.error('Erro ao compartilhar:', error)
      }
    } else {
      handleCopyLink()
    }
  }

  const openCancelModal = () => {
    setSelectedReason('')
    setCustomReason('')
    setCancelModalOpen(true)
  }

  const closeCancelModal = () => {
    setCancelModalOpen(false)
    setSelectedReason('')
    setCustomReason('')
  }

  const handleCancel = async () => {
    if (!entryId) return
    const reason = selectedReason === 'Outro motivo' ? customReason : selectedReason
    if (!reason.trim()) return

    setCanceling(true)
    const result = await cancelQueueEntry(entryId, reason)
    setCanceling(false)

    if (result.success) {
      closeCancelModal()
      setSuccess(false)
      setEntryId(null)
      setEntryData(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success && entryId && entryData) {
    const getStatusDisplay = () => {
      switch (entryData.status) {
        case 'waiting':
          return {
            icon: <Clock className="w-12 h-12 text-blue-500" />,
            title: 'Aguardando na fila',
            color: 'blue',
          }
        case 'called':
          return {
            icon: <AlertCircle className="w-12 h-12 text-yellow-500" />,
            title: 'Você foi chamado!',
            color: 'yellow',
          }
        case 'attending':
          return {
            icon: <Users className="w-12 h-12 text-green-500" />,
            title: 'Em atendimento',
            color: 'green',
          }
        case 'completed':
          return {
            icon: <CheckCircle className="w-12 h-12 text-green-500" />,
            title: 'Atendimento concluído',
            color: 'green',
          }
        case 'cancelled':
          return {
            icon: <XCircle className="w-12 h-12 text-red-500" />,
            title: 'Cancelado',
            color: 'red',
          }
        default:
          return {
            icon: <Clock className="w-12 h-12 text-zinc-500" />,
            title: 'Status desconhecido',
            color: 'zinc',
          }
      }
    }

    const statusDisplay = getStatusDisplay()

    return (
      <div className="w-full -mx-4 sm:mx-0 -my-4 sm:my-0 px-4 sm:px-0 py-4 sm:py-0">
        {/* Alert quando chamado */}
        {entryData.status === 'called' && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 text-yellow-900 dark:text-yellow-100 rounded-lg p-4">
            <div className="text-center">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-lg sm:text-xl font-bold mb-1">Sua vez chegou!</h2>
              <p className="text-sm">Dirija-se ao atendimento</p>
            </div>
          </div>
        )}

        {/* Status - sem card extra */}
        <div className={`mb-4 transition-all ${
          entryData.status === 'called' ? 'pb-4 border-b-2 border-yellow-500' : ''
        }`}>
          <div className="flex flex-col items-center text-center mb-4">
            <div className="mb-2">
              {statusDisplay.icon}
            </div>
            <h2 className={`text-lg sm:text-xl font-bold mb-1 ${
              entryData.status === 'called' ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-900 dark:text-white'
            }`}>
              {statusDisplay.title}
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{entryData.customer_name}</p>
          </div>

          {/* Position Display */}
          {!['cancelled', 'no_show'].includes(entryData.status) && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 text-center bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs mb-1 text-zinc-600 dark:text-zinc-400">
                    {entryData.status === 'waiting' ? 'Sua Posição' : 'Posição Inicial'}
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {entryData.status === 'waiting' ? currentPosition : (entryData.position || currentPosition)}
                  </p>
                </div>
                <div className="p-3 text-center bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                  <p className="text-xs mb-1 text-zinc-600 dark:text-zinc-400">
                    {entryData.status === 'waiting' ? 'Tempo Estimado' : 'Tempo Esperado'}
                  </p>
                  <p className="text-3xl font-bold text-teal-600 dark:text-teal-400">
                    {estimatedWaitTime}<span className="text-base">min</span>
                  </p>
                </div>
              </div>

              {/* Party Size */}
              <div className="flex items-center justify-center gap-2 mb-4 text-sm text-zinc-600 dark:text-zinc-400">
                <Users className="w-4 h-4" />
                <span>{entryData.party_size} {entryData.party_size === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
            </>
          )}

          {/* Notes */}
          {entryData.notes && (
            <div className="p-3 mb-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <p className="text-xs mb-1 text-zinc-600 dark:text-zinc-400">Observações</p>
              <p className="text-sm text-zinc-900 dark:text-white">{entryData.notes}</p>
            </div>
          )}

          {/* Push Notification Status */}
          {isPushSupported && entryData.status === 'waiting' && (
            <>
              {!isPushSubscribed && pushPermission !== 'denied' && (
                <div className="p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-200 mb-2">
                    📱 Ative as notificações push para receber avisos mesmo com o site fechado
                  </p>
                  <button
                    onClick={subscribeToPush}
                    disabled={isPushLoading}
                    className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors text-xs disabled:opacity-50"
                  >
                    {isPushLoading ? 'Ativando...' : 'Ativar Notificações Push'}
                  </button>
                </div>
              )}

              {isPushSubscribed && (
                <div className="p-2.5 mb-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-xs text-green-800 dark:text-green-200">
                    Notificações push ativas! Você será avisado mesmo com o site fechado.
                  </p>
                </div>
              )}

              {pushPermission === 'denied' && (
                <div className="p-2.5 mb-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-800 dark:text-red-200">
                    Notificações bloqueadas. Ative nas configurações do navegador.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          {entryData.status === 'waiting' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartilhar</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700 text-sm"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <button
                onClick={openCancelModal}
                className="w-full px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg font-medium transition-all hover:bg-red-100 dark:hover:bg-red-900/30 text-sm"
              >
                Sair da Fila
              </button>
            </>
          )}

          {entryData.status === 'completed' && (
            <button
              onClick={() => window.location.reload()}
              className="w-full px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Entrar na Fila Novamente
            </button>
          )}

          {entryData.status === 'cancelled' && (
            <button
              onClick={() => window.location.reload()}
              className="w-full px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Voltar para a Fila
            </button>
          )}
        </div>

        {/* Debug info banner */}
        {entryData.status === 'waiting' && debugInfo && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
            <p className="text-blue-800 dark:text-blue-200 font-mono">
              🔍 DEBUG: {debugInfo}
            </p>
            <p className="text-blue-600 dark:text-blue-400 mt-1">
              DB Status: {entryData.status} | Entry ID: {entryData.id.slice(0, 8)}...
            </p>
          </div>
        )}

        {/* Auto-refresh notice */}
        {entryData.status === 'waiting' && (
          <p className="text-xs text-center mt-3 text-zinc-400">
            Atualização automática em tempo real {lastUpdate && `(última: ${lastUpdate})`}
          </p>
        )}

        {/* Cancel Modal */}
        {cancelModalOpen && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={closeCancelModal}
          >
            <div
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg sm:rounded-xl p-4 sm:p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white mb-1 sm:mb-2">
                Sair da fila
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-3 sm:mb-4">
                Por que você está saindo da fila?
              </p>

              <div className="space-y-2 mb-3 sm:mb-4">
                {CUSTOMER_CANCEL_REASONS.map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border transition-all text-xs sm:text-sm ${
                      selectedReason === reason
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white'
                    }`}
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
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm resize-none mb-3 sm:mb-4 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  rows={3}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={closeCancelModal}
                  className="flex-1 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-sm sm:text-base py-2.5 sm:py-3"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={canceling || !selectedReason || (selectedReason === 'Outro motivo' && !customReason.trim())}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 text-sm sm:text-base py-2.5 sm:py-3"
                >
                  {canceling ? 'Saindo...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhum serviço disponível na fila no momento
        </p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <QueueFormWithServices
        businessId={businessId}
        businessName={businessName}
        services={services}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
