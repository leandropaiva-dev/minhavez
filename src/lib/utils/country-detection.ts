export type Country = 'BR' | 'PT'

export interface CountryDetectionResult {
  country: Country
  detectedAuto: boolean
  method: 'ip' | 'language' | 'default'
}

/**
 * Detects user's country using IP geolocation with fallbacks
 */
export async function detectCountry(): Promise<CountryDetectionResult> {
  // 1. Try IP Geolocation
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(3000), // 3 second timeout
    })

    if (response.ok) {
      const data = await response.json()
      const countryCode = data.country_code as string

      if (countryCode === 'PT') {
        return { country: 'PT', detectedAuto: true, method: 'ip' }
      }
      if (countryCode === 'BR') {
        return { country: 'BR', detectedAuto: true, method: 'ip' }
      }
    }
  } catch (error) {
    console.warn('IP geolocation failed:', error)
  }

  // 2. Try Browser Language
  if (typeof navigator !== 'undefined') {
    const navigatorWithLang = navigator as Navigator & { userLanguage?: string }
    const language = navigator.language || navigatorWithLang.userLanguage

    if (language === 'pt-PT') {
      return { country: 'PT', detectedAuto: true, method: 'language' }
    }
    if (language === 'pt-BR' || language === 'pt') {
      return { country: 'BR', detectedAuto: true, method: 'language' }
    }
  }

  // 3. Default to Brazil (larger market)
  return { country: 'BR', detectedAuto: false, method: 'default' }
}

/**
 * Get country configuration (labels, placeholders, formats)
 */
export function getCountryConfig(country: Country) {
  const configs = {
    BR: {
      name: 'Brasil',
      flag: '🇧🇷',
      phonePrefix: '+55',
      phonePlaceholder: '(11) 98765-4321',
      phoneFormat: '(XX) XXXXX-XXXX',
      currency: 'R$',
      documentTypes: [
        { value: 'CNPJ', label: 'CNPJ (Empresa)' },
        { value: 'CPF', label: 'CPF (Autônomo/MEI)' },
      ],
      documentPlaceholders: {
        CNPJ: '00.000.000/0000-00',
        CPF: '000.000.000-00',
      },
    },
    PT: {
      name: 'Portugal',
      flag: '🇵🇹',
      phonePrefix: '+351',
      phonePlaceholder: '912 345 678',
      phoneFormat: 'XXX XXX XXX',
      currency: '€',
      documentTypes: [
        { value: 'NIF_EMPRESA', label: 'NIF Empresa' },
        { value: 'NIF_INDIVIDUAL', label: 'NIF Individual' },
      ],
      documentPlaceholders: {
        NIF_EMPRESA: '5 0000 0000',
        NIF_INDIVIDUAL: '0 0000 0000',
      },
    },
  }

  return configs[country]
}
