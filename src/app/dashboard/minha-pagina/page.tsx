import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import LinkPageEditor from '@/components/linkpage/LinkPageEditor'
import { getBusiness } from '@/lib/onboarding/actions'

export default async function MinhaPagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: business } = await getBusiness()

  if (!business) {
    redirect('/onboarding')
  }

  // Busca a link page existente
  const { data: linkPage } = await supabase
    .from('link_pages')
    .select('*')
    .eq('business_id', business.id)
    .single()

  // Busca os links se existir link page
  let links: unknown[] = []
  if (linkPage) {
    const { data } = await supabase
      .from('link_page_links')
      .select('*')
      .eq('link_page_id', linkPage.id)
      .order('position', { ascending: true })

    links = data || []
  }

  return (
    <DashboardLayout
      userName={user.user_metadata?.name}
      userEmail={user.email}
    >
      <main className="p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            Minha Página
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Crie seu link na bio com fila e reserva integrados
          </p>
        </div>

        <LinkPageEditor
          businessId={business.id}
          businessName={business.name}
          initialLinkPage={linkPage}
          initialLinks={links}
        />
      </main>
    </DashboardLayout>
  )
}
