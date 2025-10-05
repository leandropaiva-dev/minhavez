'use client'

import { useState, useEffect, useRef } from 'react'
import { QrCode, Download, Copy, Check, ExternalLink } from 'lucide-react'
import QRCodeLib from 'qrcode'

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
    const generateQRCode = async () => {
      try {
        if (canvasRef.current) {
          // Gera QR code com fundo transparente
          await QRCodeLib.toCanvas(canvasRef.current, queueUrl, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#00000000', // Transparente
            },
          })

          // Converte canvas para URL
          const url = canvasRef.current.toDataURL('image/png')
          setQrCodeUrl(url)
        }
      } catch (error) {
        console.error('Erro ao gerar QR code:', error)
      }
    }

    if (queueUrl) {
      generateQRCode()
    }
  }, [queueUrl])

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

  return (
    <div className="relative group">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-purple-600/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-600/10 rounded-lg">
            <QrCode className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Fila Pública</h3>
            <p className="text-sm text-zinc-400">Compartilhe com seus clientes</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* QR Code Display */}
          <div className="flex flex-col items-center gap-4 py-4 bg-white rounded-lg">
            <canvas
              ref={canvasRef}
              className="w-64 h-64"
            />
          </div>

          {/* Link com ações */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 bg-black border border-zinc-800 rounded-lg">
              <input
                type="text"
                value={queueUrl}
                readOnly
                className="flex-1 bg-transparent text-zinc-300 text-sm outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                title="Copiar link"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            </div>

            {/* Botões de ação */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadQR}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Baixar QR Code
              </button>
              <button
                onClick={handleOpenQueue}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir Fila
              </button>
            </div>
          </div>

          <p className="text-xs text-zinc-500 text-center">
            Clientes podem escanear o QR code ou acessar o link para entrar na fila
          </p>
        </div>
      </div>
    </div>
  )
}
