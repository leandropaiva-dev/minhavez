'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface BasicInfoStepProps {
  onNext: (data: { name: string; phone: string; address: string }) => void
  onBack?: () => void
  initialData?: { name: string; phone: string; address: string }
}

export default function BasicInfoStep({
  onNext,
  onBack,
  initialData,
}: BasicInfoStepProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do estabelecimento é obrigatório'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, '')
      if (digitsOnly.length < 10 || digitsOnly.length > 11) {
        newErrors.phone = 'Telefone inválido'
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext(formData)
    }
  }

  const handlePhoneChange = (value: string) => {
    // Auto-format phone number
    const digitsOnly = value.replace(/\D/g, '')
    let formatted = digitsOnly

    if (digitsOnly.length > 10) {
      formatted = `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7, 11)}`
    } else if (digitsOnly.length > 6) {
      formatted = `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6, 10)}`
    } else if (digitsOnly.length > 2) {
      formatted = `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2)}`
    }

    setFormData({ ...formData, phone: formatted })
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

      <div className="space-y-4">
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

        <div>
          <Label htmlFor="phone" className="text-zinc-300">
            Telefone *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(11) 98765-4321"
            maxLength={15}
            className={`mt-2 ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

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
