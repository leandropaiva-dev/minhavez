'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Lock, Save, Check, Eye, EyeOff, Home, MapPin, Phone, Tag } from 'react-feather'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { getSegmentConfig, saveSegmentConfig } from '@/lib/config/storage'
import type { SegmentConfig, BusinessSegment } from '@/types/config.types'

interface ProfileManagerProps {
  userId: string
  userName: string
  userEmail: string
  business?: {
    id: string
    name: string
    phone: string | null
    address: string | null
    business_type: string | null
  } | null
}

const SEGMENT_OPTIONS: { value: BusinessSegment; label: string }[] = [
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'barbearia', label: 'Barbearia' },
  { value: 'salao_beleza', label: 'Salão de Beleza' },
  { value: 'consultorio', label: 'Consultório' },
  { value: 'outro', label: 'Outro' },
]

export default function ProfileManager({ userName, userEmail, business }: ProfileManagerProps) {
  const [name, setName] = useState(userName)
  const [savingName, setSavingName] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [businessName, setBusinessName] = useState(business?.name || '')
  const [businessPhone, setBusinessPhone] = useState(business?.phone || '')
  const [businessAddress, setBusinessAddress] = useState(business?.address || '')
  const [savingBusiness, setSavingBusiness] = useState(false)
  const [businessSaved, setBusinessSaved] = useState(false)

  const [segmentType, setSegmentType] = useState<BusinessSegment>('outro')
  const [savingSegment, setSavingSegment] = useState(false)
  const [segmentSaved, setSegmentSaved] = useState(false)

  useEffect(() => {
    const savedSegment = getSegmentConfig()
    if (savedSegment) {
      setSegmentType(savedSegment.segmentType)
    } else if (business?.business_type) {
      setSegmentType(business.business_type as BusinessSegment)
    }
  }, [business?.business_type])

  const getInitials = (name: string) => {
    if (!name) return 'U'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const handleSaveName = async () => {
    setSavingName(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { name } })
    if (!error) {
      setNameSaved(true)
      setTimeout(() => setNameSaved(false), 2000)
    }
    setSavingName(false)
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)
    if (newPassword.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas não coincidem')
      return
    }
    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordError('Erro ao alterar senha. Tente novamente.')
    } else {
      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordSuccess(false), 3000)
    }
    setSavingPassword(false)
  }

  const handleSaveBusiness = async () => {
    if (!business?.id) return
    setSavingBusiness(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('businesses')
      .update({ name: businessName, phone: businessPhone || null, address: businessAddress || null })
      .eq('id', business.id)
    if (!error) {
      setBusinessSaved(true)
      setTimeout(() => setBusinessSaved(false), 2000)
    }
    setSavingBusiness(false)
  }

  const handleSaveSegment = async () => {
    setSavingSegment(true)
    const config: SegmentConfig = { businessId: business?.id, segmentType, config: {} }
    saveSegmentConfig(config)
    if (business?.id) {
      const supabase = createClient()
      await supabase.from('businesses').update({ business_type: segmentType }).eq('id', business.id)
    }
    setSegmentSaved(true)
    setTimeout(() => setSegmentSaved(false), 2000)
    setSavingSegment(false)
  }

  return (
    <div className="space-y-6">
      {/* Avatar Card */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-2xl">{getInitials(name)}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{name || 'Usuário'}</h2>
            <p className="text-zinc-500 dark:text-zinc-400">{userEmail}</p>
            {business?.name && <p className="text-sm text-blue-500 mt-1">{business.name}</p>}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="personal" className="gap-2">
            <User className="w-4 h-4 hidden sm:block" />
            Pessoal
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2" disabled={!business}>
            <Home className="w-4 h-4 hidden sm:block" />
            Estabelecimento
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="w-4 h-4 hidden sm:block" />
            Segurança
          </TabsTrigger>
        </TabsList>

        {/* Personal Tab */}
        <TabsContent value="personal">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </h3>
            <div>
              <Label htmlFor="name" className="text-zinc-700 dark:text-zinc-300">Nome</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email</Label>
              <div className="relative mt-2">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input id="email" value={userEmail} disabled className="pl-10 bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed" />
              </div>
              <p className="text-xs text-zinc-500 mt-1">O email não pode ser alterado</p>
            </div>
            <Button onClick={handleSaveName} disabled={savingName} className="gap-2">
              {nameSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {nameSaved ? 'Salvo!' : savingName ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business">
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Home className="w-5 h-5" />
                Dados do Estabelecimento
              </h3>
              <div>
                <Label htmlFor="businessName" className="text-zinc-700 dark:text-zinc-300">Nome do Estabelecimento</Label>
                <Input id="businessName" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Nome do seu negócio" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="businessPhone" className="text-zinc-700 dark:text-zinc-300">Telefone</Label>
                <div className="relative mt-2">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input id="businessPhone" type="tel" value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="(11) 98765-4321" className="pl-10" />
                </div>
              </div>
              <div>
                <Label htmlFor="businessAddress" className="text-zinc-700 dark:text-zinc-300">Endereço</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input id="businessAddress" value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} placeholder="Rua, Número, Bairro, Cidade" className="pl-10" />
                </div>
              </div>
              <Button onClick={handleSaveBusiness} disabled={savingBusiness} className="gap-2">
                {businessSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {businessSaved ? 'Salvo!' : savingBusiness ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Segmento do Negócio
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Selecione o tipo do seu estabelecimento para personalizar a experiência.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SEGMENT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSegmentType(option.value)}
                    className={`p-4 rounded-lg border text-sm font-medium transition-all ${
                      segmentType === option.value
                        ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <Button onClick={handleSaveSegment} disabled={savingSegment} className="gap-2">
                {segmentSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {segmentSaved ? 'Salvo!' : savingSegment ? 'Salvando...' : 'Salvar Segmento'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Alterar Senha
            </h3>
            <div>
              <Label htmlFor="currentPassword" className="text-zinc-700 dark:text-zinc-300">Senha Atual</Label>
              <div className="relative mt-2">
                <Input id="currentPassword" type={showPasswords ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Digite sua senha atual" />
                <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-zinc-700 dark:text-zinc-300">Nova Senha</Label>
              <Input id="newPassword" type={showPasswords ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Digite a nova senha" className="mt-2" />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-zinc-700 dark:text-zinc-300">Confirmar Nova Senha</Label>
              <Input id="confirmPassword" type={showPasswords ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme a nova senha" className="mt-2" />
            </div>
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            {passwordSuccess && <p className="text-sm text-green-500">Senha alterada com sucesso!</p>}
            <Button onClick={handleChangePassword} disabled={savingPassword || !newPassword || !confirmPassword} variant="outline" className="gap-2">
              {savingPassword ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
