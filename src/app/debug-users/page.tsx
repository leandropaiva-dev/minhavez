import { createClient } from '@/lib/supabase/server'

export default async function DebugUsersPage() {
  const supabase = await createClient()

  // Check if we can access businesses
  const { data: businesses, error: businessError } = await supabase
    .from('businesses')
    .select('*')

  // Check if we can access audit log
  const { data: auditLogs, error: auditError } = await supabase
    .from('admin_audit_log')
    .select('*')

  // Check auth admin access
  let authError = null
  try {
    const { error } = await supabase.auth.admin.listUsers()
    authError = error
  } catch (e: unknown) {
    authError = e instanceof Error ? e.message : String(e)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Users & Audit</h1>

      <div className="space-y-6">
        {/* Businesses */}
        <div className="bg-zinc-900 p-6 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-4">Businesses Table</h2>
          {businessError ? (
            <div className="text-red-400">
              <strong>Error:</strong> {businessError.message}
            </div>
          ) : (
            <div>
              <p className="mb-2">Found: {businesses?.length || 0} businesses</p>
              <pre className="bg-zinc-800 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(businesses, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Audit Logs */}
        <div className="bg-zinc-900 p-6 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-4">Audit Log Table</h2>
          {auditError ? (
            <div className="text-red-400">
              <strong>Error:</strong> {auditError.message}
            </div>
          ) : (
            <div>
              <p className="mb-2">Found: {auditLogs?.length || 0} logs</p>
              <pre className="bg-zinc-800 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(auditLogs, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Auth Admin */}
        <div className="bg-zinc-900 p-6 rounded-lg text-white">
          <h2 className="text-xl font-bold mb-4">Auth Admin Access</h2>
          {authError ? (
            <div className="text-red-400">
              <strong>Error:</strong> {String(authError)}
              <p className="mt-2 text-sm">
                Isso é esperado se você não tiver a service role key configurada.
              </p>
            </div>
          ) : (
            <div className="text-green-400">
              ✅ Auth admin access working
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
