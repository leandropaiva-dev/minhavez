# Web Push Notifications - MinhaVez

## 📱 Funcionalidade Implementada

Web Push Notifications para avisar clientes quando forem chamados na fila, **mesmo com o site fechado**.

## ✅ O que foi implementado

### 1. **Backend**
- ✅ Service Worker ([public/sw.js](public/sw.js))
- ✅ API Routes:
  - `/api/push/subscribe` - Gerenciar subscriptions
  - `/api/push/send` - Enviar notificações
- ✅ Server Action ([src/lib/push/send-notification.ts](src/lib/push/send-notification.ts))
- ✅ Tabela no Supabase: `push_subscriptions`
- ✅ Campo `user_id` em `queue_entries`

### 2. **Frontend**
- ✅ Hook personalizado: `usePushNotifications`
- ✅ Integração no `QueueFormWrapper`
- ✅ Envio automático quando business chama cliente
- ✅ UI para ativar/desativar notificações

### 3. **Configuração**
- ✅ VAPID keys geradas
- ✅ Content Security Policy atualizada
- ✅ Migrations do banco de dados

## 🚀 Como testar

### Passo 1: Aplicar migrations no Supabase

Execute as migrations no Supabase Dashboard:

```sql
-- Migration 044: Criar tabela push_subscriptions
-- Migration 045: Adicionar user_id à tabela queue_entries
```

### Passo 2: Configurar variáveis de ambiente na Vercel

Adicione as seguintes variáveis:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPCLKgNGCqDld8qdHtOQwW0dHWPeKg8lSumKdhzD6SXqxLVqzAuXGt59bMvheJrmWSoUlfeJr4oJlFRJ6i5pMu0
VAPID_PRIVATE_KEY=F8T33mXPVYAfXD2WTvxaYfHqcTsIdEwLf-73-6bpt8w
```

### Passo 3: Deploy e teste

1. **Fazer deploy** na Vercel
2. **Criar conta** ou fazer login
3. **Entrar em uma fila** como cliente
4. **Aceitar permissão** de notificações quando solicitado
5. **Fechar o site** completamente (aba e navegador)
6. **No dashboard**, chamar o cliente
7. **Verificar** se a notificação chegou mesmo com o site fechado

## 🔧 Como funciona

### Fluxo completo:

1. **Cliente entra na fila**
   - Se estiver logado, `user_id` é salvo em `queue_entries`
   - Service Worker é registrado
   - Permissão de notificação é solicitada

2. **Cliente aceita notificações**
   - Push subscription é criada
   - Subscription é salva no banco (`push_subscriptions`)
   - Mensagem de confirmação é exibida

3. **Business chama o cliente**
   - Status muda para `called` no `QueueManager`
   - Server action `sendPushNotification` é chamada
   - Notificação é enviada via web-push
   - Service Worker recebe e exibe a notificação

4. **Cliente recebe notificação**
   - Mesmo com site fechado
   - Com som e vibração
   - Ao clicar, abre a página da fila

## 📋 Requisitos

- ✅ **HTTPS** - Obrigatório para Service Workers (automático na Vercel)
- ✅ **Navegador compatível** - Chrome, Firefox, Edge, Safari 16+
- ✅ **Permissão concedida** - Usuário precisa aceitar
- ✅ **Usuário logado** - Para vincular subscription ao user_id

## 🐛 Troubleshooting

### Notificação não chega

1. **Verificar permissão do navegador**
   - Chrome: `chrome://settings/content/notifications`
   - Garantir que o site tem permissão

2. **Verificar console do Service Worker**
   - DevTools → Application → Service Workers
   - Ver logs de erros

3. **Verificar banco de dados**
   - Confirmar que `push_subscriptions` tem registros
   - Confirmar que `queue_entries` tem `user_id`

4. **Verificar VAPID keys**
   - Confirmar que estão configuradas na Vercel
   - Verificar que são as mesmas do .env local

### Service Worker não registra

1. **Verificar HTTPS**
   - Service Workers só funcionam em HTTPS (ou localhost)

2. **Verificar CSP**
   - `worker-src 'self' blob:` está configurado

3. **Limpar cache**
   - DevTools → Application → Clear storage

## 📝 Notas importantes

- As notificações só funcionam para **usuários logados**
- Clientes anônimos ainda veem notificações no navegador (in-app)
- VAPID keys são únicas - não compartilhar publicamente
- Subscriptions expiradas são automaticamente removidas

## 🎯 Próximos passos (opcionais)

- [ ] Notificações para outros eventos (reserva confirmada, etc)
- [ ] Personalizar som da notificação
- [ ] Analytics de notificações entregues
- [ ] Suporte para notificações agrupadas
- [ ] Web Push para PWA (Add to Home Screen)
