-- ---------------------------------------------------------------------------
-- Catalogo: la obra, la sala, la temporada, la funcion y el credito.
--
-- El corazon del sitio es que una obra se monta en una sala durante una
-- temporada, que esa temporada tiene funciones concretas, y que un interprete
-- hace un rol que ademas alguien cubre. Ningun blog modela eso.
-- ---------------------------------------------------------------------------

-- --- Salas ----------------------------------------------------------------

create table public.venues (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  name              text not null,
  address           text,
  neighborhood      text,
  city              text not null default 'Ciudad Autónoma de Buenos Aires',
  province          text not null default 'CABA',
  lat               numeric(9, 6),
  lng               numeric(9, 6),
  seats             integer check (seats is null or seats > 0),
  circuit           app.venue_circuit,
  website           text,
  wheelchair_access boolean,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index venues_city_idx on public.venues (province, city);


-- --- Personas -------------------------------------------------------------

create table public.people (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  bio         text,
  photo_path  text,
  socials     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);


-- --- Obras ----------------------------------------------------------------

create table public.productions (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  title           text not null,
  original_title  text,
  synopsis        text,
  poster_path     text,
  composer        text,
  lyricist        text,
  book_author     text,
  translator      text,
  -- Distingue el musical argentino original del titulo licenciado. Es una
  -- division que le importa mucho a este publico y que nadie filtra hoy.
  is_original_arg boolean not null default false,
  licensor        text,
  duration_min    integer check (duration_min is null or duration_min > 0),
  has_intermission boolean,
  age_rating      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index productions_original_idx on public.productions (is_original_arg);


-- --- Temporadas: obra x sala x periodo ------------------------------------

create table public.runs (
  id            uuid primary key default gen_random_uuid(),
  production_id uuid not null references public.productions (id) on delete cascade,
  venue_id      uuid not null references public.venues (id) on delete restrict,
  status        app.run_status not null default 'anunciada',
  opens_on      date not null,
  closes_on     date,
  ticket_url    text,
  ticketing     text,
  price_min     integer check (price_min is null or price_min >= 0),
  price_max     integer check (price_max is null or price_max >= 0),
  producer      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint runs_dates_ok check (closes_on is null or closes_on >= opens_on),
  constraint runs_prices_ok check (
    price_min is null or price_max is null or price_max >= price_min
  )
);

create index runs_status_idx on public.runs (status, opens_on desc);
create index runs_production_idx on public.runs (production_id);
create index runs_venue_idx on public.runs (venue_id);


-- --- Funciones ------------------------------------------------------------
-- Es lo que alimenta "que hay hoy", la pagina de mayor intencion del sitio.

create table public.showtimes (
  id           uuid primary key default gen_random_uuid(),
  run_id       uuid not null references public.runs (id) on delete cascade,
  starts_at    timestamptz not null,
  is_cancelled boolean not null default false,
  note         text,
  created_at   timestamptz not null default now(),

  unique (run_id, starts_at)
);

-- Indice parcial: las consultas de cartelera solo miran funciones vigentes.
create index showtimes_upcoming_idx
  on public.showtimes (starts_at)
  where not is_cancelled;


-- --- Creditos -------------------------------------------------------------

create table public.credits (
  id             uuid primary key default gen_random_uuid(),
  run_id         uuid not null references public.runs (id) on delete cascade,
  person_id      uuid not null references public.people (id) on delete cascade,
  department     app.credit_department not null,
  role_name      text not null,
  character_name text,
  cover_type     app.cover_type not null default 'titular',
  billing_order  integer not null default 999,
  created_at     timestamptz not null default now(),

  unique (run_id, person_id, role_name, cover_type)
);

create index credits_run_idx on public.credits (run_id, department, billing_order);
create index credits_person_idx on public.credits (person_id);

comment on column public.credits.cover_type is
  'Titular, alternate, cover o swing. Es informacion que la comunidad del musical busca activamente y que ninguna cartelera generalista publica.';


-- --- updated_at -----------------------------------------------------------

create trigger venues_touch      before update on public.venues      for each row execute function app.touch_updated_at();
create trigger people_touch      before update on public.people      for each row execute function app.touch_updated_at();
create trigger productions_touch before update on public.productions for each row execute function app.touch_updated_at();
create trigger runs_touch        before update on public.runs        for each row execute function app.touch_updated_at();
