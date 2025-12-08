import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin/permissions'
import AdminLayout from '@/components/admin/AdminLayout'
import AuditLogViewer from '@/components/admin/AuditLogViewer'

export default async function AdminAuditPage() {
  const isAdmin = await isSuperAdmin()

  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <AdminLayout>
      <AuditLogViewer />
    </AdminLayout>
  )
}
