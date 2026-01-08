'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuthModal } from '@/contexts/AuthModalContext'

export default function Hero() {
  const { openSignup } = useAuthModal()
  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Floating Icons */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute top-32 left-[10%] hidden lg:block"
      >
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center transform rotate-12">
          <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="absolute top-40 right-[10%] hidden lg:block"
      >
        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center transform -rotate-12">
          <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute bottom-40 left-[15%] hidden lg:block"
      >
        <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center transform rotate-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="absolute bottom-32 right-[12%] hidden lg:block"
      >
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center transform -rotate-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm shadow-sm"
        >
          <span className="font-medium text-center">Usado diariamente para gerir reservas, filas e atendimento</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 sm:mt-8 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight text-gray-900 px-4"
        >
          Transforme o seu atendimento
          <br />
          do início ao fim.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4"
        >
          Organize filas e reservas com ou sem pré-pagamento.
          <br />
          Todo atendimento com notificações automáticas e controlo total.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 sm:mt-10"
        >
          <button
            onClick={openSignup}
            className="inline-flex items-center justify-center rounded-lg text-sm sm:text-base font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-105 uppercase tracking-wide cursor-pointer"
          >
            COMEÇAR AGORA
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-3xl" />
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Image
              src="/hero.jpg"
              alt="Dashboard Preview"
              width={1400}
              height={900}
              className="rounded-2xl shadow-2xl border border-gray-200 w-full h-auto"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
