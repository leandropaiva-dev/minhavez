'use client'

import QueueWaitView from './QueueWaitView'
import type { PageCustomization } from '@/types/page-customization.types'

interface QueueWaitViewWithStylesProps {
  entry: {
    id: string
    business_id: string
    customer_name: string
    party_size: number
    status: string
    position: number | null
    notes: string | null
    joined_at: string
    estimated_wait_time: number | null
    business: {
      name: string
      business_type: string | null
      address: string | null
      phone: string | null
    } | null
  }
  currentPosition: number
  estimatedWaitTime: number
  customization: PageCustomization | null
}

export default function QueueWaitViewWithStyles({
  entry,
  currentPosition,
  estimatedWaitTime,
  customization,
}: QueueWaitViewWithStylesProps) {
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!customization) return { backgroundColor: '#000000' }

    if (customization.background_type === 'image' && customization.background_image_url) {
      return {
        backgroundImage: `url(${customization.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    if (customization.background_type === 'gradient') {
      return {
        background: `linear-gradient(${customization.background_gradient_direction || 'to bottom'}, ${customization.background_gradient_start || '#000'}, ${customization.background_gradient_end || '#333'})`,
      }
    }
    return { backgroundColor: customization.background_color || '#000000' }
  }

  const getButtonRadius = () => {
    if (!customization) return '8px'
    switch (customization.button_style) {
      case 'pill': return '9999px'
      case 'square': return '4px'
      default: return '8px'
    }
  }

  const getCardRadius = () => {
    if (!customization) return '0.75rem'
    switch (customization.card_border_radius) {
      case 'sm': return '0.25rem'
      case 'md': return '0.375rem'
      case 'lg': return '0.5rem'
      case 'xl': return '0.75rem'
      case '2xl': return '1rem'
      default: return '0.75rem'
    }
  }

  const styles = customization || {
    text_color: '#ffffff',
    primary_color: '#3b82f6',
    button_color: '#3b82f6',
    button_text_color: '#ffffff',
    card_background: '#18181b',
    card_border_color: '#27272a',
    logo_url: null,
    show_business_name: true,
    show_powered_by: true,
    custom_title: null,
    custom_subtitle: null,
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
    <div style={{ ...getBackgroundStyle(), ...cssVariables }}>
      {/* Logo e título customizado (se existir) */}
      {(styles.logo_url || styles.custom_title || styles.custom_subtitle) && (
        <div className="text-center pt-8 pb-4">
          {styles.logo_url && (
            <div className="w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={styles.logo_url} alt="Logo" className="w-full h-full object-cover" />
            </div>
          )}
          {styles.custom_title && (
            <p className="text-lg font-semibold mb-1" style={{ color: styles.text_color }}>
              {styles.custom_title}
            </p>
          )}
          {styles.custom_subtitle && (
            <p className="text-sm" style={{ color: styles.text_color, opacity: 0.7 }}>
              {styles.custom_subtitle}
            </p>
          )}
        </div>
      )}

      <QueueWaitView
        entry={entry}
        currentPosition={currentPosition}
        estimatedWaitTime={estimatedWaitTime}
      />
    </div>
  )
}
