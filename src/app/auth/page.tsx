'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import AuthSidebar from '@/components/auth/AuthSidebar'
import { ArrowLeft } from 'lucide-react'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const [isLogin, setIsLogin] = useState(mode !== 'signup')

  useEffect(() => {
    setIsLogin(mode !== 'signup')
  }, [mode])

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-2 sm:p-4 relative">
      {/* Botão Voltar */}
      <a
        href="/"
        className="fixed top-4 left-4 z-50 inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Voltar</span>
      </a>

      {/* Container Principal */}
      <div className="w-full max-w-6xl min-h-[600px] md:h-[700px] bg-zinc-900 rounded-xl sm:rounded-2xl border border-zinc-800 overflow-hidden flex flex-col md:flex-row relative">
        {/* Animação de Swap */}
        <AnimatePresence mode="wait">
          {isLogin ? (
            <>
              {/* Login: Form (mobile stacked, desktop side-by-side) */}
              <motion.div
                key="login-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 order-2 md:order-1"
              >
                <LoginForm />
              </motion.div>

              <motion.div
                key="login-sidebar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-1/2 bg-zinc-950 border-b md:border-b-0 md:border-l border-zinc-800 order-1 md:order-2 hidden md:flex"
              >
                <AuthSidebar
                  mode="signup"
                  onToggle={toggleMode}
                />
              </motion.div>

              {/* Mobile toggle button */}
              <div className="w-full p-4 text-center border-t border-zinc-800 md:hidden order-3">
                <button onClick={toggleMode} className="text-zinc-400 text-sm">
                  Não tem conta?{' '}
                  <span className="text-blue-500 hover:text-blue-400">Cadastre-se</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Cadastro: Form (mobile stacked, desktop side-by-side) */}
              <motion.div
                key="signup-sidebar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-1/2 bg-zinc-950 border-b md:border-b-0 md:border-r border-zinc-800 order-1 hidden md:flex"
              >
                <AuthSidebar
                  mode="login"
                  onToggle={toggleMode}
                />
              </motion.div>

              <motion.div
                key="signup-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 order-2"
              >
                <SignupForm />
              </motion.div>

              {/* Mobile toggle button */}
              <div className="w-full p-4 text-center border-t border-zinc-800 md:hidden order-3">
                <button onClick={toggleMode} className="text-zinc-400 text-sm">
                  Já tem conta?{' '}
                  <span className="text-blue-500 hover:text-blue-400">Entrar</span>
                </button>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
