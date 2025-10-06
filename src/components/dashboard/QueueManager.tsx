'use client'

import { useState, useEffect } from 'react'
import { Phone, Check, X, Clock, User, Bell } from 'lucide-react'
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

export default function QueueManager() {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchQueue()

    const supabase = createClient()
    const channel = supabase
      .channel('queue-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries' }, () => {
        fetchQueue()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const fetchQueue = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('queue_entries')
      .select('*')
      .in('status', ['waiting', 'called', 'attending'])
      .order('position', { ascending: true })

    if (data) setQueue(data)
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient()
    const updates: Record<string, string> = { status }

    if (status === 'called') updates.called_at = new Date().toISOString()
    else if (status === 'attending') updates.attended_at = new Date().toISOString()
    else if (status === 'completed') updates.completed_at = new Date().toISOString()

    await supabase.from('queue_entries').update(updates).eq('id', id)
    fetchQueue()
  }

  const calculateWaitTime = (joinedAt: string): string => {
    const joined = new Date(joinedAt)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - joined.getTime()) / 60000)
    if (diffMinutes < 60) return `${diffMinutes}min`
    return `${Math.floor(diffMinutes / 60)}h${diffMinutes % 60}min`
  }


  const statusConfig: Record<string, { label: string; color: string }> = {
    waiting: { label: 'Aguardando', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    called: { label: 'Chamado', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    attending: { label: 'Atendendo', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Na Fila</p>
              <p className="text-2xl font-bold text-white">
                {queue.filter((c) => c.status === 'waiting').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-lg">
              <Phone className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Chamados</p>
              <p className="text-2xl font-bold text-white">
                {queue.filter((c) => c.status === 'called').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <User className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-sm">Atendendo</p>
              <p className="text-2xl font-bold text-white">
                {queue.filter((c) => c.status === 'attending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Clientes na Fila</h2>
      </div>

      {/* Queue List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><p className="text-zinc-500">Carregando...</p></div>
        ) : queue.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhum cliente na fila</p>
            <p className="text-zinc-500 text-sm mt-2">Clientes entram via QR code</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {queue.map((entry) => {
              const status = statusConfig[entry.status] || statusConfig.waiting
              const waitTime = calculateWaitTime(entry.joined_at)

              return (
                <div key={entry.id} className="p-6 hover:bg-zinc-950 transition-colors">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-white">{entry.position}</span>
                      </div>

                      <div>
                        <h3 className="font-semibold text-white">{entry.customer_name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-zinc-400">
                          {entry.customer_phone && <span>{entry.customer_phone}</span>}
                          <span>• {entry.party_size} {entry.party_size === 1 ? 'pessoa' : 'pessoas'}</span>
                          <span>• {waitTime}</span>
                        </div>
                        {entry.notes && <p className="text-sm text-zinc-500 mt-1">📝 {entry.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={cn('px-3 py-1 rounded-full text-xs font-medium border', status.color)}>
                        {status.label}
                      </span>

                      {entry.status === 'waiting' && (
                        <Button onClick={() => updateStatus(entry.id, 'called')} size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Bell className="w-4 h-4 mr-2" />Chamar
                        </Button>
                      )}

                      {entry.status === 'called' && (
                        <Button onClick={() => updateStatus(entry.id, 'attending')} size="sm" className="bg-green-600 hover:bg-green-700">
                          <User className="w-4 h-4 mr-2" />Atender
                        </Button>
                      )}

                      {entry.status === 'attending' && (
                        <Button onClick={() => updateStatus(entry.id, 'completed')} size="sm" className="bg-green-600 hover:bg-green-700">
                          <Check className="w-4 h-4 mr-2" />Concluir
                        </Button>
                      )}

                      {(entry.status === 'waiting' || entry.status === 'called') && (
                        <Button onClick={() => updateStatus(entry.id, 'cancelled')} size="sm" variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                          <X className="w-4 h-4" />
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
  )
}
