'use client'

import { useState } from 'react'
import { Plus, Phone, Check, X, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QueueCustomer {
  id: string
  name: string
  phone: string
  position: number
  waitTime: number
  status: 'waiting' | 'called' | 'serving'
  joinedAt: Date
}

export default function QueueManager() {
  const [queue, setQueue] = useState<QueueCustomer[]>([
    {
      id: '1',
      name: 'João Silva',
      phone: '+351 912 345 678',
      position: 1,
      waitTime: 5,
      status: 'waiting',
      joinedAt: new Date(Date.now() - 5 * 60000),
    },
    {
      id: '2',
      name: 'Maria Santos',
      phone: '+351 913 456 789',
      position: 2,
      waitTime: 12,
      status: 'waiting',
      joinedAt: new Date(Date.now() - 12 * 60000),
    },
    {
      id: '3',
      name: 'Pedro Costa',
      phone: '+351 914 567 890',
      position: 3,
      waitTime: 18,
      status: 'called',
      joinedAt: new Date(Date.now() - 18 * 60000),
    },
  ])

  const [showAddModal, setShowAddModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' })

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) return

    const newEntry: QueueCustomer = {
      id: Date.now().toString(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      position: queue.length + 1,
      waitTime: 0,
      status: 'waiting',
      joinedAt: new Date(),
    }

    setQueue([...queue, newEntry])
    setNewCustomer({ name: '', phone: '' })
    setShowAddModal(false)
  }

  const handleCallNext = (id: string) => {
    setQueue(
      queue.map((customer) =>
        customer.id === id ? { ...customer, status: 'called' as const } : customer
      )
    )
  }

  const handleStartServing = (id: string) => {
    setQueue(
      queue.map((customer) =>
        customer.id === id ? { ...customer, status: 'serving' as const } : customer
      )
    )
  }

  const handleComplete = (id: string) => {
    setQueue(queue.filter((customer) => customer.id !== id))
  }

  const handleRemove = (id: string) => {
    setQueue(queue.filter((customer) => customer.id !== id))
  }

  const statusConfig = {
    waiting: {
      label: 'Aguardando',
      color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    called: {
      label: 'Chamado',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    serving: {
      label: 'Atendendo',
      color: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
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
                {queue.filter((c) => c.status === 'serving').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Clientes na Fila</h2>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </Button>
      </div>

      {/* Queue List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        {queue.length === 0 ? (
          <div className="p-12 text-center">
            <User className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400">Nenhum cliente na fila</p>
            <p className="text-zinc-500 text-sm mt-2">
              Adicione o primeiro cliente para começar
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {queue.map((customer) => {
              const status = statusConfig[customer.status]
              return (
                <div
                  key={customer.id}
                  className="p-6 hover:bg-zinc-950 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Position */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {customer.position}
                        </span>
                      </div>

                      {/* Info */}
                      <div>
                        <h3 className="font-semibold text-white">
                          {customer.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-sm text-zinc-400">{customer.phone}</p>
                          <p className="text-sm text-zinc-500">
                            • {customer.waitTime} min de espera
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium border',
                          status.color
                        )}
                      >
                        {status.label}
                      </span>

                      {customer.status === 'waiting' && (
                        <Button
                          onClick={() => handleCallNext(customer.id)}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Chamar
                        </Button>
                      )}

                      {customer.status === 'called' && (
                        <Button
                          onClick={() => handleStartServing(customer.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Atender
                        </Button>
                      )}

                      {customer.status === 'serving' && (
                        <Button
                          onClick={() => handleComplete(customer.id)}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Concluir
                        </Button>
                      )}

                      <Button
                        onClick={() => handleRemove(customer.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500/20 text-red-500 hover:bg-red-500/10"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Adicionar Cliente à Fila
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, name: e.target.value })
                  }
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({ ...newCustomer, phone: e.target.value })
                  }
                  placeholder="+351 912 345 678"
                  className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowAddModal(false)}
                variant="outline"
                className="flex-1 border-zinc-700"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddCustomer}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!newCustomer.name || !newCustomer.phone}
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
