'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DynamicQueueForm from './DynamicQueueForm'

interface QueueFormWrapperProps {
  businessId: string
  businessName: string
}

export default function QueueFormWrapper({
  businessId,
}: QueueFormWrapperProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (formData: Record<string, any>) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          customerName: formData.customer_name,
          customerPhone: formData.customer_phone,
          customerEmail: formData.customer_email,
          partySize: formData.party_size || 1,
          notes: formData.notes,
          ...formData, // Include custom fields
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
        return
      }

      if (result.data?.id) {
        router.push(`/fila/${businessId}/espera/${result.data.id}`)
      }
    } catch (err) {
      setError('Erro ao entrar na fila. Tente novamente.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
      <DynamicQueueForm onSubmit={handleSubmit} loading={loading} />
    </div>
  )
}
