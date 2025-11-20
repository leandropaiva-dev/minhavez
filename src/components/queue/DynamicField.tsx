'use client'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CustomField } from '@/types/config.types'

interface DynamicFieldProps {
  field: CustomField
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (value: any) => void
  error?: string
}

export default function DynamicField({
  field,
  value,
  onChange,
  error,
}: DynamicFieldProps) {
  return (
    <div>
      <Label htmlFor={field.id} className="text-zinc-300">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </Label>

      {field.type === 'text' && (
        <Input
          id={field.id}
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`mt-2 ${error ? 'border-red-500' : ''}`}
        />
      )}

      {field.type === 'number' && (
        <Input
          id={field.id}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={field.placeholder}
          className={`mt-2 ${error ? 'border-red-500' : ''}`}
        />
      )}

      {field.type === 'email' && (
        <Input
          id={field.id}
          type="email"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`mt-2 ${error ? 'border-red-500' : ''}`}
        />
      )}

      {field.type === 'tel' && (
        <Input
          id={field.id}
          type="tel"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`mt-2 ${error ? 'border-red-500' : ''}`}
        />
      )}

      {field.type === 'textarea' && (
        <Textarea
          id={field.id}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`mt-2 ${error ? 'border-red-500' : ''}`}
        />
      )}

      {field.type === 'select' && (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger className={`mt-2 ${error ? 'border-red-500' : ''}`}>
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === 'checkbox' && (
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            id={field.id}
            checked={value || false}
            onCheckedChange={(checked) => onChange(checked)}
          />
          <label htmlFor={field.id} className="text-sm text-zinc-400 cursor-pointer">
            Sim
          </label>
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
