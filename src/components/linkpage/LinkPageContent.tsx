'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Users, Calendar, MessageCircle, Instagram, Facebook, Youtube, MapPin, Mail, Phone, Music, Link as LinkIcon, Coffee, ExternalLink } from 'react-feather'
import { incrementLinkClick } from '@/lib/linkpage/actions'
import { trackLinkClick } from '@/lib/analytics/track'
import type { LinkPage, LinkPageLink, LinkType } from '@/types/linkpage.types'

interface LinkPageContentProps {
  linkPage: LinkPage
  links: LinkPageLink[]
  businessId: string
  enableTracking?: boolean
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

export default function LinkPageContent({ linkPage, links, businessId, enableTracking = false }: LinkPageContentProps) {
  const [clickedLinks, setClickedLinks] = useState<Set<string>>(new Set())

  const handleLinkClick = async (link: LinkPageLink) => {
    if (!clickedLinks.has(link.id)) {
      setClickedLinks(prev => new Set(prev).add(link.id))
      await incrementLinkClick(link.id)

      // Track link click in analytics
      if (enableTracking && businessId) {
        const linkUrl = getLinkUrl(link)
        trackLinkClick(businessId, linkUrl, link.title)
      }
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
    <div className="max-w-2xl mx-auto py-8">
      {/* Bio Section */}
      {linkPage.bio && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
          <p className="text-zinc-700 dark:text-zinc-300 text-center leading-relaxed">
            {linkPage.bio}
          </p>
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
              className="flex items-center gap-3 w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
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
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  {renderIcon(link)}
                </div>
              )}

              <span className="flex-1 font-medium text-zinc-900 dark:text-white">
                {link.title}
              </span>

              {!isInternal && (
                <ExternalLink className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              )}
            </LinkWrapper>
          )
        })}
      </div>

      {/* Empty State */}
      {links.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <LinkIcon className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
          <p className="text-zinc-600 dark:text-zinc-400">Nenhum link adicionado ainda</p>
        </div>
      )}
    </div>
  )
}
