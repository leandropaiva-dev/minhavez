'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { motion } from 'framer-motion'

export default function FAQ() {
  const faqs = [
    {
      question: 'Como funciona o sistema de filas e reservas?',
      answer: 'O Organizy permite que os seus clientes entrem na fila ou façam reservas através de um link personalizado. Você recebe notificações em tempo real e pode gerir tudo através do painel de controlo.'
    },
    {
      question: 'Preciso de conhecimentos técnicos para usar?',
      answer: 'Não. O Organizy foi desenhado para ser simples e intuitivo. Em menos de 5 minutos consegue configurar a sua conta e começar a receber clientes.'
    },
    {
      question: 'Posso aceitar pagamentos antecipados?',
      answer: 'Sim! Oferecemos integração com Stripe para aceitar sinais ou pré-pagamentos, reduzindo drasticamente as faltas e garantindo receita.'
    },
    {
      question: 'Os meus dados estão seguros?',
      answer: 'Absolutamente. Utilizamos encriptação SSL de nível empresarial e seguimos as melhores práticas de segurança da indústria para proteger os seus dados e dos seus clientes.'
    },
    {
      question: 'Posso experimentar antes de me comprometer?',
      answer: 'Sim, oferecemos um período de teste gratuito com acesso completo a todas as funcionalidades para que possa avaliar se o Organizy é ideal para o seu negócio.'
    }
  ]

  return (
    <section id="faq" className="py-16 md:py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Respostas claras às questões mais comuns sobre a plataforma
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-gray-200 rounded-lg px-4 md:px-6 hover:border-blue-300 transition-colors bg-white"
                >
                  <AccordionTrigger className="text-left text-sm md:text-base lg:text-lg hover:no-underline py-4 md:py-5 font-medium text-gray-900">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 pb-4 md:pb-5 text-sm md:text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
