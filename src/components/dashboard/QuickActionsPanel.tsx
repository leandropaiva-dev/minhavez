'use client'

import * as Icons from 'react-feather'
import { Button } from '@/components/ui/button'
import type { QuickAction } from '@/types/config.types'

interface QuickActionsPanelProps {
  actions: QuickAction[]
}

export default function QuickActionsPanel({ actions }: QuickActionsPanelProps) {
  const handleAction = (action: QuickAction) => {
    console.log('Action triggered:', action.action)
    // TODO: Implement actual actions when backend is ready
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          // @ts-expect-error - Dynamic icon loading
          const Icon = Icons[action.icon] || Icons.Zap

          return (
            <Button
              key={action.id}
              variant={action.variant || 'default'}
              className="justify-start gap-2 h-auto py-3"
              onClick={() => handleAction(action)}
            >
              <Icon className="w-4 h-4" />
              <span>{action.label}</span>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
