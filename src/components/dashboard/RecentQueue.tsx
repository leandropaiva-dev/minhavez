'use client'

import { Filter, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QueueItem {
  id: string
  name: string
  phone: string
  position: number
  waitTime: string
  status: 'waiting' | 'called' | 'served' | 'cancelled'
}

const mockData: QueueItem[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+351 912 345 678',
    position: 1,
    waitTime: '5min',
    status: 'waiting',
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '+351 913 456 789',
    position: 2,
    waitTime: '12min',
    status: 'waiting',
  },
  {
    id: '3',
    name: 'Pedro Costa',
    phone: '+351 914 567 890',
    position: 3,
    waitTime: '18min',
    status: 'called',
  },
  {
    id: '4',
    name: 'Ana Ferreira',
    phone: '+351 915 678 901',
    position: 4,
    waitTime: '25min',
    status: 'waiting',
  },
  {
    id: '5',
    name: 'Carlos Oliveira',
    phone: '+351 916 789 012',
    position: 5,
    waitTime: '30min',
    status: 'served',
  },
]

const statusConfig = {
  waiting: { label: 'Aguardando', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  called: { label: 'Chamado', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  served: { label: 'Atendido', color: 'bg-green-500/10 text-green-500 border-green-500/20' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
}

export default function RecentQueue() {
  return (
    <div className="relative group">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/5">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold text-base sm:text-lg">Fila Atual</h3>
              <p className="text-zinc-500 text-xs sm:text-sm truncate">Clientes aguardando atendimento</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
              </button>
              <button className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                Ver Tudo
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                  Telefone
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Tempo
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {mockData.map((item) => {
                const status = statusConfig[item.status]
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-950 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-zinc-800 rounded-lg">
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {item.position}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <p className="text-xs sm:text-sm font-medium text-white">{item.name}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <p className="text-xs sm:text-sm text-zinc-400">{item.phone}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <p className="text-xs sm:text-sm text-zinc-400">{item.waitTime}</p>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-2 sm:px-3 py-1 rounded-full text-xs font-medium border',
                          status.color
                        )}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
