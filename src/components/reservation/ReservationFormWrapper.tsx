'use client'

import { useState, useEffect } from 'react'
import { CheckCircle } from 'react-feather'
import { createClient } from '@/lib/supabase/client'
import DynamicReservationForm from './DynamicReservationForm'
import { getPublicFormConfig } from '@/lib/config/form-config-api'
import type { ReservationFormConfig } from '@/types/config.types'

interface ReservationFormWrapperProps {
  businessId: string
  businessName: string
}

export default function ReservationFormWrapper({
  businessId,
  businessName,
}: ReservationFormWrapperProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [config, setConfig] = useState<ReservationFormConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)
  const [reservationDetails, setReservationDetails] = useState<{
    date: string
    time: string
  } | null>(null)

  useEffect(() => {
    async function loadConfig() {
      try {
        const formConfig = await getPublicFormConfig(businessId, 'reservation')
        setConfig(formConfig as ReservationFormConfig)
      } catch (err) {
        console.error('Error loading form config:', err)
      } finally {
        setConfigLoading(false)
      }
    }

    loadConfig()
  }, [businessId])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = async (formData: Record<string, any>) => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Check if reservation time is within business hours
      const datetime = new Date(`${formData.reservation_date}T${formData.reservation_time}`)

      const { data: isOpen, error: checkError } = await supabase
        .rpc('is_reservation_time_open', {
          p_business_id: businessId,
          p_datetime: datetime.toISOString(),
        })

      if (checkError) {
        console.error('Error checking schedule:', checkError)
        // Continue anyway if function doesn't exist yet
      } else if (isOpen === false) {
        setError('Desculpe, não aceitamos reservas neste horário. Por favor, escolha outro horário.')
        setLoading(false)
        return
      }

      // Create reservation
      const { error: insertError } = await supabase
        .from('reservations')
        .insert({
          business_id: businessId,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone || null,
          customer_email: formData.customer_email || null,
          party_size: formData.party_size || 2,
          reservation_date: formData.reservation_date,
          reservation_time: formData.reservation_time,
          notes: formData.notes || null,
          selected_service: formData.selected_service || null,
          status: 'pending',
        })

      if (insertError) {
        throw insertError
      }

      setReservationDetails({
        date: formData.reservation_date,
        time: formData.reservation_time,
      })
      setSuccess(true)
    } catch (err) {
      console.error('Error creating reservation:', err)
      setError('Erro ao criar reserva. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success && reservationDetails) {
    const formattedDate = new Date(reservationDetails.date + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })

    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          Reserva Solicitada!
        </h3>
        <p className="text-zinc-400 mb-4">
          Sua reserva em <span className="text-white font-medium">{businessName}</span> foi enviada.
        </p>
        <div className="bg-zinc-950 rounded-xl p-4 mb-6">
          <p className="text-sm text-zinc-400 mb-1">Data e Horário</p>
          <p className="text-lg font-semibold text-white capitalize">
            {formattedDate}
          </p>
          <p className="text-2xl font-bold text-blue-500">
            {reservationDetails.time}
          </p>
        </div>
        <p className="text-sm text-zinc-500 mb-4">
          Você receberá uma confirmação em breve.
        </p>
        <button
          onClick={() => {
            setSuccess(false)
            setReservationDetails(null)
          }}
          className="text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors"
        >
          Fazer outra reserva
        </button>
      </div>
    )
  }

  if (configLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      {config && <DynamicReservationForm onSubmit={handleSubmit} loading={loading} config={config} />}
    </div>
  )
}
