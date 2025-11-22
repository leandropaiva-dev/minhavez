'use client'

import { useState, useEffect, useRef } from 'react'
import { QrCode, Download, Copy, Check, ExternalLink } from 'lucide-react'
import QRCodeLib from 'qrcode'
import Link from 'next/link'

interface QRCodeCardProps {
  businessId: string
  businessName: string
}

export default function QRCodeCard({ businessId, businessName }: QRCodeCardProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // URL da fila pública
  const queueUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/fila/${businessId}`

  useEffect(() => {
    console.log('QRCodeCard - Generating QR code for:', queueUrl, 'businessId:', businessId)

    const generateQRCode = async () => {
      try {
        if (canvasRef.current) {
          console.log('QRCodeCard - Canvas ref available, generating...')
          // Gera QR code com fundo transparente
          await QRCodeLib.toCanvas(canvasRef.current, queueUrl, {
            width: 180,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#00000000', // Transparente
            },
          })

          // Converte canvas para URL
          const url = canvasRef.current.toDataURL('image/png')
          setQrCodeUrl(url)
          console.log('QRCodeCard - QR code generated successfully')
        } else {
          console.log('QRCodeCard - Canvas ref not available yet')
        }
      } catch (error) {
        console.error('Erro ao gerar QR code:', error)
      }
    }

    if (queueUrl) {
      generateQRCode()
    }
  }, [queueUrl, businessId])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(queueUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Erro ao copiar link:', error)
    }
  }

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.download = `qrcode-${businessName.toLowerCase().replace(/\s+/g, '-')}.png`
      link.href = qrCodeUrl
      link.click()
    }
  }

  const handleOpenQueue = () => {
    window.open(queueUrl, '_blank')
  }

  // Check if businessId is valid - render early return
  if (!businessId || businessId === 'default') {
    return (
      <div className="relative group">
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-2 bg-yellow-600/10 rounded-lg flex-shrink-0">
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white truncate">Fila Pública</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">Complete o onboarding</p>
            </div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
            <p className="text-yellow-500 text-sm">
              ⚠️ Complete o onboarding em <Link href="/onboarding" className="underline">/onboarding</Link> para gerar seu QR code
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group h-80">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-700/5 h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-shrink-0">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-shrink-0">
            <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white truncate">QR Code</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Fila pública</p>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex-1 flex items-center justify-center py-2 overflow-hidden">
          <div className="bg-white rounded-lg p-2">
            <canvas
              ref={canvasRef}
              className="w-32 h-32 sm:w-36 sm:h-36"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0 mt-4">
          <button
            onClick={handleCopyLink}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors text-xs font-medium"
            title="Copiar link"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-xs">Copiar</span>
              </>
            )}
          </button>
          <button
            onClick={handleDownloadQR}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-xs font-medium"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-xs">Baixar</span>
          </button>
          <button
            onClick={handleOpenQueue}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-xs font-medium"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline text-xs">Abrir</span>
          </button>
        </div>
      </div>
    </div>
  )
}
