'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'react-feather'
import { createClient } from '@/lib/supabase/client'
import MultiStepReservationForm from './MultiStepReservationForm'

interface Service {
  id: string
  name: string
  description?: string | null
  photo_url: string
  price_cents?: number | null
  estimated_duration_minutes?: number | null
}

interface Professional {
  id: string
  name: string
  description?: string | null
  photo_url?: string | null
}

interface NewReservationWrapperProps {
  businessId: string
  businessName: string
}

export default function NewReservationWrapper({
  businessId,
  businessName,
}: NewReservationWrapperProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [services, setServices] = useState<Service[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [config, setConfig] = useState({
    requiresProfessional: false,
    requiresPayment: false,
  })

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId])

  const loadData = async () => {
    try {
      const supabase = createClient()

      // Buscar serviços ativos disponíveis em reservas
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .eq('available_in_reservations', true)
        .order('position')

      // Buscar profissionais ativos
      const { data: professionalsData } = await supabase
        .from('professionals')
        .select('*')
        .eq('business_id', businessId)
        .eq('is_active', true)
        .order('position')

      // Buscar configurações do negócio
      const { data: businessData } = await supabase
        .from('businesses')
        .select('reservation_requires_professional, reservation_requires_payment')
        .eq('id', businessId)
        .single()

      setServices(servicesData || [])
      setProfessionals(professionalsData || [])
      setConfig({
        requiresProfessional: businessData?.reservation_requires_professional || false,
        requiresPayment: businessData?.reservation_requires_payment || false,
      })
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Erro ao carregar informações')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (formData: {
    customer_name: string
    customer_email: string
    customer_phone: string
    selected_service: string | null
    selected_professional: string | null
    reservation_date: string
    reservation_time: string
    notes: string
  }) => {
    setError(null)

    try {
      const supabase = createClient()

      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          business_id: businessId,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email,
          selected_service: formData.selected_service,
          reservation_date: formData.reservation_date,
          reservation_time: formData.reservation_time,
          notes: formData.notes || null,
          status: 'pending',
        })

      if (insertError) {
        throw insertError
      }

      setSuccess(true)
    } catch (err) {
      const error = err as Error
      console.error('Error creating reservation:', error)
      setError(error.message || 'Erro ao criar reserva. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
          Reserva Confirmada!
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">
          Você receberá uma confirmação em breve
        </p>
        <button
          onClick={() => {
            setSuccess(false)
            router.refresh()
          }}
          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Fazer outra reserva
        </button>
      </div>
    )
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-600 dark:text-zinc-400">
          Nenhum serviço disponível no momento
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

      <MultiStepReservationForm
        businessId={businessId}
        businessName={businessName}
        services={services}
        professionals={professionals}
        config={config}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
