import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin/permissions'
import AdminLayout from '@/components/admin/AdminLayout'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const isAdmin = await isSuperAdmin()

  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
  )
}
