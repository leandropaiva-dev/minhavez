'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Calendar, Clock, Users, XCircle, CheckCircle, Loader2, Eye, X, Phone, Mail, FileText, UserCheck, LogIn, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type EntryType = 'all' | 'queue' | 'reservation'
type StatusFilter = 'all' | 'completed' | 'cancelled'
type PeriodFilter = 'today' | '7d' | '30d' | '90d' | 'all'

interface HistoryEntry {
  id: string
  type: 'queue' | 'reservation'
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  status: string
  created_at: string
  completed_at: string | null
  party_size?: number
  cancellation_reason?: string | null
}

interface QueueEntryDetails {
  id: string
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  party_size: number
  status: string
  position: number | null
  notes: string | null
  joined_at: string
  called_at: string | null
  attended_at: string | null
  completed_at: string | null
  estimated_wait_time: number | null
  cancellation_reason: string | null
}

interface ReservationDetails {
  id: string
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  party_size: number
  reservation_date: string
  reservation_time: string
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  cancellation_reason: string | null
}

interface HistoryManagerProps {
  businessId: string
}

export default function HistoryManager({ businessId }: HistoryManagerProps) {
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<EntryType>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('30d')
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  // Details modal
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [queueDetails, setQueueDetails] = useState<QueueEntryDetails | null>(null)
  const [reservationDetails, setReservationDetails] = useState<ReservationDetails | null>(null)

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
  })

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const itemsPerPage = isMobile ? 15 : 30

  const fetchHistory = useCallback(async () => {
    if (!businessId) return

    setLoading(true)
    const supabase = createClient()

    const endDate = new Date()
    const startDate = new Date()

    switch (periodFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0)
        break
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      case 'all':
        startDate.setFullYear(2020)
        break
    }

    const allEntries: HistoryEntry[] = []

    // Fetch queue entries
    if (typeFilter === 'all' || typeFilter === 'queue') {
      let query = supabase
        .from('queue_entries')
        .select('id, customer_name, customer_phone, customer_email, party_size, status, joined_at, completed_at, cancellation_reason')
        .eq('business_id', businessId)
        .gte('joined_at', startDate.toISOString())
        .lte('joined_at', endDate.toISOString())
        .order('joined_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      } else {
        query = query.in('status', ['completed', 'cancelled'])
      }

      const { data: queueData } = await query

      if (queueData) {
        queueData.forEach(entry => {
          allEntries.push({
            id: entry.id,
            type: 'queue',
            customer_name: entry.customer_name,
            customer_phone: entry.customer_phone,
            customer_email: entry.customer_email,
            status: entry.status,
            created_at: entry.joined_at,
            completed_at: entry.completed_at,
            party_size: entry.party_size,
            cancellation_reason: entry.cancellation_reason,
          })
        })
      }
    }

    // Fetch reservations
    if (typeFilter === 'all' || typeFilter === 'reservation') {
      let query = supabase
        .from('reservations')
        .select('id, customer_name, customer_phone, customer_email, status, created_at, updated_at, party_size, reservation_date, reservation_time, cancellation_reason')
        .eq('business_id', businessId)
        .gte('reservation_date', startDate.toISOString().split('T')[0])
        .lte('reservation_date', endDate.toISOString().split('T')[0])
        .order('reservation_date', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      } else {
        query = query.in('status', ['completed', 'cancelled'])
      }

      const { data: reservationData } = await query

      if (reservationData) {
        reservationData.forEach(entry => {
          allEntries.push({
            id: entry.id,
            type: 'reservation',
            customer_name: entry.customer_name,
            customer_phone: entry.customer_phone,
            customer_email: entry.customer_email,
            status: entry.status,
            created_at: `${entry.reservation_date}T${entry.reservation_time}`,
            completed_at: entry.status === 'completed' ? entry.updated_at : null,
            party_size: entry.party_size,
            cancellation_reason: entry.cancellation_reason,
          })
        })
      }
    }

    allEntries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setEntries(allEntries)
    setCurrentPage(1)

    const completed = allEntries.filter(e => e.status === 'completed').length
    const cancelled = allEntries.filter(e => e.status === 'cancelled').length

    setStats({ total: allEntries.length, completed, cancelled })
    setLoading(false)
  }, [businessId, typeFilter, statusFilter, periodFilter])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const fetchDetails = async (entry: HistoryEntry) => {
    setSelectedEntry(entry)
    setDetailsLoading(true)
    setQueueDetails(null)
    setReservationDetails(null)

    const supabase = createClient()

    if (entry.type === 'queue') {
      const { data } = await supabase
        .from('queue_entries')
        .select('*')
        .eq('id', entry.id)
        .single()

      if (data) {
        setQueueDetails(data as QueueEntryDetails)
      }
    } else {
      const { data } = await supabase
        .from('reservations')
        .select('*')
        .eq('id', entry.id)
        .single()

      if (data) {
        setReservationDetails(data as ReservationDetails)
      }
    }

    setDetailsLoading(false)
  }

  const closeDetails = () => {
    setSelectedEntry(null)
    setQueueDetails(null)
    setReservationDetails(null)
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeDetails()
    }
  }

  // Filter by search term
  const filteredEntries = entries.filter(entry => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      entry.customer_name.toLowerCase().includes(search) ||
      entry.customer_phone?.toLowerCase().includes(search) ||
      entry.customer_email?.toLowerCase().includes(search)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"

    switch (status) {
      case 'completed':
        return (
          <span className={baseClasses}>
            <CheckCircle className="w-3 h-3" />
            Concluído
          </span>
        )
      case 'cancelled':
        return (
          <span className={baseClasses}>
            <XCircle className="w-3 h-3" />
            Cancelado
          </span>
        )
      default:
        return (
          <span className={baseClasses}>
            {status}
          </span>
        )
    }
  }

  const getTypeBadge = (type: 'queue' | 'reservation') => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"

    if (type === 'queue') {
      return (
        <span className={baseClasses}>
          <Clock className="w-3 h-3" />
          Fila
        </span>
      )
    }
    return (
      <span className={baseClasses}>
        <Calendar className="w-3 h-3" />
        Reserva
      </span>
    )
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-'
    return timeString.slice(0, 5)
  }

  const calculateDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return '-'
    const diff = new Date(end).getTime() - new Date(start).getTime()
    const minutes = Math.round(diff / 60000)
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}min`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">Total</p>
              <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">Concluídos</p>
              <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs">Cancelados</p>
              <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 text-sm"
          />
        </div>

        {/* Filter buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as EntryType)}>
            <SelectTrigger className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs justify-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="all" className="text-zinc-900 dark:text-white text-xs">Todos</SelectItem>
              <SelectItem value="queue" className="text-zinc-900 dark:text-white text-xs">Fila</SelectItem>
              <SelectItem value="reservation" className="text-zinc-900 dark:text-white text-xs">Reservas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
            <SelectTrigger className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs justify-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="all" className="text-zinc-900 dark:text-white text-xs">Todos status</SelectItem>
              <SelectItem value="completed" className="text-zinc-900 dark:text-white text-xs">Concluídos</SelectItem>
              <SelectItem value="cancelled" className="text-zinc-900 dark:text-white text-xs">Cancelados</SelectItem>
            </SelectContent>
          </Select>

          <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodFilter)}>
            <SelectTrigger className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs justify-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="today" className="text-zinc-900 dark:text-white text-xs">Hoje</SelectItem>
              <SelectItem value="7d" className="text-zinc-900 dark:text-white text-xs">7 dias</SelectItem>
              <SelectItem value="30d" className="text-zinc-900 dark:text-white text-xs">30 dias</SelectItem>
              <SelectItem value="90d" className="text-zinc-900 dark:text-white text-xs">90 dias</SelectItem>
              <SelectItem value="all" className="text-zinc-900 dark:text-white text-xs">Todo período</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Mobile List */}
            <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-800">
              {paginatedEntries.map((entry) => (
                <button
                  key={`mobile-${entry.type}-${entry.id}`}
                  onClick={() => fetchDetails(entry)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left"
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(entry.status)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-900 dark:text-white text-sm truncate">
                      {entry.customer_name}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {entry.type === 'queue' ? 'Fila' : 'Reserva'} • {formatDateShort(entry.created_at)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                </button>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {paginatedEntries.map((entry) => (
                    <tr
                      key={`desktop-${entry.type}-${entry.id}`}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors group relative"
                      title={entry.status === 'cancelled' && entry.cancellation_reason ? `Motivo: ${entry.cancellation_reason}` : undefined}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-sm">
                              {entry.customer_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-white text-sm truncate">{entry.customer_name}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              {entry.customer_phone || entry.customer_email || 'Sem contato'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getTypeBadge(entry.type)}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-zinc-900 dark:text-white">{formatDate(entry.created_at)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(entry.status)}
                          {entry.status === 'cancelled' && entry.cancellation_reason && (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[150px] truncate" title={entry.cancellation_reason}>
                              ({entry.cancellation_reason})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => fetchDetails(entry)}
                          className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && filteredEntries.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Nenhum registro encontrado</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredEntries.length)} de {filteredEntries.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-zinc-700 dark:text-zinc-300">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                  <span className="text-zinc-700 dark:text-zinc-300 font-semibold text-lg">
                    {selectedEntry.customer_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-white text-lg">{selectedEntry.customer_name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeBadge(selectedEntry.type)}
                    {getStatusBadge(selectedEntry.status)}
                  </div>
                </div>
              </div>
              <button
                onClick={closeDetails}
                className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {detailsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
                </div>
              ) : queueDetails ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Contato</h4>
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 sm:p-4 space-y-2">
                        {queueDetails.customer_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-900 dark:text-white">{queueDetails.customer_phone}</span>
                          </div>
                        )}
                        {queueDetails.customer_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-900 dark:text-white">{queueDetails.customer_email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-zinc-400" />
                          <span className="text-zinc-900 dark:text-white">{queueDetails.party_size} {queueDetails.party_size === 1 ? 'pessoa' : 'pessoas'}</span>
                        </div>
                        {!queueDetails.customer_phone && !queueDetails.customer_email && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sem informações de contato</p>
                        )}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Métricas</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Tempo de espera</p>
                          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {calculateDuration(queueDetails.joined_at, queueDetails.called_at || queueDetails.attended_at)}
                          </p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Tempo total</p>
                          <p className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {calculateDuration(queueDetails.joined_at, queueDetails.completed_at)}
                          </p>
                        </div>
                        {queueDetails.position && (
                          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Posição na fila</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">#{queueDetails.position}</p>
                          </div>
                        )}
                        {queueDetails.estimated_wait_time && (
                          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Estimativa inicial</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-white">{queueDetails.estimated_wait_time}min</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cancellation Reason */}
                    {queueDetails.status === 'cancelled' && queueDetails.cancellation_reason && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Motivo do Cancelamento</h4>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">{queueDetails.cancellation_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {queueDetails.notes && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Observações</h4>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-zinc-400 mt-0.5" />
                            <p className="text-sm text-zinc-900 dark:text-white">{queueDetails.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Timeline */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Linha do Tempo</h4>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 sm:p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded">
                          <LogIn className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Entrou na fila</p>
                          <p className="text-sm text-zinc-900 dark:text-white">{formatDate(queueDetails.joined_at)}</p>
                        </div>
                      </div>

                      {queueDetails.called_at && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded">
                            <UserCheck className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Chamado</p>
                            <p className="text-sm text-zinc-900 dark:text-white">{formatDate(queueDetails.called_at)}</p>
                          </div>
                        </div>
                      )}

                      {queueDetails.attended_at && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded">
                            <CheckCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Atendimento iniciado</p>
                            <p className="text-sm text-zinc-900 dark:text-white">{formatDate(queueDetails.attended_at)}</p>
                          </div>
                        </div>
                      )}

                      {queueDetails.completed_at && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded">
                            <LogOut className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Finalizado</p>
                            <p className="text-sm text-zinc-900 dark:text-white">{formatDate(queueDetails.completed_at)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : reservationDetails ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Contact Info */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Contato</h4>
                      <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 sm:p-4 space-y-2">
                        {reservationDetails.customer_phone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-900 dark:text-white">{reservationDetails.customer_phone}</span>
                          </div>
                        )}
                        {reservationDetails.customer_email && (
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-zinc-400" />
                            <span className="text-zinc-900 dark:text-white">{reservationDetails.customer_email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-zinc-400" />
                          <span className="text-zinc-900 dark:text-white">{reservationDetails.party_size} {reservationDetails.party_size === 1 ? 'pessoa' : 'pessoas'}</span>
                        </div>
                        {!reservationDetails.customer_phone && !reservationDetails.customer_email && (
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">Sem informações de contato</p>
                        )}
                      </div>
                    </div>

                    {/* Cancellation Reason */}
                    {reservationDetails.status === 'cancelled' && reservationDetails.cancellation_reason && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Motivo do Cancelamento</h4>
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start gap-2">
                            <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-300">{reservationDetails.cancellation_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {reservationDetails.notes && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Observações</h4>
                        <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-zinc-400 mt-0.5" />
                            <p className="text-sm text-zinc-900 dark:text-white">{reservationDetails.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column - Reservation Info */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Detalhes da Reserva</h4>
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 sm:p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded">
                          <Calendar className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Data da reserva</p>
                          <p className="text-sm text-zinc-900 dark:text-white">
                            {new Date(reservationDetails.reservation_date).toLocaleDateString('pt-BR', {
                              weekday: 'long',
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded">
                          <Clock className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Horário</p>
                          <p className="text-sm text-zinc-900 dark:text-white">{formatTime(reservationDetails.reservation_time)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded">
                          <LogIn className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Reserva criada em</p>
                          <p className="text-sm text-zinc-900 dark:text-white">{formatDate(reservationDetails.created_at)}</p>
                        </div>
                      </div>

                      {reservationDetails.status === 'completed' && (
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-zinc-200 dark:bg-zinc-700 rounded">
                            <CheckCircle className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">Finalizada em</p>
                            <p className="text-sm text-zinc-900 dark:text-white">{formatDate(reservationDetails.updated_at)}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-zinc-500 dark:text-zinc-400">Não foi possível carregar os detalhes</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
