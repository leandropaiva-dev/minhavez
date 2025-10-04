import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingSteps from '@/components/onboarding/OnboardingSteps'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-2 sm:p-4 py-8 sm:py-12">
      <OnboardingSteps user={user} />
    </div>
  )
}
