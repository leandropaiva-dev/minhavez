'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConfigurationsTabs from './ConfigurationsTabs'
import PageCustomizationEditor from './PageCustomizationEditor'
import { Clock, Calendar, Edit3, Eye, UserCheck, CheckCircle } from 'react-feather'

interface PublicFormsManagerProps {
  businessId: string
}

type FormSection = 'queue' | 'reservation'
type QueueScreen = 'form' | 'waiting' | 'attending' | 'completed'
type ReservationScreen = 'form' | 'confirmation'

export default function PublicFormsManager({ businessId }: PublicFormsManagerProps) {
  const [activeSection, setActiveSection] = useState<FormSection>('queue')
  const [activeQueueScreen, setActiveQueueScreen] = useState<QueueScreen>('form')
  const [activeReservationScreen, setActiveReservationScreen] = useState<ReservationScreen>('form')

  return (
    <div className="space-y-6">
      <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as FormSection)}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="queue" className="gap-2">
            <Clock className="w-4 h-4" />
            Fila
          </TabsTrigger>
          <TabsTrigger value="reservation" className="gap-2">
            <Calendar className="w-4 h-4" />
            Reservas
          </TabsTrigger>
        </TabsList>

        {/* Queue Section */}
        <TabsContent value="queue" className="space-y-4">
          <Tabs value={activeQueueScreen} onValueChange={(v) => setActiveQueueScreen(v as QueueScreen)}>
            <TabsList className="grid w-full grid-cols-4 mb-4">
              <TabsTrigger value="form" className="gap-1.5 text-xs sm:text-sm">
                <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Formulário</span>
                <span className="sm:hidden">Form</span>
              </TabsTrigger>
              <TabsTrigger value="waiting" className="gap-1.5 text-xs sm:text-sm">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Esperando</span>
                <span className="sm:hidden">Espera</span>
              </TabsTrigger>
              <TabsTrigger value="attending" className="gap-1.5 text-xs sm:text-sm">
                <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Atendimento</span>
                <span className="sm:hidden">Atend.</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="gap-1.5 text-xs sm:text-sm">
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Concluído</span>
                <span className="sm:hidden">Fim</span>
              </TabsTrigger>
            </TabsList>

            {/* Form Screen */}
            <TabsContent value="form">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Formulário de Entrada na Fila
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Configure os campos e a aparência da página onde clientes entram na fila
                  </p>
                </div>

                <ConfigurationsTabs formType="queue" businessId={businessId} />
              </div>
            </TabsContent>

            {/* Waiting Screen */}
            <TabsContent value="waiting">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Tela de Espera
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Personalize a aparência da tela onde clientes veem sua posição na fila
                  </p>
                </div>
                <PageCustomizationEditor
                  businessId={businessId}
                  pageType="queue_wait"
                  title="Aguardando na Fila"
                  description="Página de espera com posição na fila"
                />
              </div>
            </TabsContent>

            {/* Attending Screen */}
            <TabsContent value="attending">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Tela de Atendimento
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Personalize a tela exibida quando o cliente está sendo atendido
                  </p>
                </div>
                <PageCustomizationEditor
                  businessId={businessId}
                  pageType="queue_attending"
                  title="Sendo Atendido"
                  description="Página exibida durante o atendimento"
                />
              </div>
            </TabsContent>

            {/* Completed Screen */}
            <TabsContent value="completed">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Tela Pós-Atendimento
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Personalize a tela de feedback após o atendimento ser concluído
                  </p>
                </div>
                <PageCustomizationEditor
                  businessId={businessId}
                  pageType="queue_completed"
                  title="Atendimento Concluído"
                  description="Página de feedback após o atendimento"
                />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Reservation Section */}
        <TabsContent value="reservation" className="space-y-4">
          <Tabs value={activeReservationScreen} onValueChange={(v) => setActiveReservationScreen(v as ReservationScreen)}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="form" className="gap-2">
                <Edit3 className="w-4 h-4" />
                Formulário de Reserva
              </TabsTrigger>
              <TabsTrigger value="confirmation" className="gap-2">
                <CheckCircle className="w-4 h-4" />
                Confirmação
              </TabsTrigger>
            </TabsList>

            {/* Form Screen */}
            <TabsContent value="form">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Formulário de Reserva
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Configure os campos e a aparência da página de reservas
                  </p>
                </div>

                <ConfigurationsTabs formType="reservation" businessId={businessId} />
              </div>
            </TabsContent>

            {/* Confirmation Screen */}
            <TabsContent value="confirmation">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                    Tela de Confirmação
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Personalize a tela exibida após a reserva ser confirmada
                  </p>
                </div>
                <PageCustomizationEditor
                  businessId={businessId}
                  pageType="reservation_confirm"
                  title="Confirmação de Reserva"
                  description="Página de confirmação após reservar"
                />
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  )
}
