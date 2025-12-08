'use client'

import { useState, useEffect } from 'react'
import { Filter, Activity, User, FileText, Calendar } from 'lucide-react'
import { getAuditLog, getAuditStats } from '@/lib/admin/audit'

interface AuditEntry {
  id: string
  admin_user_id: string
  admin_email: string
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalActions: 0,
    actionsToday: 0,
    actionsThisWeek: 0,
    actionsByType: {} as Record<string, number>
  })
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    limit: 50
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  async function loadData() {
    setLoading(true)

    const [logsResult, statsResult] = await Promise.all([
      getAuditLog({
        action: filters.action || undefined,
        resourceType: filters.resourceType || undefined,
        limit: filters.limit
      }),
      getAuditStats()
    ])

    if (logsResult.success && logsResult.data) {
      setLogs(logsResult.data as AuditEntry[])
    }

    if (statsResult.success && statsResult.data) {
      setStats(statsResult.data)
    }

    setLoading(false)
  }

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
    if (action.includes('update') || action.includes('extend')) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
    if (action.includes('delete') || action.includes('deactivate')) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
    return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
  }

  const getActionIcon = (action: string) => {
    if (action.includes('coupon')) return '🎫'
    if (action.includes('user')) return '👤'
    if (action.includes('subscription') || action.includes('trial')) return '💳'
    return '📝'
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
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
          Audit Log
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Histórico de todas as ações administrativas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total de Ações</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalActions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Hoje</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.actionsToday}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Últimos 7 dias</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.actionsThisWeek}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-zinc-500" />
          <h3 className="font-semibold text-zinc-900 dark:text-white">Filtros</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tipo de Ação
            </label>
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="">Todas</option>
              {Object.keys(stats.actionsByType).map(action => (
                <option key={action} value={action}>
                  {action} ({stats.actionsByType[action]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tipo de Recurso
            </label>
            <select
              value={filters.resourceType}
              onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="">Todos</option>
              <option value="coupon">Cupons</option>
              <option value="user">Usuários</option>
              <option value="business">Estabelecimentos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Limite
            </label>
            <select
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            >
              <option value="25">25 registros</option>
              <option value="50">50 registros</option>
              <option value="100">100 registros</option>
              <option value="500">500 registros</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Data/Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Ação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Recurso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Detalhes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400">
                    {new Date(log.created_at).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm text-zinc-900 dark:text-white">
                        {log.admin_email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                      <span>{getActionIcon(log.action)}</span>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 capitalize">
                    {log.resource_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                    {log.details && (
                      <details className="cursor-pointer">
                        <summary className="hover:text-purple-600 dark:hover:text-purple-400">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-xs overflow-auto max-w-md">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">
              Nenhuma ação registrada
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
