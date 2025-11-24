import { redirect } from 'next/navigation'

export default function MinhaPagePage() {
  // Redirect para nova rota
  redirect('/dashboard/links')
}
