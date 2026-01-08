'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, Users, MapPin, Phone, CheckCircle, XCircle, AlertCircle, Share2, Copy, Check, Star, ExternalLink } from 'react-feather'
import { Button } from '@/components/ui/button'
import { cancelQueueEntry } from '@/lib/queue/actions'
import type { PageCustomization } from '@/types/page-customization.types'

interface QueueWaitViewProps {
  entry: {
    id: string
    business_id: string
    customer_name: string
    party_size: number
    status: string
    position: number | null
    notes: string | null
    joined_at: string
    estimated_wait_time: number | null
    business: {
      name: string
      business_type: string | null
      address: string | null
      phone: string | null
    } | null
  }
  currentPosition: number
  estimatedWaitTime: number
}

export default function QueueWaitView({ entry: initialEntry, currentPosition: initialPosition, estimatedWaitTime: initialWaitTime }: QueueWaitViewProps) {
  const router = useRouter()
  const [entry, setEntry] = useState(initialEntry)
  const [currentPosition, setCurrentPosition] = useState(initialPosition)
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(initialWaitTime)
  const [copied, setCopied] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [justCalled, setJustCalled] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [completionCustomization, setCompletionCustomization] = useState<PageCustomization | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)

  const CUSTOMER_CANCEL_REASONS = [
    'Não posso mais esperar',
    'Mudança de planos',
    'Tempo de espera muito longo',
    'Outro motivo',
  ]

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

  // Fetch completion page customization when status is completed
  useEffect(() => {
    if (entry.status === 'completed') {
      const supabase = createClient()
      supabase
        .from('page_customizations')
        .select('*')
        .eq('business_id', entry.business_id)
        .eq('page_type', 'queue_completed')
        .single()
        .then(({ data }) => {
          if (data) {
            setCompletionCustomization(data)
            // Start auto-redirect countdown if enabled
            if (data.auto_redirect_enabled && data.auto_redirect_url) {
              setRedirectCountdown(data.auto_redirect_delay || 5)
            }
          }
        })
    }
  }, [entry.status, entry.business_id])

  // Handle auto-redirect countdown
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (redirectCountdown === 0 && completionCustomization?.auto_redirect_url) {
      window.location.href = completionCustomization.auto_redirect_url
    }
  }, [redirectCountdown, completionCustomization])

  // Solicita permissão para notificações
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Realtime updates
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`queue-entry-${entry.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `id=eq.${entry.id}`,
        },
        (payload) => {
          if (payload.new) {
            const newEntry = payload.new as typeof entry
            const wasWaiting = entry.status === 'waiting'
            const nowCalled = newEntry.status === 'called'

            // Detecta quando cliente é chamado
            if (wasWaiting && nowCalled) {
              setJustCalled(true)
              // Toca som de notificação
              if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission === 'granted') {
                  new Notification('Você foi chamado!', {
                    body: `${entry.business?.name} está te chamando`,
                    icon: '/icon.png',
                    tag: 'queue-call',
                    requireInteraction: true
                  })
                }
              }
              // Vibra (mobile)
              if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200, 100, 200])
              }
              // Toca som
              try {
                const audio = new Audio('/notification.mp3')
                audio.play().catch(() => {
                  // Fallback para beep do sistema
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

            setEntry(prev => ({ ...prev, ...newEntry }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `business_id=eq.${entry.business_id}`,
        },
        async () => {
          // Busca a entrada atual para pegar a posição atualizada
          const { data: currentEntry } = await supabase
            .from('queue_entries')
            .select('position, status')
            .eq('id', entry.id)
            .single()

          if (!currentEntry) return

          // Recalcula posição apenas se ainda estiver waiting
          if (currentEntry.status === 'waiting') {
            const { count } = await supabase
              .from('queue_entries')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', entry.business_id)
              .eq('status', 'waiting')
              .lt('position', currentEntry.position || 999999)

            const newPosition = (count || 0) + 1
            setCurrentPosition(newPosition)
            setEstimatedWaitTime((count || 0) * 15)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [entry.id, entry.business_id, entry.business?.name, entry.status])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Fila - ${entry.business?.name}`,
          text: `Estou na posição ${currentPosition} da fila em ${entry.business?.name}`,
          url: currentUrl,
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
    const reason = selectedReason === 'Outro motivo' ? customReason : selectedReason
    if (!reason.trim()) return

    setCanceling(true)
    const result = await cancelQueueEntry(entry.id, reason)
    setCanceling(false)

    if (result.success) {
      closeCancelModal()
      router.push(`/fila/${entry.business_id}`)
    }
  }

  // Status display
  const getStatusDisplay = () => {
    switch (entry.status) {
      case 'waiting':
        return {
          icon: <Clock className="w-12 h-12 text-blue-500" />,
          title: 'Aguardando na fila',
          color: 'blue',
        }
      case 'called':
        return {
          icon: <AlertCircle className={`w-12 h-12 text-yellow-500 ${justCalled ? 'animate-bounce' : ''}`} />,
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
      case 'no_show':
        return {
          icon: <XCircle className="w-12 h-12 text-orange-500" />,
          title: 'Não compareceu',
          color: 'orange',
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
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 ${
      entry.status === 'called' ? 'animate-pulse' : ''
    }`} style={{ minHeight: '100vh' }}>
      <div className="w-full max-w-lg">
        {/* Business Info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-color, #ffffff)' }}>
            {entry.business?.name}
          </h1>
          {entry.business?.business_type && (
            <p className="capitalize" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }}>
              {entry.business.business_type}
            </p>
          )}
        </div>

        {/* Alert quando chamado */}
        {entry.status === 'called' && (
          <div className="mb-6 bg-yellow-500 text-black rounded-xl p-6 animate-bounce">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 mx-auto mb-3" />
              <h2 className="text-3xl font-bold mb-2">🔔 SUA VEZ!</h2>
              <p className="text-lg font-semibold">Dirija-se ao atendimento agora!</p>
            </div>
          </div>
        )}

        {/* Status Card */}
        <div className={`p-8 mb-6 transition-all duration-300 ${
          entry.status === 'called'
            ? 'border-yellow-500 shadow-2xl shadow-yellow-500/50 ring-4 ring-yellow-500/20'
            : ''
        }`} style={{
          backgroundColor: 'var(--card-bg, #18181b)',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: entry.status === 'called' ? '#eab308' : 'var(--card-border, #27272a)',
          borderRadius: 'var(--card-radius, 0.75rem)'
        }}>
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4">
              {statusDisplay.icon}
            </div>
            <h2 className={`text-2xl font-bold mb-2 ${
              entry.status === 'called' ? 'text-yellow-500 animate-pulse' : ''
            }`} style={{ color: entry.status === 'called' ? '#eab308' : 'var(--text-color, #ffffff)' }}>
              {statusDisplay.title}
            </h2>
            <p style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }}>{entry.customer_name}</p>
          </div>

          {/* Position Display - Show for all non-cancelled/no-show statuses */}
          {!['cancelled', 'no_show'].includes(entry.status) && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 text-center" style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border, #27272a)',
                  borderRadius: 'var(--card-radius, 0.75rem)'
                }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }}>
                    {entry.status === 'waiting' ? 'Sua Posição' : 'Posição Inicial'}
                  </p>
                  <p className="text-4xl font-bold" style={{ color: 'var(--primary-color, #3b82f6)' }}>
                    {entry.status === 'waiting' ? currentPosition : (entry.position || currentPosition)}
                  </p>
                </div>
                <div className="p-4 text-center" style={{
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border, #27272a)',
                  borderRadius: 'var(--card-radius, 0.75rem)'
                }}>
                  <p className="text-sm mb-1" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }}>
                    {entry.status === 'waiting' ? 'Tempo Estimado' : 'Tempo Esperado'}
                  </p>
                  <p className="text-4xl font-bold" style={{ color: 'var(--primary-color, #3b82f6)' }}>
                    {estimatedWaitTime}min
                  </p>
                </div>
              </div>

              {/* Party Size */}
              <div className="flex items-center justify-center gap-2 mb-6" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }}>
                <Users className="w-5 h-5" />
                <span>{entry.party_size} {entry.party_size === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
            </>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="p-4 mb-6" style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--card-border, #27272a)',
              borderRadius: 'var(--card-radius, 0.75rem)'
            }}>
              <p className="text-sm mb-1" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }}>Observações</p>
              <p style={{ color: 'var(--text-color, #ffffff)' }}>{entry.notes}</p>
            </div>
          )}

          {/* Business Contact */}
          {entry.business && (
            <div className="pt-6 space-y-3" style={{ borderTop: '1px solid var(--card-border, #27272a)' }}>
              {entry.business.address && (
                <div className="flex items-start gap-3 text-sm" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }}>
                  <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{entry.business.address}</span>
                </div>
              )}
              {entry.business.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }} />
                  <a href={`tel:${entry.business.phone}`} className="hover:underline" style={{ color: 'var(--primary-color, #3b82f6)' }}>
                    {entry.business.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {entry.status === 'waiting' && (
            <>
              <div className="flex gap-3">
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--card-bg, #18181b)',
                    color: 'var(--text-color, #ffffff)',
                    borderRadius: 'var(--button-radius, 8px)',
                    border: '1px solid var(--card-border, #27272a)'
                  }}
                >
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--card-bg, #18181b)',
                    color: 'var(--text-color, #ffffff)',
                    borderRadius: 'var(--button-radius, 8px)',
                    border: '1px solid var(--card-border, #27272a)'
                  }}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
              <button
                onClick={openCancelModal}
                className="w-full px-4 py-3 font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  color: '#ef4444',
                  borderRadius: 'var(--button-radius, 8px)',
                  border: '1px solid rgba(220, 38, 38, 0.2)'
                }}
              >
                Sair da Fila
              </button>
            </>
          )}

          {entry.status === 'completed' && (
            <>
              {/* Thank you message */}
              {completionCustomization?.thank_you_message && (
                <div className="p-6 mb-4" style={{
                  backgroundColor: 'var(--card-bg, #18181b)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border, #27272a)',
                  borderRadius: 'var(--card-radius, 0.75rem)'
                }}>
                  <p className="text-center whitespace-pre-wrap" style={{ color: 'var(--text-color, #ffffff)' }}>
                    {completionCustomization.thank_you_message}
                  </p>
                </div>
              )}

              {/* Review button */}
              {completionCustomization?.review_link && (
                <button
                  onClick={() => window.open(completionCustomization.review_link!, '_blank')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium mb-3 transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--button-color, #3b82f6)',
                    color: 'var(--button-text-color, #ffffff)',
                    borderRadius: 'var(--button-radius, 8px)'
                  }}
                >
                  <Star className="w-4 h-4" />
                  {completionCustomization.review_button_text || 'Avaliar Atendimento'}
                </button>
              )}

              {/* CTA button */}
              {completionCustomization?.cta_link && completionCustomization?.cta_button_text && (
                <button
                  onClick={() => window.open(completionCustomization.cta_link!, '_blank')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 font-medium mb-3 transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--button-color, #3b82f6)',
                    color: 'var(--button-text-color, #ffffff)',
                    borderRadius: 'var(--button-radius, 8px)'
                  }}
                >
                  {completionCustomization.cta_icon === 'star' && <Star className="w-4 h-4" />}
                  {completionCustomization.cta_icon === 'external-link' && <ExternalLink className="w-4 h-4" />}
                  {completionCustomization.cta_button_text}
                </button>
              )}

              {/* Auto-redirect countdown */}
              {redirectCountdown !== null && redirectCountdown > 0 && (
                <div className="p-4 mb-3 text-center" style={{
                  backgroundColor: 'var(--card-bg, #18181b)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--card-border, #27272a)',
                  borderRadius: 'var(--card-radius, 0.75rem)'
                }}>
                  <p className="text-sm" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.6 }}>
                    Redirecionando em <span className="font-bold" style={{ color: 'var(--primary-color, #3b82f6)' }}>{redirectCountdown}</span> segundo{redirectCountdown !== 1 ? 's' : ''}...
                  </p>
                </div>
              )}

              {/* Back to queue button */}
              <button
                onClick={() => router.push(`/fila/${entry.business_id}`)}
                className="w-full px-4 py-3 font-medium transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--card-bg, #18181b)',
                  color: 'var(--text-color, #ffffff)',
                  borderRadius: 'var(--button-radius, 8px)',
                  border: '1px solid var(--card-border, #27272a)'
                }}
              >
                Voltar para a Fila
              </button>
            </>
          )}

          {entry.status === 'cancelled' && (
            <button
              onClick={() => router.push(`/fila/${entry.business_id}`)}
              className="w-full px-4 py-3 font-medium transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--button-color, #3b82f6)',
                color: 'var(--button-text-color, #ffffff)',
                borderRadius: 'var(--button-radius, 8px)'
              }}
            >
              Voltar para a Fila
            </button>
          )}
        </div>

        {/* Auto-refresh notice */}
        {entry.status === 'waiting' && (
          <p className="text-xs text-center mt-4" style={{ color: 'var(--text-color, #ffffff)', opacity: 0.4 }}>
            Esta página atualiza automaticamente em tempo real
          </p>
        )}
      </div>

      {/* Cancel Modal */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={closeCancelModal}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Sair da fila
            </h3>
            <p className="text-sm text-zinc-400 mb-4">
              Por que você está saindo da fila?
            </p>

            <div className="space-y-2 mb-4">
              {CUSTOMER_CANCEL_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm ${
                    selectedReason === reason
                      ? 'border-blue-500 bg-blue-950 text-blue-400'
                      : 'border-zinc-700 hover:bg-zinc-800 text-white'
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
                className="w-full px-4 py-3 rounded-lg border border-zinc-700 bg-zinc-800 text-white text-sm resize-none mb-4 placeholder:text-zinc-500"
                rows={3}
              />
            )}

            <div className="flex gap-3">
              <Button
                onClick={closeCancelModal}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
              >
                Voltar
              </Button>
              <Button
                onClick={handleCancel}
                disabled={canceling || !selectedReason || (selectedReason === 'Outro motivo' && !customReason.trim())}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
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
