'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import { X } from 'react-feather'
import Image from 'next/image'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login')

  useEffect(() => {
    setIsLogin(initialMode === 'login')
  }, [initialMode])

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <div className="fixed top-16 left-0 right-0 bottom-0 z-40 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-[1200px] mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white transition-all shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid md:grid-cols-2 h-[85vh] max-h-[800px]">
                  {/* Left Side */}
                  <motion.div
                    key={isLogin ? 'login-form' : 'signup-sidebar'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={isLogin ? 'flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8' : 'hidden md:flex flex-col relative overflow-hidden'}
                    style={!isLogin ? { backgroundColor: '#4525d2' } : {}}
                  >
                    {isLogin ? (
                      <div className="w-full max-w-md">
                        <LoginForm onToggle={toggleMode} />
                      </div>
                    ) : (
                      <>
                        {/* Pattern Background */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: 'url(/pattern.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.05
                          }}
                        />

                        {/* Sidebar Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 lg:p-8 text-white text-center h-full">
                          <div className="mb-6">
                            <Image
                              src="/logos/LogoEscritoLight.png"
                              alt="Organizy"
                              width={200}
                              height={60}
                              className="h-10 w-auto brightness-0 invert"
                            />
                          </div>

                          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                            Já tem uma conta?
                          </h2>
                          <p className="text-sm lg:text-base text-white/80 mb-6 max-w-sm">
                            Entre agora e continue gerenciando suas filas e reservas de forma profissional.
                          </p>

                          <button
                            onClick={toggleMode}
                            className="px-8 py-3 bg-white text-[#4525d2] rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg"
                          >
                            Entrar na conta
                          </button>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-6 lg:gap-8 mt-8 w-full max-w-sm">
                            <div>
                              <div className="text-2xl lg:text-3xl font-bold">500+</div>
                              <div className="text-xs text-white/70 mt-1">Negócios</div>
                            </div>
                            <div>
                              <div className="text-2xl lg:text-3xl font-bold">50k+</div>
                              <div className="text-xs text-white/70 mt-1">Clientes</div>
                            </div>
                            <div>
                              <div className="text-2xl lg:text-3xl font-bold">4.9</div>
                              <div className="text-xs text-white/70 mt-1">Avaliação</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>

                  {/* Right Side */}
                  <motion.div
                    key={isLogin ? 'login-sidebar' : 'signup-form'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={!isLogin ? 'flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8' : 'hidden md:flex flex-col relative overflow-hidden'}
                    style={isLogin ? { backgroundColor: '#4525d2' } : {}}
                  >
                    {!isLogin ? (
                      <div className="w-full max-w-md">
                        <SignupForm onToggle={toggleMode} />
                      </div>
                    ) : (
                      <>
                        {/* Pattern Background */}
                        <div
                          className="absolute inset-0"
                          style={{
                            backgroundImage: 'url(/pattern.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.05
                          }}
                        />

                        {/* Sidebar Content */}
                        <div className="relative z-10 flex flex-col items-center justify-center p-6 lg:p-8 text-white text-center h-full">
                          <div className="mb-6">
                            <Image
                              src="/logos/LogoEscritoLight.png"
                              alt="Organizy"
                              width={200}
                              height={60}
                              className="h-10 w-auto brightness-0 invert"
                            />
                          </div>

                          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
                            Novo por aqui?
                          </h2>
                          <p className="text-sm lg:text-base text-white/80 mb-6 max-w-sm">
                            Cadastre-se agora e comece a transformar a experiência dos seus clientes hoje mesmo.
                          </p>

                          <button
                            onClick={toggleMode}
                            className="px-8 py-3 bg-white text-[#4525d2] rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-lg"
                          >
                            Criar conta grátis
                          </button>

                          {/* Stats */}
                          <div className="grid grid-cols-3 gap-6 lg:gap-8 mt-8 w-full max-w-sm">
                            <div>
                              <div className="text-2xl lg:text-3xl font-bold">500+</div>
                              <div className="text-xs text-white/70 mt-1">Negócios</div>
                            </div>
                            <div>
                              <div className="text-2xl lg:text-3xl font-bold">50k+</div>
                              <div className="text-xs text-white/70 mt-1">Clientes</div>
                            </div>
                            <div>
                              <div className="text-2xl lg:text-3xl font-bold">4.9</div>
                              <div className="text-xs text-white/70 mt-1">Avaliação</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
