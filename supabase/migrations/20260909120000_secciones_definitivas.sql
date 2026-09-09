-- ---------------------------------------------------------------------------
-- Las siete secciones definitivas.
--
-- El esquema original cubria cuatro. Esta migracion agrega lo que falta:
--   · Formacion en cinco tipos, no cuatro genericos
--   · Salas como destino de contacto, no solo como dato de la cartelera
--   · Productoras como entidad propia
--   · Criticas que pueden ser de una obra, de una sala o de una productora
--   · Audiciones que incluyen representantes buscando talento
--   · Eventos, festivales y convocatorias
--
-- ESCRITA PARA PODER REAPLICARSE. El primer intento fallo a mitad de camino
-- —cambiar el tipo de `articles.section` rompe mientras existan restricciones
-- que comparan esa columna contra el enumerado— y dejo la base a medias. Todo
-- lo de aca es idempotente.
-- ---------------------------------------------------------------------------


-- --- Formacion ------------------------------------------------------------
-- Los cinco tipos que pidio el proyecto. `montaje` sigue siendo el que
-- distingue al sitio: es el unico que termina en funcion.

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'workshop_kind' and e.enumlabel = 'carrera'
  ) then
    alter table public.workshops drop column if exists kind;
    drop type if exists app.workshop_kind cascade;

    create type app.workshop_kind as enum (
      'montaje', 'carrera', 'curso', 'especializacion', 'workshop'
    );

    alter table public.workshops
      add column kind app.workshop_kind not null default 'curso';
  end if;
end $$;

comment on column public.workshops.kind is
  'montaje = termina en funcion. carrera = formacion larga con titulacion. curso = cursada regular. especializacion = foco en una disciplina. workshop = encuentro corto.';

-- Regla editorial: se publica lo que informa la escuela, sin reescribirlo, y
-- siempre con enlace a la fuente. Por eso el enlace deja de ser opcional.
alter table public.workshops alter column source_url set not null;

comment on column public.workshops.source_url is
  'Obligatorio. La ficha reproduce lo que informa la escuela y enlaza a su pagina; no se parafrasea ni se completa con suposiciones.';

create index if not exists workshops_kind_montaje_idx
  on public.workshops (enrollment_open, starts_on)
  where kind = 'montaje';


-- --- Salas: contacto ------------------------------------------------------
-- La seccion existe para que alguien pueda comunicarse con la sala. Sin datos
-- de contacto no cumple su unico proposito.

alter table public.venues
  add column if not exists phone        text,
  add column if not exists email        text,
  add column if not exists socials      jsonb not null default '{}'::jsonb,
  add column if not exists booking_url  text,
  add column if not exists contact_note text;

comment on column public.venues.contact_note is
  'Como conviene contactarla en la practica: horario de boleteria, si responden por WhatsApp, a quien dirigirse por prensa.';


-- --- Productoras ----------------------------------------------------------
-- Eran texto libre en `runs.producer`. Como ahora pueden ser sujeto de una
-- critica, necesitan identidad propia.

create table if not exists public.companies (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  description  text,
  city         text,
  website      text,
  email        text,
  phone        text,
  socials      jsonb not null default '{}'::jsonb,
  logo_path    text,
  founded_year integer,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.runs
  add column if not exists company_id uuid references public.companies (id) on delete set null;

comment on column public.runs.producer is
  'Texto libre, para cuando la productora no amerita ficha propia. Si existe ficha, usar company_id.';

drop trigger if exists companies_touch on public.companies;
create trigger companies_touch
  before update on public.companies
  for each row execute function app.touch_updated_at();


-- --- Secciones editoriales ------------------------------------------------
-- Se suma `blog`: temas libres del ambiente, que no son noticia ni opinion
-- sobre una obra concreta.
--
-- Va ANTES de tocar las restricciones de `articles`: cambiar el tipo de la
-- columna falla mientras exista una restriccion que la compare con el enum.

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'article_section' and e.enumlabel = 'blog'
  ) then
    alter table public.articles drop constraint if exists articles_rating_only_reviews;
    alter table public.articles drop constraint if exists articles_review_tiene_sujeto;

    alter table public.articles alter column section drop default;
    alter table public.articles alter column section type text using section::text;

    drop type if exists app.article_section;

    create type app.article_section as enum (
      'noticias', 'blog', 'opiniones', 'reviews', 'entrevistas'
    );

    alter table public.articles
      alter column section type app.article_section using section::app.article_section;
  end if;
end $$;


-- --- Criticas -------------------------------------------------------------
-- Puntaje en estrellas de 1 a 5, con medias estrellas. Y el sujeto de la
-- critica puede ser una obra, una sala o una productora.

alter table public.articles
  add column if not exists reviewed_venue_id   uuid references public.venues (id) on delete set null,
  add column if not exists reviewed_company_id uuid references public.companies (id) on delete set null;

alter table public.articles drop constraint if exists articles_rating_only_reviews;
alter table public.articles
  add constraint articles_rating_only_reviews check (
    section = 'reviews' or (rating is null and seen_on is null)
  );

-- 1 a 5 en pasos de media estrella. El esquema anterior aceptaba 0 y cualquier
-- decimal, que no es lo que se muestra en pantalla.
alter table public.articles drop constraint if exists articles_rating_check;
alter table public.articles drop constraint if exists articles_rating_estrellas;
alter table public.articles
  add constraint articles_rating_estrellas check (
    rating is null or (rating >= 1 and rating <= 5 and (rating * 2) = floor(rating * 2))
  );

-- Una critica califica algo. Sin sujeto, el puntaje no dice de que habla.
alter table public.articles drop constraint if exists articles_review_tiene_sujeto;
alter table public.articles
  add constraint articles_review_tiene_sujeto check (
    section <> 'reviews'
    or rating is null
    or reviewed_run_id is not null
    or reviewed_venue_id is not null
    or reviewed_company_id is not null
    or related_production_id is not null
  );


-- --- Audiciones: representantes -------------------------------------------
-- No toda convocatoria es para una obra: hay managers y agentes buscando
-- talento sin un montaje concreto detras.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'audition_kind') then
    create type app.audition_kind as enum ('obra', 'representacion', 'ensamble');
  end if;
end $$;

alter table public.auditions
  add column if not exists kind app.audition_kind not null default 'obra',
  add column if not exists contact_name  text,
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

comment on column public.auditions.kind is
  'obra = casting para un montaje. representacion = manager o agente buscando talento. ensamble = coro, swing o cover sin rol asignado.';


-- --- Eventos y convocatorias ----------------------------------------------
-- Festivales, ciclos y encuentros que incluyan musicales. Algunos, ademas,
-- reciben propuestas: eso es la convocatoria, y va en la misma ficha porque es
-- un atributo del evento y no una entidad separada.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'event_kind') then
    create type app.event_kind as enum
      ('festival', 'ciclo', 'encuentro', 'premiacion', 'concurso');
  end if;
end $$;

create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         text not null,
  kind          app.event_kind not null,
  description   text,
  organizer     text,
  venue_id      uuid references public.venues (id) on delete set null,
  city          text not null default 'Ciudad Autónoma de Buenos Aires',
  province      text not null default 'CABA',
  starts_on     date,
  ends_on       date,
  website       text,
  source_url    text not null,
  poster_path   text,

  has_open_call    boolean not null default false,
  call_opens_at    timestamptz,
  call_closes_at   timestamptz,
  how_to_submit    text,
  submission_fee   integer check (submission_fee is null or submission_fee >= 0),
  requirements     text,

  is_verified   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint events_fechas_ok check (ends_on is null or starts_on is null or ends_on >= starts_on),
  constraint events_convocatoria_ok check (
    has_open_call or (call_opens_at is null and call_closes_at is null and how_to_submit is null)
  )
);

create index if not exists events_proximos_idx
  on public.events (starts_on) where is_verified;
create index if not exists events_convocatorias_idx
  on public.events (call_closes_at) where has_open_call and is_verified;

drop trigger if exists events_touch on public.events;
create trigger events_touch
  before update on public.events
  for each row execute function app.touch_updated_at();


-- --- Seguridad de las tablas nuevas ---------------------------------------

alter table public.companies enable row level security;
alter table public.events    enable row level security;

drop policy if exists "lectura publica" on public.companies;
create policy "lectura publica" on public.companies
  for select to anon, authenticated using (true);

drop policy if exists "escritura staff" on public.companies;
create policy "escritura staff" on public.companies
  for all to authenticated
  using (app.es_staff()) with check (app.es_staff());

-- Igual que las audiciones: solo lo verificado sale a la luz. Un festival
-- inventado en una pagina con publicidad es el mismo problema.
drop policy if exists "lectura verificados" on public.events;
create policy "lectura verificados" on public.events
  for select to anon, authenticated using (is_verified);

drop policy if exists "lectura staff" on public.events;
create policy "lectura staff" on public.events
  for select to authenticated using (app.es_staff());

drop policy if exists "escritura staff" on public.events;
create policy "escritura staff" on public.events
  for all to authenticated
  using (app.es_staff()) with check (app.es_staff());
