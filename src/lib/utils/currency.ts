type Currency = 'BRL' | 'EUR'

export function formatCurrency(amount: number, currency: Currency = 'BRL'): string {
  const formatter = new Intl.NumberFormat(currency === 'BRL' ? 'pt-BR' : 'pt-PT', {
    style: 'currency',
    currency: currency,
  })

  return formatter.format(amount)
}

export function getCurrencySymbol(currency: Currency = 'BRL'): string {
  return currency === 'BRL' ? 'R$' : '€'
}

export function getCurrencyFromCountry(country: 'BR' | 'PT'): Currency {
  return country === 'BR' ? 'BRL' : 'EUR'
}
