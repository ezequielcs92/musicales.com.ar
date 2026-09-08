-- ---------------------------------------------------------------------------
-- Talleres y audiciones: las dos secciones que hoy nadie cubre bien y que son
-- el diferencial competitivo frente a las carteleras generalistas.
-- ---------------------------------------------------------------------------

-- --- Escuelas -------------------------------------------------------------

create table public.schools (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text,
  address      text,
  neighborhood text,
  city         text not null default 'Ciudad Autónoma de Buenos Aires',
  province     text not null default 'CABA',
  website      text,
  socials      jsonb not null default '{}'::jsonb,
  logo_path    text,
  founded_year integer,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);


-- --- Talleres -------------------------------------------------------------

create table public.workshops (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  school_id         uuid not null references public.schools (id) on delete cascade,
  title             text not null,
  description       text,

  -- La distincion que pidio el proyecto: el taller de montaje termina en una
  -- funcion; el entrenamiento es semanal y no monta nada. Es el filtro mas
  -- buscado y el que ningun listado generico ofrece.
  kind              app.workshop_kind not null,
  disciplines       app.discipline[] not null default '{}',
  level             app.skill_level not null default 'todos',

  age_min           integer check (age_min is null or age_min >= 0),
  age_max           integer check (age_max is null or age_max >= 0),

  starts_on         date,
  ends_on           date,
  weekday           smallint check (weekday is null or weekday between 0 and 6),
  time_from         time,
  duration_weeks    integer check (duration_weeks is null or duration_weeks > 0),

  -- Lo que hace que un montaje sea un montaje.
  final_show        boolean not null default false,
  final_show_venue_id uuid references public.venues (id) on delete set null,
  final_show_title  text,

  audition_required boolean not null default false,
  fee_ars           integer check (fee_ars is null or fee_ars >= 0),
  fee_period        text,
  enrollment_open   boolean not null default true,
  enrollment_deadline date,

  contact_email     text,
  contact_phone     text,
  source_url        text,
  verified_at       date,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint workshops_dates_ok check (ends_on is null or starts_on is null or ends_on >= starts_on),
  constraint workshops_ages_ok  check (age_max is null or age_min is null or age_max >= age_min),
  -- Coherencia: si no hay montaje, no puede haber sala ni titulo de montaje.
  constraint workshops_show_ok  check (
    final_show or (final_show_venue_id is null and final_show_title is null)
  )
);

create index workshops_kind_idx on public.workshops (kind, enrollment_open);
create index workshops_school_idx on public.workshops (school_id);
create index workshops_disciplines_idx on public.workshops using gin (disciplines);


-- --- Audiciones -----------------------------------------------------------

create table public.auditions (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  production_id  uuid references public.productions (id) on delete set null,
  title          text not null,
  organizer      text not null,
  description    text,

  roles_sought   jsonb not null default '[]'::jsonb,
  age_min        integer check (age_min is null or age_min >= 0),
  age_max        integer check (age_max is null or age_max >= 0),
  vocal_ranges   app.vocal_range[] not null default '{}',
  dance_styles   text[] not null default '{}',

  is_paid        boolean,
  contract_type  text,

  -- Filtro decisivo en las convocatorias oficiales argentinas, y que hoy no se
  -- puede buscar en ningun lado.
  requires_arca  boolean not null default false,

  city           text not null default 'Ciudad Autónoma de Buenos Aires',
  province       text not null default 'CABA',

  opens_at       timestamptz,
  closes_at      timestamptz,
  how_to_apply   text,
  requirements   text,
  source_url     text,

  -- Solo se publican las verificadas contra la fuente oficial: un aviso falso
  -- en una pagina con publicidad es motivo de suspension de la cuenta AdSense.
  is_verified    boolean not null default false,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint auditions_dates_ok check (closes_at is null or opens_at is null or closes_at >= opens_at),
  constraint auditions_ages_ok  check (age_max is null or age_min is null or age_max >= age_min)
);

create index auditions_open_idx on public.auditions (closes_at desc) where is_verified;
create index auditions_production_idx on public.auditions (production_id);


-- --- updated_at -----------------------------------------------------------

create trigger schools_touch   before update on public.schools   for each row execute function app.touch_updated_at();
create trigger workshops_touch before update on public.workshops for each row execute function app.touch_updated_at();
create trigger auditions_touch before update on public.auditions for each row execute function app.touch_updated_at();
