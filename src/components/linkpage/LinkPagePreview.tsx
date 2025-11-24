'use client'

import Image from 'next/image'
import { Users, Calendar, MessageCircle, Instagram, Facebook, Youtube, MapPin, Mail, Phone, Music, Link as LinkIcon, Coffee } from 'react-feather'
import type { LinkPage, LinkPageLink, LinkType } from '@/types/linkpage.types'

interface LinkPagePreviewProps {
  linkPage: Partial<LinkPage>
  links: Partial<LinkPageLink>[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users,
  Calendar,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  MapPin,
  Mail,
  Phone,
  Music,
  Link: LinkIcon,
  Coffee,
}

const TYPE_TO_ICON: Record<LinkType, string> = {
  custom: 'Link',
  queue: 'Users',
  reservation: 'Calendar',
  whatsapp: 'MessageCircle',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'Music',
  youtube: 'Youtube',
  menu: 'Coffee',
  location: 'MapPin',
  email: 'Mail',
  phone: 'Phone',
}

export default function LinkPagePreview({ linkPage, links }: LinkPagePreviewProps) {
  const getBackgroundStyle = () => {
    if (linkPage.background_type === 'image' && linkPage.background_image_url) {
      const imageSize = linkPage.background_image_size || 'cover'

      if (imageSize === 'repeat') {
        return {
          backgroundImage: `url(${linkPage.background_image_url})`,
          backgroundSize: 'auto',
          backgroundPosition: 'top left',
          backgroundRepeat: 'repeat',
        }
      }

      return {
        backgroundImage: `url(${linkPage.background_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }

    if (linkPage.background_type === 'gradient' && linkPage.background_gradient_start && linkPage.background_gradient_end) {
      return {
        background: `linear-gradient(${linkPage.background_gradient_direction || 'to bottom'}, ${linkPage.background_gradient_start}, ${linkPage.background_gradient_end})`,
      }
    }

    return {
      backgroundColor: linkPage.background_color || '#0a0a0a',
    }
  }

  const getButtonStyle = (link: Partial<LinkPageLink>) => {
    const bgColor = link.custom_color || linkPage.button_color || '#3b82f6'
    const textColor = link.custom_text_color || linkPage.button_text_color || '#ffffff'

    const baseStyle = {
      backgroundColor: bgColor,
      color: textColor,
    }

    switch (linkPage.button_style) {
      case 'pill':
        return { ...baseStyle, borderRadius: '9999px' }
      case 'square':
        return { ...baseStyle, borderRadius: '4px' }
      default:
        return { ...baseStyle, borderRadius: '8px' }
    }
  }

  const renderIcon = (link: Partial<LinkPageLink>) => {
    const iconName = link.icon || (link.link_type ? TYPE_TO_ICON[link.link_type] : 'Link') || 'Link'
    const IconComponent = ICON_MAP[iconName]

    if (IconComponent) {
      return <IconComponent className="w-3 h-3 flex-shrink-0" />
    }

    if (link.icon) {
      return <span className="text-xs">{link.icon}</span>
    }

    return <LinkIcon className="w-3 h-3 flex-shrink-0" />
  }

  const activeLinks = links.filter(l => l.is_active !== false)

  return (
    <div
      className="h-full w-full overflow-auto flex flex-col"
      style={getBackgroundStyle()}
    >

      <div className="flex-1 flex flex-col items-center px-3 py-4 relative z-10">
        <div className="w-full max-w-[200px]">
          {/* Cover Image */}
          {linkPage.cover_url && (
            <div className="w-full h-16 rounded-lg overflow-hidden mb-3 relative">
              <Image
                src={linkPage.cover_url}
                alt="Cover"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center mb-3">
            {linkPage.avatar_url ? (
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shadow-lg relative">
                <Image
                  src={linkPage.avatar_url}
                  alt={linkPage.title || 'Avatar'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white/20 shadow-lg"
                style={{ backgroundColor: linkPage.button_color, color: linkPage.button_text_color }}
              >
                {linkPage.title?.charAt(0).toUpperCase() || '?'}
              </div>
            )}

            {/* Title */}
            {linkPage.title && (
              <h1
                className="text-sm font-bold mt-2 text-center"
                style={{ color: linkPage.text_color }}
              >
                {linkPage.title}
              </h1>
            )}

            {/* Bio */}
            {linkPage.bio && (
              <p
                className="text-center mt-1 text-[10px] opacity-80 max-w-[160px] line-clamp-2"
                style={{ color: linkPage.text_color }}
              >
                {linkPage.bio}
              </p>
            )}
          </div>

          {/* Social Icons */}
          {linkPage.social_links && Object.keys(linkPage.social_links).length > 0 && (
            <div className="flex justify-center gap-2 mb-3">
              {linkPage.social_links.instagram && (
                <div
                  className="p-1.5 rounded-full bg-white/10"
                  style={{ color: linkPage.text_color }}
                >
                  <Instagram className="w-3 h-3" />
                </div>
              )}
              {linkPage.social_links.facebook && (
                <div
                  className="p-1.5 rounded-full bg-white/10"
                  style={{ color: linkPage.text_color }}
                >
                  <Facebook className="w-3 h-3" />
                </div>
              )}
              {linkPage.social_links.youtube && (
                <div
                  className="p-1.5 rounded-full bg-white/10"
                  style={{ color: linkPage.text_color }}
                >
                  <Youtube className="w-3 h-3" />
                </div>
              )}
              {linkPage.social_links.whatsapp && (
                <div
                  className="p-1.5 rounded-full bg-white/10"
                  style={{ color: linkPage.text_color }}
                >
                  <MessageCircle className="w-3 h-3" />
                </div>
              )}
              {linkPage.social_links.email && (
                <div
                  className="p-1.5 rounded-full bg-white/10"
                  style={{ color: linkPage.text_color }}
                >
                  <Mail className="w-3 h-3" />
                </div>
              )}
            </div>
          )}

          {/* Links */}
          <div className="space-y-1.5">
            {activeLinks.map((link, index) => (
              <div
                key={link.id || index}
                className="flex items-center gap-2 w-full p-2 text-xs"
                style={getButtonStyle(link)}
              >
                {link.thumbnail_url && link.thumbnail_url.startsWith('http') ? (
                  <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={link.thumbnail_url}
                      alt={link.title || ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  renderIcon(link)
                )}

                <span className="flex-1 font-medium text-center pr-3 truncate">
                  {link.title || 'Link sem título'}
                </span>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {activeLinks.length === 0 && (
            <div
              className="text-center py-6 opacity-60"
              style={{ color: linkPage.text_color }}
            >
              <LinkIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-[10px]">Nenhum link</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-2 text-center relative z-10">
        <span
          className="text-[8px] opacity-50"
          style={{ color: linkPage.text_color }}
        >
          Feito com MinhaVez
        </span>
      </div>
    </div>
  )
}
