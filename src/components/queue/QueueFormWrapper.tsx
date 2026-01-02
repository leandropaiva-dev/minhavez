'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'react-feather'
import { createClient } from '@/lib/supabase/client'
import QueueFormWithServices from './QueueFormWithServices'

interface Service {
  id: string
  name: string
  description?: string | null
  photo_url: string
  price_cents?: number | null
  estimated_duration_minutes?: number | null
}

interface QueueFormWrapperProps {
  businessId: string
  businessName: string
}

export default function QueueFormWrapper({
  businessId,
  businessName,
}: QueueFormWrapperProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [entryId, setEntryId] = useState<string | null>(null)

  useEffect(() => {
    loadServices()
  }, [businessId])

  const loadServices = async () => {
    try {
      const supabase = createClient()

      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('available_in_queue', true)
        .order('position')

      setServices(servicesData || [])
    } catch (err) {
      console.error('Error loading services:', err)
      setError('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: {
    customer_name: string
    customer_phone: string
    party_size: number
    selected_service: string | null
    notes: string
  }) => {
    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from('queue_entries')
        .insert({
          business_id: businessId,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          party_size: formData.party_size,
          selected_service: formData.selected_service,
          notes: formData.notes || null,
          status: 'waiting',
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      setEntryId(data.id)
      setSuccess(true)
    } catch (err) {
      const error = err as Error
      console.error('Error joining queue:', error)
      setError(error.message || 'Erro ao entrar na fila. Tente novamente.')
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success && entryId) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Você está na fila!
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Acompanhe sua posição e aguarde ser chamado
        </p>
        <button
          onClick={() => router.push(`/fila/${businessId}/espera/${entryId}`)}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Ver Minha Posição
        </button>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhum serviço disponível na fila no momento
        </p>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      <QueueFormWithServices
        businessId={businessId}
        businessName={businessName}
        services={services}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
