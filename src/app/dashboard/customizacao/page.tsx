import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import CustomizationManager from '@/components/dashboard/CustomizationManager'

export default async function CustomizationPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Busca business do usuário
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!business) {
    redirect('/onboarding')
  }

  // Busca dados do usuário para o layout
  const { data: userData } = await supabase
    .from('users')
    .select('name, email, profile_picture_url')
    .eq('id', user.id)
    .single()

  return (
    <DashboardLayout
      userName={userData?.name}
      userEmail={userData?.email}
      profilePictureUrl={userData?.profile_picture_url}
    >
      <div className="p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">
            Customização
          </h1>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
            Personalize a aparência das suas páginas públicas
          </p>
        </div>

        <CustomizationManager businessId={business.id} initialData={business} />
      </div>
    </DashboardLayout>
  )
}
