'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { motion } from 'framer-motion'
import { HelpCircle } from 'react-feather'

export default function FAQ() {
  const faqs = [
    {
      question: 'Como funciona o MinhaVez?',
      answer: 'É simples: seus clientes escaneiam um QR Code, entram na fila digital e acompanham a posição pelo celular. Você gerencia tudo pelo dashboard.'
    },
    {
      question: 'Preciso de cartão de crédito para testar?',
      answer: 'Não! Você tem 14 dias grátis sem precisar cadastrar cartão. Só pedimos pagamento se decidir continuar após o trial.'
    },
    {
      question: 'Posso cancelar quando quiser?',
      answer: 'Sim, sem multas ou burocracias. Cancele a qualquer momento direto no dashboard.'
    },
    {
      question: 'Tem suporte em português?',
      answer: 'Sim! Nossa equipe responde em português por email em até 24h.'
    },
    {
      question: 'Funciona em qualquer tipo de restaurante?',
      answer: 'Sim! De food trucks a restaurantes grandes. Se você tem fila de espera, o MinhaVez funciona.'
    }
  ]

  return (
    <section className="py-12 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-blue-600/10 rounded-full mb-3 md:mb-4">
            <HelpCircle className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Perguntas Frequentes
          </h2>
          <p className="text-zinc-400 mt-3 md:mt-4 text-sm md:text-base px-2">
            Tire suas dúvidas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="w-full space-y-3 md:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 md:px-6 hover:border-zinc-700 transition-colors"
                >
                  <AccordionTrigger className="text-left text-sm md:text-lg hover:no-underline py-4 md:py-6">
                    <span className="flex items-start gap-2 md:gap-3">
                      <span className="text-blue-600 font-bold text-sm md:text-base">Q.</span>
                      <span className="pr-2">{faq.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-zinc-400 pb-4 md:pb-6 pl-6 md:pl-8 text-sm md:text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
