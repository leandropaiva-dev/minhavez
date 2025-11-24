'use client'

import { useState } from 'react'
import { Plus, Search, MoreVertical, Mail, Phone, Calendar, TrendingUp } from 'react-feather'
import { Button } from '@/components/ui/button'

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  totalVisits: number
  lastVisit: Date
  avgWaitTime: string
  status: 'active' | 'inactive'
}

export default function CustomersManager() {
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '+351 912 345 678',
      totalVisits: 15,
      lastVisit: new Date('2025-10-01'),
      avgWaitTime: '12min',
      status: 'active',
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@email.com',
      phone: '+351 913 456 789',
      totalVisits: 23,
      lastVisit: new Date('2025-09-28'),
      avgWaitTime: '8min',
      status: 'active',
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@email.com',
      phone: '+351 914 567 890',
      totalVisits: 8,
      lastVisit: new Date('2025-08-15'),
      avgWaitTime: '15min',
      status: 'inactive',
    },
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs sm:text-sm">Total Clientes</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{customers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs sm:text-sm">Ativos</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {customers.filter((c) => c.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs sm:text-sm">Novos (30d)</p>
              <p className="text-xl sm:text-2xl font-bold text-white">12</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-zinc-400 text-xs sm:text-sm">Média Visitas</p>
              <p className="text-xl sm:text-2xl font-bold text-white">15.3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Customers Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead className="bg-zinc-950 border-b border-zinc-800">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden md:table-cell">
                  Contato
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                  Visitas
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden lg:table-cell">
                  Última Visita
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden xl:table-cell">
                  Tempo Médio
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">

                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-zinc-950 transition-colors"
                >
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm sm:text-base text-white font-semibold">
                          {customer.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm sm:text-base truncate">{customer.name}</p>
                        <p className="text-xs sm:text-sm text-zinc-500 md:hidden truncate">
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <p className="text-white font-semibold text-sm sm:text-base">{customer.totalVisits}</p>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                    <p className="text-zinc-400 text-xs sm:text-sm">
                      {customer.lastVisit.toLocaleDateString('pt-PT')}
                    </p>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden xl:table-cell">
                    <p className="text-zinc-400 text-xs sm:text-sm">{customer.avgWaitTime}</p>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${
                        customer.status === 'active'
                          ? 'bg-green-500/10 text-green-500 border-green-500/20'
                          : 'bg-zinc-700/10 text-zinc-500 border-zinc-700/20'
                      }`}
                    >
                      {customer.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                      <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-zinc-400">Nenhum cliente encontrado</p>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Novo Cliente</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="joao@email.com"
                  className="w-full px-4 py-2 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
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
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
