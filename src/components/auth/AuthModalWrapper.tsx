'use client'

import { useAuthModal } from '@/contexts/AuthModalContext'
import AuthModal from './AuthModal'

export function AuthModalWrapper() {
  const { isOpen, mode, close } = useAuthModal()

  return <AuthModal isOpen={isOpen} onClose={close} initialMode={mode} />
}
