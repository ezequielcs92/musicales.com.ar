-- ---------------------------------------------------------------------------
-- El sitio no publica precios. Nunca.
--
-- Decision editorial. Los motivos, para que nadie la revierta sin pensarla:
--
--   · Los precios cambian sin aviso y un precio viejo es peor que ningun
--     precio: promete algo que la sala o la escuela no va a cumplir.
--   · Publicarlos nos vuelve responsables de un dato que no controlamos.
--   · Comparar aranceles entre escuelas las pone en una posicion que no
--     pidieron, y este sitio depende de que quieran darnos informacion.
--
-- Se quitan las columnas en vez de dejar de mostrarlas: una columna que existe
-- termina apareciendo en pantalla tarde o temprano. Lo que ocupa su lugar es
-- mejor, ademas: el enlace a la fuente, donde el precio siempre esta al dia.
-- ---------------------------------------------------------------------------

-- Aranceles de formacion.
alter table public.workshops drop column if exists fee_ars;
alter table public.workshops drop column if exists fee_period;

-- Entradas.
alter table public.runs drop constraint if exists runs_prices_ok;
alter table public.runs drop column if exists price_min;
alter table public.runs drop column if exists price_max;

comment on column public.runs.ticket_url is
  'A donde comprar. Reemplaza al precio: la boleteria siempre tiene el valor vigente y nosotros no.';

-- Aranceles de convocatoria.
alter table public.events drop column if exists submission_fee;

comment on column public.events.how_to_submit is
  'Como enviar la propuesta. Si la convocatoria tiene arancel, se dice que lo tiene y se enlaza a las bases, sin transcribir el monto.';
