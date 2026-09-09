/**
 * Carga la cartelera desde `data/relevamiento/cartelera-*.json`.
 *
 *   node scripts/cargar-cartelera.mjs data/relevamiento/cartelera-2026-09-09.json
 *   node scripts/cargar-cartelera.mjs <archivo> --aplicar
 *
 * Sin `--aplicar` no escribe.
 *
 * Crea la obra (`productions`) y su temporada (`runs`) apuntando a la sala. Si
 * la sala no está en la base —las 310 vienen de datos abiertos de CABA, y hay
 * salas fuera de ese padrón— se crea con lo mínimo y queda para completar.
 *
 * No carga funciones una por una: el horario relevado dice "sábados y domingos
 * a las 17", no fechas concretas, y generar fechas a partir de eso sería
 * inventar. Va como descripción de la temporada.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [archivo, ...flags] = process.argv.slice(2);
const aplicar = flags.includes("--aplicar");

if (!archivo) {
  console.error("Uso: node scripts/cargar-cartelera.mjs <archivo.json> [--aplicar]");
  process.exit(1);
}

const env = {};
for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const datos = JSON.parse(readFileSync(archivo, "utf8"));

const aSlug = (t) =>
  t
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);

console.log(`\nFuente: ${datos.relevamiento.fuente}`);
console.log(`${datos.obras.length} obras confirmadas como teatro musical`);
console.log(`${datos.a_revisar.length} a revisar · ${datos.descartadas.length} descartadas`);
console.log(aplicar ? "MODO ESCRITURA\n" : "SIMULACION — no escribe. Agregá --aplicar.\n");

const problemas = [];
let ok = 0;

for (const o of datos.obras) {
  if (!o.confirmado_musical) {
    problemas.push(`"${o.title}": sin confirmar como teatro musical, se saltea`);
    continue;
  }

  if (!aplicar) {
    console.log(`  ${o.title}`);
    console.log(`    ${o.sala_nombre} · ${o.funciones}`);
    ok++;
    continue;
  }

  // --- Sala ---------------------------------------------------------------
  // Se busca por nombre porque el slug de datos abiertos no siempre coincide
  // con como la nombra la cartelera.
  const { data: encontrada } = await admin
    .from("venues")
    .select("id")
    .ilike("name", o.sala_nombre)
    .maybeSingle();

  let venue_id = encontrada?.id;

  if (!venue_id) {
    const { data: creada, error } = await admin
      .from("venues")
      .upsert(
        {
          slug: aSlug(o.sala_nombre),
          name: o.sala_nombre,
          address: o.sala_direccion ?? null,
        },
        { onConflict: "slug" },
      )
      .select("id")
      .single();
    if (error) {
      problemas.push(`sala "${o.sala_nombre}": ${error.message}`);
      continue;
    }
    venue_id = creada.id;
  }

  // --- Obra ---------------------------------------------------------------
  const { data: obra, error: eObra } = await admin
    .from("productions")
    .upsert(
      {
        slug: o.slug,
        title: o.title,
        // La sinopsis es de la fuente y no se copia. Lo que se guarda son los
        // datos de hecho y el enlace para leerla allá.
        synopsis: null,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();

  if (eObra) {
    problemas.push(`obra "${o.title}": ${eObra.message}`);
    continue;
  }

  // --- Temporada ----------------------------------------------------------
  const { data: existente } = await admin
    .from("runs")
    .select("id")
    .eq("production_id", obra.id)
    .eq("venue_id", venue_id)
    .maybeSingle();

  const temporada = {
    production_id: obra.id,
    venue_id,
    status: "en_cartel",
    opens_on: o.opens_on ?? datos.relevamiento.fecha,
    closes_on: o.closes_on ?? null,
    ticket_url: o.ticket_url ?? o.source_url,
    producer: o.director ?? null,
    schedule_note: o.funciones ?? null,
  };

  const { error: eRun } = existente
    ? await admin.from("runs").update(temporada).eq("id", existente.id)
    : await admin.from("runs").insert(temporada);

  if (eRun) {
    problemas.push(`temporada "${o.title}": ${eRun.message}`);
    continue;
  }
  ok++;
}

console.log(`\n${ok}/${datos.obras.length} obras cargadas`);
if (problemas.length) {
  console.log(`\n${problemas.length} problema(s):`);
  for (const p of problemas) console.log(`  · ${p}`);
}
if (aplicar) {
  console.log("\nNinguna verificada con la sala. Revisar antes de darlas por firmes.");
}
process.exit(problemas.length ? 1 : 0);
