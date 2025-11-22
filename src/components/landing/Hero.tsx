'use client'

import { RotatingText } from '@/components/ui/rotating-text'
import Image from 'next/image'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="py-12 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/50 text-zinc-300 text-xs md:text-sm border border-zinc-700/50"
        >
          <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
          <span className="whitespace-nowrap">14 dias grátis, sem cartão</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 md:mt-4 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            ELIMINE FILAS EM
          </span>
          <br />
          <RotatingText
            texts={['Restaurantes', 'Clínicas', 'Bares', 'Consultórios', 'Barbearias']}
            interval={3500}
            className="uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent inline-block"
          />
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-4 md:mt-6 text-base md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed px-2"
        >
          Gestão de fila digital em tempo real. Clientes acompanham pelo celular.
        </motion.p>

        <div className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-colors bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white px-6 md:px-8 py-3 w-full sm:w-auto"
          >
            Cadastrar
          </Link>
          <Link
            href="/auth?mode=login"
            className="inline-flex items-center justify-center rounded-md text-base font-medium transition-all border border-zinc-700 text-white hover:bg-transparent hover:border-zinc-600 bg-transparent px-6 md:px-8 py-3 w-full sm:w-auto hover:scale-105"
          >
            Entrar
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 md:mt-16 relative px-2"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl" />
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <Image
              src="/hero.jpg"
              alt="Dashboard MinhaVez"
              width={1200}
              height={675}
              className="rounded-xl md:rounded-2xl shadow-2xl border border-zinc-800 w-full h-auto"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
