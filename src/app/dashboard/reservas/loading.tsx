import { Loader } from 'react-feather'

export default function ReservationsLoading() {
  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Carregando reservas...</p>
        </div>
      </div>
    </div>
  )
}
