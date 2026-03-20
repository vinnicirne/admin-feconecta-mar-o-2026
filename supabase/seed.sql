-- Seed para o FeConecta Admin Dashboard

-- 1. Criar um Admin de Exemplo (ID mockado para testes)
-- Nota: em prod, o auth_user_id deve vir do Supabase Auth
insert into public.admin_users (name, email, role, status, mfa_required)
values 
  ('Marina Costa', 'marina@feconecta.com', 'super_admin', 'active', true),
  ('João Victor Moraes', 'joao@feconecta.com', 'admin', 'active', true),
  ('Ana Beatriz Lima', 'ana@feconecta.com', 'moderator', 'review', false)
on conflict (email) do nothing;

-- 2. Mockar algumas métricas da plataforma
insert into public.platform_metrics (metric_date, active_users, open_reports, revenue_cents, security_incidents)
values 
  (current_date, 128450, 214, 8290000, 2),
  (current_date - interval '1 day', 125300, 220, 7850000, 0),
  (current_date - interval '2 days', 122100, 198, 7620000, 1)
on conflict (metric_date) do nothing;

-- 3. Mockar logs de acesso
insert into public.access_logs (admin_user_id, action, ip_address, geo_label, device_label, risk)
select 
  id, 
  'Login no painel administrativo', 
  '189.122.34.11', 
  'Sao Paulo, BR', 
  'MacBook Pro - Chrome', 
  'low'
from public.admin_users 
limit 3;
