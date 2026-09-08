/**
 * Da de alta a alguien en la redaccion, o le cambia el rol si ya existe.
 *
 *   node scripts/crear-usuario.mjs admin@musicales.com.ar administrador
 *
 * El rol se escribe en `app_metadata` del JWT, que es de donde lo leen las
 * politicas RLS. NUNCA en `user_metadata`: eso lo edita el propio usuario desde
 * el navegador, y seria un rol autoasignable.
 *
 * Necesita SUPABASE_SERVICE_ROLE_KEY en .env.local. No imprime credenciales.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const ROLES = ["administrador", "editor", "autor", "colaborador", "suscriptor"];

const [email, rol = "colaborador"] = process.argv.slice(2);

if (!email || !ROLES.includes(rol)) {
  console.error(
    `Uso: node scripts/crear-usuario.mjs <email> <rol>\n` +
      `Roles: ${ROLES.join(", ")}`,
  );
  process.exit(1);
}

const env = {};
for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

if (!env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local.");
  process.exit(1);
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// listUsers pagina; se busca por email en vez de asumir que esta en la primera.
async function buscar(email) {
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(error.message);
    const u = data.users.find((x) => x.email?.toLowerCase() === email.toLowerCase());
    if (u) return u;
    if (data.users.length < 200) return null;
  }
  return null;
}

const existente = await buscar(email);

if (existente) {
  const { error } = await admin.auth.admin.updateUserById(existente.id, {
    app_metadata: { role: rol },
  });
  if (error) {
    console.error("No se pudo cambiar el rol:", error.message);
    process.exit(1);
  }
  console.log(`Ya existia. Rol actualizado a "${rol}".`);
} else {
  const { error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    app_metadata: { role: rol },
  });
  if (error) {
    console.error("No se pudo crear:", error.message);
    process.exit(1);
  }
  console.log(`Usuario creado con rol "${rol}".`);
}

// El perfil lo crea un disparador de la base; se confirma que aparecio.
const u = await buscar(email);

// `app_metadata` es la fuente de verdad para RLS, pero la columna `role` de
// profiles es lo que muestra el panel. Si quedan desincronizadas, la interfaz
// miente. Se actualizan siempre las dos.
const { error: eSync } = await admin
  .from("profiles")
  .update({ role: rol })
  .eq("id", u.id);
if (eSync) {
  console.error("AVISO: no se pudo sincronizar profiles.role:", eSync.message);
}

const { data: perfil } = await admin
  .from("profiles")
  .select("display_name, role")
  .eq("id", u.id)
  .maybeSingle();

console.log(
  perfil
    ? `Perfil: ${perfil.display_name} (columna role: ${perfil.role})`
    : "AVISO: no se creo el perfil. Revisar el disparador on_auth_user_created.",
);
console.log(`\nYa puede pedir su enlace de acceso en /ingresar con ${email}.`);
