import { Loader } from 'react-feather'

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando...</p>
      </div>
    </div>
  )
}
