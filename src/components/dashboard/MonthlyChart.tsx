'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'Jan', value: 120 },
  { name: 'Fev', value: 340 },
  { name: 'Mar', value: 180 },
  { name: 'Abr', value: 280 },
  { name: 'Mai', value: 240 },
  { name: 'Jun', value: 190 },
  { name: 'Jul', value: 380 },
  { name: 'Ago', value: 160 },
  { name: 'Set', value: 290 },
  { name: 'Out', value: 420 },
  { name: 'Nov', value: 350 },
  { name: 'Dez', value: 310 },
]

export default function MonthlyChart() {
  return (
    <div className="relative group">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/5">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg">Atendimentos Mensais</h3>
            <p className="text-zinc-500 text-xs sm:text-sm">Total de clientes atendidos por mês</p>
          </div>
        </div>

        <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
          <div className="min-w-[400px] px-2 sm:px-0">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  cursor={{ fill: '#27272a' }}
                />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
