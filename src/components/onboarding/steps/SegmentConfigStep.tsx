'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import type { BusinessSegment, SegmentConfig } from '@/types/config.types'
import { SEGMENT_LABELS, SEGMENT_QUESTIONS } from '@/lib/config/segment-configs'

interface SegmentConfigStepProps {
  onNext: (data: SegmentConfig) => void
  onBack: () => void
  initialData?: SegmentConfig
}

export default function SegmentConfigStep({
  onNext,
  onBack,
  initialData,
}: SegmentConfigStepProps) {
  const [segmentType, setSegmentType] = useState<BusinessSegment>(
    initialData?.segmentType || 'outro'
  )
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [config, setConfig] = useState<Record<string, any>>(
    initialData?.config || {}
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset config when segment type changes
  useEffect(() => {
    if (!initialData || segmentType !== initialData.segmentType) {
      setConfig({})
      setErrors({})
    }
  }, [segmentType, initialData])

  const questions = SEGMENT_QUESTIONS[segmentType]

  const validate = () => {
    const newErrors: Record<string, string> = {}

    questions.forEach((question) => {
      if (question.required) {
        const value = config[question.id]
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          (Array.isArray(value) && value.length === 0)
        ) {
          newErrors[question.id] = `${question.label} é obrigatório`
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onNext({
        segmentType,
        config,
      })
    }
  }

  const handleMultiselectToggle = (questionId: string, option: string) => {
    const current = (config[questionId] as string[]) || []
    const updated = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option]
    setConfig({ ...config, [questionId]: updated })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Configuração do Segmento
        </h2>
        <p className="text-zinc-400">
          Ajude-nos a personalizar sua experiência
        </p>
      </div>

      <div className="space-y-4">
        {/* Segment Type Selection */}
        <div>
          <Label htmlFor="segment" className="text-zinc-300">
            Tipo de Estabelecimento *
          </Label>
          <Select value={segmentType} onValueChange={(value) => setSegmentType(value as BusinessSegment)}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Dynamic Questions */}
        {questions.map((question) => (
          <div key={question.id}>
            <Label htmlFor={question.id} className="text-zinc-300">
              {question.label} {question.required && '*'}
            </Label>

            {question.type === 'text' && (
              <Input
                id={question.id}
                type="text"
                value={config[question.id] || ''}
                onChange={(e) =>
                  setConfig({ ...config, [question.id]: e.target.value })
                }
                placeholder={question.placeholder}
                className={`mt-2 ${errors[question.id] ? 'border-red-500' : ''}`}
              />
            )}

            {question.type === 'number' && (
              <Input
                id={question.id}
                type="number"
                value={config[question.id] || ''}
                onChange={(e) =>
                  setConfig({ ...config, [question.id]: Number(e.target.value) })
                }
                placeholder={question.placeholder}
                min={1}
                className={`mt-2 ${errors[question.id] ? 'border-red-500' : ''}`}
              />
            )}

            {question.type === 'select' && (
              <Select
                value={config[question.id] || ''}
                onValueChange={(value) =>
                  setConfig({ ...config, [question.id]: value })
                }
              >
                <SelectTrigger className={`mt-2 ${errors[question.id] ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecione uma opção" />
                </SelectTrigger>
                <SelectContent>
                  {question.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {question.type === 'multiselect' && (
              <div className="mt-2 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {((config[question.id] as string[]) || []).map((selected) => (
                    <Badge
                      key={selected}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {selected}
                      <button
                        type="button"
                        onClick={() =>
                          handleMultiselectToggle(question.id, selected)
                        }
                        className="ml-1 hover:bg-zinc-700 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Select
                  onValueChange={(value) =>
                    handleMultiselectToggle(question.id, value)
                  }
                >
                  <SelectTrigger className={errors[question.id] ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Adicionar opção..." />
                  </SelectTrigger>
                  <SelectContent>
                    {question.options
                      ?.filter(
                        (option) =>
                          !(config[question.id] as string[])?.includes(option)
                      )
                      .map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {question.type === 'checkbox' && (
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox
                  id={question.id}
                  checked={config[question.id] || false}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, [question.id]: checked })
                  }
                />
                <label
                  htmlFor={question.id}
                  className="text-sm text-zinc-400 cursor-pointer"
                >
                  Sim
                </label>
              </div>
            )}

            {errors[question.id] && (
              <p className="text-red-500 text-sm mt-1">{errors[question.id]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button type="submit" className="flex-1">
          Continuar
        </Button>
      </div>
    </form>
  )
}
