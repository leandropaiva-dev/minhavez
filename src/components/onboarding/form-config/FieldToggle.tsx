'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'

interface FieldToggleProps {
  label: string
  enabled: boolean
  required: boolean
  onEnabledChange: (enabled: boolean) => void
  onRequiredChange: (required: boolean) => void
}

export default function FieldToggle({
  label,
  enabled,
  required,
  onEnabledChange,
  onRequiredChange,
}: FieldToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 border border-zinc-800 rounded-lg bg-zinc-950">
      <div className="flex items-center gap-4 flex-1">
        <Switch checked={enabled} onCheckedChange={onEnabledChange} />
        <Label className="text-zinc-300 font-medium">{label}</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox
          id={`${label}-required`}
          checked={required}
          onCheckedChange={(checked) => onRequiredChange(checked as boolean)}
          disabled={!enabled}
        />
        <label
          htmlFor={`${label}-required`}
          className={`text-sm ${!enabled ? 'text-zinc-600' : 'text-zinc-400'} cursor-pointer`}
        >
          Obrigatório
        </label>
      </div>
    </div>
  )
}
