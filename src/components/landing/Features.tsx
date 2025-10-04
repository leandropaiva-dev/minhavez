'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, QrCode, LayoutDashboard } from 'lucide-react'
import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const sections = containerRef.current.querySelectorAll('.feature-section')
    const isMobile = window.innerWidth < 768

    const ctx = gsap.context(() => {
      sections.forEach((section, index) => {
        // Pin cada seção
        ScrollTrigger.create({
          trigger: section,
          start: 'center center',
          end: '+=100%',
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        })

        // Fade out - 1% visível no mobile, 50% no desktop
        if (index < sections.length - 1) {
          const nextSection = sections[index + 1]
          gsap.to(section, {
            opacity: 0,
            scale: 0.9,
            scrollTrigger: {
              trigger: nextSection,
              start: isMobile ? 'top 99%' : 'top 50%',
              end: isMobile ? 'top 50%' : 'center center',
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
        }
      })
    }, containerRef)

    return () => {
      ctx.revert()
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <section id="recursos" ref={containerRef} className="relative bg-black">
      {/* Feature 1 - Acompanhamento Real-time */}
      <div className="feature-section min-h-screen flex items-center justify-center py-12 md:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-4 md:mb-6">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-blue-400 font-semibold text-sm md:text-base">Real-time</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Acompanhamento em Tempo Real
              </h2>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed mb-4 md:mb-6">
                Clientes veem a posição atualizada automaticamente pelo celular.
              </p>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <span>Atualizações instantâneas</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <span>Notificações push</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <span>Estimativa de tempo</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl opacity-50" />
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Image
                  src="/feat1.jpg"
                  alt="Acompanhamento Real-time"
                  width={600}
                  height={400}
                  className="rounded-xl md:rounded-2xl shadow-2xl border border-zinc-800 w-full h-auto"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature 2 - QR Code */}
      <div className="feature-section min-h-screen flex items-center justify-center py-12 md:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative order-2 md:order-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl blur-3xl opacity-50" />
              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Image
                  src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80&fit=crop"
                  alt="QR Code Automático"
                  width={600}
                  height={400}
                  className="rounded-xl md:rounded-2xl shadow-2xl border border-zinc-800 w-full h-auto"
                />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 md:order-2 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-purple-600/10 border border-purple-600/20 mb-4 md:mb-6">
                <QrCode className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                <span className="text-purple-400 font-semibold text-sm md:text-base">QR Code</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                QR Code Automático
              </h2>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed mb-4 md:mb-6">
                Cada cliente recebe um QR Code único para entrar na fila.
              </p>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
                  <span>Códigos únicos automáticos</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
                  <span>Sem formulários</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2" />
                  <span>Compartilhar via WhatsApp</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Feature 3 - Dashboard */}
      <div className="feature-section min-h-screen flex items-center justify-center py-12 md:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-600/10 border border-blue-600/20 mb-4 md:mb-6">
                <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                <span className="text-blue-400 font-semibold text-sm md:text-base">Dashboard</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                Dashboard Completo
              </h2>
              <p className="text-base md:text-lg text-zinc-400 leading-relaxed mb-4 md:mb-6">
                Gerencie a fila e veja métricas de atendimento.
              </p>
              <ul className="space-y-2 md:space-y-3">
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <span>Visão geral da fila</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <span>Analytics e relatórios</span>
                </li>
                <li className="flex items-start gap-2 md:gap-3 text-zinc-300 text-sm md:text-base">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2" />
                  <span>Controle total</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl opacity-50" />
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80&fit=crop"
                  alt="Dashboard Completo"
                  width={600}
                  height={400}
                  className="rounded-xl md:rounded-2xl shadow-2xl border border-zinc-800 w-full h-auto"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
