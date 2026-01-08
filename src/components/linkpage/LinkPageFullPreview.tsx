'use client'

import { ExternalLink } from 'react-feather'
import PublicHeader from '@/components/public/PublicHeader'
import type { LinkPage, LinkPageLink } from '@/types/linkpage.types'

interface LinkPageFullPreviewProps {
  linkPage: Partial<LinkPage>
  links: Partial<LinkPageLink>[]
  businessName: string
  coverPhotoUrl?: string | null
  profilePictureUrl?: string | null
}

export default function LinkPageFullPreview({ linkPage, links, businessName, coverPhotoUrl, profilePictureUrl }: LinkPageFullPreviewProps) {
  // Map icon names to emojis
  const getIconEmoji = (icon?: string | null) => {
    const emojiMap: Record<string, string> = {
      'link': '🔗',
      'instagram': '📷',
      'whatsapp': '💬',
      'email': '📧',
      'phone': '📞',
      'map': '📍',
      'calendar': '📅',
      'shopping': '🛒',
      'menu': '🍽️',
      'youtube': '▶️',
      'facebook': '👥',
      'twitter': '🐦',
      'tiktok': '🎵',
      'linkedin': '💼',
    }

    return emojiMap[icon || 'link'] || '🔗'
  }

  const activeLinks = links.filter(l => l.title && l.url)

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-color, #ffffff)' }}>
      {/* Header */}
      <PublicHeader
        businessName={linkPage.title || businessName}
        coverPhotoUrl={coverPhotoUrl}
        profilePhotoUrl={profilePictureUrl}
      />

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-10/12 max-w-md space-y-6">
          {/* Title & Bio */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-color, #18181b)' }}>
              {linkPage.title || businessName}
            </h1>
            {linkPage.bio && (
              <p className="text-sm sm:text-base opacity-70" style={{ color: 'var(--text-color, #18181b)' }}>
                {linkPage.bio}
              </p>
            )}
          </div>

          {/* Links */}
          <div className="space-y-3">
            {activeLinks.length === 0 ? (
              <div className="text-center py-12 opacity-50" style={{ color: 'var(--text-color, #18181b)' }}>
                <p className="text-sm">Nenhum link ainda</p>
                <p className="text-xs mt-1">Adicione links no editor ao lado</p>
              </div>
            ) : (
              activeLinks.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02] cursor-pointer"
                  style={{
                    backgroundColor: 'var(--card-bg, #ffffff)',
                    borderColor: 'var(--card-border, #e4e4e7)',
                    color: 'var(--text-color, #18181b)',
                  }}
                >
                  <span className="text-2xl flex-shrink-0">
                    {getIconEmoji(link.icon)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{link.title}</p>
                    {link.url && (
                      <p className="text-xs opacity-60 truncate">{link.url}</p>
                    )}
                  </div>
                  <ExternalLink className="w-4 h-4 flex-shrink-0 opacity-40" />
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="text-center pt-8">
            <p className="text-xs opacity-40" style={{ color: 'var(--text-color, #18181b)' }}>
              Feito com MinhaVez
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
