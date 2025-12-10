'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DynamicQueueForm from './DynamicQueueForm'
import { getPublicFormConfig } from '@/lib/config/form-config-api'
import type { QueueFormConfig } from '@/types/config.types'

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
  const [config, setConfig] = useState<QueueFormConfig | null>(null)
  const [configLoading, setConfigLoading] = useState(true)

  useEffect(() => {
    async function loadConfig() {
      try {
        const formConfig = await getPublicFormConfig(businessId, 'queue')
        setConfig(formConfig as QueueFormConfig)
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
      const payload = {
        businessId,
        customerName: formData.customer_name,
        customerPhone: formData.customer_phone || undefined,
        customerEmail: formData.customer_email || undefined,
        partySize: formData.party_size || 1,
        notes: formData.notes || undefined,
        selectedService: formData.selected_service || undefined,
      }

      console.log('[Mobile Debug] Enviando payload:', payload)
      console.log('[Mobile Debug] User Agent:', navigator.userAgent)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch('/api/queue/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log('[Mobile Debug] Response status:', response.status)
      console.log('[Mobile Debug] Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        let errorText = ''
        try {
          errorText = await response.text()
        } catch (e) {
          errorText = 'Não foi possível ler a resposta'
        }
        console.error('[Mobile Debug] Response error:', errorText)

        // Mostrar erro detalhado no mobile
        const detailedError = `Status: ${response.status}\nURL: ${response.url}\nError: ${errorText}`
        alert(`[DEBUG] Erro na requisição:\n${detailedError}`)
        setError(detailedError)
        return
      }

      const result = await response.json()
      console.log('[Mobile Debug] Response result:', result)

      if (result.error) {
        alert(`[DEBUG] Erro do servidor: ${result.error}`)
        setError(result.error)
        return
      }

      if (result.data?.id) {
        console.log('[Mobile Debug] Redirecting to:', `/fila/${businessId}/espera/${result.data.id}`)
        alert(`[DEBUG] Sucesso! Redirecionando para: /fila/${businessId}/espera/${result.data.id}`)
        router.push(`/fila/${businessId}/espera/${result.data.id}`)
      } else {
        alert(`[DEBUG] Resposta inválida: ${JSON.stringify(result)}`)
        setError('Resposta inválida do servidor')
      }
    } catch (err) {
      console.error('[Mobile Debug] Exception:', err)

      let errorMessage = ''
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Timeout: A requisição demorou muito. Verifique sua conexão.'
        } else if (err.message.includes('fetch')) {
          errorMessage = 'Erro de rede: Verifique sua conexão com a internet.'
        } else {
          errorMessage = `Erro: ${err.message}`
        }
      } else {
        errorMessage = 'Erro desconhecido. Tente novamente.'
      }

      alert(`[DEBUG] Exception:\n${errorMessage}\n${err}`)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
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
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-6">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}
      {config && <DynamicQueueForm onSubmit={handleSubmit} loading={loading} config={config} />}
    </div>
  )
}
