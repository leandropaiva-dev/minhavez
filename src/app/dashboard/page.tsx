import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="text-zinc-400 text-xs sm:text-sm hidden sm:inline">
              {user.user_metadata?.name || user.email}
            </span>
            <form action={signOut}>
              <Button
                type="submit"
                variant="outline"
                className="border-zinc-700 hover:bg-zinc-800 text-white text-xs sm:text-sm px-2 sm:px-4 py-1.5 sm:py-2"
              >
                Sair
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">
            Dashboard
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-6 sm:mb-8">
            Bem-vindo ao seu painel de controle
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Card 1 */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Fila Atual
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-blue-500">0</p>
              <p className="text-zinc-500 text-xs sm:text-sm mt-2">clientes esperando</p>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Atendidos Hoje
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-green-500">0</p>
              <p className="text-zinc-500 text-xs sm:text-sm mt-2">clientes</p>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
                Tempo Médio
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-500">0min</p>
              <p className="text-zinc-500 text-xs sm:text-sm mt-2">de espera</p>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 bg-zinc-950 border border-zinc-800 rounded-xl p-4 sm:p-6">
            <p className="text-sm sm:text-base text-zinc-400 text-center">
              Esta é uma página temporária. O dashboard completo será implementado em breve.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
