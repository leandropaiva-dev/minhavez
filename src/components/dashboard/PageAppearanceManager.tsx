'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PageCustomizationEditor from './PageCustomizationEditor'
import { PAGE_TYPE_LABELS, type PageType } from '@/types/page-customization.types'

interface PageAppearanceManagerProps {
  businessId: string
}

export default function PageAppearanceManager({ businessId }: PageAppearanceManagerProps) {
  const [activeTab, setActiveTab] = useState<PageType>('queue_form')

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PageType)} className="w-full">
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
        <TabsTrigger value="queue_form" className="text-xs sm:text-sm">
          Fila - Formulário
        </TabsTrigger>
        <TabsTrigger value="queue_wait" className="text-xs sm:text-sm">
          Fila - Espera
        </TabsTrigger>
        <TabsTrigger value="reservation_form" className="text-xs sm:text-sm">
          Reserva - Formulário
        </TabsTrigger>
        <TabsTrigger value="reservation_confirm" className="text-xs sm:text-sm">
          Reserva - Confirmação
        </TabsTrigger>
      </TabsList>

      {(Object.keys(PAGE_TYPE_LABELS) as PageType[]).map((pageType) => (
        <TabsContent key={pageType} value={pageType}>
          <PageCustomizationEditor
            businessId={businessId}
            pageType={pageType}
            title={PAGE_TYPE_LABELS[pageType].title}
            description={PAGE_TYPE_LABELS[pageType].description}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
