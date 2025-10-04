import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface AuthSidebarProps {
  mode: 'login' | 'signup'
  onToggle: () => void
}

export default function AuthSidebar({ mode, onToggle }: AuthSidebarProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-12 relative">
      {/* CTA no topo */}
      <div className="absolute top-8 left-0 right-0 text-center">
        <p className="text-zinc-400 text-sm mb-3">
          {mode === 'login' ? 'Já tem conta?' : 'Não tem conta?'}
        </p>
        <Button
          onClick={onToggle}
          variant="outline"
          className="border-zinc-700 hover:bg-zinc-800 text-white"
        >
          {mode === 'login' ? 'Entrar agora!' : 'Comece agora!'}
        </Button>
      </div>

      {/* Imagem */}
      <div className="mb-8 relative w-full max-w-md h-64 rounded-xl overflow-hidden">
        <Image
          src="/signup.jpg"
          alt="MinhaVez App"
          fill
          className="object-cover"
        />
      </div>

      {/* Copy */}
      <div className="text-center max-w-md">
        <h3 className="text-2xl font-bold text-white mb-4">
          {mode === 'login'
            ? 'Elimine filas físicas no seu negócio'
            : 'Junte-se a centenas de negócios'}
        </h3>
        <p className="text-zinc-400">
          {mode === 'login'
            ? 'Gestão de fila digital em tempo real. Clientes felizes, mais eficiência.'
            : 'Comece grátis hoje e transforme a experiência dos seus clientes.'}
        </p>
      </div>

      {/* Stats (opcional) */}
      <div className="grid grid-cols-3 gap-4 mt-12 w-full max-w-md">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">500+</div>
          <div className="text-xs text-zinc-500">Negócios</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">50k+</div>
          <div className="text-xs text-zinc-500">Clientes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">4.9</div>
          <div className="text-xs text-zinc-500">Avaliação</div>
        </div>
      </div>
    </div>
  )
}
