'use client'

import Sidebar from './Sidebar'
import Header from './Header'

interface DashboardLayoutProps {
  userName?: string
  userEmail?: string
  children: React.ReactNode
}

export default function DashboardLayout({
  userName,
  userEmail,
  children,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      {/* Header - Full width, fixed at top */}
      <Header userName={userName} userEmail={userEmail} />

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
