# Como Acessar a Página de Reservas

## ✅ Sistema Implementado com ID Único

Assim como a fila pública, a página de reservas usa o **ID único do negócio** (não slug), evitando conflitos entre negócios com nomes similares.

## 📍 URL da Página Pública

```
http://localhost:3000/reserva/[ID-DO-SEU-NEGOCIO]
```

## 🔍 Como Descobrir Seu Link

### Opção 1: Dashboard (Recomendado)
1. Acesse `/dashboard`
2. Procure o card **"QR Code Reservas"** (ao lado do QR Code da fila)
3. O link completo está visível no card
4. Use os botões:
   - **Copiar**: Copia o link
   - **Baixar**: Baixa o QR Code
   - **Abrir**: Abre em nova aba para testar

### Opção 2: Console do Navegador
1. Abra `/dashboard`
2. Abra o Console (F12)
3. Rode: `console.log(window.location.origin + '/reserva/SEU-ID')`

### Opção 3: Banco de Dados
1. Acesse Supabase Table Editor
2. Abra a tabela `businesses`
3. Copie o `id` do seu negócio
4. Use: `http://localhost:3000/reserva/[COLE-O-ID-AQUI]`

## 📋 O que os Clientes Veem

Quando acessam o link, encontram:
- Nome do seu negócio
- Formulário de reserva com:
  - Nome completo *
  - Telefone
  - Email
  - Número de pessoas *
  - Data *
  - Horário *
  - Observações

## ⚙️ Validação Automática de Horários

O sistema verifica automaticamente se o horário solicitado está dentro dos **horários configurados** em `/dashboard/reservas` → botão "Configurar".

Se o cliente tentar reservar fora do horário:
❌ "Desculpe, não aceitamos reservas neste horário. Por favor, escolha outro horário."

## 🔄 Fluxo da Reserva

1. Cliente preenche formulário → **Status: Pendente**
2. Você vê no `/dashboard/reservas` e clica "Confirmar" → **Status: Confirmada**
3. Cliente chega, você clica "Cliente Chegou" → **Status: Chegou**
4. Você clica "Sentar" → **Status: Sentado**
5. Atendimento termina, você clica "Concluir" → **Status: Concluída**

## 💡 Dicas

- Compartilhe o QR Code impresso no estabelecimento
- Adicione o link nas redes sociais
- Use o botão "Copiar" para enviar via WhatsApp
- Configure os horários para evitar reservas fora do expediente

## 🚀 Próximos Passos

1. Rode a migration do sistema de horários (SQL já fornecido)
2. Configure seus horários em `/dashboard/reservas` → "Configurar"
3. Teste fazendo uma reserva pelo link público
4. Gerencie as reservas no dashboard
