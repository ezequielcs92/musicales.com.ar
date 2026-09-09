-- ---------------------------------------------------------------------------
-- Un solo campo de texto libre, no dos.
--
-- La migracion anterior agrego `details` sin advertir que `description` ya
-- existia desde el esquema original. Dos areas de texto en el mismo formulario
-- obligan a quien carga a decidir cual usa, y la respuesta correcta es que no
-- deberia tener que decidirlo.
--
-- Se conserva `description`, que es el nombre natural, con el contenido de
-- `details` si alguno lo tuviera.
-- ---------------------------------------------------------------------------

update public.workshops
   set description = coalesce(nullif(description, ''), details)
 where details is not null;

alter table public.workshops drop column if exists details;

comment on column public.workshops.description is
  'Todo lo que informa la escuela, tal como lo informa: horarios, edades, duracion, requisitos, modalidad. Se pega completo y sin parafrasear. Lo que no este acá, esta en source_url.';
