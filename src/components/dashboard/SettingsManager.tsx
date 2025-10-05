'use client'

import { useState } from 'react'
import { Save, Building2, Bell, CreditCard, Shield, LogOut, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/lib/auth/actions'
import { saveBusinessInfo } from '@/lib/onboarding/actions'

interface SettingsManagerProps {
  business: any
  user: any
}

export default function SettingsManager({ business, user }: SettingsManagerProps) {
  const [activeTab, setActiveTab] = useState<'business' | 'notifications' | 'billing' | 'security'>('business')
  const [businessData, setBusinessData] = useState({
    name: business?.name || '',
    type: business?.business_type || '',
    phone: business?.phone || '',
    address: business?.address || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSaveBusiness = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    const result = await saveBusinessInfo({
      name: businessData.name,
      businessType: businessData.type as any,
      phone: businessData.phone,
      address: businessData.address,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  const tabs = [
    { id: 'business', label: 'Negócio', icon: Building2 },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'billing', label: 'Pagamento', icon: CreditCard },
    { id: 'security', label: 'Segurança', icon: Shield },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Tabs Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}

          <div className="border-t border-zinc-800 mt-2 pt-2">
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="lg:col-span-3">
        {/* Business Settings */}
        {activeTab === 'business' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              Informações do Negócio
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome do Estabelecimento
                </label>
                <input
                  type="text"
                  value={businessData.name}
                  onChange={(e) =>
                    setBusinessData({ ...businessData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Tipo de Negócio
                </label>
                <select
                  value={businessData.type}
                  onChange={(e) =>
                    setBusinessData({ ...businessData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Selecione...</option>
                  <option value="restaurante">Restaurante</option>
                  <option value="bar">Bar</option>
                  <option value="clinica">Clínica</option>
                  <option value="barbearia">Barbearia</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={businessData.phone}
                  onChange={(e) =>
                    setBusinessData({ ...businessData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={businessData.address}
                  onChange={(e) =>
                    setBusinessData({ ...businessData, address: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Alterações salvas com sucesso!
                </div>
              )}

              <Button
                onClick={handleSaveBusiness}
                disabled={loading || !businessData.name || !businessData.type || !businessData.phone}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        )}

        {/* Notifications Settings */}
        {activeTab === 'notifications' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Notificações</h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Notificações por Email</p>
                  <p className="text-sm text-zinc-400">
                    Receba atualizações por email
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Notificações por SMS</p>
                  <p className="text-sm text-zinc-400">
                    Receba alertas via SMS
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-700">
                  <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Cliente Chamado</p>
                  <p className="text-sm text-zinc-400">
                    Notificar quando cliente é chamado
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                  <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                </button>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Salvar Preferências
              </Button>
            </div>
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === 'billing' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Pagamento</h2>

            <div className="space-y-6">
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4">
                <p className="text-blue-400 font-medium mb-2">Plano Atual: Trial</p>
                <p className="text-sm text-blue-300">
                  {business?.trial_ends_at
                    ? `Seu trial termina em ${new Date(business.trial_ends_at).toLocaleDateString('pt-PT')}`
                    : '14 dias restantes'}
                </p>
              </div>

              <div className="border border-zinc-800 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">
                  Método de Pagamento
                </h3>
                <div className="flex items-center gap-4 p-4 bg-zinc-950 rounded-lg">
                  <CreditCard className="w-8 h-8 text-zinc-400" />
                  <div>
                    <p className="text-white font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-zinc-400">Expira 12/25</p>
                  </div>
                  <Button
                    variant="outline"
                    className="ml-auto border-zinc-700"
                  >
                    Alterar
                  </Button>
                </div>
              </div>

              <div className="border border-zinc-800 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-4">
                  Histórico de Faturas
                </h3>
                <p className="text-zinc-400 text-sm">
                  Nenhuma fatura ainda. Você está no período trial.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === 'security' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">Segurança</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-white mb-4">Conta</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Email</p>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-1">Nome</p>
                    <p className="text-white">{user.user_metadata?.name || 'Não definido'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <h3 className="font-semibold text-white mb-4">Alterar Senha</h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Senha atual"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="password"
                    placeholder="Nova senha"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <input
                    type="password"
                    placeholder="Confirmar nova senha"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Alterar Senha
                  </Button>
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-6">
                <h3 className="font-semibold text-red-500 mb-2">Zona de Perigo</h3>
                <p className="text-sm text-zinc-400 mb-4">
                  Excluir sua conta permanentemente
                </p>
                <Button variant="outline" className="border-red-500/20 text-red-500 hover:bg-red-500/10">
                  Excluir Conta
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
