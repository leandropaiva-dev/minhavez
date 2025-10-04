export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Coluna 1 - Logo e Descrição */}
          <div>
            <div className="font-bold text-xl mb-3">MinhaVez</div>
            <p className="text-zinc-400 text-sm">
              Gestão de filas digital para restaurantes modernos.
            </p>
          </div>

          {/* Coluna 2 - Links */}
          <div>
            <h3 className="font-semibold mb-3">Links</h3>
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
                <a href="#contato" className="text-zinc-400 hover:text-white transition text-sm">
                  Contato
                </a>
              </li>
            </ul>
          </div>

          {/* Coluna 3 - Redes Sociais */}
          <div>
            <h3 className="font-semibold mb-3">Redes Sociais</h3>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-400 hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="text-center text-zinc-500 text-sm mt-8 pt-8 border-t border-zinc-800">
          © 2025 MinhaVez. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  )
}
