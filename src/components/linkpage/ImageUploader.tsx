'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader, Crop, RotateCw, Check } from 'react-feather'
import ReactCrop, { type Crop as CropType, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import type { BackgroundImageSize } from '@/types/linkpage.types'

interface ImageUploaderProps {
  label: string
  value: string | null
  onChange: (url: string | null) => void
  businessId: string
  bucket?: string
  folder?: string
  aspectRatio?: string
  showSizeOptions?: boolean
  imageSize?: BackgroundImageSize
  onImageSizeChange?: (size: BackgroundImageSize) => void
  maxWidth?: string
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      { unit: '%', width: 90 },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageUploader({
  label,
  value,
  onChange,
  businessId,
  bucket = 'linkpage-images',
  folder = 'images',
  aspectRatio = 'aspect-video',
  showSizeOptions = false,
  imageSize = 'cover',
  onImageSizeChange,
  maxWidth = 'max-w-xs',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState<CropType>()
  const [rotation, setRotation] = useState(0)
  const [completedCrop, setCompletedCrop] = useState<CropType>()
  const inputRef = useRef<HTMLInputElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const aspect = aspectRatio === 'aspect-square' ? 1 : aspectRatio === 'aspect-[3/1]' ? 3 : 16/9
    setCrop(centerAspectCrop(width, height, aspect))
  }, [aspectRatio])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }

    setError(null)
    const url = URL.createObjectURL(file)
    setTempImageUrl(url)
    setEditMode(true)
    setRotation(0)
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const getCroppedImg = async (): Promise<Blob | null> => {
    if (!imgRef.current || !completedCrop) return null

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const image = imgRef.current
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    const pixelCrop = {
      x: completedCrop.x * scaleX,
      y: completedCrop.y * scaleY,
      width: completedCrop.width * scaleX,
      height: completedCrop.height * scaleY,
    }

    // Handle rotation
    const rotRad = (rotation * Math.PI) / 180
    const isRotated90or270 = rotation === 90 || rotation === 270

    if (isRotated90or270) {
      canvas.width = pixelCrop.height
      canvas.height = pixelCrop.width
    } else {
      canvas.width = pixelCrop.width
      canvas.height = pixelCrop.height
    }

    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate(rotRad)

    if (isRotated90or270) {
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        -pixelCrop.width / 2,
        -pixelCrop.height / 2,
        pixelCrop.width,
        pixelCrop.height
      )
    } else {
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        -pixelCrop.width / 2,
        -pixelCrop.height / 2,
        pixelCrop.width,
        pixelCrop.height
      )
    }

    ctx.restore()

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    })
  }

  const handleConfirmEdit = async () => {
    setUploading(true)
    setError(null)

    try {
      const blob = await getCroppedImg()
      if (!blob) {
        throw new Error('Falha ao processar imagem')
      }

      const supabase = createClient()
      const fileName = `${businessId}/${folder}/${Date.now()}.jpg`

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      onChange(urlData.publicUrl)
      setEditMode(false)
      setTempImageUrl(null)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Erro ao fazer upload. Tente novamente.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleCancelEdit = () => {
    setEditMode(false)
    setTempImageUrl(null)
    setRotation(0)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleRemove = async () => {
    if (!value) return

    try {
      const supabase = createClient()
      const url = new URL(value)
      const pathParts = url.pathname.split('/')
      const bucketIndex = pathParts.indexOf(bucket)
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/')
        await supabase.storage.from(bucket).remove([filePath])
      }
    } catch (err) {
      console.error('Error removing file:', err)
    }

    onChange(null)
  }

  // Edit Mode - Image Cropper
  if (editMode && tempImageUrl) {
    return (
      <div className="space-y-3">
        <Label className="text-zinc-700 dark:text-zinc-300">{label}</Label>

        <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Editar Imagem</span>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRotate}
                className="gap-1"
              >
                <RotateCw className="w-4 h-4" />
                Girar
              </Button>
            </div>
          </div>

          <div className="flex justify-center bg-zinc-200 dark:bg-zinc-900 rounded-lg overflow-hidden">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              className="max-h-[300px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={tempImageUrl}
                alt="Editar"
                onLoad={onImageLoad}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  maxHeight: '300px',
                  width: 'auto'
                }}
              />
            </ReactCrop>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={uploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmEdit}
              disabled={uploading}
              className="flex-1 gap-2"
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirmar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${maxWidth}`}>
      <Label className="text-zinc-700 dark:text-zinc-300">{label}</Label>

      {value && value.startsWith('http') ? (
        <div className="space-y-2">
          <div className={`relative ${aspectRatio} rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700`}>
            <Image
              src={value}
              alt={label}
              fill
              className={imageSize === 'cover' ? 'object-cover' : 'object-none'}
              style={imageSize === 'repeat' ? {
                objectFit: 'none',
                backgroundImage: `url(${value})`,
                backgroundRepeat: 'repeat',
                backgroundSize: 'auto',
              } : undefined}
            />
            <button
              onClick={handleRemove}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
              type="button"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {showSizeOptions && onImageSizeChange && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onImageSizeChange('cover')}
                className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors ${
                  imageSize === 'cover'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Cobrir
              </button>
              <button
                type="button"
                onClick={() => onImageSizeChange('repeat')}
                className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors ${
                  imageSize === 'repeat'
                    ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                    : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Repetir
              </button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-full gap-1 text-xs"
          >
            <Crop className="w-3 h-3" />
            Trocar imagem
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={`w-full ${aspectRatio} rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors flex flex-col items-center justify-center gap-1.5 text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900`}
        >
          {uploading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span className="text-xs">Enviando...</span>
            </>
          ) : (
            <>
              <Upload className="w-6 h-6" />
              <span className="text-xs">Enviar imagem</span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Máx. 5MB</span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
