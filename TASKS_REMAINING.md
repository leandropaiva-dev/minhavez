# Tasks Remaining - Dashboard Final

## ✅ Completed
- [x] Fix avg wait time calculation (returns 0 when no attendances)
- [x] Update analytics chart to show all days in range (empty + data)

## 🚧 In Progress - Critical for Launch

### 1. UI/UX - Neutral Colors & Icons
- [ ] Change ALL icons to zinc/gray (remove blue/green/red/purple)
- [ ] Update AnalyticsChart icon to zinc-400
- [ ] Update GoalsPanel icon to zinc-400
- [ ] Update QuickActions icon to zinc-400
- [ ] Update QRCodeCard icon to zinc-400
- [ ] Remove colored backgrounds from icon badges (use zinc-800/zinc-900)
- [ ] Update all buttons to zinc-700/zinc-800 (remove blue/green/red/purple)
- [ ] Update hover states to zinc-600
- [ ] Keep only danger actions in subtle red (encerrar fila/reservas)

### 2. GoalsPanel - Real Data & Functionality
- [ ] Create hook `useBusinessGoals` to fetch goals from Supabase
- [ ] Filter goals by period and type (real-time)
- [ ] Show empty state when no goal exists
- [ ] Create goal creation modal component
- [ ] Implement goal creation with Supabase insert
- [ ] Implement goal editing functionality
- [ ] Auto-calculate current_value based on goal_type:
  - attendance: count completed queue_entries
  - avg_time: calculate from completed entries
  - reservations_served: count completed reservations
  - reservations_pending: count pending reservations
  - queue_served: count completed queue entries
  - queue_pending: count waiting queue entries

### 3. Queue Close/Open System
- [ ] Add `is_queue_open` BOOLEAN column to businesses table (migration)
- [ ] Create `/lib/queue/actions.ts` with toggleQueueStatus function
- [ ] Update QuickActions "Encerrar Fila" to call toggleQueueStatus
- [ ] Update public queue page to check `is_queue_open` before allowing joins
- [ ] Show appropriate message when queue is closed
- [ ] Add "Abrir Fila" action when queue is closed
- [ ] Add visual indicator in dashboard when queue is closed

### 4. QR Code Display
- [ ] Update QRCodeCard to show QR code image (not hidden)
- [ ] Make QR code size ~120x120px to fit harmoniously
- [ ] Center QR code in available space
- [ ] Keep action buttons below QR code

### 5. Quick Actions - Add 3 More Actions (9 total)
Current: 6 actions
- Encerrar Fila
- Encerrar Reservas
- Chamar Próximo
- Inserir na Fila
- Ver Filas
- Ver Reservas

Add 3 more:
- [ ] "Histórico" - View completed queue entries
- [ ] "Configurações" - Quick access to settings
- [ ] "Relatórios" - Quick access to reports

### 6. Database Migrations
- [ ] Run migration 003_create_reservations.sql
- [ ] Run migration 004_create_business_goals.sql
- [ ] Run migration 005_update_goal_types.sql
- [ ] Create migration 006_add_queue_status_to_businesses.sql

## Priority Order
1. UI/UX Colors (fast, visual impact)
2. QR Code Display (fast, important UX)
3. Quick Actions additions (fast)
4. Queue Close/Open (critical functionality)
5. GoalsPanel Real Data (important for metrics)
6. Goal Creation Modal (nice to have, can be done after launch)
