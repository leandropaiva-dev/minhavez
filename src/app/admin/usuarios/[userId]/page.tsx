import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin/permissions'
import AdminLayout from '@/components/admin/AdminLayout'
import UserDetailPage from '@/components/admin/UserDetailPage'

interface PageProps {
  params: Promise<{ userId: string }>
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  const isAdmin = await isSuperAdmin()

  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized')
  }

  const { userId } = await params

  return (
    <AdminLayout>
      <UserDetailPage userId={userId} />
    </AdminLayout>
  )
}
