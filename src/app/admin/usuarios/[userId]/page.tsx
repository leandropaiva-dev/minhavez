import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin/permissions'
import AdminLayout from '@/components/admin/AdminLayout'
import UserDetailPageNew from '@/components/admin/UserDetailPageNew'

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
      <UserDetailPageNew userId={userId} />
    </AdminLayout>
  )
}
