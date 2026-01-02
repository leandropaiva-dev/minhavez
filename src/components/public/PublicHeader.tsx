'use client'

import { Phone, Mail, Instagram, Globe, MapPin } from 'react-feather'

interface PublicHeaderProps {
  businessName: string
  coverPhotoUrl?: string | null
  profilePhotoUrl?: string | null
  phone?: string | null
  email?: string | null
  instagramUrl?: string | null
  websiteUrl?: string | null
  address?: string | null
  showPhone?: boolean
  showEmail?: boolean
  showInstagram?: boolean
  showWebsite?: boolean
  showAddress?: boolean
}

export default function PublicHeader({
  businessName,
  coverPhotoUrl,
  profilePhotoUrl,
  phone,
  email,
  instagramUrl,
  websiteUrl,
  address,
  showPhone = true,
  showEmail = true,
  showInstagram = false,
  showWebsite = false,
  showAddress = true,
}: PublicHeaderProps) {
  const initials = businessName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      {/* Cover Photo */}
      <div className="relative h-32 sm:h-48 md:h-56 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 overflow-hidden">
        {coverPhotoUrl && (
          <img
            src={coverPhotoUrl}
            alt="Capa"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative -mt-12 sm:-mt-16 md:-mt-20 pb-4 sm:pb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
            {/* Profile Photo */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-zinc-900 bg-white dark:bg-zinc-800 overflow-hidden shadow-2xl">
                {profilePhotoUrl ? (
                  <img
                    src={profilePhotoUrl}
                    alt={businessName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl sm:text-3xl md:text-4xl font-bold">
                    {initials}
                  </div>
                )}
              </div>
            </div>

            {/* Business Info */}
            <div className="flex-1 min-w-0 pt-0 sm:pt-8 md:pt-12">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2 sm:mb-3">
                {businessName}
              </h1>

              {/* Contact Info Grid - Stack on mobile */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-6 sm:gap-y-2 text-xs sm:text-sm">
                {showPhone && phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-medium">{phone}</span>
                  </a>
                )}

                {showEmail && email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-medium truncate max-w-[200px] sm:max-w-none">{email}</span>
                  </a>
                )}

                {showInstagram && instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-medium">Instagram</span>
                  </a>
                )}

                {showWebsite && websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-medium">Website</span>
                  </a>
                )}

                {showAddress && address && (
                  <div className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                    <span className="font-medium line-clamp-2">{address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
