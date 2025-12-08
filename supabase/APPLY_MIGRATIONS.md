# Aplicar Migrations no Supabase

## Instruções para Super Admin System

Para implementar o sistema de super admin com cupons, você precisa aplicar as seguintes migrations no **Supabase Dashboard**:

### 1. Migration 013: Profile Pictures

1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto MinhaVez
3. Vá em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo de `migrations/013_add_profile_picture.sql`
6. Clique em **Run**

**O que faz:**
- Adiciona campo `profile_picture_url` na tabela `businesses`
- Cria bucket de storage `profile-pictures`
- Configura políticas RLS para upload seguro

### 2. Migration 014: Super Admin System

1. No **SQL Editor**, clique em **New Query**
2. Cole o conteúdo de `migrations/014_create_super_admin_system.sql`
3. Clique em **Run**

**O que faz:**
- Cria tabela `super_admins`
- Cria sistema de cupons (`coupons`, `coupon_redemptions`)
- Cria audit log (`admin_audit_log`)
- Configura função `is_super_admin()` para verificação de permissão
- Configura função `redeem_coupon()` para aplicar cupons
- Políticas RLS de segurança máxima

### 3. Criar seu primeiro Super Admin

Após aplicar as migrations, você precisa se adicionar como super admin:

```sql
-- Substitua 'seu-email@exemplo.com' pelo seu email real
INSERT INTO super_admins (user_id, email)
SELECT
  id,
  email
FROM auth.users
WHERE email = 'seu-email@exemplo.com';
```

**IMPORTANTE:** Execute esta query uma única vez com seu email real.

### 4. Verificar se funcionou

```sql
-- Verificar super admins
SELECT * FROM super_admins;

-- Verificar função is_super_admin (deve retornar true)
SELECT is_super_admin();
```

## Ordem de Aplicação

Execute na seguinte ordem:
1. ✅ Migration 001-011 (já aplicadas)
2. 🔄 Migration 013 (profile pictures)
3. 🔄 Migration 014 (super admin system)
4. 🔄 Criar primeiro super admin (SQL acima)

## Acesso ao Painel Admin

Após configurar tudo:

1. Faça login com a conta super admin
2. Acesse: `http://localhost:3000/admin`
3. Você verá:
   - Dashboard com estatísticas
   - Gerenciador de cupons
   - Gestão de usuários
   - Audit log

## Criar Cupons

No painel admin (`/admin/cupons`), você pode criar:

### Cupom de Desconto Percentual
- Código: `PROMO20`
- Tipo: Percentual
- Valor: 20%
- Máx usos: 100
- Validade: 31/12/2025

### Cupom de Trial Gratuito
- Código: `FREE30DAYS`
- Tipo: Trial Gratuito
- Dias: 30
- Máx usos: 50
- Sem expiração

### Cupom de Valor Fixo
- Código: `DESC50`
- Tipo: Valor Fixo
- Valor: R$ 50,00
- Máx usos: 20
- Validade: 15/01/2025

## Segurança

O sistema possui múltiplas camadas de segurança:

1. **Middleware**: Verifica autenticação antes de permitir acesso a `/admin/*`
2. **RLS Policies**: Previne manipulação direta no banco
3. **Server Actions**: Validações server-side em `requireSuperAdmin()`
4. **Função DB**: `is_super_admin()` valida no nível do PostgreSQL
5. **Audit Log**: Registra todas as ações administrativas

## Troubleshooting

### Erro: "Acesso negado"
- Verifique se você foi adicionado na tabela `super_admins`
- Execute: `SELECT is_super_admin();` no SQL Editor

### Erro: "Function does not exist"
- A migration 014 não foi aplicada corretamente
- Reaplicar `migrations/014_create_super_admin_system.sql`

### Cupons não aparecem
- Verifique RLS policies
- Execute: `SELECT * FROM coupons;` no SQL Editor como super admin
