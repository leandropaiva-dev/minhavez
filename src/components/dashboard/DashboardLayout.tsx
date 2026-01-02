'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import Header from './Header'
import { NavigationProgress } from '@/components/ui/navigation-progress'
import PageTutorial from '@/components/tutorial/PageTutorial'
import { TUTORIAL_STEPS } from '@/components/tutorial/tutorialSteps'
import { createClient } from '@/lib/supabase/client'

interface DashboardLayoutProps {
  userName?: string
  userEmail?: string
  profilePictureUrl?: string | null
  children: React.ReactNode
}

export default function DashboardLayout({
  userName,
  userEmail,
  profilePictureUrl,
  children,
}: DashboardLayoutProps) {
  const [userId, setUserId] = useState<string | null>(null)
  const pathname = usePathname()
  const currentTutorial = TUTORIAL_STEPS[pathname || '/dashboard']

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getUser()
  }, [])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Navigation Progress Bar */}
      <NavigationProgress />

      {/* Header - Full width, fixed at top */}
      <Header userName={userName} userEmail={userEmail} profilePictureUrl={profilePictureUrl} />

      {/* Sidebar - Desktop Only */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="pt-16 lg:pl-16">
        {/* Page Content */}
        <main className="w-full">{children}</main>
      </div>

      {/* Tutorial - Detecta automaticamente pela rota */}
      {userId && currentTutorial && (
        <PageTutorial
          userId={userId}
          pageName={currentTutorial.pageName}
          steps={currentTutorial.steps}
        />
      )}
    </div>
  )
}
