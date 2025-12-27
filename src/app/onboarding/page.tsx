import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingSimple from '@/components/onboarding/OnboardingSimple'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return <OnboardingSimple />
}
