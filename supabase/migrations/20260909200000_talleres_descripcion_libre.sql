-- ---------------------------------------------------------------------------
-- Los talleres pasan a tener una descripcion libre en vez de quince campos.
--
-- El motivo es practico: cada escuela informa cosas distintas y en formatos
-- distintos. Quince campos separados obligan a quien carga a pelear con el
-- formulario y dejan la mayoria vacios, que era exactamente lo que pasaba: de
-- once talleres relevados, cuatro tenian dia y horario.
--
-- Con una descripcion libre se pega lo que la escuela informa, completo, y
-- listo.
--
-- SE CONSERVAN SOLO LOS QUE SON FILTRO Y NO SE ESCRIBEN:
--   · kind            -> desplegable. Es lo que separa montaje de lo demas.
--   · enrollment_open -> casilla. Es lo que separa "puedo anotarme" de "no".
--
-- Esos dos sostienen la consulta que define al sitio: montajes con inscripcion
-- abierta. Si tambien fueran texto, esa consulta dejaria de existir.
-- ---------------------------------------------------------------------------

alter table public.workshops
  add column if not exists details text;

comment on column public.workshops.details is
  'Todo lo que informa la escuela, tal como lo informa: horarios, edades, duracion, requisitos, modalidad. Se pega completo y sin parafrasear. Lo que no este acá, esta en source_url.';

-- Los campos que se pliegan dentro de `details`.
alter table public.workshops
  drop column if exists disciplines,
  drop column if exists level,
  drop column if exists age_min,
  drop column if exists age_max,
  drop column if exists weekday,
  drop column if exists time_from,
  drop column if exists duration_weeks,
  drop column if exists starts_on,
  drop column if exists ends_on,
  drop column if exists enrollment_deadline,
  drop column if exists audition_required,
  drop column if exists final_show,
  drop column if exists final_show_venue_id,
  drop column if exists final_show_title,
  drop column if exists contact_email,
  drop column if exists contact_phone;

-- Restricciones que vigilaban campos que ya no existen.
alter table public.workshops drop constraint if exists workshops_dates_ok;
alter table public.workshops drop constraint if exists workshops_ages_ok;
alter table public.workshops drop constraint if exists workshops_show_ok;

-- El indice de montajes ya no puede ordenar por fecha de inicio.
drop index if exists public.workshops_kind_montaje_idx;
create index workshops_kind_montaje_idx
  on public.workshops (enrollment_open)
  where kind = 'montaje';

-- Enumerados que quedaron sin uso al plegar los campos.
drop type if exists app.discipline;
drop type if exists app.skill_level;
