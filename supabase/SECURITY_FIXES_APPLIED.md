# 🔒 Correções de Segurança Aplicadas

**Data:** 2025-12-08
**Status:** ✅ CRÍTICO - Aplicação imediata necessária

---

## ⚠️ AÇÃO IMEDIATA REQUERIDA

### 1. Aplicar Migrations SQL

Execute as migrations na ordem abaixo **IMEDIATAMENTE** no Supabase:

```bash
# Via Supabase CLI (recomendado):
cd supabase
supabase db push

# OU via Dashboard Supabase:
# 1. Acesse https://app.supabase.com/project/YOUR_PROJECT/sql
# 2. Execute cada arquivo .sql na ordem:
```

#### Ordem de execução:

1. ✅ **018_fix_queue_rls_critical.sql** - CRÍTICO
   - Corrige RLS que permite qualquer um ler TODAS filas
   - **Impacto:** Vazamento cross-tenant, LGPD violation

2. ✅ **019_fix_get_user_email_security.sql** - CRÍTICO
   - Protege função que permite enumerar emails de usuários
   - **Impacto:** Privacy violation, user enumeration

3. ✅ **020_fix_conversion_funnels_policy.sql** - CRÍTICO
   - Corrige policy que permite DELETE/UPDATE por qualquer um
   - **Impacto:** Manipulação de métricas

4. ✅ **021_fix_redeem_coupon_ownership.sql** - CRÍTICO
   - Adiciona validação de ownership em resgate de cupom
   - **Impacto:** User pode resgatar cupom de outro business

5. ✅ **022_fix_reservation_schedule_policies.sql** - ALTO
   - Corrige policies quebradas (referenciavam coluna inexistente)
   - **Impacto:** RLS não funciona

6. ✅ **023_add_storage_validation.sql** - MÉDIO
   - Adiciona limite de tamanho e MIME types permitidos

---

### 2. Configurar Variáveis de Ambiente

Adicione ao seu `.env.local` e ao **Vercel/Production**:

```bash
# Upstash Redis (para rate limiting)
# 1. Criar conta grátis: https://upstash.com/
# 2. Criar Redis database
# 3. Copiar credenciais:
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**⚠️ IMPORTANTE:** Se não configurar Upstash, rate limiting será desabilitado (dev mode OK, PRODUÇÃO NÃO).

---

### 3. Verificar Supabase Dashboard

Execute estas verificações:

#### A) Email Verification

1. Acesse: `Authentication > Settings`
2. Habilite: **✅ Enable email confirmation**
3. Configure template de email

#### B) Password Policy

1. Acesse: `Authentication > Settings`
2. Configure:
   - Minimum password length: **8**
   - Require uppercase: **✅**
   - Require lowercase: **✅**
   - Require numbers: **✅**

#### C) Storage Bucket

1. Acesse: `Storage > profile-pictures`
2. Verifique:
   - File size limit: **5MB**
   - Allowed MIME types: `image/jpeg, image/png, image/webp`

---

## 📋 Resumo das Correções

### 🔴 CRÍTICAS (APLICADAS)

| # | Vulnerabilidade | Correção | Arquivo |
|---|-----------------|----------|---------|
| 1 | CVE Next.js 15.5.4 (RCE) | ✅ Upgrade para 15.5.7 | `package.json` |
| 2 | RLS permissivo queue_entries | ✅ Policy corrigida | `018_fix_queue_rls_critical.sql` |
| 3 | get_user_email() sem validação | ✅ Validação adicionada | `019_fix_get_user_email_security.sql` |
| 4 | conversion_funnels policy ALL | ✅ Policy corrigida | `020_fix_conversion_funnels_policy.sql` |
| 5 | redeem_coupon() sem ownership | ✅ Validação adicionada | `021_fix_redeem_coupon_ownership.sql` |

### 🟠 ALTAS (APLICADAS)

| # | Vulnerabilidade | Correção | Arquivo |
|---|-----------------|----------|---------|
| 6 | reservation_schedule policies quebradas | ✅ Policies corrigidas | `022_fix_reservation_schedule_policies.sql` |
| 7 | /dashboard/* sem proteção middleware | ✅ Middleware atualizado | `src/middleware.ts` |
| 8 | Ausência rate limiting | ✅ Upstash implementado | `src/lib/ratelimit/*` |
| 9 | Storage sem validação MIME | ✅ Validação client+server | `src/lib/storage/validation.ts` |

### 🟡 MÉDIAS (APLICADAS)

| # | Vulnerabilidade | Correção | Arquivo |
|---|-----------------|----------|---------|
| 10 | Headers de segurança faltantes | ✅ CSP, HSTS, X-Frame-Options | `next.config.ts` |
| 11 | Logout não global | ✅ scope: 'global' adicionado | `src/lib/auth/actions.ts` |
| 12 | Storage validation server-side | ✅ Migration criada | `023_add_storage_validation.sql` |

---

## 🧪 Como Testar

### Teste 1: RLS Queue Entries

```javascript
// Antes: Qualquer um podia ler todas filas
// Depois: Só business owner ou super admin

// Login como usuário normal
const { data } = await supabase
  .from('queue_entries')
  .select('*')
  .eq('business_id', 'outro-business-uuid')

// ✅ Deve retornar: [] (vazio) ou erro 403
```

### Teste 2: get_user_email()

```javascript
// Antes: Qualquer autenticado podia ler qualquer email
// Depois: Só super admin ou próprio user

const { data, error } = await supabase.rpc('get_user_email', {
  p_user_id: 'outro-user-uuid'
})

// ✅ Deve retornar error: "Acesso negado"
```

### Teste 3: Rate Limiting

```bash
# Fazer 11 requests rápidas ao endpoint /api/queue/join
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/queue/join \
    -H "Content-Type: application/json" \
    -d '{"businessId":"uuid","customerName":"Test"}'
done

# ✅ Request 11 deve retornar 429 Too Many Requests
```

### Teste 4: Logout Global

```javascript
// Abrir app em 2 navegadores diferentes
// Fazer logout em 1
// ✅ Deve deslogar em AMBOS
await supabase.auth.signOut({ scope: 'global' })
```

---

## 📦 Arquivos Criados/Modificados

### Migrations SQL (6 arquivos)
```
supabase/migrations/
├── 018_fix_queue_rls_critical.sql
├── 019_fix_get_user_email_security.sql
├── 020_fix_conversion_funnels_policy.sql
├── 021_fix_redeem_coupon_ownership.sql
├── 022_fix_reservation_schedule_policies.sql
└── 023_add_storage_validation.sql
```

### Código TypeScript (7 arquivos)
```
src/
├── middleware.ts (modificado)
├── next.config.ts (modificado)
├── lib/
│   ├── auth/actions.ts (modificado)
│   ├── storage/validation.ts (novo)
│   └── ratelimit/
│       ├── config.ts (novo)
│       └── middleware.ts (novo)
└── app/api/queue/join/route.ts (modificado)
```

### Dependencies (package.json)
```json
{
  "next": "15.5.7",  // ✅ Atualizado de 15.5.4
  "@upstash/ratelimit": "^2.0.0",  // ✅ Novo
  "@upstash/redis": "^1.34.0"  // ✅ Novo
}
```

---

## ⏭️ Próximos Passos Recomendados

### Curto Prazo (1-2 semanas)

1. **Monitoramento**
   - [ ] Integrar Sentry para error tracking
   - [ ] Configurar alertas de rate limit excedido
   - [ ] Monitorar logs de audit_log

2. **CSRF Explícito**
   - [ ] Validar origin em todas API routes

3. **Audit Log Completo**
   - [ ] Capturar IP/User-Agent em logAdminAction()
   - [ ] Adicionar logs para ações de usuários comuns

### Médio Prazo (1 mês)

4. **Compliance LGPD/GDPR**
   - [ ] Endpoint `/api/user/export-data`
   - [ ] Endpoint `/api/user/delete-account`
   - [ ] Cookie consent banner
   - [ ] Privacy Policy atualizada

5. **2FA/MFA**
   - [ ] Implementar TOTP para super admins

6. **Pentest**
   - [ ] Contratar auditoria externa

---

## 🚨 Alertas de Produção

Configure alertas para:

- ✅ Taxa de 429 (rate limit) > 5% requests
- ✅ Falhas de auth consecutivas > 5 por IP
- ✅ Mudanças em `super_admins` table
- ✅ Erros em funções SECURITY DEFINER
- ✅ Tentativas de acesso negado (RLS)

---

## 📞 Suporte

Se encontrar problemas ao aplicar as correções:

1. Verifique logs: `supabase logs --project-ref YOUR_REF`
2. Valide migrations: `supabase db diff --schema public`
3. Rollback se necessário: `supabase db reset`

**IMPORTANTE:** Faça backup do banco antes de aplicar migrations em produção!

---

## ✅ Checklist de Deployment

- [ ] Migrations aplicadas no Supabase
- [ ] `.env.local` e Vercel configurados com Upstash
- [ ] Email verification habilitado no Supabase
- [ ] Password policy configurada
- [ ] Storage bucket validado
- [ ] `npm install` executado
- [ ] Build testado localmente (`npm run build`)
- [ ] Testes manuais realizados
- [ ] Deploy em staging (se disponível)
- [ ] Deploy em produção
- [ ] Monitoramento ativado

---

**Data de aplicação:** _______________
**Aplicado por:** _______________
**Verificado por:** _______________
