'use client'

import { Check, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Pricing() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isAnnual, setIsAnnual] = useState(false)

  const basicFeatures = [
    'Fila ilimitada',
    'QR Code automático',
    'Notificações em tempo real',
    'Dashboard básico',
    'Suporte por email',
  ]

  const proFeatures = [
    'Tudo do Básico',
    'Filas por categorias',
    'Relatórios automáticos',
    'Lista de contactos',
    'Suporte prioritário',
  ]

  useEffect(() => {
    if (!sectionRef.current) return

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'center center',
        end: '+=20%',
        pin: true,
        pinSpacing: true,
        invalidateOnRefresh: true,
      })
    }, sectionRef)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section id="precos" ref={sectionRef} className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden py-12 md:py-0">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/10 via-transparent to-purple-950/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative w-full">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Planos Simples
          </h2>
          <p className="text-zinc-400 mt-3 md:mt-4 text-base md:text-lg px-2">
            Escolha o melhor plano para seu negócio
          </p>

          {/* Toggle Mensal/Anual */}
          <div className="flex items-center justify-center gap-3 mt-6 md:mt-8">
            <span className={`text-sm md:text-base transition-colors ${!isAnnual ? 'text-white font-semibold' : 'text-zinc-500'}`}>
              Mensal
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-zinc-800 rounded-full transition-colors hover:bg-zinc-700"
            >
              <motion.div
                className="absolute top-1 left-1 w-5 h-5 bg-blue-600 rounded-full"
                animate={{ x: isAnnual ? 28 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={`text-sm md:text-base transition-colors ${isAnnual ? 'text-white font-semibold' : 'text-zinc-500'}`}>
              Anual
            </span>
            {isAnnual && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold"
              >
                -10%
              </motion.span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Plano Básico */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8 }}
            className="group bg-zinc-900 rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-zinc-800 hover:border-zinc-700 transition-all duration-300 relative"
          >

            <div className="inline-flex items-center px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs md:text-sm mb-3 md:mb-4">
              Básico
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl md:text-5xl font-bold">
                €{isAnnual ? '226,80' : '21'}
              </span>
              <span className="text-zinc-400 text-sm md:text-base">
                /{isAnnual ? 'ano' : 'mês'}
              </span>
            </div>
            {isAnnual && (
              <div className="text-zinc-500 line-through text-sm">€252</div>
            )}

            <ul className="mt-6 md:mt-8 space-y-3">
              {basicFeatures.map((feature, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-2 md:gap-3"
                >
                  <div className="bg-blue-600/10 p-1 rounded-full">
                    <Check className="w-3 h-3 md:w-4 md:h-4 text-blue-600 flex-shrink-0" />
                  </div>
                  <span className="text-zinc-300 text-sm md:text-base">{feature}</span>
                </motion.li>
              ))}
            </ul>

            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center w-full mt-6 md:mt-8 rounded-md text-sm md:text-base font-medium transition-all border border-zinc-700 bg-transparent text-white hover:border-zinc-600 h-10 px-4 py-2 hover:scale-105"
            >
              Cadastrar
            </Link>
          </motion.div>

          {/* Plano Pro */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-blue-600 relative overflow-hidden"
          >

            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:w-60 group-hover:h-60 transition-all duration-500" />
            <div className="absolute -top-1 -right-1 bg-gradient-to-br from-blue-600 to-purple-600 text-white px-3 md:px-4 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1 text-xs md:text-sm font-semibold">
              <Zap className="w-3 h-3 md:w-4 md:h-4" />
              Popular
            </div>

            <div className="relative">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs md:text-sm mb-3 md:mb-4">
                Pro
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
                  €{isAnnual ? '270' : '25'}
                </span>
                <span className="text-zinc-400 text-sm md:text-base">
                  /{isAnnual ? 'ano' : 'mês'}
                </span>
              </div>
              {isAnnual && (
                <div className="text-zinc-500 line-through text-sm">€300</div>
              )}

              <ul className="mt-6 md:mt-8 space-y-3">
                {proFeatures.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-2 md:gap-3"
                  >
                    <div className="bg-blue-600 p-1 rounded-full">
                      <Check className="w-3 h-3 md:w-4 md:h-4 text-white flex-shrink-0" />
                    </div>
                    <span className="text-zinc-300 text-sm md:text-base">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              <Link
                href="/auth?mode=signup"
                className="inline-flex items-center justify-center w-full mt-6 md:mt-8 rounded-md text-sm md:text-base font-medium transition-colors bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white h-10 px-4 py-2"
              >
                Cadastrar
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
