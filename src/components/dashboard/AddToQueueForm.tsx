'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Users, MessageSquare, ArrowLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'

interface AddToQueueFormProps {
  businessId: string
}

export default function AddToQueueForm({ businessId }: AddToQueueFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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

    try {
      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId,
          customerName: formData.customerName,
          customerPhone: formData.customerPhone || undefined,
          customerEmail: formData.customerEmail || undefined,
          partySize: formData.partySize,
          notes: formData.notes || undefined,
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/fila')
      }, 1500)
    } catch {
      setError('Erro ao adicionar cliente. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          Cliente Adicionado!
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Redirecionando para a fila...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
      <Link
        href="/dashboard/fila"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para a fila
      </Link>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nome */}
        <div>
          <Label htmlFor="customerName" className="text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <User className="w-4 h-4" />
            Nome do Cliente <span className="text-red-500">*</span>
          </Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="Nome completo"
            required
            className="mt-2"
            disabled={loading}
          />
        </div>

        {/* Telefone */}
        <div>
          <Label htmlFor="customerPhone" className="text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Telefone
          </Label>
          <Input
            id="customerPhone"
            type="tel"
            value={formData.customerPhone}
            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
            placeholder="(11) 98765-4321"
            className="mt-2"
            disabled={loading}
          />
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="customerEmail" className="text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            placeholder="email@exemplo.com"
            className="mt-2"
            disabled={loading}
          />
        </div>

        {/* Número de Pessoas */}
        <div>
          <Label htmlFor="partySize" className="text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Número de Pessoas
          </Label>
          <Input
            id="partySize"
            type="number"
            min={1}
            max={50}
            value={formData.partySize}
            onChange={(e) => setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })}
            className="mt-2"
            disabled={loading}
          />
        </div>

        {/* Observações */}
        <div>
          <Label htmlFor="notes" className="text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Observações
          </Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Alguma informação adicional..."
            rows={3}
            className="mt-2"
            disabled={loading}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/fila')}
            disabled={loading}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || !formData.customerName.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Adicionando...' : 'Adicionar na Fila'}
          </Button>
        </div>
      </form>
    </div>
  )
}
