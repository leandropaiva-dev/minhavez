'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LoginForm from '@/components/auth/LoginForm'
import SignupForm from '@/components/auth/SignupForm'
import { ArrowLeft } from 'react-feather'
import Image from 'next/image'

function AuthContent() {
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-y-auto">
      {/* Back Button */}
      <Link
        href="/"
        className="fixed top-4 left-4 z-50 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-white transition-all text-sm font-medium shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Voltar</span>
      </Link>

      {/* Logo - Mobile Only */}
      <div className="fixed top-4 right-4 md:hidden z-50">
        <Image
          src="/logos/LogoEscritoLight.png"
          alt="Organizy"
          width={120}
          height={32}
          className="h-8 w-auto"
        />
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[1200px] mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 h-[85vh]">
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

        {/* Trust Badges - Mobile Only */}
        <div className="md:hidden mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
            </svg>
            <span>Seguro</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            <span>500+ negócios</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            <span>4.9/5</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Carregando...</div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  )
}
