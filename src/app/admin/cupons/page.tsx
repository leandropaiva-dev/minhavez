import { redirect } from 'next/navigation'
import { isSuperAdmin } from '@/lib/admin/permissions'
import AdminLayout from '@/components/admin/AdminLayout'
import CouponManager from '@/components/admin/CouponManager'

export default async function AdminCouponsPage() {
  const isAdmin = await isSuperAdmin()

  if (!isAdmin) {
    redirect('/dashboard?error=unauthorized')
  }

  return (
    <AdminLayout>
      <CouponManager />
    </AdminLayout>
  )
}
