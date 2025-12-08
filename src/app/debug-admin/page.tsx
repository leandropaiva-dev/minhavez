import { createClient } from '@/lib/supabase/server'

export default async function DebugAdminPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let isSuperAdmin = false
  let rpcError = null
  let superAdminData = null

  if (user) {
    // Test RPC function
    const { data, error } = await supabase.rpc('is_super_admin')
    isSuperAdmin = data === true
    rpcError = error?.message

    // Check super_admins table directly
    const { data: adminData } = await supabase
      .from('super_admins')
      .select('*')
      .eq('user_id', user.id)
      .single()

    superAdminData = adminData
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Super Admin</h1>

      <div className="space-y-4 bg-zinc-900 p-6 rounded-lg text-white font-mono text-sm">
        <div>
          <strong>Usuário autenticado:</strong>
          <pre className="mt-2 bg-zinc-800 p-3 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <strong>RPC is_super_admin():</strong>
          <pre className="mt-2 bg-zinc-800 p-3 rounded">
            {isSuperAdmin ? 'TRUE ✅' : 'FALSE ❌'}
          </pre>
        </div>

        {rpcError && (
          <div>
            <strong className="text-red-400">RPC Error:</strong>
            <pre className="mt-2 bg-red-900/20 p-3 rounded">
              {rpcError}
            </pre>
          </div>
        )}

        <div>
          <strong>Dados na tabela super_admins:</strong>
          <pre className="mt-2 bg-zinc-800 p-3 rounded overflow-auto">
            {superAdminData ? JSON.stringify(superAdminData, null, 2) : 'Nenhum registro encontrado ❌'}
          </pre>
        </div>
      </div>
    </div>
  )
}
