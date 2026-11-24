-- CEFI-ELITE · V1 · Contenus administrables et offre de formation

-- Paramètres du site (coordonnées, textes clés). is_placeholder = contenu provisoire à remplacer.
create table public.settings (
  key text primary key,
  value jsonb not null,
  label text,
  is_placeholder boolean not null default true,
  updated_at timestamptz not null default now()
);

create type public.post_kind as enum ('actualite','conference','seminaire','evenement','annonce');
create type public.publish_status as enum ('brouillon','programme','publie','archive');

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  kind public.post_kind not null default 'actualite',
  title text not null,
  slug text not null unique,
  excerpt text,
  body text,
  cover_url text,
  event_starts_at timestamptz,
  event_place text,
  status public.publish_status not null default 'brouillon',
  published_at timestamptz,
  is_demo boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_detail text,
  quote text not null,
  is_published boolean not null default false,
  is_demo boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  is_demo boolean not null default false
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (length(full_name) between 2 and 120),
  email text check (email is null or email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or length(phone) <= 30),
  subject text check (subject is null or length(subject) <= 200),
  message text not null check (length(message) between 5 and 5000),
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order int not null default 0
);

create table public.trainers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles(id) on delete set null,
  full_name text not null,
  photo_url text,
  bio text,
  specialties text[] not null default '{}',
  declared_qualifications text,
  phone text,
  email text,
  is_public boolean not null default false,
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create type public.modality as enum ('presentiel','video','distance');

create table public.programs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  modality public.modality not null default 'presentiel',
  level text,
  short_description text,
  description text,
  objectives text,
  prerequisites text,
  syllabus text,
  target_audience text,
  duration_label text,
  hours int check (hours is null or hours >= 0),
  price_fcfa int check (price_fcfa is null or price_fcfa >= 0),
  registration_fee_fcfa int not null default 0 check (registration_fee_fcfa >= 0),
  payment_terms text,
  pass_mark numeric(5,2) not null default 10,
  cover_url text,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  label text not null,
  starts_on date,
  ends_on date,
  schedule_text text,
  capacity int check (capacity is null or capacity > 0),
  trainer_id uuid references public.trainers(id) on delete set null,
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null,
  coefficient numeric(5,2) not null default 1 check (coefficient > 0),
  sort_order int not null default 0
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.program_sessions(id) on delete cascade,
  name text not null,
  trainer_id uuid references public.trainers(id) on delete set null,
  room text,
  created_at timestamptz not null default now()
);

create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();
create trigger programs_touch before update on public.programs for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- Le formateur connecté est-il celui de cette classe ?
create or replace function public.is_trainer_of_class(c uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.classes cl join public.trainers t on t.id = cl.trainer_id
    where cl.id = c and t.profile_id = auth.uid()
  );
$$;

-- RLS
alter table public.settings enable row level security;
alter table public.posts enable row level security;
alter table public.testimonials enable row level security;
alter table public.faqs enable row level security;
alter table public.contact_messages enable row level security;
alter table public.categories enable row level security;
alter table public.trainers enable row level security;
alter table public.programs enable row level security;
alter table public.program_sessions enable row level security;
alter table public.subjects enable row level security;
alter table public.classes enable row level security;

-- Lecture publique
create policy "public lit les paramètres" on public.settings for select using (true);
create policy "public lit les publications" on public.posts for select
  using ((status in ('publie','programme') and published_at <= now()) or public.is_staff());
create policy "public lit les témoignages publiés" on public.testimonials for select using (is_published or public.is_staff());
create policy "public lit la FAQ" on public.faqs for select using (is_published or public.is_staff());
create policy "public lit les disciplines" on public.categories for select using (true);
create policy "public lit les formateurs publics" on public.trainers for select
  using (is_public or public.is_staff() or profile_id = auth.uid());
create policy "public lit les formations publiées" on public.programs for select using (is_published or public.is_staff());
create policy "public lit les sessions publiées" on public.program_sessions for select
  using (exists (select 1 from public.programs p where p.id = program_id and p.is_published) or public.is_staff());
create policy "public lit les matières publiées" on public.subjects for select
  using (exists (select 1 from public.programs p where p.id = program_id and p.is_published) or public.is_staff());
create policy "classes: personnel ou formateur" on public.classes for select
  using (public.is_staff() or public.is_trainer_of_class(id));

-- Écriture : administration (contenus) / responsable pédagogique (offre)
create policy "admin gère paramètres" on public.settings for all
  using (public.has_any_role(array['super_admin','admin']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin']::public.app_role[]));
create policy "admin gère publications" on public.posts for all
  using (public.has_any_role(array['super_admin','admin']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin']::public.app_role[]));
create policy "admin gère témoignages" on public.testimonials for all
  using (public.has_any_role(array['super_admin','admin']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin']::public.app_role[]));
create policy "admin gère FAQ" on public.faqs for all
  using (public.has_any_role(array['super_admin','admin']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin']::public.app_role[]));
create policy "tout le monde écrit un message de contact" on public.contact_messages for insert with check (is_handled = false);
create policy "secrétariat lit les messages" on public.contact_messages for select
  using (public.has_any_role(array['super_admin','admin','direction','secretariat']::public.app_role[]));
create policy "secrétariat traite les messages" on public.contact_messages for update
  using (public.has_any_role(array['super_admin','admin','secretariat']::public.app_role[]));
create policy "offre: gère disciplines" on public.categories for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]));
create policy "offre: gère formateurs" on public.trainers for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]));
create policy "offre: gère formations" on public.programs for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]));
create policy "offre: gère sessions" on public.program_sessions for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]));
create policy "offre: gère matières" on public.subjects for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]));
create policy "offre: gère classes" on public.classes for all
  using (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]))
  with check (public.has_any_role(array['super_admin','admin','resp_pedago']::public.app_role[]));
