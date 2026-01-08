'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthModalContextType {
  isOpen: boolean
  mode: 'login' | 'signup'
  openLogin: () => void
  openSignup: () => void
  close: () => void
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined)

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'login' | 'signup'>('login')

  const openLogin = () => {
    setMode('login')
    setIsOpen(true)
  }

  const openSignup = () => {
    setMode('signup')
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
  }

  return (
    <AuthModalContext.Provider value={{ isOpen, mode, openLogin, openSignup, close }}>
      {children}
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  const context = useContext(AuthModalContext)
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider')
  }
  return context
}
