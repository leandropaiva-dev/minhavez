import { createClient } from '@/lib/supabase/server'
import type { PageType, PageCustomization } from '@/types/page-customization.types'
import { ReactNode } from 'react'
import Link from 'next/link'

interface CustomizedPageWrapperProps {
  businessId: string
  pageType: PageType
  businessName?: string
  children: ReactNode
  showHeader?: boolean
}

export default async function CustomizedPageWrapper({
  businessId,
  pageType,
  businessName,
  children,
  showHeader = true,
}: CustomizedPageWrapperProps) {
  const supabase = await createClient()

  // Busca customização da página
  const { data: customization } = await supabase
    .from('page_customizations')
    .select('*')
    .eq('business_id', businessId)
    .eq('page_type', pageType)
    .single()

  // Defaults se não houver customização
  const styles = customization || {
    background_type: 'solid',
    background_color: '#000000',
    text_color: '#ffffff',
    primary_color: '#3b82f6',
    button_color: '#3b82f6',
    button_text_color: '#ffffff',
    button_style: 'rounded',
    card_background: '#18181b',
    card_border_color: '#27272a',
    card_border_radius: 'xl',
    show_business_name: true,
    show_powered_by: true,
    logo_url: null,
    custom_title: null,
    custom_subtitle: null,
  }

  const getBackgroundStyle = (): React.CSSProperties => {
    if (styles.background_type === 'image' && styles.background_image_url) {
      return {
        backgroundImage: `url(${styles.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    if (styles.background_type === 'gradient') {
      return {
        background: `linear-gradient(${styles.background_gradient_direction || 'to bottom'}, ${styles.background_gradient_start || '#000'}, ${styles.background_gradient_end || '#333'})`,
      }
    }
    return { backgroundColor: styles.background_color || '#000000' }
  }

  const getButtonRadius = () => {
    switch (styles.button_style) {
      case 'pill': return '9999px'
      case 'square': return '4px'
      default: return '8px'
    }
  }

  const getCardRadius = () => {
    switch (styles.card_border_radius) {
      case 'sm': return '0.25rem'
      case 'md': return '0.375rem'
      case 'lg': return '0.5rem'
      case 'xl': return '0.75rem'
      case '2xl': return '1rem'
      default: return '0.75rem'
    }
  }

  const cssVariables = {
    '--text-color': styles.text_color,
    '--primary-color': styles.primary_color,
    '--button-color': styles.button_color,
    '--button-text-color': styles.button_text_color,
    '--button-radius': getButtonRadius(),
    '--card-bg': styles.card_background,
    '--card-border': styles.card_border_color,
    '--card-radius': getCardRadius(),
  } as React.CSSProperties

  return (
    <div className="min-h-screen flex flex-col" style={{ ...getBackgroundStyle(), ...cssVariables }}>
      {/* Header */}
      {showHeader && (
        <header className="border-b backdrop-blur-sm sticky top-0 z-10" style={{
          borderColor: styles.card_border_color,
          backgroundColor: `${styles.card_background}cc`,
        }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="transition-colors text-sm" style={{
              color: styles.text_color,
              opacity: 0.6,
            }}>
              ← Voltar
            </Link>
            {styles.show_powered_by && (
              <span className="text-xs" style={{
                color: styles.text_color,
                opacity: 0.4,
              }}>
                Powered by MinhaVez
              </span>
            )}
          </div>
        </header>
      )}

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg">
          {/* Logo & Business Info */}
          <div className="text-center mb-8">
            {styles.logo_url && (
              <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={styles.logo_url} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}

            {styles.show_business_name && businessName && (
              <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: styles.text_color }}>
                {businessName}
              </h1>
            )}

            {styles.custom_title && (
              <p className="text-xl font-semibold mb-1" style={{ color: styles.text_color }}>
                {styles.custom_title}
              </p>
            )}

            {styles.custom_subtitle && (
              <p className="text-sm" style={{ color: styles.text_color, opacity: 0.7 }}>
                {styles.custom_subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </main>
    </div>
  )
}
