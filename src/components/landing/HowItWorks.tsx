'use client'

import { motion } from 'framer-motion'
import { Aperture, Clock, Smartphone, Layout } from 'react-feather'

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Aperture,
      title: 'Cliente chega',
      description: 'Escaneia o QR Code na entrada (sem app, sem cadastro demorado).',
      color: 'blue'
    },
    {
      number: 2,
      icon: Clock,
      title: 'Entra na fila',
      description: 'Preenche nome e celular em 5 segundos.',
      color: 'purple'
    },
    {
      number: 3,
      icon: Smartphone,
      title: 'Acompanha pelo celular',
      description: 'Vê a posição em tempo real e recebe notificação quando estiver perto.',
      color: 'blue'
    },
    {
      number: 4,
      icon: Layout,
      title: 'Você gerencia no dashboard',
      description: 'Chame o próximo cliente e acompanhe métricas de espera, desistências e picos de movimento.',
      color: 'purple'
    }
  ]

  return (
    <section className="py-12 md:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Como funciona o MinhaVez?
          </h2>
          <p className="text-sm md:text-lg text-zinc-400 max-w-2xl mx-auto px-2">
            Fila digital simples, rápida e sem complicação.
          </p>
        </motion.div>

        {/* Mobile: Vertical Timeline */}
        <ol className="relative border-s border-zinc-800 ml-5 md:hidden">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isLast = index === steps.length - 1

            return (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={isLast ? 'pl-8' : 'mb-10 pl-8'}
              >
                <div className={`absolute flex items-center justify-center w-10 h-10 rounded-full -left-5 ${
                  step.color === 'blue'
                    ? 'bg-blue-600 shadow-lg shadow-blue-600/50'
                    : 'bg-purple-600 shadow-lg shadow-purple-600/50'
                }`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="flex items-center text-lg font-semibold text-white mb-2 mt-1">
                  {step.number}. {step.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.li>
            )
          })}
        </ol>

        {/* Desktop: Tree Timeline */}
        <div className="hidden md:block relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-800 -translate-x-1/2" />

          {steps.map((step, index) => {
            const Icon = step.icon
            const isRight = index % 2 === 0

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: isRight ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative mb-16 ${isRight ? 'pr-1/2 text-right' : 'pl-1/2 ml-auto text-left'} w-1/2`}
              >
                {/* Icon */}
                <div className={`absolute top-0 ${isRight ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} flex items-center justify-center w-12 h-12 rounded-full ${
                  step.color === 'blue'
                    ? 'bg-blue-600 shadow-lg shadow-blue-600/50'
                    : 'bg-purple-600 shadow-lg shadow-purple-600/50'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className={isRight ? 'pr-16' : 'pl-16'}>
                  <h3 className="text-xl font-bold text-white mb-2">
                    {step.number}. {step.title}
                  </h3>
                  <p className="text-base text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
