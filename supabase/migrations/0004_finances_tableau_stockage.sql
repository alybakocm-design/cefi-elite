-- CEFI-ELITE · V1 · Finances, tableau de bord, stockage

create sequence public.receipt_seq;

create table public.installments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments(id) on delete cascade,
  label text not null,
  amount_fcfa int not null check (amount_fcfa > 0),
  due_on date not null,
  created_at timestamptz not null default now()
);

-- Paiements : jamais modifiés ni supprimés. Remboursement / annulation = nouvelle ligne liée.
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  receipt_number text not null unique
    default 'REC-' || to_char(now() at time zone 'Africa/Bamako','YYYY') || '-' || lpad(nextval('public.receipt_seq')::text, 6, '0'),
  kind text not null default 'encaissement' check (kind in ('encaissement','remboursement','annulation')),
  learner_id uuid references public.learners(id) on delete restrict,
  enrollment_id uuid references public.enrollments(id) on delete restrict,
  amount_fcfa int not null check (amount_fcfa > 0),
  purpose text not null default 'formation' check (purpose in ('inscription','formation','autre')),
  method text not null check (method in ('especes','orange_money','moov_money','carte','virement','autre')),
  channel text not null default 'guichet' check (channel in ('guichet','en_ligne')),
  revenue_stream text not null default 'presentiel' check (revenue_stream in ('presentiel','video','abonnement','distance')),
  status text not null default 'confirme' check (status in ('en_attente','confirme','echoue','annule')),
  provider text,
  provider_ref text,
  reversal_of uuid references public.payments(id),
  note text,
  received_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now(),
  check (kind = 'encaissement' or reversal_of is not null)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  category text not null default 'autre',
  amount_fcfa int not null check (amount_fcfa > 0),
  spent_on date not null default current_date,
  supplier text,
  note text,
  recorded_by uuid references public.profiles(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create trigger payments_audit after insert on public.payments for each row execute function public.audit_trigger();
create trigger expenses_audit after insert or update or delete on public.expenses for each row execute function public.audit_trigger();

alter table public.installments enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;

create policy "échéances: lecture" on public.installments for select
  using (public.has_any_role(array['super_admin','direction','admin','secretariat','comptable']::public.app_role[])
         or exists (select 1 from public.enrollments e where e.id = enrollment_id and e.learner_id = public.my_learner_id()));
create policy "échéances: gestion" on public.installments for all
  using (public.has_any_role(array['super_admin','admin','comptable']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','comptable']::public.app_role[]));

create policy "paiements: lecture" on public.payments for select
  using (public.has_any_role(array['super_admin','direction','admin','secretariat','comptable']::public.app_role[])
         or learner_id = public.my_learner_id());
-- Seuls les encaissements au guichet sont saisis par le personnel ; les paiements en ligne
-- ne sont écrits que par le serveur après vérification du prestataire (clé service, hors RLS).
create policy "paiements: saisie guichet" on public.payments for insert
  with check (channel = 'guichet' and status = 'confirme'
              and public.has_any_role(array['super_admin','admin','secretariat','comptable']::public.app_role[])
              and (kind = 'encaissement' or public.has_any_role(array['super_admin','comptable']::public.app_role[])));

create policy "dépenses: lecture" on public.expenses for select
  using (public.has_any_role(array['super_admin','direction','admin','comptable']::public.app_role[]));
create policy "dépenses: gestion" on public.expenses for all
  using (public.has_any_role(array['super_admin','comptable']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','comptable']::public.app_role[]));

-- Soldes par inscription (respecte la RLS de l'utilisateur qui interroge)
create view public.enrollment_balances with (security_invoker = true) as
select e.id as enrollment_id, e.learner_id, e.program_id,
       coalesce(e.agreed_price_fcfa, p.price_fcfa, 0) + p.registration_fee_fcfa as due_fcfa,
       coalesce(sum(case when pay.status = 'confirme' and pay.kind = 'encaissement' then pay.amount_fcfa
                         when pay.status = 'confirme' then -pay.amount_fcfa else 0 end), 0)::int as paid_fcfa,
       (coalesce(e.agreed_price_fcfa, p.price_fcfa, 0) + p.registration_fee_fcfa
        - coalesce(sum(case when pay.status = 'confirme' and pay.kind = 'encaissement' then pay.amount_fcfa
                            when pay.status = 'confirme' then -pay.amount_fcfa else 0 end), 0))::int as balance_fcfa
from public.enrollments e
join public.programs p on p.id = e.program_id
left join public.payments pay on pay.enrollment_id = e.id
group by e.id, p.id;

-- Tableau de bord de la direction : uniquement des chiffres réels, calculés à la demande
create or replace function public.dashboard_stats()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb; month_start timestamptz := date_trunc('month', now() at time zone 'Africa/Bamako') at time zone 'Africa/Bamako';
begin
  if not public.has_any_role(array['super_admin','direction','admin','comptable','resp_pedago','secretariat']::public.app_role[]) then
    raise exception 'Accès refusé';
  end if;
  select jsonb_build_object(
    'learners_total', (select count(*) from learners where status = 'actif' and not is_demo),
    'learners_presentiel', (select count(distinct e.learner_id) from enrollments e join programs p on p.id = e.program_id join learners l on l.id = e.learner_id
                            where p.modality = 'presentiel' and e.status = 'active' and not l.is_demo),
    'learners_online', (select count(distinct e.learner_id) from enrollments e join programs p on p.id = e.program_id join learners l on l.id = e.learner_id
                        where p.modality <> 'presentiel' and e.status = 'active' and not l.is_demo),
    'trainers_total', (select count(*) from trainers where is_active and not is_demo),
    'programs_active', (select count(*) from programs where is_published and not is_demo),
    'applications_new', (select count(*) from applications where status in ('nouvelle','en_attente','incomplet','en_examen')),
    'applications_month', (select count(*) from applications where created_at >= month_start),
    'attendance_rate', (select round(100.0 * count(*) filter (where status in ('present','retard')) / nullif(count(*),0), 1)
                        from attendance where session_date >= (now() - interval '30 days')::date),
    'revenue_month', (select coalesce(sum(case when kind = 'encaissement' then amount_fcfa else -amount_fcfa end),0)
                      from payments where status = 'confirme' and created_at >= month_start),
    'revenue_by_stream', (select coalesce(jsonb_object_agg(revenue_stream, total), '{}') from (
                           select revenue_stream, sum(case when kind = 'encaissement' then amount_fcfa else -amount_fcfa end) total
                           from payments where status = 'confirme' and created_at >= date_trunc('year', now()) group by 1) s),
    'expenses_month', (select coalesce(sum(amount_fcfa),0) from expenses where spent_on >= month_start::date),
    'unpaid_total', (select coalesce(sum(greatest(b.balance_fcfa,0)),0) from enrollment_balances b
                     join enrollments e on e.id = b.enrollment_id where e.status = 'active'),
    'top_programs', (select coalesce(jsonb_agg(t), '[]') from (
                      select p.title, count(*) as n from enrollments e join programs p on p.id = e.program_id
                      where e.status = 'active' group by p.title order by n desc limit 5) t),
    'recent_applications', (select coalesce(jsonb_agg(t), '[]') from (
                      select a.reference, a.first_name || ' ' || a.last_name as name, a.status, a.created_at, p.title as program
                      from applications a left join programs p on p.id = a.program_id order by a.created_at desc limit 6) t)
  ) into r;
  return r;
end $$;
revoke all on function public.dashboard_stats from public, anon;
grant execute on function public.dashboard_stats to authenticated;

-- Droits d'accès à l'API (la RLS décide ensuite ligne par ligne)
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant insert on public.contact_messages to anon;
grant usage, select on all sequences in schema public to anon, authenticated;
revoke update, delete on public.payments from authenticated;
revoke update, delete on public.audit_log from authenticated;
revoke insert on public.audit_log from authenticated;

-- Stockage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('candidatures', 'candidatures', false, 5242880, array['application/pdf','image/jpeg','image/png','image/webp']),
  ('medias', 'medias', true, 5242880, array['image/jpeg','image/png','image/webp','image/svg+xml']),
  ('documents', 'documents', false, 20971520, null)
on conflict (id) do nothing;

create policy "candidatures: dépôt public" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'candidatures' and (storage.foldername(name))[1] = 'depots');
create policy "candidatures: lecture secrétariat" on storage.objects for select to authenticated
  using (bucket_id = 'candidatures' and public.has_any_role(array['super_admin','admin','secretariat','direction']::public.app_role[]));
create policy "médias: écriture administration" on storage.objects for insert to authenticated
  with check (bucket_id = 'medias' and public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]));
create policy "médias: suppression administration" on storage.objects for delete to authenticated
  using (bucket_id = 'medias' and public.has_any_role(array['super_admin','admin']::public.app_role[]));
create policy "documents: personnel" on storage.objects for all to authenticated
  using (bucket_id = 'documents' and public.is_staff())
  with check (bucket_id = 'documents' and public.is_staff());
