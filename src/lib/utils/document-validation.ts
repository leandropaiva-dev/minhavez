/**
 * Document validation utilities for BR and PT
 */

/**
 * Validates Brazilian CPF (Cadastro de Pessoas Físicas)
 */
export function validateCPF(cpf: string): boolean {
  // Remove non-digits
  const digits = cpf.replace(/\D/g, '')

  // Must have 11 digits
  if (digits.length !== 11) return false

  // Reject known invalid patterns
  if (/^(\d)\1{10}$/.test(digits)) return false

  // Validate first check digit
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i)
  }
  let checkDigit = 11 - (sum % 11)
  if (checkDigit >= 10) checkDigit = 0
  if (checkDigit !== parseInt(digits[9])) return false

  // Validate second check digit
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i)
  }
  checkDigit = 11 - (sum % 11)
  if (checkDigit >= 10) checkDigit = 0
  if (checkDigit !== parseInt(digits[10])) return false

  return true
}

/**
 * Validates Brazilian CNPJ (Cadastro Nacional da Pessoa Jurídica)
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove non-digits
  const digits = cnpj.replace(/\D/g, '')

  // Must have 14 digits
  if (digits.length !== 14) return false

  // Reject known invalid patterns
  if (/^(\d)\1{13}$/.test(digits)) return false

  // Validate first check digit
  let size = digits.length - 2
  let numbers = digits.substring(0, size)
  const checkDigits = digits.substring(size)
  let sum = 0
  let pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(checkDigits.charAt(0))) return false

  // Validate second check digit
  size = size + 1
  numbers = digits.substring(0, size)
  sum = 0
  pos = size - 7

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--
    if (pos < 2) pos = 9
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(checkDigits.charAt(1))) return false

  return true
}

/**
 * Validates Portuguese NIF (Número de Identificação Fiscal)
 */
export function validateNIF(nif: string): boolean {
  // Remove non-digits
  const digits = nif.replace(/\D/g, '')

  // Must have 9 digits
  if (digits.length !== 9) return false

  // First digit must be valid (1-9)
  const firstDigit = parseInt(digits[0])
  if (firstDigit === 0) return false

  // Calculate check digit
  let sum = 0
  for (let i = 0; i < 8; i++) {
    sum += parseInt(digits[i]) * (9 - i)
  }

  const checkDigit = 11 - (sum % 11)
  const expectedCheckDigit = checkDigit >= 10 ? 0 : checkDigit

  return expectedCheckDigit === parseInt(digits[8])
}

/**
 * Format CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length <= 3) return digits
  if (digits.length <= 6)
    return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9)
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`
}

/**
 * Format CNPJ: 00.000.000/0000-00
 */
export function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)

  if (digits.length <= 2) return digits
  if (digits.length <= 5)
    return `${digits.slice(0, 2)}.${digits.slice(2)}`
  if (digits.length <= 8)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`
  if (digits.length <= 12)
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`
}

/**
 * Format NIF: X XXXX XXXX
 */
export function formatNIF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 9)

  if (digits.length <= 1) return digits
  if (digits.length <= 5)
    return `${digits.slice(0, 1)} ${digits.slice(1)}`

  return `${digits.slice(0, 1)} ${digits.slice(1, 5)} ${digits.slice(5)}`
}

/**
 * Format phone number based on country
 */
export function formatPhone(value: string, country: 'BR' | 'PT'): string {
  const digits = value.replace(/\D/g, '')

  if (country === 'BR') {
    // Brazil: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
    if (digits.length <= 2) return digits
    if (digits.length <= 6)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
    if (digits.length <= 10)
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  } else {
    // Portugal: XXX XXX XXX
    const limited = digits.slice(0, 9)
    if (limited.length <= 3) return limited
    if (limited.length <= 6)
      return `${limited.slice(0, 3)} ${limited.slice(3)}`

    return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`
  }
}
