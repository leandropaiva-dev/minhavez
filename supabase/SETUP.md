# Configuração do Supabase para MinhaVez

## 1. Criar a tabela `businesses`

### Opção A: Via Supabase Dashboard (Mais Fácil)

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto MinhaVez
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `migrations/001_create_businesses_table.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)

### Opção B: Via Supabase CLI

```bash
# Instalar Supabase CLI (se ainda não tiver)
npm install -g supabase

# Fazer login
supabase login

# Executar a migration
supabase db push
```

## 2. Verificar se a tabela foi criada

No SQL Editor, execute:

```sql
SELECT * FROM businesses;
```

Você deve ver uma tabela vazia (sem erros).

## 3. Próximos Passos

Após criar a tabela:

1. Teste o fluxo de onboarding:
   - Crie uma nova conta
   - Preencha as informações do negócio
   - Verifique se os dados foram salvos no Supabase

2. Verifique no Supabase Dashboard:
   - Vá em **Table Editor**
   - Selecione a tabela `businesses`
   - Veja os dados salvos

## Estrutura da Tabela

- **id**: UUID único do negócio
- **user_id**: Referência ao usuário (auth.users)
- **name**: Nome do estabelecimento
- **business_type**: Tipo (restaurante, bar, etc.)
- **phone**: Telefone
- **address**: Endereço (opcional)
- **subscription_status**: Status da assinatura (trial, active, canceled, past_due)
- **trial_ends_at**: Data de término do trial (14 dias por padrão)
- **stripe_customer_id**: ID do cliente no Stripe
- **stripe_subscription_id**: ID da assinatura no Stripe
- **created_at**: Data de criação
- **updated_at**: Data de atualização

## Políticas de Segurança (RLS)

A tabela possui Row Level Security habilitado:

- Usuários só podem ver seus próprios negócios
- Usuários só podem criar UM negócio
- Usuários podem atualizar seus próprios negócios
- Usuários podem deletar seus próprios negócios
