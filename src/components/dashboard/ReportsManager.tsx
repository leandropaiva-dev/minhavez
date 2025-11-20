'use client'

import { useState } from 'react'
import { Calendar, Download, TrendingUp, TrendingDown, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const dailyData = [
  { date: '01/10', clientes: 23, tempo: 12 },
  { date: '02/10', clientes: 31, tempo: 15 },
  { date: '03/10', clientes: 28, tempo: 10 },
  { date: '04/10', clientes: 35, tempo: 14 },
  { date: '05/10', clientes: 42, tempo: 18 },
]

const hourlyData = [
  { hora: '09h', clientes: 5 },
  { hora: '10h', clientes: 12 },
  { hora: '11h', clientes: 18 },
  { hora: '12h', clientes: 25 },
  { hora: '13h', clientes: 20 },
  { hora: '14h', clientes: 15 },
  { hora: '15h', clientes: 22 },
  { hora: '16h', clientes: 28 },
  { hora: '17h', clientes: 30 },
  { hora: '18h', clientes: 18 },
]

const statusData = [
  { name: 'Atendidos', value: 156, color: '#10b981' },
  { name: 'Cancelados', value: 12, color: '#ef4444' },
  { name: 'Não Compareceram', value: 8, color: '#f59e0b' },
]

export default function ReportsManager() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Button
            onClick={() => setPeriod('7d')}
            variant={period === '7d' ? 'default' : 'outline'}
            className={
              period === '7d'
                ? 'bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm'
                : 'border-zinc-700 text-xs sm:text-sm'
            }
          >
            7 dias
          </Button>
          <Button
            onClick={() => setPeriod('30d')}
            variant={period === '30d' ? 'default' : 'outline'}
            className={
              period === '30d'
                ? 'bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm'
                : 'border-zinc-700 text-xs sm:text-sm'
            }
          >
            30 dias
          </Button>
          <Button
            onClick={() => setPeriod('90d')}
            variant={period === '90d' ? 'default' : 'outline'}
            className={
              period === '90d'
                ? 'bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm'
                : 'border-zinc-700 text-xs sm:text-sm'
            }
          >
            90 dias
          </Button>
        </div>

        <Button className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm w-full sm:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>12%</span>
            </div>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mb-1">Total de Clientes</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">1,245</p>
          <p className="text-zinc-500 text-xs mt-2">+145 vs mês anterior</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>8%</span>
            </div>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mb-1">Taxa de Conversão</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">94.5%</p>
          <p className="text-zinc-500 text-xs mt-2">+3.2% vs mês anterior</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1 text-red-500 text-xs sm:text-sm">
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>2%</span>
            </div>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mb-1">Tempo Médio Espera</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">12min</p>
          <p className="text-zinc-500 text-xs mt-2">-15s vs mês anterior</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-purple-500/10 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
            </div>
            <div className="flex items-center gap-1 text-green-500 text-xs sm:text-sm">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>15%</span>
            </div>
          </div>
          <p className="text-zinc-400 text-xs sm:text-sm mb-1">Média Diária</p>
          <p className="text-2xl sm:text-3xl font-bold text-white">42</p>
          <p className="text-zinc-500 text-xs mt-2">+6 clientes/dia</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Customers Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
            Clientes por Dia
          </h3>
          <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-[300px] px-2 sm:px-0">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clientes"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorClientes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Hourly Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
            Distribuição por Horário
          </h3>
          <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-[300px] px-2 sm:px-0">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="hora" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="clientes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Status Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
            Status dos Atendimentos
          </h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs sm:text-sm text-zinc-400 truncate">{item.name}</span>
                <span className="text-xs sm:text-sm font-semibold text-white">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wait Time Trend */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">
            Tempo de Espera (minutos)
          </h3>
          <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
            <div className="min-w-[300px] px-2 sm:px-0">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                  <YAxis stroke="#71717a" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tempo"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
