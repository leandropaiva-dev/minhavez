import Link from 'next/link'

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="text-blue-500 hover:text-blue-400 text-sm mb-4 inline-block">
            ← Voltar para Home
          </Link>
          <h1 className="text-4xl font-bold text-white mb-4">Termos de Uso</h1>
          <p className="text-zinc-400">Última atualização: Janeiro de 2025</p>
        </div>

        {/* Conteúdo */}
        <div className="prose prose-invert prose-zinc max-w-none">
          <div className="space-y-8 text-zinc-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Aceitação dos Termos</h2>
              <p className="leading-relaxed">
                Ao acessar e usar o MinhaVez, você concorda em ficar vinculado a estes Termos de Uso e a todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Descrição do Serviço</h2>
              <p className="leading-relaxed">
                O MinhaVez é uma plataforma SaaS de gestão de filas digitais que permite aos negócios gerenciar o fluxo de clientes de forma eficiente. Fornecemos ferramentas para criação de filas virtuais, notificações em tempo real e análise de métricas de atendimento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Registro e Conta</h2>
              <p className="leading-relaxed mb-4">
                Para usar o MinhaVez, você deve:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações precisas, completas e atualizadas durante o registro</li>
                <li>Manter a segurança de sua senha e aceitar a responsabilidade por todas as atividades em sua conta</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                <li>Ter pelo menos 18 anos de idade ou a maioridade legal em sua jurisdição</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Planos e Pagamentos</h2>
              <p className="leading-relaxed mb-4">
                O MinhaVez oferece diferentes planos de assinatura:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Período de teste gratuito de 14 dias para novos usuários</li>
                <li>Assinaturas mensais ou anuais após o período de teste</li>
                <li>Pagamentos processados através do Stripe de forma segura</li>
                <li>Renovação automática, salvo cancelamento prévio</li>
                <li>Reembolsos disponíveis conforme nossa política de reembolso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Uso Aceitável</h2>
              <p className="leading-relaxed mb-4">
                Você concorda em não:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Usar o serviço para qualquer propósito ilegal ou não autorizado</li>
                <li>Violar quaisquer leis em sua jurisdição</li>
                <li>Interferir ou interromper o serviço ou servidores</li>
                <li>Tentar obter acesso não autorizado ao serviço</li>
                <li>Usar o serviço para transmitir vírus ou código malicioso</li>
                <li>Fazer engenharia reversa ou tentar extrair o código-fonte</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Propriedade Intelectual</h2>
              <p className="leading-relaxed">
                O serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva do MinhaVez. O serviço é protegido por direitos autorais, marcas registradas e outras leis. Você recebe uma licença limitada, não exclusiva e revogável para usar o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Cancelamento e Término</h2>
              <p className="leading-relaxed mb-4">
                Você pode cancelar sua assinatura a qualquer momento através do painel de controle. Reservamo-nos o direito de suspender ou encerrar sua conta se você violar estes termos. Após o cancelamento:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Seu acesso ao serviço será encerrado</li>
                <li>Seus dados serão retidos conforme nossa Política de Privacidade</li>
                <li>Não há reembolso para o período já pago, salvo indicado de outra forma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Limitação de Responsabilidade</h2>
              <p className="leading-relaxed">
                O MinhaVez não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos resultantes do uso ou incapacidade de usar o serviço. Fornecemos o serviço "como está" sem garantias de qualquer tipo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Modificações do Serviço</h2>
              <p className="leading-relaxed">
                Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o serviço com ou sem aviso prévio. Não seremos responsáveis perante você ou terceiros por qualquer modificação, suspensão ou descontinuação do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Alterações nos Termos</h2>
              <p className="leading-relaxed">
                Podemos revisar estes termos periodicamente. A versão mais atual estará sempre disponível em nosso site. O uso continuado do serviço após alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. Lei Aplicável</h2>
              <p className="leading-relaxed">
                Estes termos serão regidos e interpretados de acordo com as leis de Portugal, sem considerar suas disposições sobre conflitos de leis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Contato</h2>
              <p className="leading-relaxed mb-4">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco:
              </p>
              <p className="leading-relaxed">
                Email: <a href="mailto:suporte@minhavez.com" className="text-blue-500 hover:text-blue-400">suporte@minhavez.com</a>
              </p>
            </section>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <a
            href="/auth?mode=signup"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 py-2"
          >
            Começar Grátis
          </a>
        </div>
      </div>
    </div>
  )
}
