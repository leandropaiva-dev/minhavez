/**
 * ✅ SECURITY: Image upload validation
 * Prevents XSS via malicious SVG/HTML uploads
 */

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export interface ValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validate image file before upload
 * @param file - File object from input
 * @returns ValidationResult
 */
export function validateImageUpload(file: File): ValidationResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp']

  if (!extension || !allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Extensão de arquivo não permitida. Permitidas: ${allowedExtensions.join(', ')}`,
    }
  }

  return { valid: true }
}

/**
 * Sanitize filename to prevent path traversal
 * @param filename - Original filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars
    .replace(/\.{2,}/g, '.') // Prevent directory traversal
    .substring(0, 255) // Limit length
}

/**
 * Generate secure upload path for user
 * @param userId - User UUID
 * @param filename - Original filename
 * @returns Secure path
 */
export function generateSecureUploadPath(userId: string, filename: string): string {
  const sanitized = sanitizeFilename(filename)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)

  return `${userId}/${timestamp}-${random}-${sanitized}`
}
