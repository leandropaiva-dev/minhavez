import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin/permissions'
import AdminLayout from '@/components/admin/AdminLayout'
import UsersManager from '@/components/admin/UsersManager'

export default async function AdminUsersPage() {
  const isAdmin = await isSuperAdmin()

  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <AdminLayout>
      <UsersManager />
    </AdminLayout>
  )
}
