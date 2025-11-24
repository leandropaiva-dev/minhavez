'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Users, Phone, Mail, MessageSquare, AlertCircle } from 'react-feather'
import { joinQueue } from '@/lib/queue/actions'

interface JoinQueueFormProps {
  businessId: string
  businessName: string
}

export default function JoinQueueForm({ businessId }: JoinQueueFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    partySize: 1,
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.customerName.trim()) {
      setError('Nome é obrigatório')
      setLoading(false)
      return
    }

    const result = await joinQueue({
      businessId,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone || undefined,
      customerEmail: formData.customerEmail || undefined,
      partySize: formData.partySize,
      notes: formData.notes || undefined,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.data) {
      // Redireciona para página de espera
      router.push(`/fila/${businessId}/espera/${result.data.id}`)
    }
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-white mb-2">
        Entrar na Fila
      </h2>
      <p className="text-zinc-400 mb-6">
        Preencha seus dados para entrar na fila de espera
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Nome *
          </label>
          <input
            type="text"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="Seu nome completo"
            className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            required
          />
        </div>

        {/* Telefone */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Telefone (Opcional)
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              placeholder="+351 912 345 678"
              className="w-full pl-11 pr-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Email (Opcional)
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="seu@email.com"
              className="w-full pl-11 pr-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tamanho do grupo */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Número de Pessoas
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="number"
              min="1"
              max="20"
              value={formData.partySize}
              onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
              className="w-full pl-11 pr-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Observações (Opcional)
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-zinc-500" />
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Alguma preferência ou observação especial?"
              rows={3}
              className="w-full pl-11 pr-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
        >
          {loading ? 'Entrando na fila...' : 'Entrar na Fila'}
        </Button>

        <p className="text-xs text-zinc-500 text-center mt-4">
          Você receberá um link para acompanhar sua posição na fila
        </p>
      </form>
    </div>
  )
}
