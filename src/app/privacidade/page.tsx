import Link from 'next/link'

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Voltar para Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Política de Privacidade</h1>
          <p className="text-zinc-400">Última atualização: Janeiro de 2025</p>
        </div>

        {/* Conteúdo */}
        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-8 text-zinc-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Informações que Coletamos</h2>
              <p className="leading-relaxed mb-4">
                O MinhaVez coleta informações que você nos fornece diretamente ao criar uma conta, usar nossos serviços ou entrar em contato conosco. Isso inclui:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Nome completo e endereço de email</li>
                <li>Informações do negócio (nome, tipo, telefone)</li>
                <li>Dados de uso da plataforma</li>
                <li>Informações de pagamento (processadas através do Stripe)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Como Usamos suas Informações</h2>
              <p className="leading-relaxed mb-4">
                Utilizamos as informações coletadas para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer, manter e melhorar nossos serviços</li>
                <li>Processar transações e enviar notificações relacionadas</li>
                <li>Enviar atualizações técnicas e de segurança</li>
                <li>Responder a suas solicitações e fornecer suporte ao cliente</li>
                <li>Proteger contra fraudes e abusos</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Compartilhamento de Informações</h2>
              <p className="leading-relaxed mb-4">
                Não vendemos suas informações pessoais. Compartilhamos informações apenas nas seguintes circunstâncias:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Com provedores de serviços que nos auxiliam (ex: Stripe para pagamentos)</li>
                <li>Quando exigido por lei ou processo legal</li>
                <li>Para proteger os direitos e segurança do MinhaVez e de nossos usuários</li>
                <li>Com seu consentimento explícito</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Segurança dos Dados</h2>
              <p className="leading-relaxed">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia SSL, autenticação segura e monitoramento contínuo de nossa infraestrutura.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Seus Direitos</h2>
              <p className="leading-relaxed mb-4">
                Você tem o direito de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar e receber uma cópia de suas informações pessoais</li>
                <li>Corrigir informações imprecisas ou incompletas</li>
                <li>Solicitar a exclusão de suas informações</li>
                <li>Opor-se ao processamento de suas informações</li>
                <li>Retirar o consentimento a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies e Tecnologias Similares</h2>
              <p className="leading-relaxed">
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso da plataforma e personalizar conteúdo. Você pode controlar o uso de cookies através das configurações do seu navegador.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Retenção de Dados</h2>
              <p className="leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Alterações nesta Política</h2>
              <p className="leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas por email ou através de um aviso em nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contato</h2>
              <p className="leading-relaxed mb-4">
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre nossas práticas de dados, entre em contato conosco:
              </p>
              <p className="leading-relaxed">
                Email: <a href="mailto:privacidade@minhavez.com" className="text-blue-500 hover:text-blue-400">privacidade@minhavez.com</a>
              </p>
            </section>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <Link
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 py-2"
          >
            Começar Grátis
          </Link>
        </div>
      </div>
    </div>
  )
}
