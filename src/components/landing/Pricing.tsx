'use client'

import { Check } from 'react-feather'
import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'START',
      price: isAnnual ? 17 : 19,
      period: isAnnual ? '/mês' : '/mês',
      originalPrice: isAnnual ? 19 : null,
      discount: isAnnual ? Math.floor(((19 - 17) / 19) * 100) : 0, // 10% desconto
      popular: false,
      custom: false,
      description: 'Para pequenos negócios que querem organizar o atendimento sem complicações.',
      summary: 'Ideal para começar, testar o fluxo real de atendimento e ganhar organização desde o primeiro dia.',
      features: [
        'Fila de espera e reservas',
        'Página pública para clientes',
        'Notificações automáticas por email',
        '1 operador',
        '1 unidade',
      ]
    },
    {
      name: 'PRO',
      price: isAnnual ? 30 : 35,
      period: isAnnual ? '/mês' : '/mês',
      originalPrice: isAnnual ? 35 : null,
      discount: isAnnual ? Math.floor(((35 - 30) / 35) * 100) : 0, // 14% desconto
      popular: true,
      custom: false,
      description: 'Para negócios que atendem diariamente e precisam de mais controlo, comunicação e flexibilidade.',
      summary: 'Pensado para reduzir faltas, melhorar a comunicação com os clientes e escalar o atendimento com confiança.',
      features: [
        'Tudo do plano START',
        'Até 5 operadores e 1 gestor',
        'WhatsApp (até 1.000/mês)',
        'Cobrança de sinal ou pré-pagamento',
        'Analytics completos',
        'Formulários personalizados',
        'Cupões e incentivos',
      ]
    },
    {
      name: 'PERSONALIZADO',
      price: null,
      period: '',
      originalPrice: null,
      discount: 0,
      popular: false,
      custom: true,
      description: 'Precisa de algo diferente? Também apoiamos todos os tamanhos de empresas, organizações e projectos sociais.',
      summary: '',
      features: [
        'Múltiplas unidades ou equipas',
        'Volumes elevados de atendimento',
        'Regras e fluxos personalizados',
        'Integrações ou necessidades específicas',
        'Projectos sociais, ONGs e iniciativas públicas',
      ]
    }
  ]

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-4">
            <span>💰</span>
            <span>Preços</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Escolha O Melhor Plano Para Si
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Selecione o plano ideal adaptado às suas necessidades
          </p>

          {/* Toggle Mensal/Anual */}
          <div className="inline-flex items-center gap-0 mt-8 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                !isAnnual
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                isAnnual
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Anual
            </button>
          </div>
        </motion.div>

        <div className="flex flex-col md:grid md:grid-cols-[1fr_1.15fr_1fr] gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-8 transition-all hover:shadow-xl bg-white flex flex-col ${
                plan.popular
                  ? 'border-4 border-blue-600 shadow-lg md:scale-105'
                  : 'border border-gray-200 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-semibold">
                  Mais Escolhido
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  {plan.discount > 0 && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                      -{plan.discount}%
                    </span>
                  )}
                </div>
                {plan.custom ? (
                  <div className="mb-6">
                    <p className="text-sm leading-relaxed text-gray-600">
                      {plan.description}
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      {plan.originalPrice && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-lg text-gray-400 line-through">
                            €{plan.originalPrice}
                          </span>
                          <span className="text-sm text-gray-500">/mês</span>
                        </div>
                      )}
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold text-gray-900">
                          €{plan.price}
                        </span>
                        <span className="text-base text-gray-500">
                          {plan.period}
                        </span>
                      </div>
                      {isAnnual && !plan.custom && (
                        <p className="text-xs text-gray-500 mt-1">
                          Valor mensal no plano anual
                        </p>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-gray-600">
                      {plan.description}
                    </p>
                  </>
                )}
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-gray-900 mb-3">O que está incluído</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.custom ? '/contacto' : '/auth?mode=signup'}
                className="inline-flex items-center justify-center w-full rounded-lg text-sm font-bold transition-all h-12 uppercase tracking-wide bg-blue-600 text-white hover:bg-blue-700 mt-auto"
              >
                {plan.custom ? 'ENTRAR EM CONTACTO' : 'COMEÇAR AGORA'}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
