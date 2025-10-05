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
          subscription_status?: 'trial' | 'active' | 'canceled' | 'past_due'
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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

export type BusinessType = 'restaurante' | 'bar' | 'clinica' | 'barbearia' | 'outro'
export type SubscriptionStatus = 'trial' | 'active' | 'canceled' | 'past_due'
