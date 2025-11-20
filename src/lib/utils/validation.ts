import type {
  QueueFormConfig,
  ValidationResult,
  ValidationError,
} from '@/types/config.types'

export function validateDynamicForm(
  formData: Record<string, string | number | boolean>,
  config: QueueFormConfig
): ValidationResult {
  const errors: ValidationError[] = []

  // Validate customer_name (always required)
  if (!formData.customer_name || (typeof formData.customer_name === 'string' && formData.customer_name.trim() === '')) {
    errors.push({
      field: 'customer_name',
      message: 'Nome é obrigatório',
    })
  }

  // Validate standard fields
  if (config.fields.phone.enabled && config.fields.phone.required) {
    if (!formData.customer_phone || (typeof formData.customer_phone === 'string' && formData.customer_phone.trim() === '')) {
      errors.push({
        field: 'customer_phone',
        message: 'Telefone é obrigatório',
      })
    } else if (typeof formData.customer_phone === 'string' && !isValidPhone(formData.customer_phone)) {
      errors.push({
        field: 'customer_phone',
        message: 'Telefone inválido',
      })
    }
  }

  if (config.fields.email.enabled && config.fields.email.required) {
    if (!formData.customer_email || (typeof formData.customer_email === 'string' && formData.customer_email.trim() === '')) {
      errors.push({
        field: 'customer_email',
        message: 'Email é obrigatório',
      })
    } else if (typeof formData.customer_email === 'string' && !isValidEmail(formData.customer_email)) {
      errors.push({
        field: 'customer_email',
        message: 'Email inválido',
      })
    }
  }

  if (config.fields.partySize.enabled && config.fields.partySize.required) {
    if (!formData.party_size) {
      errors.push({
        field: 'party_size',
        message: 'Número de pessoas é obrigatório',
      })
    } else if (typeof formData.party_size === 'number' && formData.party_size < 1) {
      errors.push({
        field: 'party_size',
        message: 'Número de pessoas deve ser maior que 0',
      })
    }
  }

  if (config.fields.notes.enabled && config.fields.notes.required) {
    if (!formData.notes || (typeof formData.notes === 'string' && formData.notes.trim() === '')) {
      errors.push({
        field: 'notes',
        message: 'Observações são obrigatórias',
      })
    }
  }

  // Validate custom fields
  config.customFields.forEach((field) => {
    if (field.required) {
      const value = formData[field.id]
      if (value === undefined || value === null || value === '') {
        errors.push({
          field: field.id,
          message: `${field.label} é obrigatório`,
        })
      }
    }

    // Type-specific validations
    const value = formData[field.id]
    if (value) {
      if (field.type === 'email' && typeof value === 'string' && !isValidEmail(value)) {
        errors.push({
          field: field.id,
          message: `${field.label} inválido`,
        })
      }
      if (field.type === 'tel' && typeof value === 'string' && !isValidPhone(value)) {
        errors.push({
          field: field.id,
          message: `${field.label} inválido`,
        })
      }
      if (field.type === 'number' && isNaN(Number(value))) {
        errors.push({
          field: field.id,
          message: `${field.label} deve ser um número`,
        })
      }
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '')
  // Brazilian phone: 10-11 digits
  return digitsOnly.length >= 10 && digitsOnly.length <= 11
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '')

  if (digitsOnly.length === 10) {
    // Format: (XX) XXXX-XXXX
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 6)}-${digitsOnly.slice(6)}`
  } else if (digitsOnly.length === 11) {
    // Format: (XX) XXXXX-XXXX
    return `(${digitsOnly.slice(0, 2)}) ${digitsOnly.slice(2, 7)}-${digitsOnly.slice(7)}`
  }

  return phone
}

export function sanitizePhoneNumber(phone: string): string {
  // Return only digits for storage
  return phone.replace(/\D/g, '')
}

export function validateSegmentConfig(config: Record<string, string | number | boolean | string[]>): boolean {
  // Basic validation - can be extended based on segment requirements
  return Object.keys(config).length > 0
}
