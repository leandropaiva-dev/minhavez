'use client'

import { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { X, ZoomIn, ZoomOut } from 'react-feather'
import { Button } from './button'

interface Point {
  x: number
  y: number
}

interface Area {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropModalProps {
  isOpen: boolean
  imageSrc: string
  onClose: () => void
  onCropComplete: (croppedImage: File) => void
  aspectRatio?: number
  shape?: 'rect' | 'round'
  title?: string
}

export default function ImageCropModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio = 1,
  shape = 'rect',
  title = 'Ajustar Imagem'
}: ImageCropModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const onCropChange = useCallback((location: Point) => {
    setCrop(location)
  }, [])

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom)
  }, [])

  const onCropCompleteCallback = useCallback(
    (croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return

    setIsProcessing(true)

    try {
      const image = new Image()
      image.src = imageSrc

      await new Promise((resolve) => {
        image.onload = resolve
      })

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        throw new Error('Failed to get canvas context')
      }

      // Set canvas size to cropped area
      canvas.width = croppedAreaPixels.width
      canvas.height = croppedAreaPixels.height

      // Draw cropped image
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      )

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/jpeg', 0.95)
      })

      // Convert blob to file
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' })
      onCropComplete(file)
    } catch (error) {
      console.error('Error creating cropped image:', error)
      alert('Erro ao processar imagem')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-xl w-full max-w-2xl overflow-hidden border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cropper */}
        <div className="relative h-[400px] bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={shape}
            showGrid={true}
            onCropChange={onCropChange}
            onCropComplete={onCropCompleteCallback}
            onZoomChange={onZoomChange}
          />
        </div>

        {/* Controls */}
        <div className="p-4 space-y-4 bg-zinc-900">
          {/* Zoom Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <span>Zoom</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <ZoomOut className="w-4 h-4 text-zinc-400" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <ZoomIn className="w-4 h-4 text-zinc-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-zinc-700 hover:bg-zinc-800 text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={createCroppedImage}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? 'Processando...' : 'Aplicar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
