'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  BarChart2,
  Users,
  DollarSign,
  Shield,
  Zap,
  Target,
  CheckCircle,
  ArrowRight
} from 'react-feather'

export default function BenefitsSections() {
  return (
    <div className="bg-white">
      {/* Section 1: 2x2 Grid - Make Your Platform Work Harder */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Faça Seu Negócio Funcionar Melhor
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para gerenciar o seu atendimento de forma profissional
            </p>
          </motion.div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <Image
                  src="/hero.jpg"
                  alt="Métricas Unificadas"
                  width={600}
                  height={400}
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Métricas Unificadas</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Visualize todo o seu atendimento em tempo real: filas ativas, reservas confirmadas e taxa de ocupação.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <Image
                  src="/hero.jpg"
                  alt="Insights Automáticos"
                  width={600}
                  height={400}
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Insights Automáticos</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Identifique horários de pico e otimize sua operação com dados precisos.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <Image
                  src="/hero.jpg"
                  alt="Analytics Focado"
                  width={600}
                  height={400}
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics Focado</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Relatórios detalhados de desistências, tempo médio de espera e satisfação.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                <Image
                  src="/hero.jpg"
                  alt="Análise de Impacto"
                  width={600}
                  height={400}
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Análise de Impacto</h3>
              <p className="text-gray-600 text-sm md:text-base leading-relaxed">
                Veja o impacto das reservas com pré-pagamento na sua receita mensal.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: Benefits List - Mobile Optimized */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Benefícios Que Realmente Importam
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Recursos pensados para facilitar o seu dia a dia
            </p>
          </motion.div>

          {/* Vertical List on Mobile, Grid on Desktop */}
          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 md:space-y-0">
            {[
              { icon: Shield, title: 'Controle Seguro', desc: 'Segurança avançada com criptografia SSL para proteger seus dados e de seus clientes.' },
              { icon: BarChart2, title: 'Analytics em Tempo Real', desc: 'Insights ao vivo e visualização de dados atualizados a cada segundo no seu painel.' },
              { icon: Users, title: 'Visão do Cliente', desc: 'Acompanhe o comportamento e engajamento dos clientes para entender melhor seu público.' },
              { icon: Zap, title: 'Ultra Rápido', desc: 'Performance otimizada com tempo de resposta abaixo de 100ms para melhor experiência.' },
              { icon: DollarSign, title: 'Controle de Receita', desc: 'Monitore sua receita mensal, taxa de conversão e crescimento em um só lugar.' },
              { icon: Target, title: 'Pronto para Usar', desc: 'Templates e componentes pré-construídos prontos para usar em minutos.' }
            ].map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-4 p-4 md:p-6 bg-white md:bg-gray-50 rounded-xl md:rounded-2xl border border-gray-100 md:border-gray-200 hover:shadow-md md:hover:shadow-lg transition-shadow md:flex-col"
                >
                  <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg md:rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Section 3: 3x1 Grid - Get Clear Answers in 3 Simple Steps */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
              <CheckCircle className="w-4 h-4" />
              <span>Simples e Direto</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Respostas Claras em 3 Passos Simples
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Configure sua plataforma e comece a gerenciar em minutos
            </p>
          </motion.div>

          {/* 3x1 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200"
            >
              <div className="mb-6">
                <Image
                  src="/hero.jpg"
                  alt="Configure seu perfil"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Configure seu perfil</h3>
              <p className="text-gray-600 leading-relaxed">
                Crie sua conta, adicione o nome do seu negócio e personalize sua página em menos de 2 minutos.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200"
            >
              <div className="mb-6">
                <Image
                  src="/hero.jpg"
                  alt="Compartilhe seu link"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Compartilhe seu link</h3>
              <p className="text-gray-600 leading-relaxed">
                Receba um link personalizado e QR Code para compartilhar com seus clientes via redes sociais.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200"
            >
              <div className="mb-6">
                <Image
                  src="/hero.jpg"
                  alt="Gerencie tudo no dashboard"
                  width={400}
                  height={300}
                  className="rounded-lg w-full h-auto"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gerencie tudo no dashboard</h3>
              <p className="text-gray-600 leading-relaxed">
                Acompanhe filas, confirme reservas e veja relatórios em tempo real, tudo num único painel.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: Seamless Integrations */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Integrações</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Integrações Perfeitas
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Conecte com as ferramentas que você já usa e automatize ainda mais o seu atendimento.
              </p>
              <button className="inline-flex items-center justify-center rounded-lg text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-lg shadow-blue-600/30 hover:shadow-xl transition-all">
                Ver Integrações
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gray-50 rounded-2xl p-8 border border-gray-200"
            >
              <div className="space-y-4">
                {[
                  { name: 'Stripe', desc: 'Pagamentos', logo: '💳' },
                  { name: 'WhatsApp', desc: 'Notificações', logo: '💬' },
                  { name: 'Google Calendar', desc: 'Sincronização', logo: '📅' },
                  { name: 'Zapier', desc: 'Automação', logo: '⚡' }
                ].map((integration, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                      {integration.logo}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{integration.name}</h4>
                      <p className="text-sm text-gray-600">{integration.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}
