'use client'

import Sidebar from './Sidebar'
import Header from './Header'
import { NavigationProgress } from '@/components/ui/navigation-progress'

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
    </div>
  )
}
