/**
 * Carga salas desde `data/relevamiento/salas-*.json`.
 *
 *   node scripts/cargar-salas.mjs data/relevamiento/salas-caba-2026-09-09.json
 *   node scripts/cargar-salas.mjs <archivo> --aplicar
 *
 * Sin `--aplicar` no escribe: muestra qué haría.
 *
 * La fuente son los datos abiertos del Gobierno de la Ciudad, reutilizables
 * con atribución. Eso hace que estas fichas nazcan con mejor procedencia que
 * un relevamiento manual: no hay que verificarlas una por una.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [archivo, ...flags] = process.argv.slice(2);
const aplicar = flags.includes("--aplicar");

if (!archivo) {
  console.error("Uso: node scripts/cargar-salas.mjs <archivo.json> [--aplicar]");
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

console.log(`\nFuente: ${datos.fuente.nombre}`);
console.log(`${datos.salas.length} salas`);
console.log(aplicar ? "MODO ESCRITURA\n" : "SIMULACION — no escribe. Agregá --aplicar.\n");

// El circuito no viene en el dataset y no se puede inferir con seriedad:
// una sala de 1.100 butacas en Corrientes es comercial, pero el corte por
// tamaño falla en los dos extremos. Queda nulo hasta que alguien lo cargue.
const filas = datos.salas.map((s) => ({
  slug: s.slug,
  name: s.name,
  address: s.address,
  neighborhood: s.neighborhood,
  city: s.city,
  province: s.province,
  lat: s.lat,
  lng: s.lng,
  seats: s.seats,
  phone: s.phone,
  email: s.email,
  website: s.website,
  socials: s.socials ?? {},
}));

if (!aplicar) {
  for (const f of filas.slice(0, 5)) {
    console.log(`  ${f.name.slice(0, 34).padEnd(36)} ${(f.address ?? "").slice(0, 30)}`);
  }
  console.log(`  … y ${filas.length - 5} más`);
  const con = (k) => filas.filter((f) => f[k]).length;
  console.log(`\n  con teléfono ${con("phone")} · correo ${con("email")} · web ${con("website")} · capacidad ${con("seats")}`);
  process.exit(0);
}

// De a tandas: 310 filas en un solo upsert es una petición grande y un fallo
// deja todo sin saber qué entró.
let ok = 0;
const problemas = [];
const TANDA = 50;

for (let i = 0; i < filas.length; i += TANDA) {
  const tanda = filas.slice(i, i + TANDA);
  const { error } = await admin.from("venues").upsert(tanda, { onConflict: "slug" });
  if (error) problemas.push(`tanda ${i / TANDA + 1}: ${error.message}`);
  else ok += tanda.length;
}

console.log(`${ok}/${filas.length} salas cargadas`);
if (problemas.length) {
  console.log(`\n${problemas.length} problema(s):`);
  for (const p of problemas) console.log(`  · ${p}`);
}
process.exit(problemas.length ? 1 : 0);
