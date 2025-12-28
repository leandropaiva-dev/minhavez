import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Coluna 1 - Logo e Descrição */}
          <div className="md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-bold text-lg md:text-xl text-gray-900">Organizy</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mb-6">
              Tudo o que precisa numa única plataforma para manter o seu negócio organizado e crescer rapidamente
            </p>
            <Link href="/auth?mode=signup" className="inline-flex items-center justify-center rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 transition-all uppercase tracking-wide w-full md:w-auto">
              COMEÇAR AGORA
            </Link>
          </div>

          {/* Coluna 2 - Produto */}
          <div className="w-full md:w-auto">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Produto</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Preços
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Redes Sociais */}
          <div className="w-full md:w-auto">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Redes Sociais</h3>
            <ul className="space-y-2">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Facebook
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 4 - Empresa */}
          <div className="w-full md:w-auto">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-sm md:text-base">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-600 hover:text-gray-900 transition text-sm">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-8 md:mt-12 pt-6 md:pt-8 border-t border-gray-200 gap-4">
          <p className="text-gray-500 text-xs md:text-sm text-center md:text-left">
            Todos os Direitos Reservados © 2024 Organizy
          </p>
        </div>
      </div>
    </footer>
  )
}
