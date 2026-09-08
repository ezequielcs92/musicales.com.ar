/**
 * Prueba las politicas RLS con usuarios reales de cada rol.
 *
 * Crea usuarios temporales, ejecuta las operaciones que cada rol deberia y no
 * deberia poder hacer, y limpia todo al final. No imprime ninguna credencial.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = {};
for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(URL_, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SELLO = Date.now();
const CLAVE = `Pr!${SELLO}aA9`;
const ROLES = ["administrador", "editor", "autor", "colaborador"];

const pruebas = [];
const chequear = (nombre, ok, detalle = "") =>
  pruebas.push({ nombre, ok, detalle });

/** Crea el usuario, le pone el rol en app_metadata e inicia sesion. */
async function usuario(rol) {
  const email = `prueba.${rol}.${SELLO}@musicales.test`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: CLAVE,
    email_confirm: true,
    app_metadata: { role: rol },
  });
  if (error) throw new Error(`creando ${rol}: ${error.message}`);

  const cli = createClient(URL_, ANON, { auth: { persistSession: false } });
  const { error: e2 } = await cli.auth.signInWithPassword({ email, password: CLAVE });
  if (e2) throw new Error(`ingresando ${rol}: ${e2.message}`);

  return { id: data.user.id, cli, rol };
}

const creados = [];
let ok = true;

try {
  for (const r of ROLES) creados.push(await usuario(r));
  const U = Object.fromEntries(creados.map((u) => [u.rol, u]));

  // El disparador de auth debe haber creado el perfil solo.
  const { data: perfiles } = await admin
    .from("profiles")
    .select("id")
    .in("id", creados.map((u) => u.id));
  chequear(
    "el alta de usuario crea el perfil automaticamente",
    perfiles?.length === 4,
    `${perfiles?.length ?? 0}/4 perfiles`,
  );

  // --- El colaborador escribe un borrador -------------------------------
  const borrador = {
    slug: `borrador-${SELLO}`,
    section: "noticias",
    title: "Borrador de prueba",
    author_id: U.colaborador.id,
  };
  const r1 = await U.colaborador.cli.from("articles").insert(borrador).select("id").single();
  chequear("el colaborador puede crear un borrador", !r1.error, r1.error?.message ?? "");
  const idBorrador = r1.data?.id;

  // --- LA PRUEBA CENTRAL: el colaborador NO publica ---------------------
  if (idBorrador) {
    const r2 = await U.colaborador.cli
      .from("articles")
      .update({ status: "publicado" })
      .eq("id", idBorrador);
    chequear(
      "EL COLABORADOR NO PUEDE PUBLICAR",
      !!r2.error,
      r2.error ? r2.error.message.slice(0, 70) : "!! LO DEJO PUBLICAR",
    );

    const r3 = await U.colaborador.cli
      .from("articles")
      .update({ status: "en_revision" })
      .eq("id", idBorrador);
    chequear("el colaborador si puede mandar a revision", !r3.error, r3.error?.message ?? "");

    // Ya en revision, pierde la nota.
    const r4 = await U.colaborador.cli
      .from("articles")
      .update({ title: "Editada tarde" })
      .eq("id", idBorrador)
      .select("id");
    chequear(
      "una vez en revision, el colaborador ya no la edita",
      !r4.error && r4.data.length === 0,
      r4.error ? r4.error.message.slice(0, 50) : `${r4.data?.length} filas afectadas`,
    );
  }

  // --- El autor publica lo suyo -----------------------------------------
  const r5 = await U.autor.cli
    .from("articles")
    .insert({
      slug: `nota-autor-${SELLO}`,
      section: "noticias",
      title: "Nota del autor",
      author_id: U.autor.id,
    })
    .select("id")
    .single();
  chequear("el autor puede crear", !r5.error, r5.error?.message ?? "");
  const idAutor = r5.data?.id;

  if (idAutor) {
    const r6 = await U.autor.cli
      .from("articles")
      .update({ status: "publicado" })
      .eq("id", idAutor)
      .select("published_at, published_by")
      .single();
    chequear(
      "el autor publica lo propio y se sella published_at/by",
      !r6.error && !!r6.data?.published_at && r6.data?.published_by === U.autor.id,
      r6.error?.message ?? "sellado correcto",
    );

    // El disparador tiene que haber dejado rastro.
    const { data: log } = await admin
      .from("audit_log")
      .select("action, entity_id")
      .eq("entity_id", idAutor);
    chequear(
      "publicar deja registro en audit_log",
      log?.some((l) => l.action === "publicar"),
      `${log?.length ?? 0} registros`,
    );
  }

  // --- Firmar a nombre ajeno --------------------------------------------
  const r7 = await U.autor.cli.from("articles").insert({
    slug: `usurpada-${SELLO}`,
    section: "noticias",
    title: "Firmada por otro",
    author_id: U.colaborador.id,
  });
  chequear("nadie puede firmar una nota a nombre de otro", !!r7.error, r7.error ? "rechazado" : "!! LO DEJO");

  // --- El autor no toca notas ajenas ------------------------------------
  if (idBorrador) {
    const r8 = await U.autor.cli
      .from("articles")
      .update({ title: "Intruso" })
      .eq("id", idBorrador)
      .select("id");
    chequear(
      "el autor no puede editar notas ajenas",
      !r8.error && r8.data.length === 0,
      `${r8.data?.length ?? "error"} filas afectadas`,
    );
  }

  // --- El editor si ------------------------------------------------------
  if (idBorrador) {
    const r9 = await U.editor.cli
      .from("articles")
      .update({ title: "Corregida por el editor" })
      .eq("id", idBorrador)
      .select("id");
    chequear("el editor si puede editar notas ajenas", !r9.error && r9.data.length === 1, r9.error?.message ?? "");
  }

  // --- Visibilidad publica ----------------------------------------------
  const publico = createClient(URL_, ANON, { auth: { persistSession: false } });
  const r10 = await publico.from("articles").select("id, status");
  const soloPublicadas =
    !r10.error && r10.data.every((a) => a.status === "publicado") && r10.data.length >= 1;
  chequear(
    "el publico solo ve notas publicadas",
    soloPublicadas,
    r10.error?.message ?? `${r10.data?.length} visibles, ninguna en borrador`,
  );

  const r11 = await publico.from("audit_log").select("id");
  chequear(
    "el publico NO ve audit_log (ahora que tiene filas)",
    !r11.error && r11.data.length === 0,
    r11.error ? r11.error.message.slice(0, 40) : `${r11.data.length} filas`,
  );

  // --- Escalada de privilegios ------------------------------------------
  const r12 = await U.colaborador.cli
    .from("profiles")
    .update({ role: "administrador" })
    .eq("id", U.colaborador.id);
  chequear(
    "NADIE PUEDE ASCENDERSE SOLO",
    !!r12.error,
    r12.error ? r12.error.message.slice(0, 70) : "!! SE AUTOASCENDIO",
  );

  // --- Catalogo ----------------------------------------------------------
  const r13 = await U.autor.cli
    .from("venues")
    .insert({ slug: `sala-${SELLO}`, name: "Sala trucha" });
  chequear("el autor no puede tocar el catalogo", !!r13.error, r13.error ? "rechazado" : "!! LO DEJO");

  const r14 = await U.editor.cli
    .from("venues")
    .insert({ slug: `sala-ed-${SELLO}`, name: "Sala del editor" })
    .select("id")
    .single();
  chequear("el editor si administra el catalogo", !r14.error, r14.error?.message ?? "");
  if (r14.data?.id) await admin.from("venues").delete().eq("id", r14.data.id);
} catch (e) {
  ok = false;
  console.error("\nError durante las pruebas:", e.message);
} finally {
  // Limpieza. articles referencia profiles con ON DELETE RESTRICT, asi que las
  // notas se borran antes que los usuarios.
  await admin.from("articles").delete().like("slug", `%${SELLO}`);
  await admin.from("audit_log").delete().in("actor_id", creados.map((u) => u.id));
  for (const u of creados) await admin.auth.admin.deleteUser(u.id);
}

console.log("\n=== POLITICAS RLS ===\n");
for (const p of pruebas) {
  console.log(`${p.ok ? "  OK  " : " FALLA"} │ ${p.nombre}`);
  if (p.detalle) console.log(`       │   ${p.detalle}`);
}
const fallas = pruebas.filter((p) => !p.ok).length;
console.log(`\n${pruebas.length - fallas}/${pruebas.length} pruebas pasan.`);
process.exit(fallas || !ok ? 1 : 0);
