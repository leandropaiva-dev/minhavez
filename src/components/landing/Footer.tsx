import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Coluna 1 - Logo e Descrição */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-bold text-xl mb-3 bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
              MinhaVez
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Gestão de filas digital para negócios modernos.
            </p>
          </div>

          {/* Coluna 2 - Produto */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produto</h3>
            <ul className="space-y-2">
              <li>
                <a href="#recursos" className="text-zinc-400 hover:text-white transition text-sm">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#precos" className="text-zinc-400 hover:text-white transition text-sm">
                  Preços
                </a>
              </li>
              <li>
                <Link href="/auth?mode=signup" className="text-zinc-400 hover:text-white transition text-sm">
                  Começar Grátis
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Empresa */}
          <div>
            <h3 className="font-semibold text-white mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/sobre" className="text-zinc-400 hover:text-white transition text-sm">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/contato" className="text-zinc-400 hover:text-white transition text-sm">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacidade" className="text-zinc-400 hover:text-white transition text-sm">
                  Privacidade
                </Link>
              </li>
              <li>
                <Link href="/termos" className="text-zinc-400 hover:text-white transition text-sm">
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-12 pt-8 border-t border-zinc-800 gap-4">
          <p className="text-zinc-500 text-sm">
            © 2025 MinhaVez. Todos os direitos reservados.
          </p>
          <div className="flex gap-6">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition text-sm">
              Twitter
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition text-sm">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
