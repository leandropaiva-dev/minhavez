'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import type { CustomField, FieldType } from '@/types/config.types'

interface CustomFieldBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (field: CustomField) => void
  editField?: CustomField
}

export default function CustomFieldBuilder({
  open,
  onOpenChange,
  onSave,
  editField,
}: CustomFieldBuilderProps) {
  const [formData, setFormData] = useState<Partial<CustomField>>({
    label: '',
    type: 'text',
    placeholder: '',
    options: [],
    required: false,
  })
  const [optionsText, setOptionsText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editField) {
      setFormData(editField)
      if (editField.options) {
        setOptionsText(editField.options.join('\n'))
      }
    } else {
      setFormData({
        label: '',
        type: 'text',
        placeholder: '',
        options: [],
        required: false,
      })
      setOptionsText('')
    }
    setErrors({})
  }, [editField, open])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.label?.trim()) {
      newErrors.label = 'Nome do campo é obrigatório'
    }

    if (formData.type === 'select' && !optionsText.trim()) {
      newErrors.options = 'Opções são obrigatórias para campos de seleção'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    const options =
      formData.type === 'select'
        ? optionsText
            .split('\n')
            .map((opt) => opt.trim())
            .filter((opt) => opt.length > 0)
        : undefined

    const field: CustomField = {
      id: editField?.id || `custom_${Date.now()}`,
      label: formData.label!,
      type: formData.type as FieldType,
      placeholder: formData.placeholder,
      options,
      required: formData.required || false,
      order: editField?.order || 0,
    }

    onSave(field)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editField ? 'Editar Campo' : 'Novo Campo Personalizado'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="label" className="text-zinc-300">
              Nome do Campo *
            </Label>
            <Input
              id="label"
              value={formData.label}
              onChange={(e) =>
                setFormData({ ...formData, label: e.target.value })
              }
              placeholder="Ex: CPF, Data de Nascimento"
              className={`mt-2 ${errors.label ? 'border-red-500' : ''}`}
            />
            {errors.label && (
              <p className="text-red-500 text-sm mt-1">{errors.label}</p>
            )}
          </div>

          <div>
            <Label htmlFor="type" className="text-zinc-300">
              Tipo de Campo *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as FieldType })
              }
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texto</SelectItem>
                <SelectItem value="number">Número</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="tel">Telefone</SelectItem>
                <SelectItem value="select">Seleção</SelectItem>
                <SelectItem value="textarea">Texto Longo</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.type !== 'checkbox' && formData.type !== 'select' && (
            <div>
              <Label htmlFor="placeholder" className="text-zinc-300">
                Placeholder (opcional)
              </Label>
              <Input
                id="placeholder"
                value={formData.placeholder}
                onChange={(e) =>
                  setFormData({ ...formData, placeholder: e.target.value })
                }
                placeholder="Texto de exemplo..."
                className="mt-2"
              />
            </div>
          )}

          {formData.type === 'select' && (
            <div>
              <Label htmlFor="options" className="text-zinc-300">
                Opções (uma por linha) *
              </Label>
              <Textarea
                id="options"
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                rows={5}
                className={`mt-2 ${errors.options ? 'border-red-500' : ''}`}
              />
              {errors.options && (
                <p className="text-red-500 text-sm mt-1">{errors.options}</p>
              )}
            </div>
          )}

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="required"
              checked={formData.required}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, required: checked as boolean })
              }
            />
            <label
              htmlFor="required"
              className="text-sm text-zinc-300 cursor-pointer"
            >
              Campo obrigatório
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Campo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
