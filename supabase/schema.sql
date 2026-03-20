create extension if not exists "pgcrypto";

create type admin_role as enum ('super_admin', 'admin', 'moderator', 'support');
create type admin_status as enum ('active', 'review', 'suspended');
create type access_risk as enum ('low', 'medium', 'high', 'critical');

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  name text not null,
  email text not null unique,
  role admin_role not null default 'support',
  status admin_status not null default 'review',
  mfa_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  module text not null,
  description text not null
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role admin_role not null,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  unique (role, permission_id)
);

create table if not exists public.access_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.admin_users(id) on delete set null,
  action text not null,
  ip_address inet,
  geo_label text,
  device_label text,
  risk access_risk not null default 'low',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.admin_users(id) on delete set null,
  module text not null,
  action text not null,
  target_type text,
  target_id text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.platform_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_date date not null,
  active_users integer not null default 0,
  open_reports integer not null default 0,
  revenue_cents bigint not null default 0,
  security_incidents integer not null default 0,
  unique (metric_date)
);

insert into public.permissions (code, module, description)
values
  ('dashboard.view', 'dashboard', 'Visualizar painel executivo'),
  ('users.manage', 'users', 'Gerenciar administradores'),
  ('reports.manage', 'moderation', 'Gerenciar denuncias'),
  ('content.manage', 'content', 'Gerenciar conteudo'),
  ('monetization.view', 'monetization', 'Visualizar monetizacao'),
  ('tickets.manage', 'support', 'Gerenciar atendimento')
on conflict (code) do nothing;

alter table public.admin_users enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.access_logs enable row level security;
alter table public.audit_events enable row level security;
alter table public.platform_metrics enable row level security;

create policy "admin users readable by admins"
on public.admin_users
for select
using (auth.role() = 'authenticated');

create policy "platform metrics readable by admins"
on public.platform_metrics
for select
using (auth.role() = 'authenticated');

create policy "access logs readable by admins"
on public.access_logs
for select
using (auth.role() = 'authenticated');

create or replace function public.is_super_admin(user_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where auth_user_id = user_id
      and role = 'super_admin'
      and status = 'active'
  );
$$;


-- Função para sincronizar novo usuário do Auth com o Painel Admin
CREATE OR REPLACE FUNCTION public.handle_new_admin_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (auth_user_id, name, email, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'admin', -- Papel padrão inicial
    'active'
  )
  ON CONFLICT (email) DO UPDATE SET auth_user_id = EXCLUDED.auth_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para disparar após a criação no auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_admin_user();
