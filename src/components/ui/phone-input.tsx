'use client'

import { useState, useEffect } from 'react'
import { Phone } from 'react-feather'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import * as flags from 'country-flag-icons/react/3x2'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onCountryChange?: (country: string) => void
  required?: boolean
  className?: string
  defaultCountry?: string
}

interface CountryConfig {
  code: string
  name: string
  ddi: string
  flag: string
  flagColors: string[]
  placeholder: string
  maxLength: number
  format: (value: string) => string
}

// Flag component using country-flag-icons library
const Flag = ({ code }: { code: string }) => {
  const FlagComponent = (flags as Record<string, React.ComponentType<{ className?: string }>>)[code]

  if (!FlagComponent) {
    return (
      <div className="w-6 h-4 rounded bg-zinc-700 flex items-center justify-center text-[9px] font-bold text-white">
        {code}
      </div>
    )
  }

  return <FlagComponent className="w-6 h-4 rounded shadow-sm" />
}

const COUNTRIES: CountryConfig[] = [
  {
    code: 'BR',
    name: 'Brasil',
    ddi: '+55',
    flag: '🇧🇷',
    flagColors: ['#009c3b', '#ffdf00', '#002776'], // Verde, Amarelo, Azul
    placeholder: '(11) 98765-4321',
    maxLength: 15,
    format: (value: string) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 2) return `(${digits}`
      if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
      if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
    }
  },
  {
    code: 'PT',
    name: 'Portugal',
    ddi: '+351',
    flag: '🇵🇹',
    flagColors: ['#046a38', '#da291c'], // Verde, Vermelho
    placeholder: '912 345 678',
    maxLength: 11,
    format: (value: string) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 3) return digits
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`
    }
  },
  {
    code: 'US',
    name: 'EUA',
    ddi: '+1',
    flag: '🇺🇸',
    flagColors: ['#b22234', '#3c3b6e'], // Vermelho, Azul
    placeholder: '(555) 123-4567',
    maxLength: 14,
    format: (value: string) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 3) return `(${digits}`
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
    }
  },
  {
    code: 'ES',
    name: 'Espanha',
    ddi: '+34',
    flag: '🇪🇸',
    flagColors: ['#c60b1e', '#ffc400', '#c60b1e'], // Vermelho, Amarelo, Vermelho
    placeholder: '612 34 56 78',
    maxLength: 11,
    format: (value: string) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 3) return digits
      if (digits.length <= 5) return `${digits.slice(0, 3)} ${digits.slice(3)}`
      if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5)}`
      return `${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
    }
  },
  {
    code: 'FR',
    name: 'França',
    ddi: '+33',
    flag: '🇫🇷',
    flagColors: ['#0055a4', '#ffffff', '#ef4135'], // Azul, Branco, Vermelho
    placeholder: '06 12 34 56 78',
    maxLength: 14,
    format: (value: string) => {
      const digits = value.replace(/\D/g, '')
      const pairs = digits.match(/.{1,2}/g) || []
      return pairs.join(' ').slice(0, 14)
    }
  },
  {
    code: 'DE',
    name: 'Alemanha',
    ddi: '+49',
    flag: '🇩🇪',
    flagColors: ['#000000', '#dd0000', '#ffce00'], // Preto, Vermelho, Amarelo
    placeholder: '151 23456789',
    maxLength: 13,
    format: (value: string) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 3) return digits
      return `${digits.slice(0, 3)} ${digits.slice(3, 11)}`
    }
  },
  {
    code: 'IT',
    name: 'Itália',
    ddi: '+39',
    flag: '🇮🇹',
    flagColors: ['#009246', '#ffffff', '#ce2b37'], // Verde, Branco, Vermelho
    placeholder: '312 345 6789',
    maxLength: 12,
    format: (value: string) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 3) return digits
      if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`
      return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`
    }
  },
  {
    code: 'GB',
    name: 'Reino Unido',
    ddi: '+44',
    flag: '🇬🇧',
    flagColors: ['#012169', '#c8102e'], // Azul, Vermelho
    placeholder: '7400 123456',
    maxLength: 11,
    format: (value: string) => {
      const digits = value.replace(/\D/g, '')
      if (digits.length <= 4) return digits
      return `${digits.slice(0, 4)} ${digits.slice(4, 10)}`
    }
  },
]

export default function PhoneInput({
  value,
  onChange,
  onCountryChange,
  required = false,
  className = '',
  defaultCountry = 'PT',
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry)
  const [phoneNumber, setPhoneNumber] = useState('')

  // Parse initial value if it contains DDI
  useEffect(() => {
    if (value && value.startsWith('+')) {
      const country = COUNTRIES.find(c => value.startsWith(c.ddi))
      if (country) {
        setSelectedCountry(country.code)
        const numberPart = value.substring(country.ddi.length).trim()
        setPhoneNumber(country.format(numberPart))
        return
      }
    }
    if (value && !value.startsWith('+')) {
      const country = COUNTRIES.find(c => c.code === selectedCountry)
      if (country) {
        setPhoneNumber(country.format(value))
      }
    }
  }, [value, selectedCountry])

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode)
    if (onCountryChange) {
      onCountryChange(countryCode)
    }
    // Clear phone number when changing country
    setPhoneNumber('')
    onChange('')
  }

  const handlePhoneChange = (inputValue: string) => {
    const country = COUNTRIES.find(c => c.code === selectedCountry)
    if (!country) return

    // Extract only digits
    const digits = inputValue.replace(/\D/g, '')

    // Apply max length based on country
    const maxDigits = country.maxLength - (country.maxLength - digits.length)
    const limitedDigits = digits.slice(0, country.placeholder.replace(/\D/g, '').length)

    // Format the number
    const formatted = country.format(limitedDigits)
    setPhoneNumber(formatted)

    // Return full number with DDI
    onChange(`${country.ddi} ${limitedDigits}`)
  }

  const selectedCountryData = COUNTRIES.find(c => c.code === selectedCountry) || COUNTRIES[0]

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* Country Selector */}
      <Select value={selectedCountry} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[120px] bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700">
          <SelectValue>
            <div className="flex items-center gap-2">
              <Flag code={selectedCountryData.code} />
              <span className="text-sm font-medium">{selectedCountryData.ddi}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 max-h-[300px]">
          {COUNTRIES.map((country) => (
            <SelectItem
              key={country.code}
              value={country.code}
              className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <div className="flex items-center gap-2">
                <Flag code={country.code} />
                <span className="text-sm">{country.name}</span>
                <span className="text-xs text-zinc-500 ml-auto">{country.ddi}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Phone Input */}
      <div className="relative flex-1">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder={selectedCountryData.placeholder}
          required={required}
          maxLength={selectedCountryData.maxLength}
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  )
}
