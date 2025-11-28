'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Phone, Mail, MessageSquare, CheckCircle, Star, ExternalLink } from 'react-feather'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { PageCustomization } from '@/types/page-customization.types'

interface ReservationFormProps {
  businessId: string
}

export default function ReservationForm({ businessId }: ReservationFormProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [confirmCustomization, setConfirmCustomization] = useState<PageCustomization | null>(null)
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(null)

  // Fetch confirmation page customization when success
  useEffect(() => {
    if (success) {
      const supabase = createClient()
      supabase
        .from('page_customizations')
        .select('*')
        .eq('business_id', businessId)
        .eq('page_type', 'reservation_confirm')
        .single()
        .then(({ data }) => {
          if (data) {
            setConfirmCustomization(data)
            // Start auto-redirect countdown if enabled
            if (data.auto_redirect_enabled && data.auto_redirect_url) {
              setRedirectCountdown(data.auto_redirect_delay || 5)
            }
          }
        })
    }
  }, [success, businessId])

  // Handle auto-redirect countdown
  useEffect(() => {
    if (redirectCountdown !== null && redirectCountdown > 0) {
      const timer = setTimeout(() => {
        setRedirectCountdown(redirectCountdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (redirectCountdown === 0 && confirmCustomization?.auto_redirect_url) {
      window.location.href = confirmCustomization.auto_redirect_url
    }
  }, [redirectCountdown, confirmCustomization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

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
          party_size: formData.party_size,
          reservation_date: formData.reservation_date,
          reservation_time: formData.reservation_time,
          notes: formData.notes || null,
          status: 'pending',
        })

      if (insertError) {
        throw insertError
      }

      setSuccess(true)
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        party_size: 2,
        reservation_date: '',
        reservation_time: '',
        notes: '',
      })
    } catch (err) {
      console.error('Error creating reservation:', err)
      setError('Erro ao criar reserva. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 sm:p-12">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Reserva Solicitada!
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sua reserva foi enviada com sucesso. Você receberá uma confirmação em breve.
          </p>
        </div>

        {/* Thank you message */}
        {confirmCustomization?.thank_you_message && (
          <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6 text-center">
            <p className="text-zinc-900 dark:text-white whitespace-pre-wrap">
              {confirmCustomization.thank_you_message}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {/* Review button */}
          {confirmCustomization?.review_link && (
            <button
              onClick={() => window.open(confirmCustomization.review_link!, '_blank')}
              className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Star className="w-5 h-5" />
              {confirmCustomization.review_button_text || 'Avaliar Atendimento'}
            </button>
          )}

          {/* CTA button */}
          {confirmCustomization?.cta_link && confirmCustomization?.cta_button_text && (
            <button
              onClick={() => window.open(confirmCustomization.cta_link!, '_blank')}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              {confirmCustomization.cta_icon === 'star' && <Star className="w-5 h-5" />}
              {confirmCustomization.cta_icon === 'external-link' && <ExternalLink className="w-5 h-5" />}
              {confirmCustomization.cta_button_text}
            </button>
          )}

          {/* Auto-redirect countdown */}
          {redirectCountdown !== null && redirectCountdown > 0 && (
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Redirecionando em <span className="text-blue-600 dark:text-blue-400 font-bold">{redirectCountdown}</span> segundo{redirectCountdown !== 1 ? 's' : ''}...
              </p>
            </div>
          )}

          {/* Back to form button */}
          <button
            onClick={() => {
              setSuccess(false)
              setRedirectCountdown(null)
            }}
            className="w-full px-6 py-3 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg font-medium transition-colors"
          >
            Fazer Outra Reserva
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
            Nome Completo *
          </label>
          <input
            type="text"
            required
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Seu nome"
          />
        </div>

        {/* Phone & Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefone
            </label>
            <input
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.customer_email}
              onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        {/* Party Size */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
            <Users className="w-4 h-4 inline mr-1" />
            Número de Pessoas *
          </label>
          <select
            required
            value={formData.party_size}
            onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) })}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'pessoa' : 'pessoas'}
              </option>
            ))}
          </select>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Data *
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.reservation_date}
              onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Horário *
            </label>
            <input
              type="time"
              required
              value={formData.reservation_time}
              onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Alguma preferência ou informação adicional?"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-lg",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? 'Enviando...' : 'Confirmar Reserva'}
        </button>

        <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
          * Campos obrigatórios
        </p>
      </form>
    </div>
  )
}
