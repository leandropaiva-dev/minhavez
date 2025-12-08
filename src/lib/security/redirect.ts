/**
 * ✅ SECURITY: Safe redirect validation
 * Prevents open redirect vulnerabilities
 */

/**
 * Validate if a redirect URL is safe (internal to the application)
 * @param url - URL to validate
 * @param allowedDomains - Optional list of allowed external domains
 * @returns true if safe, false if potential open redirect
 */
export function isSafeRedirectUrl(
  url: string,
  allowedDomains?: string[]
): boolean {
  try {
    // Empty or null URL is not safe
    if (!url || url.trim() === '') {
      return false
    }

    // Allow relative URLs that start with /
    if (url.startsWith('/') && !url.startsWith('//')) {
      // Prevent protocol-relative URLs (//evil.com)
      return true
    }

    // Parse absolute URLs
    const parsedUrl = new URL(url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

    // Get current site origin
    const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')

    // Check if same origin
    if (parsedUrl.origin === siteUrl.origin) {
      return true
    }

    // Check allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      return allowedDomains.some((domain) => {
        const domainUrl = new URL(domain)
        return parsedUrl.origin === domainUrl.origin
      })
    }

    // Not same origin and not in allowed list
    return false
  } catch {
    // Invalid URL format
    return false
  }
}

/**
 * Get a safe redirect URL, defaulting to a safe path if invalid
 * @param url - URL to validate
 * @param fallback - Safe fallback URL (default: '/dashboard')
 * @returns Safe redirect URL
 */
export function getSafeRedirectUrl(
  url: string | null | undefined,
  fallback: string = '/dashboard'
): string {
  if (!url) return fallback

  if (isSafeRedirectUrl(url)) {
    return url
  }

  // Log potential attack
  console.warn('[SECURITY] Blocked open redirect attempt:', url)

  return fallback
}

/**
 * Sanitize redirect parameter from URL search params
 * @param searchParams - URLSearchParams object
 * @param paramName - Name of redirect parameter (default: 'redirect')
 * @param fallback - Safe fallback URL
 * @returns Safe redirect URL
 */
export function getSafeRedirectFromParams(
  searchParams: URLSearchParams,
  paramName: string = 'redirect',
  fallback: string = '/dashboard'
): string {
  const redirect = searchParams.get(paramName)
  return getSafeRedirectUrl(redirect, fallback)
}
