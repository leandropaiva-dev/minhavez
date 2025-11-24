'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Calendar, MessageCircle, Instagram, Facebook, Youtube, MapPin, Mail, Phone, Music, Link as LinkIcon, Coffee, ExternalLink } from 'react-feather'
import { incrementLinkClick } from '@/lib/linkpage/actions'
import type { LinkPage, LinkPageLink, LinkType } from '@/types/linkpage.types'

interface LinkPageViewProps {
  linkPage: LinkPage
  links: LinkPageLink[]
  businessId?: string
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

export default function LinkPageView({ linkPage, links, businessId }: LinkPageViewProps) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set())

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
        backgroundAttachment: 'fixed',
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

  const getButtonStyle = (link: LinkPageLink) => {
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
        return { ...baseStyle, borderRadius: '8px' }
      default:
        return { ...baseStyle, borderRadius: '12px' }
    }
  }

  const handleLinkClick = async (link: LinkPageLink) => {
    if (!clickedLinks.has(link.id)) {
      setClickedLinks(prev => new Set(prev).add(link.id))
      await incrementLinkClick(link.id)
    }
  }

  const getLinkUrl = (link: LinkPageLink) => {
    // Links integrados do MinhaVez
    if (link.link_type === 'queue' && businessId) {
      return `/fila/${businessId}`
    }
    if (link.link_type === 'reservation' && businessId) {
      return `/reserva/${businessId}`
    }

    // Links especiais
    if (link.link_type === 'whatsapp' && link.url) {
      const phone = link.url.replace(/\D/g, '')
      return `https://wa.me/${phone}`
    }
    if (link.link_type === 'email' && link.url) {
      return `mailto:${link.url}`
    }
    if (link.link_type === 'phone' && link.url) {
      return `tel:${link.url}`
    }

    return link.url
  }

  const renderIcon = (link: LinkPageLink) => {
    const iconName = link.icon || TYPE_TO_ICON[link.link_type] || 'Link'
    const IconComponent = ICON_MAP[iconName]

    if (IconComponent) {
      return <IconComponent className="w-5 h-5 flex-shrink-0" />
    }

    // Se for emoji ou texto
    if (link.icon) {
      return <span className="text-lg">{link.icon}</span>
    }

    return <LinkIcon className="w-5 h-5 flex-shrink-0" />
  }

  const isInternalLink = (link: LinkPageLink) => {
    return link.link_type === 'queue' || link.link_type === 'reservation'
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={getBackgroundStyle()}
    >

      <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Cover Image */}
          {linkPage.cover_url && (
            <div className="w-full h-32 sm:h-40 rounded-2xl overflow-hidden mb-6 relative">
              <Image
                src={linkPage.cover_url}
                alt="Cover"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            {linkPage.avatar_url ? (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-xl relative">
                <Image
                  src={linkPage.avatar_url}
                  alt={linkPage.title || 'Avatar'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/20 shadow-xl"
                style={{ backgroundColor: linkPage.button_color, color: linkPage.button_text_color }}
              >
                {linkPage.title?.charAt(0).toUpperCase() || '?'}
              </div>
            )}

            {/* Title */}
            {linkPage.title && (
              <h1
                className="text-2xl sm:text-3xl font-bold mt-4 text-center"
                style={{ color: linkPage.text_color }}
              >
                {linkPage.title}
              </h1>
            )}

            {/* Bio */}
            {linkPage.bio && (
              <p
                className="text-center mt-2 text-sm sm:text-base opacity-80 max-w-xs"
                style={{ color: linkPage.text_color }}
              >
                {linkPage.bio}
              </p>
            )}
          </div>

          {/* Social Icons */}
          {linkPage.social_links && Object.keys(linkPage.social_links).length > 0 && (
            <div className="flex justify-center gap-4 mb-6">
              {linkPage.social_links.instagram && (
                <a
                  href={`https://instagram.com/${linkPage.social_links.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  style={{ color: linkPage.text_color }}
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {linkPage.social_links.facebook && (
                <a
                  href={linkPage.social_links.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  style={{ color: linkPage.text_color }}
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {linkPage.social_links.youtube && (
                <a
                  href={linkPage.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  style={{ color: linkPage.text_color }}
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {linkPage.social_links.whatsapp && (
                <a
                  href={`https://wa.me/${linkPage.social_links.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  style={{ color: linkPage.text_color }}
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
              {linkPage.social_links.email && (
                <a
                  href={`mailto:${linkPage.social_links.email}`}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  style={{ color: linkPage.text_color }}
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

          {/* Links */}
          <div className="space-y-3">
            {links.map((link) => {
              const url = getLinkUrl(link)
              const isInternal = isInternalLink(link)

              const LinkWrapper = isInternal ? Link : 'a'
              const linkProps = isInternal
                ? { href: url }
                : { href: url, target: '_blank', rel: 'noopener noreferrer' }

              return (
                <LinkWrapper
                  key={link.id}
                  {...linkProps}
                  onClick={() => handleLinkClick(link)}
                  className="flex items-center gap-3 w-full p-4 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  style={getButtonStyle(link)}
                >
                  {link.thumbnail_url && link.thumbnail_url.startsWith('http') ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={link.thumbnail_url}
                        alt={link.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    renderIcon(link)
                  )}

                  <span className="flex-1 font-medium text-center pr-5">
                    {link.title}
                  </span>

                  {!isInternal && (
                    <ExternalLink className="w-4 h-4 opacity-50 flex-shrink-0" />
                  )}
                </LinkWrapper>
              )
            })}
          </div>

          {/* Empty State */}
          {links.length === 0 && (
            <div
              className="text-center py-12 opacity-60"
              style={{ color: linkPage.text_color }}
            >
              <LinkIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum link adicionado ainda</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <Link
          href="/"
          className="text-xs opacity-50 hover:opacity-70 transition-opacity"
          style={{ color: linkPage.text_color }}
        >
          Feito com MinhaVez
        </Link>
      </footer>
    </div>
  )
}
