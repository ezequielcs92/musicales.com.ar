-- ---------------------------------------------------------------------------
-- Fundaciones: esquema auxiliar, enumerados, perfiles y roles.
--
-- El sistema de permisos se construye completo desde el principio aunque al
-- inicio escriba una sola persona: agregarlo despues obliga a reescribir todas
-- las politicas y a migrar las notas ya publicadas.
-- ---------------------------------------------------------------------------

-- Supabase aloja las extensiones en el esquema `extensions`, no en `public`.
create extension if not exists "unaccent" with schema extensions;

-- Funciones auxiliares propias, fuera de `public` para no exponerlas por API.
create schema if not exists app;
revoke all on schema app from anon, authenticated;
grant usage on schema app to anon, authenticated;


-- --- Enumerados -----------------------------------------------------------

-- Roles al modo de WordPress.
create type app.user_role as enum (
  'administrador',
  'editor',
  'autor',
  'colaborador',
  'suscriptor'
);

create type app.article_section as enum (
  'noticias',
  'opiniones',
  'reviews',
  'entrevistas'
);

create type app.article_status as enum (
  'borrador',
  'en_revision',
  'programado',
  'publicado',
  'archivado'
);

create type app.run_status as enum ('anunciada', 'en_cartel', 'finalizada');

create type app.venue_circuit as enum ('comercial', 'oficial', 'independiente');

-- La distincion que ninguna cartelera generalista publica: quien es titular y
-- quien cubre. Es lo que la comunidad del musical realmente busca.
create type app.cover_type as enum ('titular', 'alternate', 'cover', 'swing');

create type app.credit_department as enum (
  'elenco',
  'musical',
  'creativo',
  'tecnico'
);

-- Taller de montaje (termina en funcion) vs. entrenamiento semanal.
create type app.workshop_kind as enum (
  'montaje',
  'entrenamiento',
  'intensivo',
  'clinica'
);

create type app.discipline as enum ('canto', 'danza', 'actuacion', 'integral');

create type app.skill_level as enum ('inicial', 'intermedio', 'avanzado', 'todos');

create type app.vocal_range as enum (
  'soprano',
  'mezzosoprano',
  'contralto',
  'contratenor',
  'tenor',
  'baritono',
  'bajo'
);

create type app.submission_status as enum ('pendiente', 'aprobada', 'rechazada');


-- --- Perfiles -------------------------------------------------------------
-- Espejo de auth.users con el rol y los datos publicos del redactor.
--
-- IMPORTANTE: la fuente de verdad del rol para las politicas es
-- `app_metadata` del JWT, no esta columna. `user_metadata` lo puede editar el
-- propio usuario desde el cliente, asi que un rol guardado ahi es un rol
-- autoasignable. Esta columna existe para mostrarlo y administrarlo; se
-- sincroniza hacia app_metadata desde el servidor.

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  role         app.user_role not null default 'suscriptor',
  display_name text         not null,
  slug         text         unique,
  bio          text,
  avatar_path  text,
  socials      jsonb        not null default '{}'::jsonb,
  created_at   timestamptz  not null default now(),
  updated_at   timestamptz  not null default now()
);

comment on column public.profiles.role is
  'Solo para administracion y visualizacion. Las politicas RLS leen app.rol(), que sale del JWT firmado.';


-- --- Rol efectivo ---------------------------------------------------------
-- Se lee del JWT y nunca de una tabla: evita una consulta extra por politica y,
-- sobre todo, evita recursion (una politica sobre profiles que consulte
-- profiles se llama a si misma).

create or replace function app.rol()
returns app.user_role
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(
      current_setting('request.jwt.claims', true)::jsonb
        -> 'app_metadata' ->> 'role',
      ''
    ),
    'suscriptor'
  )::app.user_role
$$;

create or replace function app.es_staff()
returns boolean
language sql
stable
set search_path = ''
as $$
  select app.rol() in ('editor', 'administrador')
$$;


-- --- unaccent inmutable ---------------------------------------------------
-- `unaccent()` viene marcada STABLE porque depende del diccionario, y una
-- columna generada exige una expresion IMMUTABLE. Este envoltorio fija el
-- diccionario y permite indexar la busqueda sin acentos.

create or replace function app.unaccent(text)
returns text
language sql
immutable
strict
parallel safe
set search_path = ''
as $$
  select extensions.unaccent('extensions.unaccent'::regdictionary, $1)
$$;


-- --- updated_at automatico ------------------------------------------------

create or replace function app.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch
  before update on public.profiles
  for each row execute function app.touch_updated_at();


-- --- Alta automatica de perfil --------------------------------------------
-- Cada usuario nuevo de auth arranca como suscriptor. El ascenso de rol lo
-- hace un administrador desde el panel, nunca el propio usuario.

create or replace function app.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function app.handle_new_user();


-- --- Permisos de las funciones auxiliares ---------------------------------
-- Las politicas RLS las invoca el rol del visitante, asi que necesita poder
-- ejecutarlas. Explicito, para no depender del default de PUBLIC.

grant execute on function app.rol() to anon, authenticated;
grant execute on function app.es_staff() to anon, authenticated;
grant execute on function app.unaccent(text) to anon, authenticated;
