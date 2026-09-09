/**
 * Asigna o cambia la contraseña de alguien de la redaccion.
 *
 *   node scripts/cambiar-clave.mjs admin@musicales.com.ar
 *
 * La contraseña se pide por teclado y no se muestra mientras se escribe, para
 * que no quede en el historial de comandos ni a la vista de nadie.
 *
 * Necesita SUPABASE_SERVICE_ROLE_KEY en .env.local.
 */
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
if (!email) {
  console.error("Uso: node scripts/cambiar-clave.mjs <email>");
  process.exit(1);
}

const env = {};
for (const l of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
  if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

/** Pide un valor por teclado sin mostrarlo en pantalla. */
function preguntarOculto(texto) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    let primera = true;
    rl._writeToOutput = (s) => {
      if (primera) {
        rl.output.write(texto);
        primera = false;
      } else if (s.includes("\n")) {
        rl.output.write("\n");
      }
      // El resto no se escribe: la contraseña no aparece en la terminal.
    };
    rl.question(texto, (v) => {
      rl.close();
      resolve(v);
    });
  });
}

const clave = await preguntarOculto("Contraseña nueva: ");
const repetida = await preguntarOculto("Repetila: ");

if (clave !== repetida) {
  console.error("\nNo coinciden. No se cambió nada.");
  process.exit(1);
}
if (clave.length < 8) {
  console.error("\nMuy corta: usá al menos 8 caracteres.");
  process.exit(1);
}

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

let usuario = null;
for (let page = 1; page <= 20 && !usuario; page++) {
  const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
  if (error) {
    console.error("\nNo se pudo buscar el usuario:", error.message);
    process.exit(1);
  }
  usuario = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (data.users.length < 200) break;
}

if (!usuario) {
  console.error(`\nNo existe ningún usuario con ${email}.`);
  console.error("Crealo primero: node scripts/crear-usuario.mjs <email> <rol>");
  process.exit(1);
}

const { error } = await admin.auth.admin.updateUserById(usuario.id, {
  password: clave,
  email_confirm: true,
});

if (error) {
  console.error("\nNo se pudo cambiar:", error.message);
  process.exit(1);
}

console.log(`\nContraseña actualizada para ${email}.`);
console.log("Ya podés entrar en https://musicales.com.ar/ingresar");
