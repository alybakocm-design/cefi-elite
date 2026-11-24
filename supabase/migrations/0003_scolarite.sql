-- CEFI-ELITE · V1 · Candidatures, apprenants, inscriptions, pédagogie

create type public.application_status as enum
  ('nouvelle','en_attente','incomplet','en_examen','acceptee','refusee','confirmee');

create sequence public.application_seq;
create sequence public.learner_seq;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    default 'CAND-' || to_char(now() at time zone 'Africa/Bamako','YYYY') || '-' || lpad(nextval('public.application_seq')::text, 5, '0'),
  first_name text not null check (length(first_name) between 1 and 80),
  last_name text not null check (length(last_name) between 1 and 80),
  birth_date date check (birth_date is null or birth_date between '1900-01-01' and current_date),
  sex text check (sex in ('F','M')),
  phone text not null check (length(phone) between 8 and 20),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  address text check (address is null or length(address) <= 300),
  program_id uuid references public.programs(id) on delete set null,
  modality public.modality,
  message text check (message is null or length(message) <= 3000),
  document_paths text[] not null default '{}',
  consent boolean not null check (consent),
  status public.application_status not null default 'nouvelle',
  staff_notes text,
  reviewed_by uuid references public.profiles(id),
  learner_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learners (
  id uuid primary key default gen_random_uuid(),
  matricule text not null unique
    default 'CE-' || to_char(now() at time zone 'Africa/Bamako','YYYY') || '-' || lpad(nextval('public.learner_seq')::text, 4, '0'),
  profile_id uuid unique references public.profiles(id) on delete set null,
  first_name text not null,
  last_name text not null,
  birth_date date,
  sex text check (sex in ('F','M')),
  phone text,
  email text,
  address text,
  photo_url text,
  emergency_contact_name text,
  emergency_contact_phone text,
  status text not null default 'actif' check (status in ('actif','suspendu','diplome','abandon','archive')),
  application_id uuid references public.applications(id) on delete set null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.applications add constraint applications_learner_fk
  foreign key (learner_id) references public.learners(id) on delete set null;

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete restrict,
  session_id uuid references public.program_sessions(id) on delete set null,
  class_id uuid references public.classes(id) on delete set null,
  source text not null default 'guichet' check (source in ('guichet','en_ligne','achat','abonnement')),
  status text not null default 'active' check (status in ('active','terminee','suspendue','annulee')),
  agreed_price_fcfa int check (agreed_price_fcfa is null or agreed_price_fcfa >= 0),
  enrolled_at timestamptz not null default now(),
  unique (learner_id, program_id, session_id)
);

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  session_date date not null,
  status text not null check (status in ('present','absent','retard','excuse')),
  note text,
  recorded_by uuid references public.profiles(id) default auth.uid(),
  recorded_at timestamptz not null default now(),
  unique (class_id, learner_id, session_date)
);

create table public.assessments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title text not null,
  kind text not null default 'devoir' check (kind in ('devoir','interrogation','examen','oral','projet')),
  held_on date,
  max_score numeric(6,2) not null default 20 check (max_score > 0),
  weight numeric(5,2) not null default 1 check (weight > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  learner_id uuid not null references public.learners(id) on delete cascade,
  score numeric(6,2) check (score is null or score >= 0),
  comment text,
  recorded_by uuid references public.profiles(id) default auth.uid(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, learner_id)
);

create or replace function public.check_grade_max()
returns trigger language plpgsql set search_path = public as $$
declare m numeric;
begin
  select max_score into m from public.assessments where id = new.assessment_id;
  if new.score is not null and new.score > m then
    raise exception 'La note dépasse le barème (% / %)', new.score, m;
  end if;
  new.updated_at = now();
  return new;
end $$;
create trigger grades_check before insert or update on public.grades for each row execute function public.check_grade_max();
create trigger grades_audit after insert or update or delete on public.grades for each row execute function public.audit_trigger();
create trigger applications_touch before update on public.applications for each row execute function public.touch_updated_at();
create trigger learners_touch before update on public.learners for each row execute function public.touch_updated_at();

-- Liens d'appartenance
create or replace function public.my_learner_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.learners where profile_id = auth.uid() limit 1;
$$;

create or replace function public.trainer_sees_learner(l uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.enrollments e
    join public.classes cl on cl.id = e.class_id
    join public.trainers t on t.id = cl.trainer_id
    where e.learner_id = l and t.profile_id = auth.uid()
  );
$$;

-- Dépôt de candidature public (seule voie d'écriture pour les visiteurs)
create or replace function public.submit_application(
  p_first_name text, p_last_name text, p_birth_date date, p_sex text, p_phone text,
  p_email text, p_address text, p_program_id uuid, p_modality public.modality,
  p_message text, p_document_paths text[], p_consent boolean
) returns text language plpgsql security definer set search_path = public as $$
declare ref text;
begin
  if not coalesce(p_consent, false) then
    raise exception 'Les conditions d''inscription doivent être acceptées';
  end if;
  if p_program_id is not null and not exists (select 1 from public.programs where id = p_program_id and is_published) then
    raise exception 'Formation introuvable';
  end if;
  if coalesce(array_length(p_document_paths, 1), 0) > 5 then
    raise exception 'Cinq documents au maximum';
  end if;
  insert into public.applications (first_name, last_name, birth_date, sex, phone, email, address,
    program_id, modality, message, document_paths, consent)
  values (trim(p_first_name), trim(p_last_name), p_birth_date, nullif(p_sex,''), trim(p_phone),
    nullif(trim(p_email),''), nullif(trim(p_address),''), p_program_id, p_modality,
    nullif(trim(p_message),''), coalesce(p_document_paths,'{}'), p_consent)
  returning reference into ref;
  return ref;
end $$;
revoke all on function public.submit_application from public;
grant execute on function public.submit_application to anon, authenticated;

-- Confirmation d'une candidature : crée le dossier apprenant et l'inscription
create or replace function public.confirm_application(p_application_id uuid, p_session_id uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare a public.applications; lid uuid;
begin
  if not public.has_any_role(array['super_admin','admin','secretariat']::public.app_role[]) then
    raise exception 'Action réservée au secrétariat';
  end if;
  select * into a from public.applications where id = p_application_id for update;
  if a.id is null then raise exception 'Candidature introuvable'; end if;
  if a.status = 'confirmee' then return a.learner_id; end if;
  if a.status <> 'acceptee' then raise exception 'La candidature doit d''abord être acceptée'; end if;
  if a.program_id is null then raise exception 'Aucune formation choisie'; end if;

  select id into lid from public.learners
   where (a.email is not null and lower(email) = lower(a.email)) or phone = a.phone limit 1;
  if lid is null then
    insert into public.learners (first_name, last_name, birth_date, sex, phone, email, address, application_id)
    values (a.first_name, a.last_name, a.birth_date, a.sex, a.phone, a.email, a.address, a.id)
    returning id into lid;
  end if;
  insert into public.enrollments (learner_id, program_id, session_id, source)
  values (lid, a.program_id, p_session_id, 'en_ligne')
  on conflict do nothing;
  update public.applications set status = 'confirmee', learner_id = lid, reviewed_by = auth.uid() where id = a.id;
  return lid;
end $$;
revoke all on function public.confirm_application from public, anon;
grant execute on function public.confirm_application to authenticated;

-- RLS
alter table public.applications enable row level security;
alter table public.learners enable row level security;
alter table public.enrollments enable row level security;
alter table public.attendance enable row level security;
alter table public.assessments enable row level security;
alter table public.grades enable row level security;

create policy "candidatures: lecture personnel" on public.applications for select
  using (public.has_any_role(array['super_admin','direction','admin','secretariat','resp_pedago']::public.app_role[]));
create policy "candidatures: traitement secrétariat" on public.applications for update
  using (public.has_any_role(array['super_admin','admin','secretariat']::public.app_role[]));

create policy "apprenants: lecture" on public.learners for select
  using (public.is_staff() or profile_id = auth.uid() or public.trainer_sees_learner(id));
create policy "apprenants: gestion" on public.learners for all
  using (public.has_any_role(array['super_admin','admin','secretariat']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','secretariat']::public.app_role[]));

create policy "inscriptions: lecture" on public.enrollments for select
  using (public.is_staff() or learner_id = public.my_learner_id()
         or (class_id is not null and public.is_trainer_of_class(class_id)));
create policy "inscriptions: gestion" on public.enrollments for all
  using (public.has_any_role(array['super_admin','admin','secretariat','resp_pedago']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','secretariat','resp_pedago']::public.app_role[]));

create policy "présences: lecture" on public.attendance for select
  using (public.is_staff() or public.is_trainer_of_class(class_id) or learner_id = public.my_learner_id());
create policy "présences: saisie" on public.attendance for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]) or public.is_trainer_of_class(class_id))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]) or public.is_trainer_of_class(class_id));

create policy "évaluations: lecture" on public.assessments for select
  using (public.is_staff() or public.is_trainer_of_class(class_id)
         or (is_published and exists (select 1 from public.enrollments e where e.class_id = assessments.class_id and e.learner_id = public.my_learner_id())));
create policy "évaluations: gestion" on public.assessments for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]) or public.is_trainer_of_class(class_id))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]) or public.is_trainer_of_class(class_id));

create policy "notes: lecture" on public.grades for select
  using (public.is_staff()
         or exists (select 1 from public.assessments a where a.id = assessment_id and public.is_trainer_of_class(a.class_id))
         or (learner_id = public.my_learner_id() and exists (select 1 from public.assessments a where a.id = assessment_id and a.is_published)));
create policy "notes: saisie" on public.grades for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[])
         or exists (select 1 from public.assessments a where a.id = assessment_id and public.is_trainer_of_class(a.class_id)))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[])
         or exists (select 1 from public.assessments a where a.id = assessment_id and public.is_trainer_of_class(a.class_id)));
