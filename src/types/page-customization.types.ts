export type PageType = 'queue_form' | 'queue_wait' | 'queue_attending' | 'queue_completed' | 'reservation_form' | 'reservation_confirm'

export interface PageCustomization {
  id: string
  business_id: string
  page_type: PageType

  // Branding
  logo_url: string | null
  show_business_name: boolean
  custom_title: string | null
  custom_subtitle: string | null

  // Colors
  background_type: 'solid' | 'gradient' | 'image'
  background_color: string
  background_gradient_start: string | null
  background_gradient_end: string | null
  background_gradient_direction: string | null
  background_image_url: string | null

  // Text & Buttons
  primary_color: string
  text_color: string
  button_style: 'rounded' | 'pill' | 'square'
  button_color: string
  button_text_color: string

  // Card Style
  card_background: string
  card_border_color: string
  card_border_radius: 'sm' | 'md' | 'lg' | 'xl' | '2xl'

  // Extra
  show_powered_by: boolean
  custom_css: string | null

  created_at: string
  updated_at: string
}

export interface PageCustomizationInsert {
  business_id: string
  page_type: PageType
  logo_url?: string
  show_business_name?: boolean
  custom_title?: string
  custom_subtitle?: string
  background_type?: 'solid' | 'gradient' | 'image'
  background_color?: string
  background_gradient_start?: string
  background_gradient_end?: string
  background_gradient_direction?: string
  background_image_url?: string
  primary_color?: string
  text_color?: string
  button_style?: 'rounded' | 'pill' | 'square'
  button_color?: string
  button_text_color?: string
  card_background?: string
  card_border_color?: string
  card_border_radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  show_powered_by?: boolean
  custom_css?: string
}

export const DEFAULT_PAGE_CUSTOMIZATION: Omit<PageCustomization, 'id' | 'business_id' | 'page_type' | 'created_at' | 'updated_at'> = {
  logo_url: null,
  show_business_name: true,
  custom_title: null,
  custom_subtitle: null,
  background_type: 'solid',
  background_color: '#000000',
  background_gradient_start: null,
  background_gradient_end: null,
  background_gradient_direction: null,
  background_image_url: null,
  primary_color: '#3b82f6',
  text_color: '#ffffff',
  button_style: 'rounded',
  button_color: '#3b82f6',
  button_text_color: '#ffffff',
  card_background: '#18181b',
  card_border_color: '#27272a',
  card_border_radius: 'xl',
  show_powered_by: true,
  custom_css: null,
}

export const PAGE_TYPE_LABELS: Record<PageType, { title: string; description: string }> = {
  queue_form: {
    title: 'Formulário de Fila',
    description: 'Página onde clientes entram na fila'
  },
  queue_wait: {
    title: 'Aguardando na Fila',
    description: 'Página de espera com posição na fila'
  },
  queue_attending: {
    title: 'Sendo Atendido',
    description: 'Página exibida durante o atendimento'
  },
  queue_completed: {
    title: 'Atendimento Concluído',
    description: 'Página de feedback após o atendimento'
  },
  reservation_form: {
    title: 'Formulário de Reserva',
    description: 'Página onde clientes fazem reservas'
  },
  reservation_confirm: {
    title: 'Confirmação de Reserva',
    description: 'Página de confirmação após reservar'
  },
}
