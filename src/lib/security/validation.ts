/**
 * ✅ SECURITY: Request validation utilities
 * Validates Content-Type, request size, and input sanitization
 */

import { NextRequest } from 'next/server'

/**
 * Validate Content-Type header for API requests
 * @param request - Next.js request
 * @param expectedTypes - Array of expected content types (default: application/json)
 * @returns true if valid, false otherwise
 */
export function validateContentType(
  request: NextRequest,
  expectedTypes: string[] = ['application/json']
): boolean {
  const contentType = request.headers.get('content-type')

  if (!contentType) {
    return false
  }

  // Check if content type matches any expected type
  return expectedTypes.some((expected) =>
    contentType.toLowerCase().includes(expected.toLowerCase())
  )
}

/**
 * Validate request body size
 * @param request - Next.js request
 * @param maxSizeBytes - Maximum size in bytes (default: 1MB)
 * @returns true if valid, false if too large
 */
export function validateBodySize(
  request: NextRequest,
  maxSizeBytes: number = 1024 * 1024
): boolean {
  const contentLength = request.headers.get('content-length')

  if (!contentLength) {
    return true // Can't validate without header, will be validated on parse
  }

  return parseInt(contentLength, 10) <= maxSizeBytes
}

/**
 * Sanitize string input to prevent injection attacks
 * @param input - User input string
 * @param maxLength - Maximum allowed length
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  // Trim and limit length
  let sanitized = input.trim().substring(0, maxLength)

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '')

  // Remove control characters except newline and tab
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  return sanitized
}

/**
 * Validate email format
 * @param email - Email string
 * @returns true if valid format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // RFC 5322 compliant regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate UUID format
 * @param uuid - UUID string
 * @returns true if valid UUID v4
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate phone number (basic validation)
 * @param phone - Phone number string
 * @returns true if valid format
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false
  }

  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')

  // Check if it's a reasonable phone number (8-15 digits)
  const phoneRegex = /^\+?[0-9]{8,15}$/
  return phoneRegex.test(cleaned)
}

/**
 * Sanitize object by validating all string fields
 * @param obj - Object to sanitize
 * @param maxLength - Maximum length for string fields
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  maxLength: number = 1000
): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key] as string, maxLength) as T[Extract<keyof T, string>]
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key] as Record<string, unknown>, maxLength) as T[Extract<keyof T, string>]
    }
  }

  return sanitized
}

/**
 * Validate and sanitize form data
 * @param formData - FormData object
 * @returns Sanitized key-value pairs
 */
export function sanitizeFormData(formData: FormData): Record<string, string> {
  const sanitized: Record<string, string> = {}

  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value)
    }
  })

  return sanitized
}
