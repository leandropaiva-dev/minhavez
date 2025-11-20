'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { detectCountry, getCountryConfig, type Country } from '@/lib/utils/country-detection'
import {
  validateCPF,
  validateCNPJ,
  validateNIF,
  formatCPF,
  formatCNPJ,
  formatNIF,
  formatPhone,
} from '@/lib/utils/document-validation'
import type { BasicInfo } from '@/types/config.types'
import { MapPin, ChevronDown } from 'lucide-react'

interface BasicInfoStepProps {
  onNext: (data: BasicInfo) => void
  onBack?: () => void
  initialData?: BasicInfo
}

export default function BasicInfoStep({
  onNext,
  onBack,
  initialData,
}: BasicInfoStepProps) {
  const [country, setCountry] = useState<Country>('BR')
  const [countryDetectedAuto, setCountryDetectedAuto] = useState(false)
  const [isDetecting, setIsDetecting] = useState(true)
  const [showCountryPicker, setShowCountryPicker] = useState(false)

  const [formData, setFormData] = useState<Partial<BasicInfo>>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    documentType: initialData?.documentType || undefined,
    cnpj: initialData?.cnpj || '',
    cpf: initialData?.cpf || '',
    nifType: initialData?.nifType || undefined,
    nif: initialData?.nif || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-detect country on mount
  useEffect(() => {
    if (initialData?.country) {
      setCountry(initialData.country)
      setCountryDetectedAuto(initialData.countryDetectedAuto)
      setIsDetecting(false)
    } else {
      detectCountry().then((result) => {
        setCountry(result.country)
        setCountryDetectedAuto(result.detectedAuto)
        setIsDetecting(false)
      })
    }
  }, [initialData])

  const config = getCountryConfig(country)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome do estabelecimento é obrigatório'
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    }

    // Validate documents
    if (country === 'BR') {
      if (!formData.documentType) {
        newErrors.documentType = 'Selecione o tipo de documento'
      } else if (formData.documentType === 'CNPJ') {
        if (!formData.cnpj?.trim()) {
          newErrors.cnpj = 'CNPJ é obrigatório'
        } else if (!validateCNPJ(formData.cnpj)) {
          newErrors.cnpj = 'CNPJ inválido'
        }
      } else if (formData.documentType === 'CPF') {
        if (!formData.cpf?.trim()) {
          newErrors.cpf = 'CPF é obrigatório'
        } else if (!validateCPF(formData.cpf)) {
          newErrors.cpf = 'CPF inválido'
        }
      }
    } else if (country === 'PT') {
      if (!formData.nifType) {
        newErrors.nifType = 'Selecione o tipo de NIF'
      } else if (!formData.nif?.trim()) {
        newErrors.nif = 'NIF é obrigatório'
      } else if (!validateNIF(formData.nif)) {
        newErrors.nif = 'NIF inválido'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext({
        country,
        countryDetectedAuto,
        name: formData.name!,
        phone: formData.phone!,
        address: formData.address!,
        documentType: formData.documentType,
        cnpj: formData.cnpj,
        cpf: formData.cpf,
        nifType: formData.nifType,
        nif: formData.nif,
      })
    }
  }

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value, country)
    setFormData({ ...formData, phone: formatted })
  }

  const handleDocumentChange = (value: string, type: 'CNPJ' | 'CPF' | 'NIF') => {
    if (type === 'CNPJ') {
      setFormData({ ...formData, cnpj: formatCNPJ(value) })
    } else if (type === 'CPF') {
      setFormData({ ...formData, cpf: formatCPF(value) })
    } else if (type === 'NIF') {
      setFormData({ ...formData, nif: formatNIF(value) })
    }
  }

  const handleCountryChange = (newCountry: Country) => {
    setCountry(newCountry)
    setCountryDetectedAuto(false)
    setShowCountryPicker(false)
    // Reset document fields
    setFormData({
      ...formData,
      documentType: undefined,
      cnpj: '',
      cpf: '',
      nifType: undefined,
      nif: '',
      phone: '', // Reset phone format
    })
    setErrors({})
  }

  if (isDetecting) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Informações Básicas
          </h2>
          <p className="text-zinc-400">Detectando sua localização...</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Informações Básicas
        </h2>
        <p className="text-zinc-400">
          Vamos começar com as informações do seu estabelecimento
        </p>
      </div>

      {/* Country Detection Banner */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-sm text-zinc-300">
                {countryDetectedAuto ? 'Detectamos que você está em:' : 'País selecionado:'}
              </p>
              <p className="text-white font-medium">
                {config.flag} {config.name}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="gap-2"
          >
            Alterar
            <ChevronDown className={`w-4 h-4 transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} />
          </Button>
        </div>

        {showCountryPicker && (
          <div className="mt-4 pt-4 border-t border-zinc-700 flex gap-2">
            <Button
              type="button"
              variant={country === 'BR' ? 'default' : 'outline'}
              onClick={() => handleCountryChange('BR')}
              className="flex-1"
            >
              🇧🇷 Brasil
            </Button>
            <Button
              type="button"
              variant={country === 'PT' ? 'default' : 'outline'}
              onClick={() => handleCountryChange('PT')}
              className="flex-1"
            >
              🇵🇹 Portugal
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {/* Business Name */}
        <div>
          <Label htmlFor="name" className="text-zinc-300">
            Nome do Estabelecimento *
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Restaurante Sabor & Cia"
            className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Document Type Selection */}
        <div>
          <Label htmlFor="documentType" className="text-zinc-300">
            Tipo de Documento *
          </Label>
          <Select
            value={
              country === 'BR'
                ? formData.documentType
                : formData.nifType
            }
            onValueChange={(value) => {
              if (country === 'BR') {
                setFormData({
                  ...formData,
                  documentType: value as 'CNPJ' | 'CPF',
                  cnpj: '',
                  cpf: '',
                })
              } else {
                setFormData({
                  ...formData,
                  nifType: value as 'NIF_EMPRESA' | 'NIF_INDIVIDUAL',
                  nif: '',
                })
              }
              setErrors({ ...errors, documentType: '', nifType: '' })
            }}
          >
            <SelectTrigger className={`mt-2 ${errors.documentType || errors.nifType ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {config.documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(errors.documentType || errors.nifType) && (
            <p className="text-red-500 text-sm mt-1">
              {errors.documentType || errors.nifType}
            </p>
          )}
        </div>

        {/* Document Input - Brazil */}
        {country === 'BR' && formData.documentType === 'CNPJ' && (
          <div>
            <Label htmlFor="cnpj" className="text-zinc-300">
              CNPJ *
            </Label>
            <Input
              id="cnpj"
              type="text"
              value={formData.cnpj}
              onChange={(e) => handleDocumentChange(e.target.value, 'CNPJ')}
              placeholder="00.000.000/0000-00"
              maxLength={18}
              className={`mt-2 ${errors.cnpj ? 'border-red-500' : ''}`}
            />
            {errors.cnpj && (
              <p className="text-red-500 text-sm mt-1">{errors.cnpj}</p>
            )}
          </div>
        )}

        {country === 'BR' && formData.documentType === 'CPF' && (
          <div>
            <Label htmlFor="cpf" className="text-zinc-300">
              CPF *
            </Label>
            <Input
              id="cpf"
              type="text"
              value={formData.cpf}
              onChange={(e) => handleDocumentChange(e.target.value, 'CPF')}
              placeholder="000.000.000-00"
              maxLength={14}
              className={`mt-2 ${errors.cpf ? 'border-red-500' : ''}`}
            />
            {errors.cpf && (
              <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>
            )}
          </div>
        )}

        {/* Document Input - Portugal */}
        {country === 'PT' && formData.nifType && (
          <div>
            <Label htmlFor="nif" className="text-zinc-300">
              NIF *
            </Label>
            <Input
              id="nif"
              type="text"
              value={formData.nif}
              onChange={(e) => handleDocumentChange(e.target.value, 'NIF')}
              placeholder={
                formData.nifType === 'NIF_EMPRESA'
                  ? '000000000'
                  : '000000000'
              }
              maxLength={11}
              className={`mt-2 ${errors.nif ? 'border-red-500' : ''}`}
            />
            {errors.nif && (
              <p className="text-red-500 text-sm mt-1">{errors.nif}</p>
            )}
          </div>
        )}

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-zinc-300">
            Telefone *
          </Label>
          <div className="relative mt-2">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
              {config.phonePrefix}
            </div>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder={config.phonePlaceholder}
              className={`pl-16 ${errors.phone ? 'border-red-500' : ''}`}
            />
          </div>
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" className="text-zinc-300">
            Endereço *
          </Label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Rua, Número, Bairro, Cidade"
            className={`mt-2 ${errors.address ? 'border-red-500' : ''}`}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            Voltar
          </Button>
        )}
        <Button type="submit" className="flex-1">
          Continuar
        </Button>
      </div>
    </form>
  )
}
