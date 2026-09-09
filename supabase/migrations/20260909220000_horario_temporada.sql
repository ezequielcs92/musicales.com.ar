-- ---------------------------------------------------------------------------
-- El horario de una temporada, en palabras.
--
-- `showtimes` guarda funciones concretas con fecha y hora, y es lo que va a
-- alimentar "qué hay hoy". Pero lo que informa una cartelera es "sábados y
-- domingos a las 17", que no son fechas: generarlas a partir de esa frase
-- sería inventar funciones que quizá no existan —feriados, suspensiones,
-- semanas sin función—.
--
-- Hasta tener las fechas reales de cada sala, el horario va como texto, tal
-- como lo informa la fuente.
-- ---------------------------------------------------------------------------

alter table public.runs
  add column if not exists schedule_note text;

comment on column public.runs.schedule_note is
  'Horario tal como lo informa la fuente ("Sábados y domingos 17:00"). Provisorio: cuando existan las funciones concretas en `showtimes`, esas mandan.';
