'use client'

import { useState, useEffect } from 'react'
import { Search, Calendar, Building2, Clock, AlertCircle, Eye, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import {
  getAllUsers,
  extendTrial,
  updateSubscriptionStatus,
  type UserData
} from '@/lib/admin/users'
import UserDetailsModal from './UserDetailsModal'

export default function UsersManager() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    setLoading(true)
    const result = await getAllUsers()
    if (result.success && result.data) {
      setUsers(result.data as UserData[])
    }
    setLoading(false)
  }

  async function handleExtendTrial(businessId: string, days: number) {
    const result = await extendTrial(businessId, days)
    if (result.success) {
      await loadUsers()
      alert(`Trial estendido por ${days} dias!`)
    } else {
      alert(result.error)
    }
  }

  async function handleUpdateStatus(businessId: string, status: 'trial' | 'active' | 'canceled' | 'past_due') {
    const result = await updateSubscriptionStatus(businessId, status)
    if (result.success) {
      await loadUsers()
      alert('Status atualizado!')
    } else {
      alert(result.error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.businesses.some(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'past_due':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
      default:
        return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'trial': return 'Trial'
      case 'active': return 'Ativo'
      case 'canceled': return 'Cancelado'
      case 'past_due': return 'Vencido'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
              Gerenciamento de Usuários
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              {users.length} usuários cadastrados • {users.reduce((acc, u) => acc + u.businesses.length, 0)} estabelecimentos
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por email ou nome..."
              className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
          >
            {/* User Header */}
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link
                    href={`/admin/usuarios/${user.id}`}
                    className="inline-flex items-center gap-2 group"
                  >
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {user.email}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Cadastro: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    {user.last_sign_in_at && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Último acesso: {new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {user.businesses.length} estabelecimento{user.businesses.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => setSelectedUserId(user.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Ver Resumo
                  </button>
                </div>
              </div>
            </div>

            {/* Businesses */}
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {user.businesses.map((business) => {
                const trialEndsAt = business.trial_ends_at ? new Date(business.trial_ends_at) : null
                const isTrialExpired = trialEndsAt && trialEndsAt < new Date()

                return (
                  <div key={business.id} className="p-6 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-white">
                              {business.name}
                            </h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                              {business.business_type}
                            </p>
                          </div>
                        </div>

                        <div className="ml-13 flex flex-wrap items-center gap-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(business.subscription_status)}`}>
                            {getStatusLabel(business.subscription_status)}
                          </span>

                          {trialEndsAt && (
                            <div className={`flex items-center gap-1 text-xs ${isTrialExpired ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                              {isTrialExpired && <AlertCircle className="w-3 h-3" />}
                              Trial {isTrialExpired ? 'expirou' : 'termina'}: {trialEndsAt.toLocaleDateString('pt-BR')}
                            </div>
                          )}

                          <div className="text-xs text-zinc-400">
                            Criado: {new Date(business.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <select
                          onChange={(e) => handleUpdateStatus(business.id, e.target.value as 'trial' | 'active' | 'canceled')}
                          value={business.subscription_status}
                          className="text-sm px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                        >
                          <option value="trial">Trial</option>
                          <option value="active">Ativo</option>
                          <option value="canceled">Cancelado</option>
                          <option value="past_due">Vencido</option>
                        </select>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleExtendTrial(business.id, 7)}
                            className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            +7 dias
                          </button>
                          <button
                            onClick={() => handleExtendTrial(business.id, 30)}
                            className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            +30 dias
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado ainda'}
            </p>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUserId && (
        <UserDetailsModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}
