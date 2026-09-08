-- ---------------------------------------------------------------------------
-- Editorial: notas, etiquetas, altas de la comunidad y registro de auditoria.
-- ---------------------------------------------------------------------------

create table public.tags (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       text not null,
  created_at timestamptz not null default now()
);


create table public.articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  section       app.article_section not null,
  status        app.article_status not null default 'borrador',

  title         text not null,
  dek           text,
  body_mdx      text not null default '',

  author_id     uuid not null references public.profiles (id) on delete restrict,
  published_by  uuid references public.profiles (id) on delete set null,

  hero_path     text,
  hero_credit   text,

  -- Solo en reviews. Una critica es de una funcion concreta, no de la obra en
  -- abstracto: `seen_on` es la convencion que distingue a un critico serio.
  rating        numeric(2, 1) check (rating is null or (rating >= 0 and rating <= 5)),
  seen_on       date,
  reviewed_run_id uuid references public.runs (id) on delete set null,

  related_production_id uuid references public.productions (id) on delete set null,

  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Publicado implica fecha de publicacion, siempre.
  constraint articles_published_needs_date check (
    status <> 'publicado' or published_at is not null
  ),
  -- Puntaje y fecha de funcion solo tienen sentido en una critica.
  constraint articles_rating_only_reviews check (
    section = 'reviews' or (rating is null and seen_on is null)
  )
);

create index articles_live_idx
  on public.articles (section, published_at desc)
  where status = 'publicado';

create index articles_author_idx on public.articles (author_id, status);
create index articles_production_idx on public.articles (related_production_id);

-- Busqueda sin acentos: "critica" tiene que encontrar "crítica".
alter table public.articles
  add column search_vec tsvector
  generated always as (
    setweight(to_tsvector('spanish', app.unaccent(coalesce(title, ''))), 'A') ||
    setweight(to_tsvector('spanish', app.unaccent(coalesce(dek, ''))), 'B') ||
    setweight(to_tsvector('spanish', app.unaccent(coalesce(body_mdx, ''))), 'C')
  ) stored;

create index articles_search_idx on public.articles using gin (search_vec);


create table public.article_tags (
  article_id uuid not null references public.articles (id) on delete cascade,
  tag_id     uuid not null references public.tags (id) on delete cascade,
  primary key (article_id, tag_id)
);

create index article_tags_tag_idx on public.article_tags (tag_id);


-- --- Altas de la comunidad ------------------------------------------------
-- Escuelas y productoras cargan sus talleres y audiciones desde el sitio.
-- Nada se publica sin moderacion previa.

create table public.submissions (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null check (kind in ('taller', 'audicion')),
  status       app.submission_status not null default 'pendiente',
  payload      jsonb not null,
  contact_name  text not null,
  contact_email text not null,
  notes        text,
  reviewed_by  uuid references public.profiles (id) on delete set null,
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now()
);

create index submissions_pending_idx on public.submissions (created_at desc) where status = 'pendiente';


-- --- Auditoria ------------------------------------------------------------
-- Quien publico que y cuando. Es lo que hace utilizable una redaccion con
-- varias manos.

create table public.audit_log (
  id         bigserial primary key,
  actor_id   uuid references public.profiles (id) on delete set null,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_log_entity_idx on public.audit_log (entity, entity_id, created_at desc);


create trigger articles_touch before update on public.articles for each row execute function app.touch_updated_at();
