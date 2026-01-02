'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Image as ImageIcon, DollarSign, Clock, CheckCircle, XCircle, Package } from 'react-feather'
import { Button } from '@/components/ui/button'
import { getServices, deleteService, type Service } from '@/lib/services/actions'
import ServiceModal from './ServiceModal'

interface ServicesManagerProps {
  businessId: string
}

export default function ServicesManager({ businessId }: ServicesManagerProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadServices = async () => {
    setLoading(true)
    const { data } = await getServices(businessId)
    if (data) {
      setServices(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadServices()
  }, [businessId])

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return

    setDeleting(serviceId)
    const { error } = await deleteService(serviceId)

    if (error) {
      alert(`Erro ao excluir: ${error}`)
    } else {
      await loadServices()
    }
    setDeleting(null)
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingService(null)
    loadServices()
  }

  const formatPrice = (priceCents: number | null) => {
    if (!priceCents) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(priceCents / 100)
  }

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-'
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com botão */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {services.length} {services.length === 1 ? 'serviço cadastrado' : 'serviços cadastrados'}
          </span>
        </div>
        <Button
          onClick={() => {
            setEditingService(null)
            setModalOpen(true)
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Serviço
        </Button>
      </div>

      {/* Lista de serviços */}
      {services.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Package className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Nenhum serviço cadastrado
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
            Comece criando seu primeiro serviço
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Criar Primeiro Serviço
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Foto do serviço */}
              <div className="relative h-48 bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={service.photo_url}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
                {!service.is_active && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Inativo
                    </span>
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-4 space-y-3">
                {/* Nome e descrição */}
                <div>
                  <h3 className="font-semibold text-lg text-zinc-900 dark:text-white truncate">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Preço */}
                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>{formatPrice(service.price_cents)}</span>
                  </div>

                  {/* Duração */}
                  <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDuration(service.estimated_duration_minutes)}</span>
                  </div>
                </div>

                {/* Badges de disponibilidade */}
                <div className="flex gap-2 flex-wrap">
                  {service.available_in_queue && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Fila
                    </span>
                  )}
                  {service.available_in_reservations && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Reservas
                    </span>
                  )}
                  {!service.available_in_queue && !service.available_in_reservations && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full text-xs font-medium">
                      <XCircle className="w-3 h-3" />
                      Não disponível
                    </span>
                  )}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="flex-1 gap-1.5"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    disabled={deleting === service.id}
                    className="gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting === service.id ? 'Excluindo...' : 'Excluir'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criar/editar */}
      <ServiceModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        businessId={businessId}
        service={editingService}
      />
    </div>
  )
}
