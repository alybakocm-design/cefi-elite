-- CEFI-ELITE · V1 · Identité, rôles, permissions, journal
create extension if not exists pgcrypto;

create type public.app_role as enum (
  'super_admin','direction','admin','secretariat','comptable','resp_pedago','formateur','apprenant'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor uuid,
  action text not null,
  table_name text,
  record_id text,
  data jsonb,
  at timestamptz not null default now()
);

create table public.login_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  at timestamptz not null default now(),
  user_agent text
);

-- Fonctions d'autorisation (security definer : lisent user_roles sans boucle RLS)
create or replace function public.has_role(r public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur join public.profiles p on p.id = ur.user_id
    where ur.user_id = auth.uid() and ur.role = r and p.is_active
  );
$$;

create or replace function public.has_any_role(rs public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur join public.profiles p on p.id = ur.user_id
    where ur.user_id = auth.uid() and ur.role = any(rs) and p.is_active
  );
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_any_role(array['super_admin','direction','admin','secretariat','comptable','resp_pedago']::public.app_role[]);
$$;

create or replace function public.my_roles()
returns public.app_role[] language sql stable security definer set search_path = public as $$
  select coalesce(array_agg(role), '{}') from public.user_roles where user_id = auth.uid();
$$;

-- Création automatique du profil à l'inscription (rôle apprenant par défaut)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email, new.raw_user_meta_data->>'phone');
  insert into public.user_roles (user_id, role) values (new.id, 'apprenant');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

-- Journalisation générique
create or replace function public.audit_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor, action, table_name, record_id, data)
  values (auth.uid(), tg_op, tg_table_name,
          coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'id',
                   (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'user_id'),
          case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end);
  return coalesce(new, old);
end $$;

create trigger audit_user_roles after insert or update or delete on public.user_roles
for each row execute function public.audit_trigger();

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

create trigger profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

-- Un utilisateur ne peut pas changer son propre statut actif
create or replace function public.protect_profile_fields()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.is_active is distinct from old.is_active
     and not public.has_any_role(array['super_admin','admin']::public.app_role[]) then
    raise exception 'Modification du statut réservée à l''administration';
  end if;
  return new;
end $$;
create trigger profiles_protect before update on public.profiles
for each row execute function public.protect_profile_fields();

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.audit_log enable row level security;
alter table public.login_history enable row level security;

create policy "profil: soi ou personnel" on public.profiles for select
  using (id = auth.uid() or public.is_staff());
create policy "profil: soi ou admin modifie" on public.profiles for update
  using (id = auth.uid() or public.has_any_role(array['super_admin','admin']::public.app_role[]));

create policy "roles: les siens ou personnel" on public.user_roles for select
  using (user_id = auth.uid() or public.is_staff());
create policy "roles: super admin gère" on public.user_roles for all
  using (public.has_role('super_admin')) with check (public.has_role('super_admin'));
create policy "roles: admin gère hors super admin" on public.user_roles for insert
  with check (public.has_role('admin') and role <> 'super_admin');
create policy "roles: admin retire hors super admin" on public.user_roles for delete
  using (public.has_role('admin') and role <> 'super_admin');

create policy "journal: direction et super admin" on public.audit_log for select
  using (public.has_any_role(array['super_admin','direction']::public.app_role[]));

create policy "connexions: soi ou super admin" on public.login_history for select
  using (user_id = auth.uid() or public.has_role('super_admin'));
create policy "connexions: soi enregistre" on public.login_history for insert
  with check (user_id = auth.uid());

-- (correctif) trigger idempotent
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email, new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'apprenant') on conflict do nothing;
  return new;
end $$;
