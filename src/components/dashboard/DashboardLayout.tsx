'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface DashboardLayoutProps {
  businessName?: string
  userName?: string
  userEmail?: string
  children: React.ReactNode
}

export default function DashboardLayout({
  businessName,
  userName,
  userEmail,
  children
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black">
      <Sidebar
        businessName={businessName}
        open={menuOpen}
        onOpenChange={setMenuOpen}
      />

      <div className="lg:pl-64">
        <Header
          userName={userName}
          userEmail={userEmail}
          onMenuClick={() => setMenuOpen(true)}
        />

        {children}
      </div>
    </div>
  )
}
