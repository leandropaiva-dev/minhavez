# Setup do Onboarding - MinhaVez

## ✅ O que foi implementado

### 1. **Banco de Dados (Supabase)**
- ✅ Schema SQL criado: `supabase/migrations/001_create_businesses_table.sql`
- ✅ Tabela `businesses` com todos os campos necessários
- ✅ Row Level Security (RLS) configurado
- ✅ Políticas de segurança para garantir que usuários só vejam seus próprios dados

### 2. **Server Actions**
- ✅ `src/lib/onboarding/actions.ts` criado com:
  - `saveBusinessInfo()` - Salva/atualiza informações do negócio
  - `completeOnboarding()` - Finaliza onboarding e redireciona
  - `getBusiness()` - Busca dados do negócio do usuário

### 3. **Componente de Onboarding**
- ✅ `src/components/onboarding/OnboardingSteps.tsx` atualizado com:
  - Estados para todos os campos (nome, tipo, telefone, endereço)
  - Integração com server actions
  - Validação de campos obrigatórios
  - Tratamento de erros
  - Loading states
  - Feedback visual de erros

### 4. **Type Safety**
- ✅ `src/types/database.types.ts` criado com tipos TypeScript completos

## 📋 Próximos Passos

### 1. Executar a Migration no Supabase

**IMPORTANTE**: Você precisa executar o SQL no Supabase antes de testar!

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto MinhaVez
3. Vá em **SQL Editor** → **New Query**
4. Cole todo o conteúdo de `supabase/migrations/001_create_businesses_table.sql`
5. Clique em **Run** (Ctrl+Enter)

### 2. Testar o Fluxo

```bash
npm run dev
```

1. Acesse http://localhost:3000
2. Crie uma nova conta ou faça login
3. Complete o onboarding:
   - **Passo 1**: Tela de boas-vindas
   - **Passo 2**: Preencha dados do negócio (nome, tipo, telefone, endereço)
   - **Passo 3**: Pule o pagamento por enquanto e clique em "Começar Teste Grátis"

4. Verifique no Supabase Dashboard:
   - Vá em **Table Editor** → **businesses**
   - Você deve ver seu negócio salvo!

### 3. Verificar os Dados Salvos

No Supabase SQL Editor, execute:

```sql
SELECT
  b.*,
  u.email
FROM businesses b
LEFT JOIN auth.users u ON b.user_id = u.id;
```

## 🔧 Campos do Formulário

### Obrigatórios
- ✅ Nome do Estabelecimento
- ✅ Tipo de Negócio (restaurante, bar, clínica, barbearia, outro)
- ✅ Telefone

### Opcional
- ✅ Endereço

## 🎯 Funcionalidades Implementadas

- ✅ Salvar dados automaticamente ao clicar em "Continuar"
- ✅ Validação de campos obrigatórios
- ✅ Mensagens de erro em caso de falha
- ✅ Loading states durante salvamento
- ✅ Botões desabilitados durante loading
- ✅ Atualização de dados se usuário já tiver um negócio
- ✅ Trial de 14 dias configurado automaticamente
- ✅ RLS garantindo segurança dos dados

## 🚀 Próximas Melhorias Sugeridas

1. **Integração Stripe Real** (Step 3)
   - Substituir campos fake por Stripe Elements
   - Criar checkout session
   - Salvar customer_id e subscription_id

2. **Validação de Telefone**
   - Formatar número automaticamente
   - Validar formato português (+351)

3. **Validação de Dados**
   - Validar se negócio já existe
   - Melhorar mensagens de erro

4. **Dashboard**
   - Mostrar dados do negócio no dashboard
   - Permitir edição das informações

## ❓ Troubleshooting

### Erro: "relation businesses does not exist"
→ Você esqueceu de executar a migration no Supabase. Veja passo 1 acima.

### Erro: "new row violates row-level security policy"
→ Verifique se o RLS foi configurado corretamente na migration.

### Dados não aparecem no Supabase
→ Verifique o console do navegador (F12) para ver erros de API.
