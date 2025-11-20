export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          user_id: string
          name: string
          business_type: string | null
          phone: string | null
          address: string | null
          country: 'BR' | 'PT'
          document_type: 'CNPJ' | 'CPF' | 'NIF_EMPRESA' | 'NIF_INDIVIDUAL' | null
          document_number: string | null
          subscription_status: 'trial' | 'active' | 'canceled' | 'past_due'
          trial_ends_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          business_type?: string | null
          phone?: string | null
          address?: string | null
          country?: 'BR' | 'PT'
          document_type?: 'CNPJ' | 'CPF' | 'NIF_EMPRESA' | 'NIF_INDIVIDUAL' | null
          document_number?: string | null
          subscription_status?: 'trial' | 'active' | 'canceled' | 'past_due'
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          business_type?: string | null
          phone?: string | null
          address?: string | null
          country?: 'BR' | 'PT'
          document_type?: 'CNPJ' | 'CPF' | 'NIF_EMPRESA' | 'NIF_INDIVIDUAL' | null
          document_number?: string | null
          subscription_status?: 'trial' | 'active' | 'canceled' | 'past_due'
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      queue_entries: {
        Row: {
          id: string
          business_id: string
          customer_name: string
          customer_phone: string | null
          customer_email: string | null
          party_size: number
          status: 'waiting' | 'called' | 'attending' | 'completed' | 'cancelled' | 'no_show'
          position: number | null
          notes: string | null
          joined_at: string
          called_at: string | null
          attended_at: string | null
          completed_at: string | null
          estimated_wait_time: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          customer_name: string
          customer_phone?: string | null
          customer_email?: string | null
          party_size?: number
          status?: 'waiting' | 'called' | 'attending' | 'completed' | 'cancelled' | 'no_show'
          position?: number | null
          notes?: string | null
          joined_at?: string
          called_at?: string | null
          attended_at?: string | null
          completed_at?: string | null
          estimated_wait_time?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          customer_name?: string
          customer_phone?: string | null
          customer_email?: string | null
          party_size?: number
          status?: 'waiting' | 'called' | 'attending' | 'completed' | 'cancelled' | 'no_show'
          position?: number | null
          notes?: string | null
          joined_at?: string
          called_at?: string | null
          attended_at?: string | null
          completed_at?: string | null
          estimated_wait_time?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

export type QueueEntry = Database['public']['Tables']['queue_entries']['Row']
export type QueueEntryInsert = Database['public']['Tables']['queue_entries']['Insert']
export type QueueEntryUpdate = Database['public']['Tables']['queue_entries']['Update']

export type BusinessType = 'restaurante' | 'bar' | 'clinica' | 'barbearia' | 'outro'
export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'past_due'
export type QueueStatus = 'waiting' | 'called' | 'attending' | 'completed' | 'cancelled' | 'no_show'
export type Country = 'BR' | 'PT'
export type DocumentType = 'CNPJ' | 'CPF' | 'NIF_EMPRESA' | 'NIF_INDIVIDUAL'
