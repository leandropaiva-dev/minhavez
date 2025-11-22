import type {
  QueueFormConfig,
  ReservationFormConfig,
  SegmentConfig,
  OnboardingProgress,
  BusinessSegment,
} from '@/types/config.types'

const STORAGE_KEYS = {
  QUEUE_FORM_CONFIG: 'minhavez_queue_form_config',
  RESERVATION_FORM_CONFIG: 'minhavez_reservation_form_config',
  SEGMENT_CONFIG: 'minhavez_segment_config',
  ONBOARDING_PROGRESS: 'minhavez_onboarding_progress',
} as const

// Helper to check if we're in browser
const isBrowser = () => typeof window !== 'undefined'

// Queue Form Config
export function saveQueueFormConfig(config: QueueFormConfig): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEYS.QUEUE_FORM_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save queue form config:', error)
  }
}

export function getQueueFormConfig(): QueueFormConfig | null {
  if (!isBrowser()) return null
  try {
    const data = localStorage.getItem(STORAGE_KEYS.QUEUE_FORM_CONFIG)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to get queue form config:', error)
    return null
  }
}

export function getDefaultQueueFormConfig(): QueueFormConfig {
  return {
    fields: {
      phone: { enabled: true, required: true },
      email: { enabled: true, required: false },
      partySize: { enabled: true, required: false },
      notes: { enabled: true, required: false },
    },
    customFields: [],
  }
}

// Reservation Form Config
export function saveReservationFormConfig(config: ReservationFormConfig): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEYS.RESERVATION_FORM_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save reservation form config:', error)
  }
}

export function getReservationFormConfig(): ReservationFormConfig | null {
  if (!isBrowser()) return null
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESERVATION_FORM_CONFIG)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to get reservation form config:', error)
    return null
  }
}

export function getDefaultReservationFormConfig(): ReservationFormConfig {
  return {
    fields: {
      phone: { enabled: true, required: true },
      email: { enabled: true, required: false },
      partySize: { enabled: true, required: true },
      notes: { enabled: true, required: false },
    },
    customFields: [],
  }
}

// Segment Config
export function saveSegmentConfig(config: SegmentConfig): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(STORAGE_KEYS.SEGMENT_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save segment config:', error)
  }
}

export function getSegmentConfig(): SegmentConfig | null {
  if (!isBrowser()) return null
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SEGMENT_CONFIG)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to get segment config:', error)
    return null
  }
}

// Onboarding Progress
export function saveOnboardingProgress(progress: OnboardingProgress): void {
  if (!isBrowser()) return
  try {
    localStorage.setItem(
      STORAGE_KEYS.ONBOARDING_PROGRESS,
      JSON.stringify(progress)
    )
  } catch (error) {
    console.error('Failed to save onboarding progress:', error)
  }
}

export function getOnboardingProgress(): OnboardingProgress | null {
  if (!isBrowser()) return null
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ONBOARDING_PROGRESS)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Failed to get onboarding progress:', error)
    return null
  }
}

export function clearOnboardingData(): void {
  if (!isBrowser()) return
  try {
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_PROGRESS)
  } catch (error) {
    console.error('Failed to clear onboarding data:', error)
  }
}

// Clear all MinhaVez data (useful for testing)
export function clearAllMinhaVezData(): void {
  if (!isBrowser()) return
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.error('Failed to clear all data:', error)
  }
}

// Get business segment from config
export function getCurrentBusinessSegment(): BusinessSegment {
  const config = getSegmentConfig()
  return config?.segmentType || 'outro'
}
