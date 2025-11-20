export type BusinessSegment =
  | 'restaurante'
  | 'clinica'
  | 'barbearia'
  | 'salao_beleza'
  | 'consultorio'
  | 'outro'

export type FieldType = 'text' | 'number' | 'select' | 'textarea' | 'checkbox' | 'email' | 'tel'

export interface CustomField {
  id: string
  label: string
  type: FieldType
  placeholder?: string
  options?: string[] // Para type='select'
  required: boolean
  order: number
}

export interface QueueFormConfig {
  businessId?: string
  fields: {
    phone: { enabled: boolean; required: boolean }
    email: { enabled: boolean; required: boolean }
    partySize: { enabled: boolean; required: boolean }
    notes: { enabled: boolean; required: boolean }
  }
  customFields: CustomField[]
}

export interface SegmentQuestion {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox'
  options?: string[]
  required: boolean
  placeholder?: string
}

export interface SegmentConfig {
  businessId?: string
  segmentType: BusinessSegment
  config: Record<string, string | number | boolean | string[]>
}

export interface DashboardMetric {
  id: string
  label: string
  icon: string
  type: 'count' | 'time' | 'percentage' | 'currency'
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  action: string
  variant?: 'default' | 'outline' | 'secondary' | 'destructive'
}

export interface DashboardConfig {
  metrics: DashboardMetric[]
  quickActions: QuickAction[]
  defaultView: 'fila' | 'agenda' | 'clientes'
  terminology: {
    queueLabel: string
    customerLabel: string
    callAction: string
  }
}

export type Country = 'BR' | 'PT'
export type DocumentType = 'CNPJ' | 'CPF' | 'NIF_EMPRESA' | 'NIF_INDIVIDUAL'

export interface BasicInfo {
  // Country detection
  country: Country
  countryDetectedAuto: boolean

  // Business info
  name: string
  phone: string
  address: string

  // Document info (BR)
  documentType?: 'CNPJ' | 'CPF'
  cnpj?: string
  cpf?: string

  // Document info (PT)
  nifType?: 'NIF_EMPRESA' | 'NIF_INDIVIDUAL'
  nif?: string
}

export interface OnboardingProgress {
  currentStep: number
  basicInfo?: BasicInfo
  segmentConfig?: SegmentConfig
  formConfig?: QueueFormConfig
  completedAt?: string
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}
