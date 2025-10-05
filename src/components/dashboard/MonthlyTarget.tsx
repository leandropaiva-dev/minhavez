'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MonthlyTargetProps {
  percentage: number
  target: number
  revenue: number
  today: number
}

export default function MonthlyTarget({
  percentage = 75.55,
  target = 20000,
  revenue = 20000,
  today = 20000,
}: MonthlyTargetProps) {
  const data = [
    { name: 'Completed', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ]

  const COLORS = ['#2563eb', '#27272a']

  return (
    <div className="relative group">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg">Meta Mensal</h3>
            <p className="text-zinc-500 text-xs sm:text-sm">Meta definida para cada mês</p>
          </div>
        </div>

        {/* Chart */}
        <div className="relative h-40 sm:h-48 mb-4 sm:mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={0}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl sm:text-4xl font-bold text-white">{percentage}%</p>
            <p className="text-green-500 text-xs sm:text-sm font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              +10%
            </p>
          </div>
        </div>

        <p className="text-center text-zinc-400 text-xs sm:text-sm mb-4 sm:mb-6 px-2">
          Você ganhou €{today.toLocaleString()} hoje, é maior que o mês passado.
          <br className="hidden sm:block" />
          <span className="sm:inline"> Continue o bom trabalho!</span>
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="text-center">
            <p className="text-zinc-500 text-xs mb-1">Meta</p>
            <p className="text-white text-sm font-semibold flex items-center justify-center gap-1">
              €{(target / 1000).toFixed(0)}K
              <TrendingDown className="w-3 h-3 text-red-500" />
            </p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 text-xs mb-1">Receita</p>
            <p className="text-white text-sm font-semibold flex items-center justify-center gap-1">
              €{(revenue / 1000).toFixed(0)}K
              <TrendingUp className="w-3 h-3 text-green-500" />
            </p>
          </div>
          <div className="text-center">
            <p className="text-zinc-500 text-xs mb-1">Hoje</p>
            <p className="text-white text-sm font-semibold flex items-center justify-center gap-1">
              €{(today / 1000).toFixed(0)}K
              <TrendingUp className="w-3 h-3 text-green-500" />
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
