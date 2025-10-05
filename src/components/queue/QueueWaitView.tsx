'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Clock, Users, MapPin, Phone, CheckCircle2, XCircle, AlertCircle, Share2, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cancelQueueEntry } from '@/lib/queue/actions'

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

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''

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
            setEntry(prev => ({ ...prev, ...payload.new }))
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
          // Recalcula posição quando há mudanças na fila
          const { count } = await supabase
            .from('queue_entries')
            .select('*', { count: 'exact', head: true })
            .eq('business_id', entry.business_id)
            .eq('status', 'waiting')
            .lt('position', entry.position || 999999)

          const newPosition = (count || 0) + 1
          setCurrentPosition(newPosition)
          setEstimatedWaitTime((count || 0) * 15)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [entry.id, entry.business_id, entry.position])

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

  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja sair da fila?')) {
      return
    }

    setCanceling(true)
    const result = await cancelQueueEntry(entry.id)
    setCanceling(false)

    if (result.success) {
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
          icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Business Info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">
            {entry.business?.name}
          </h1>
          {entry.business?.business_type && (
            <p className="text-zinc-400 capitalize">{entry.business.business_type}</p>
          )}
        </div>

        {/* Status Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4">
              {statusDisplay.icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {statusDisplay.title}
            </h2>
            <p className="text-zinc-400">{entry.customer_name}</p>
          </div>

          {entry.status === 'waiting' && (
            <>
              {/* Position Display */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-black border border-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-sm text-zinc-400 mb-1">Sua Posição</p>
                  <p className="text-4xl font-bold text-blue-500">{currentPosition}</p>
                </div>
                <div className="bg-black border border-zinc-800 rounded-lg p-4 text-center">
                  <p className="text-sm text-zinc-400 mb-1">Tempo Estimado</p>
                  <p className="text-4xl font-bold text-blue-500">{estimatedWaitTime}min</p>
                </div>
              </div>

              {/* Party Size */}
              <div className="flex items-center justify-center gap-2 text-zinc-400 mb-6">
                <Users className="w-5 h-5" />
                <span>{entry.party_size} {entry.party_size === 1 ? 'pessoa' : 'pessoas'}</span>
              </div>
            </>
          )}

          {/* Notes */}
          {entry.notes && (
            <div className="bg-black border border-zinc-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-zinc-400 mb-1">Observações</p>
              <p className="text-white">{entry.notes}</p>
            </div>
          )}

          {/* Business Contact */}
          {entry.business && (
            <div className="border-t border-zinc-800 pt-6 space-y-3">
              {entry.business.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-400">{entry.business.address}</span>
                </div>
              )}
              {entry.business.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                  <a href={`tel:${entry.business.phone}`} className="text-blue-500 hover:underline">
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
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
                <Button
                  onClick={handleCopyLink}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </Button>
              </div>
              <Button
                onClick={handleCancel}
                disabled={canceling}
                className="w-full bg-red-600/10 border border-red-600/20 hover:bg-red-600/20 text-red-500"
              >
                {canceling ? 'Cancelando...' : 'Sair da Fila'}
              </Button>
            </>
          )}

          {(entry.status === 'completed' || entry.status === 'cancelled') && (
            <Button
              onClick={() => router.push(`/fila/${entry.business_id}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Voltar para a Fila
            </Button>
          )}
        </div>

        {/* Auto-refresh notice */}
        {entry.status === 'waiting' && (
          <p className="text-xs text-zinc-500 text-center mt-4">
            Esta página atualiza automaticamente em tempo real
          </p>
        )}
      </div>
    </div>
  )
}
