-- ---------------------------------------------------------------------------
-- Seguridad a nivel de fila.
--
-- La seguridad vive en la base, no en la aplicacion: aunque alguien llame a la
-- API de Supabase directamente con la clave publica, estas politicas se aplican
-- igual. El codigo de la app no es la ultima linea de defensa.
-- ---------------------------------------------------------------------------

alter table public.profiles     enable row level security;
alter table public.venues       enable row level security;
alter table public.people       enable row level security;
alter table public.productions  enable row level security;
alter table public.runs         enable row level security;
alter table public.showtimes    enable row level security;
alter table public.credits      enable row level security;
alter table public.schools      enable row level security;
alter table public.workshops    enable row level security;
alter table public.auditions    enable row level security;
alter table public.tags         enable row level security;
alter table public.articles     enable row level security;
alter table public.article_tags enable row level security;
alter table public.submissions  enable row level security;
alter table public.audit_log    enable row level security;


-- --- Catalogo -------------------------------------------------------------
-- Informacion publica por naturaleza: cualquiera la lee, solo el staff escribe.

do $$
declare t text;
begin
  foreach t in array array[
    'venues', 'people', 'productions', 'runs', 'showtimes',
    'credits', 'schools', 'workshops', 'tags', 'article_tags'
  ]
  loop
    execute format($f$
      create policy "lectura publica" on public.%I
        for select to anon, authenticated using (true);
    $f$, t);

    execute format($f$
      create policy "escritura staff" on public.%I
        for all to authenticated
        using (app.es_staff()) with check (app.es_staff());
    $f$, t);
  end loop;
end $$;


-- --- Audiciones -----------------------------------------------------------
-- Solo las verificadas contra la fuente oficial salen a la luz. Un aviso de
-- casting falso en una pagina con publicidad es motivo de suspension de AdSense.

create policy "lectura verificadas" on public.auditions
  for select to anon, authenticated
  using (is_verified);

create policy "lectura staff" on public.auditions
  for select to authenticated
  using (app.es_staff());

create policy "escritura staff" on public.auditions
  for all to authenticated
  using (app.es_staff()) with check (app.es_staff());


-- --- Perfiles -------------------------------------------------------------

-- Las firmas de las notas son publicas; los suscriptores no.
create policy "lectura de firmas" on public.profiles
  for select to anon, authenticated
  using (role <> 'suscriptor');

create policy "lectura del propio perfil" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "lectura total del staff" on public.profiles
  for select to authenticated
  using (app.es_staff());

-- Cada quien edita su perfil. El cambio de rol lo bloquea un disparador:
-- RLS no puede restringir por columna.
create policy "edicion del propio perfil" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "administracion de perfiles" on public.profiles
  for all to authenticated
  using (app.rol() = 'administrador')
  with check (app.rol() = 'administrador');


-- --- Notas ----------------------------------------------------------------

create policy "lectura publica" on public.articles
  for select to anon, authenticated
  using (status = 'publicado' and published_at <= now());

-- Cada quien ve sus propios borradores; editor y administrador ven todo.
create policy "lectura interna" on public.articles
  for select to authenticated
  using (author_id = (select auth.uid()) or app.es_staff());

-- Se escribe siempre a nombre propio: nadie publica firmando a otro.
create policy "alta propia" on public.articles
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and app.rol() in ('colaborador', 'autor', 'editor', 'administrador')
  );

-- El colaborador pierde la nota una vez enviada a revision; el autor maneja las
-- suyas en cualquier estado; el staff, todas.
create policy "edicion" on public.articles
  for update to authenticated
  using (
    (author_id = (select auth.uid()) and app.rol() = 'colaborador' and status = 'borrador')
    or (author_id = (select auth.uid()) and app.rol() = 'autor')
    or app.es_staff()
  )
  with check (
    (author_id = (select auth.uid()) and app.rol() in ('colaborador', 'autor'))
    or app.es_staff()
  );

create policy "baja staff" on public.articles
  for delete to authenticated
  using (app.es_staff());


-- --- Altas de la comunidad ------------------------------------------------
-- Cualquiera puede proponer un taller o una audicion; nadie ve la bandeja
-- salvo el staff, y nada se publica sin moderacion.
--
-- Pendiente en la aplicacion: limite de envios por IP y verificacion de humano.
-- Un formulario anonimo abierto es un iman de spam.

create policy "alta publica" on public.submissions
  for insert to anon, authenticated
  with check (true);

create policy "moderacion staff" on public.submissions
  for all to authenticated
  using (app.es_staff()) with check (app.es_staff());


-- --- Auditoria ------------------------------------------------------------
-- Se lee, no se escribe a mano: lo escriben los disparadores.

create policy "lectura staff" on public.audit_log
  for select to authenticated
  using (app.es_staff());


-- ---------------------------------------------------------------------------
-- Reglas que RLS no puede expresar
--
-- "Un colaborador no publica" es una restriccion sobre la TRANSICION de estado,
-- no sobre la fila: RLS mira el resultado, no de donde viene. Lo mismo el
-- cambio de rol, que es una restriccion sobre una columna. Van en disparadores.
-- ---------------------------------------------------------------------------

create or replace function app.articles_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  estado_previo public.articles.status%type := null;
begin
  if tg_op = 'UPDATE' then
    estado_previo := old.status;
  end if;

  if app.rol() = 'colaborador' and new.status not in ('borrador', 'en_revision') then
    raise exception
      'Un colaborador no puede publicar. Enviá la nota a revisión.'
      using errcode = '42501';
  end if;

  if new.status = 'publicado' and estado_previo is distinct from 'publicado' then
    new.published_at := coalesce(new.published_at, now());
    new.published_by := (select auth.uid());

    insert into public.audit_log (actor_id, action, entity, entity_id, detail)
    values (
      (select auth.uid()), 'publicar', 'articles', new.id,
      jsonb_build_object('slug', new.slug, 'section', new.section, 'title', new.title)
    );
  end if;

  return new;
end;
$$;

create trigger articles_guard
  before insert or update on public.articles
  for each row execute function app.articles_guard();


create or replace function app.profiles_role_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and app.rol() <> 'administrador' then
    raise exception
      'Solo un administrador puede cambiar roles.'
      using errcode = '42501';
  end if;

  if new.role is distinct from old.role then
    insert into public.audit_log (actor_id, action, entity, entity_id, detail)
    values (
      (select auth.uid()), 'cambiar_rol', 'profiles', new.id,
      jsonb_build_object('de', old.role, 'a', new.role)
    );
  end if;

  return new;
end;
$$;

create trigger profiles_role_guard
  before update on public.profiles
  for each row execute function app.profiles_role_guard();
