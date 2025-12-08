'use client'

import { useState, useEffect } from 'react'
import { Users, Gift, DollarSign, TrendingUp, Calendar, Activity } from 'lucide-react'
import Link from 'next/link'
import { getDashboardStats, type DashboardStats } from '@/lib/admin/stats'

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBusinesses: 0,
    activeCoupons: 0,
    totalRedemptions: 0,
    recentSignups: 0,
    recentReservations: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const result = await getDashboardStats()
      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
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
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
          Dashboard Administrativo
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Visão geral da plataforma MinhaVez
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Total Users */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Usuários Totais</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stats.totalUsers}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-medium">+{stats.recentSignups}</span>
            <span className="text-zinc-500 dark:text-zinc-400">últimos 7 dias</span>
          </div>
        </div>

        {/* Total Businesses */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg hover:shadow-pink-500/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-pink-600/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-pink-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Estabelecimentos</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stats.totalBusinesses}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-zinc-500 dark:text-zinc-400">Cadastrados na plataforma</span>
          </div>
        </div>

        {/* Active Coupons */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Gift className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Cupons Ativos</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stats.activeCoupons}
              </p>
            </div>
          </div>
          <Link
            href="/admin/cupons"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Gerenciar cupons →
          </Link>
        </div>

        {/* Total Redemptions */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg hover:shadow-green-500/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Cupons Usados</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stats.totalRedemptions}
              </p>
            </div>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Total de resgates
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg hover:shadow-orange-500/10 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Reservas (7d)</p>
              <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                {stats.recentReservations}
              </p>
            </div>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Últimos 7 dias
          </div>
        </div>

        {/* Platform Health */}
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <p className="text-sm text-white/80">Status da Plataforma</p>
              <p className="text-3xl font-bold">100%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/90">Todos os sistemas operacionais</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/cupons"
            className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center group-hover:bg-purple-600 transition-colors">
              <Gift className="w-5 h-5 text-purple-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">Criar Cupom</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Novo cupom de desconto</p>
            </div>
          </Link>

          <Link
            href="/admin/usuarios"
            className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group"
          >
            <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center group-hover:bg-pink-600 transition-colors">
              <Users className="w-5 h-5 text-pink-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">Ver Usuários</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Gerenciar usuários</p>
            </div>
          </Link>

          <Link
            href="/admin/audit"
            className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center group-hover:bg-blue-600 transition-colors">
              <Activity className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white">Audit Log</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Histórico de ações</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
