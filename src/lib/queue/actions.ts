'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { QueueEntryInsert } from '@/types/database.types'

export interface JoinQueueData {
  businessId: string
  customerName: string
  customerPhone?: string
  customerEmail?: string
  partySize?: number
  notes?: string
}

export async function joinQueue(data: JoinQueueData) {
  const supabase = await createClient()

  // Verifica se o negócio existe
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('id', data.businessId)
    .single()

  if (businessError || !business) {
    return { error: 'Negócio não encontrado' }
  }

  // Calcula tempo estimado de espera (média de 15min por pessoa na fila)
  const { count } = await supabase
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', data.businessId)
    .eq('status', 'waiting')

  const estimatedWaitTime = (count || 0) * 15

  // Insere entrada na fila
  const queueEntry: QueueEntryInsert = {
    business_id: data.businessId,
    customer_name: data.customerName,
    customer_phone: data.customerPhone,
    customer_email: data.customerEmail,
    party_size: data.partySize || 1,
    notes: data.notes,
    estimated_wait_time: estimatedWaitTime,
    status: 'waiting',
  }

  const { data: entry, error: insertError } = await supabase
    .from('queue_entries')
    .insert(queueEntry)
    .select()
    .single()

  if (insertError) {
    console.error('Erro ao inserir na fila:', insertError)
    return { error: 'Erro ao entrar na fila. Tente novamente.' }
  }

  revalidatePath(`/fila/${data.businessId}`)
  return { success: true, data: entry }
}

export async function getQueueEntry(entryId: string) {
  const supabase = await createClient()

  const { data: entry, error } = await supabase
    .from('queue_entries')
    .select(`
      *,
      business:businesses(name, business_type)
    `)
    .eq('id', entryId)
    .single()

  if (error) {
    return { error: 'Entrada não encontrada' }
  }

  // Calcula posição atual na fila
  const { count } = await supabase
    .from('queue_entries')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', entry.business_id)
    .eq('status', 'waiting')
    .lt('position', entry.position || 999999)

  return {
    data: {
      ...entry,
      currentPosition: (count || 0) + 1
    }
  }
}

export async function getBusinessQueue(businessId: string) {
  const supabase = await createClient()

  const { data: entries, error } = await supabase
    .from('queue_entries')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', 'waiting')
    .order('position', { ascending: true })

  if (error) {
    return { error: 'Erro ao buscar fila' }
  }

  return { data: entries }
}

export async function cancelQueueEntry(entryId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('queue_entries')
    .update({ status: 'cancelled' })
    .eq('id', entryId)

  if (error) {
    return { error: 'Erro ao cancelar entrada' }
  }

  revalidatePath('/dashboard/fila')
  return { success: true }
}

export async function toggleQueueStatus(businessId: string) {
  const supabase = await createClient()

  // Get current status
  const { data: business, error: fetchError } = await supabase
    .from('businesses')
    .select('is_queue_open')
    .eq('id', businessId)
    .single()

  if (fetchError || !business) {
    return { success: false, error: 'Business not found' }
  }

  // Toggle status
  const newStatus = !business.is_queue_open

  const { error: updateError } = await supabase
    .from('businesses')
    .update({ is_queue_open: newStatus })
    .eq('id', businessId)

  if (updateError) {
    return { success: false, error: 'Failed to update queue status' }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/fila/${businessId}`)

  return {
    success: true,
    isOpen: newStatus,
    message: newStatus
      ? 'Fila aberta com sucesso!'
      : 'Fila encerrada. Novos clientes não poderão entrar.',
  }
}

export async function getQueueStatus(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('businesses')
    .select('is_queue_open')
    .eq('id', businessId)
    .single()

  if (error || !data) {
    return { isOpen: true } // Default to open if error
  }

  return { isOpen: data.is_queue_open }
}
