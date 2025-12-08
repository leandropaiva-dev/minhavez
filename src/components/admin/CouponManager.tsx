'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Calendar, Users, TrendingUp } from 'react-feather'
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deactivateCoupon,
  getCouponRedemptions,
  type CreateCouponData,
  type CouponType
} from '@/lib/admin/coupons'

interface Coupon {
  id: string
  code: string
  discount_type: CouponType
  discount_value: number | null
  trial_days: number | null
  max_redemptions: number | null
  current_redemptions: number
  valid_from: string | null
  valid_until: string | null
  description: string | null
  is_active: boolean
  created_at: string
  creator: { email: string } | null
}

interface Redemption {
  id: string
  coupon_id: string
  business_id: string
  user_id: string
  redeemed_at: string
  coupon: { code: string; description: string | null }
  business: { name: string }
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [selectedCouponRedemptions, setSelectedCouponRedemptions] = useState<{
    couponId: string
    redemptions: Redemption[]
  } | null>(null)

  useEffect(() => {
    loadCoupons()
  }, [])

  async function loadCoupons() {
    setLoading(true)
    const result = await getAllCoupons()
    if (result.success && result.data) {
      setCoupons(result.data as Coupon[])
    }
    setLoading(false)
  }

  async function handleCreateCoupon(data: CreateCouponData) {
    const result = await createCoupon(data)
    if (result.success) {
      await loadCoupons()
      setShowCreateModal(false)
    } else {
      alert(result.error)
    }
  }

  async function handleUpdateCoupon(couponId: string, updates: Partial<CreateCouponData>) {
    const result = await updateCoupon(couponId, updates)
    if (result.success) {
      await loadCoupons()
      setEditingCoupon(null)
    } else {
      alert(result.error)
    }
  }

  async function handleDeactivateCoupon(couponId: string) {
    if (!confirm('Tem certeza que deseja desativar este cupom?')) return

    const result = await deactivateCoupon(couponId)
    if (result.success) {
      await loadCoupons()
    } else {
      alert(result.error)
    }
  }

  async function viewRedemptions(couponId: string) {
    const result = await getCouponRedemptions(couponId)
    if (result.success && result.data) {
      setSelectedCouponRedemptions({
        couponId,
        redemptions: result.data as Redemption[],
      })
    }
  }

  const formatCouponValue = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}% off`
    } else if (coupon.discount_type === 'fixed_amount') {
      return `R$ ${coupon.discount_value?.toFixed(2)} off`
    } else if (coupon.discount_type === 'free_trial') {
      return `${coupon.trial_days} dias grátis`
    }
    return ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">
              Cupons de Desconto
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Gerencie cupons promocionais e trials gratuitos
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Novo Cupom
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total de Cupons</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{coupons.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Cupons Ativos</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {coupons.filter(c => c.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-pink-600/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total de Usos</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">
                {coupons.reduce((sum, c) => sum + c.current_redemptions, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Tipo / Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Usos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Validade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-mono font-semibold text-zinc-900 dark:text-white">
                        {coupon.code}
                      </div>
                      {coupon.description && (
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                          {coupon.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-900 dark:text-white font-medium">
                      {formatCouponValue(coupon)}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                      {coupon.discount_type.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewRedemptions(coupon.id)}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {coupon.current_redemptions}
                      {coupon.max_redemptions && ` / ${coupon.max_redemptions}`}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                      {coupon.valid_until
                        ? new Date(coupon.valid_until).toLocaleDateString('pt-BR')
                        : 'Sem expiração'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        coupon.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {coupon.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingCoupon(coupon)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeactivateCoupon(coupon.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-12">
            <p className="text-zinc-500 dark:text-zinc-400">
              Nenhum cupom criado ainda
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCoupon) && (
        <CouponFormModal
          coupon={editingCoupon}
          onClose={() => {
            setShowCreateModal(false)
            setEditingCoupon(null)
          }}
          onSave={(data) => {
            if (editingCoupon) {
              handleUpdateCoupon(editingCoupon.id, data)
            } else {
              handleCreateCoupon(data)
            }
          }}
        />
      )}

      {/* Redemptions Modal */}
      {selectedCouponRedemptions && (
        <RedemptionsModal
          redemptions={selectedCouponRedemptions.redemptions}
          onClose={() => setSelectedCouponRedemptions(null)}
        />
      )}
    </div>
  )
}

function CouponFormModal({
  coupon,
  onClose,
  onSave,
}: {
  coupon?: Coupon | null
  onClose: () => void
  onSave: (data: CreateCouponData) => void
}) {
  const [formData, setFormData] = useState<CreateCouponData>({
    code: coupon?.code || '',
    discountType: coupon?.discount_type || 'percentage',
    discountValue: coupon?.discount_value || undefined,
    trialDays: coupon?.trial_days || undefined,
    maxRedemptions: coupon?.max_redemptions || undefined,
    validUntil: coupon?.valid_until || undefined,
    description: coupon?.description || undefined,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            {coupon ? 'Editar Cupom' : 'Novo Cupom'}
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Código do Cupom
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono"
              placeholder="PROMO2024"
              required
              disabled={!!coupon}
            />
          </div>

          {/* Discount Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Tipo de Desconto
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value as CouponType })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              disabled={!!coupon}
            >
              <option value="percentage">Percentual</option>
              <option value="fixed_amount">Valor Fixo</option>
              <option value="free_trial">Trial Gratuito</option>
            </select>
          </div>

          {/* Discount Value */}
          {formData.discountType === 'percentage' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Desconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountValue || ''}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              />
            </div>
          )}

          {formData.discountType === 'fixed_amount' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Valor (R$)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.discountValue || ''}
                onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              />
            </div>
          )}

          {formData.discountType === 'free_trial' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Dias de Trial
              </label>
              <input
                type="number"
                min="1"
                value={formData.trialDays || ''}
                onChange={(e) => setFormData({ ...formData, trialDays: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                required
              />
            </div>
          )}

          {/* Max Redemptions */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Máximo de Usos (opcional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxRedemptions || ''}
              onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>

          {/* Valid Until */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Válido Até (opcional)
            </label>
            <input
              type="date"
              value={formData.validUntil || ''}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value || undefined })}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all font-medium"
            >
              {coupon ? 'Salvar' : 'Criar Cupom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RedemptionsModal({
  redemptions,
  onClose,
}: {
  redemptions: Redemption[]
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
            Histórico de Usos
          </h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {redemptions.length === 0 ? (
            <p className="text-center text-zinc-500 dark:text-zinc-400 py-8">
              Nenhum uso registrado
            </p>
          ) : (
            <div className="space-y-3">
              {redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-zinc-900 dark:text-white">
                        {redemption.business.name}
                      </p>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        ID: {redemption.user_id.substring(0, 8)}...
                      </p>
                    </div>
                    <p className="text-xs text-zinc-400">
                      {new Date(redemption.redeemed_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
