# Sistema de Agendamento de Reservas

## O que foi implementado:

1. **Banco de Dados**: Nova tabela `reservation_schedule` para configurar horários de aceitação automática de reservas
2. **Modal de Configuração**: Interface para gerenciar dias e horários
3. **Status em Tempo Real**: Mostra se está aceitando reservas agora ou quando será o próximo horário

## Passo a passo para ativar:

### 1. Rodar a migração no Supabase

Acesse o Supabase SQL Editor e rode a migration:

```sql
-- Copie e cole todo o conteúdo do arquivo:
-- supabase/migrations/007_create_reservation_schedule.sql
```

Ou se estiver usando Supabase CLI local, rode:

```bash
npx supabase db push
```

### 2. Como usar:

1. Acesse `/dashboard/reservas`
2. Clique no botão "Configurar" no canto superior direito da lista de reservas
3. Adicione horários clicando em "Adicionar Horário"
4. Configure:
   - **Dia da Semana**: Domingo a Sábado
   - **Horário Inicial**: Ex: 09:00
   - **Horário Final**: Ex: 18:00
5. Clique em "Salvar Horários"

### 3. Exemplos de configuração:

**Restaurante de almoço:**
- Segunda a Sexta: 11:00 - 15:00
- Sábado: 11:00 - 16:00

**Restaurante com almoço e jantar:**
- Segunda a Quinta: 11:00 - 14:30
- Segunda a Quinta: 18:00 - 22:00
- Sexta e Sábado: 11:00 - 23:00

### 4. Como funciona:

- O sistema mostra automaticamente o status atual:
  - "Aceitando reservas agora" - quando está dentro de um horário configurado
  - "Próximo: Segunda às 09:00" - quando está fora do horário
  - "Sem horários configurados" - quando nenhum horário foi definido

- Clientes poderão fazer reservas apenas nos horários configurados
- Você pode adicionar múltiplos horários por dia (ex: almoço e jantar)
- Cada horário pode ser removido individualmente

### 5. Componentes criados:

- `ReservationScheduleModal.tsx` - Modal de configuração
- Migration `007_create_reservation_schedule.sql` - Estrutura do banco
- `ReservationsManager.tsx` - Atualizado com integração do modal

## Benefícios:

✅ Aceitação automática baseada em horários
✅ Configuração flexível por dia da semana
✅ Múltiplos horários por dia
✅ Status em tempo real
✅ Interface intuitiva
✅ Totalmente integrado com dark/light mode
✅ Segue a IDV do projeto
