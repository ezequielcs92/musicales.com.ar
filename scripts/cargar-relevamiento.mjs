/**
 * Carga un relevamiento de `data/relevamiento/*.json` a la base.
 *
 *   node scripts/cargar-relevamiento.mjs data/relevamiento/talleres-2026-09-09.json
 *   node scripts/cargar-relevamiento.mjs <archivo> --aplicar
 *
 * Sin `--aplicar` no escribe nada: muestra qué haría. Es a propósito, porque
 * un relevamiento sin verificar no debería entrar a la base por accidente.
 *
 * Todo entra con `enrollment_open` según lo relevado pero SIN publicar como
 * verificado: `verified_at` queda nulo hasta que una persona lo confirme.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [archivo, ...flags] = process.argv.slice(2);
const aplicar = flags.includes("--aplicar");

if (!archivo) {
  console.error("Uso: node scripts/cargar-relevamiento.mjs <archivo.json> [--aplicar]");
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
    .slice(0, 80);

console.log(`\nRelevamiento del ${datos.relevamiento.fecha} — ${datos.relevamiento.alcance}`);
console.log(`${datos.escuelas.length} escuelas, ${datos.talleres.length} talleres`);
console.log(aplicar ? "MODO ESCRITURA\n" : "SIMULACION — no se escribe nada. Agregá --aplicar.\n");

const idPorSlug = new Map();
let escuelasOk = 0;
let talleresOk = 0;
const problemas = [];

// --- Escuelas -------------------------------------------------------------
for (const e of datos.escuelas) {
  const fila = {
    slug: e.slug,
    name: e.name,
    city: e.city,
    neighborhood: e.neighborhood ?? null,
    province: e.province,
    address: e.address ?? null,
    website: e.website ?? null,
    socials: e.socials ?? {},
  };

  if (!aplicar) {
    console.log(`  escuela  ${e.slug.padEnd(22)} ${e.name}`);
    idPorSlug.set(e.slug, "simulado");
    escuelasOk++;
    continue;
  }

  const { data, error } = await admin
    .from("schools")
    .upsert(fila, { onConflict: "slug" })
    .select("id")
    .single();

  if (error) {
    problemas.push(`escuela ${e.slug}: ${error.message}`);
    continue;
  }
  idPorSlug.set(e.slug, data.id);
  escuelasOk++;
}

// --- Talleres -------------------------------------------------------------
for (const t of datos.talleres) {
  const escuela = datos.escuelas.find((e) => e.slug === t.school_slug);
  const school_id = idPorSlug.get(t.school_slug);

  if (!school_id) {
    problemas.push(`taller "${t.title}": no se cargó su escuela`);
    continue;
  }

  // La base exige fuente. Si el taller no trae la suya, hereda la de la
  // escuela: siempre tiene que haber a dónde ir a verificar.
  const source_url = t.source_url ?? escuela?.fuente ?? escuela?.website;
  if (!source_url) {
    problemas.push(`taller "${t.title}": sin fuente, no se puede cargar`);
    continue;
  }

  const fila = {
    slug: aSlug(`${t.school_slug}-${t.title}`),
    school_id,
    title: t.title,
    kind: t.kind,
    disciplines: t.disciplines ?? [],
    level: t.level ?? "todos",
    age_min: t.age_min ?? null,
    age_max: t.age_max ?? null,
    weekday: t.weekday ?? null,
    time_from: t.time_from ?? null,
    final_show: t.final_show ?? false,
    audition_required: t.audition_required ?? false,
    fee_ars: t.fee_ars ?? null,
    fee_period: t.fee_period ?? null,
    enrollment_open: t.enrollment_open ?? false,
    source_url,
    // Nulo a propósito: relevado no es verificado. Lo completa una persona.
    verified_at: null,
  };

  if (!aplicar) {
    const faltan = t.faltan?.length ? `  falta: ${t.faltan.join(", ")}` : "";
    console.log(`  taller   ${fila.kind.padEnd(16)} ${t.title}${faltan}`);
    talleresOk++;
    continue;
  }

  const { error } = await admin
    .from("workshops")
    .upsert(fila, { onConflict: "slug" });

  if (error) {
    problemas.push(`taller "${t.title}": ${error.message}`);
    continue;
  }
  talleresOk++;
}

console.log(`\n${escuelasOk}/${datos.escuelas.length} escuelas · ${talleresOk}/${datos.talleres.length} talleres`);

if (problemas.length) {
  console.log(`\n${problemas.length} problema(s):`);
  for (const p of problemas) console.log(`  · ${p}`);
}

if (aplicar) {
  console.log("\nTodo quedó SIN verificar. Revisá cada ficha en el panel antes de publicarla.");
}

process.exit(problemas.length ? 1 : 0);
