export type BackgroundType = 'solid' | 'gradient' | 'image'
export type ButtonStyle = 'rounded' | 'pill' | 'square'
export type GradientDirection = 'to bottom' | 'to right' | 'to bottom right' | 'to top right'
export type LinkType = 'custom' | 'queue' | 'reservation' | 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'menu' | 'location' | 'email' | 'phone'

export interface SocialLinks {
  instagram?: string
  facebook?: string
  tiktok?: string
  youtube?: string
  twitter?: string
  whatsapp?: string
  email?: string
  phone?: string
}

export interface LinkPage {
  id: string
  business_id: string
  slug: string
  title: string | null
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
  background_type: BackgroundType
  background_color: string
  background_gradient_start: string | null
  background_gradient_end: string | null
  background_gradient_direction: GradientDirection
  background_image_url: string | null
  button_style: ButtonStyle
  button_color: string
  button_text_color: string
  text_color: string
  social_links: SocialLinks
  seo_title: string | null
  seo_description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface LinkPageLink {
  id: string
  link_page_id: string
  title: string
  url: string
  icon: string | null
  link_type: LinkType
  custom_color: string | null
  custom_text_color: string | null
  thumbnail_url: string | null
  position: number
  is_active: boolean
  click_count: number
  created_at: string
  updated_at: string
}

export interface LinkPageInsert {
  business_id: string
  slug: string
  title?: string
  bio?: string
  avatar_url?: string
  cover_url?: string
  background_type?: BackgroundType
  background_color?: string
  background_gradient_start?: string
  background_gradient_end?: string
  background_gradient_direction?: GradientDirection
  background_image_url?: string
  button_style?: ButtonStyle
  button_color?: string
  button_text_color?: string
  text_color?: string
  social_links?: SocialLinks
  seo_title?: string
  seo_description?: string
  is_published?: boolean
}

export interface LinkPageUpdate {
  slug?: string
  title?: string | null
  bio?: string | null
  avatar_url?: string | null
  cover_url?: string | null
  background_type?: BackgroundType
  background_color?: string
  background_gradient_start?: string | null
  background_gradient_end?: string | null
  background_gradient_direction?: GradientDirection
  background_image_url?: string | null
  button_style?: ButtonStyle
  button_color?: string
  button_text_color?: string
  text_color?: string
  social_links?: SocialLinks
  seo_title?: string | null
  seo_description?: string | null
  is_published?: boolean
}

export interface LinkPageLinkInsert {
  link_page_id: string
  title: string
  url: string
  icon?: string
  link_type?: LinkType
  custom_color?: string
  custom_text_color?: string
  thumbnail_url?: string
  position?: number
  is_active?: boolean
}

export interface LinkPageLinkUpdate {
  title?: string
  url?: string
  icon?: string | null
  link_type?: LinkType
  custom_color?: string | null
  custom_text_color?: string | null
  thumbnail_url?: string | null
  position?: number
  is_active?: boolean
}

// Preset themes
export interface LinkPageTheme {
  name: string
  background_type: BackgroundType
  background_color: string
  background_gradient_start?: string
  background_gradient_end?: string
  background_gradient_direction?: GradientDirection
  button_style: ButtonStyle
  button_color: string
  button_text_color: string
  text_color: string
}

export const LINK_PAGE_THEMES: LinkPageTheme[] = [
  {
    name: 'Escuro',
    background_type: 'solid',
    background_color: '#0a0a0a',
    button_style: 'rounded',
    button_color: '#3b82f6',
    button_text_color: '#ffffff',
    text_color: '#ffffff',
  },
  {
    name: 'Claro',
    background_type: 'solid',
    background_color: '#ffffff',
    button_style: 'rounded',
    button_color: '#0a0a0a',
    button_text_color: '#ffffff',
    text_color: '#0a0a0a',
  },
  {
    name: 'Gradiente Azul',
    background_type: 'gradient',
    background_color: '#1e3a8a',
    background_gradient_start: '#1e3a8a',
    background_gradient_end: '#7c3aed',
    background_gradient_direction: 'to bottom right',
    button_style: 'pill',
    button_color: '#ffffff',
    button_text_color: '#1e3a8a',
    text_color: '#ffffff',
  },
  {
    name: 'Gradiente Rosa',
    background_type: 'gradient',
    background_color: '#be185d',
    background_gradient_start: '#be185d',
    background_gradient_end: '#7c3aed',
    background_gradient_direction: 'to bottom right',
    button_style: 'pill',
    button_color: '#ffffff',
    button_text_color: '#be185d',
    text_color: '#ffffff',
  },
  {
    name: 'Gradiente Verde',
    background_type: 'gradient',
    background_color: '#047857',
    background_gradient_start: '#047857',
    background_gradient_end: '#0891b2',
    background_gradient_direction: 'to bottom',
    button_style: 'rounded',
    button_color: '#ffffff',
    button_text_color: '#047857',
    text_color: '#ffffff',
  },
  {
    name: 'Sunset',
    background_type: 'gradient',
    background_color: '#f97316',
    background_gradient_start: '#f97316',
    background_gradient_end: '#ec4899',
    background_gradient_direction: 'to bottom right',
    button_style: 'pill',
    button_color: '#ffffff',
    button_text_color: '#f97316',
    text_color: '#ffffff',
  },
]

// Link type icons mapping
export const LINK_TYPE_ICONS: Record<LinkType, string> = {
  custom: 'Link',
  queue: 'Users',
  reservation: 'Calendar',
  whatsapp: 'MessageCircle',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'Music2',
  youtube: 'Youtube',
  menu: 'UtensilsCrossed',
  location: 'MapPin',
  email: 'Mail',
  phone: 'Phone',
}
