/** Local fixture transport for browser QA. Never reads credentials or remote data.
 * Run: node scripts/probar-admin-local.mjs
 * Demo login: editor@example.test / prueba-local (also autor, colaborador, suscriptor).
 * Real authentication code runs against this loopback-only fake Supabase service.
 */
import http from "node:http";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

const API_PORT = 4319;
const APP_PORT = 3108;
const roles = ["editor", "autor", "colaborador", "suscriptor", "administrador"];
const users = Object.fromEntries(roles.map((role, i) => [role, { id: `10000000-0000-4000-8000-00000000000${i + 1}`, aud: "authenticated", role: "authenticated", email: `${role}@example.test`, email_confirmed_at: "2026-09-08T12:00:00Z", app_metadata: { role, provider: "email" }, user_metadata: {}, created_at: "2026-09-08T12:00:00Z" }]));
const states = ["borrador", "en_revision", "programado", "publicado", "archivado"];
const sections = ["noticias", "entrevistas", "reviews", "opiniones"];
const titles = ["Las voces detrás de cada función", "La escena que se construye en los ensayos", "Un recorrido por el teatro musical argentino", "El oficio de contar historias en escena", "Nuevas miradas sobre una puesta"];
let notes = Array.from({ length: 27 }, (_, i) => ({ id: `20000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`, title: i < 5 ? titles[i] : `Nota de prueba ${i + 1}`, slug: `nota-prueba-${i + 1}`, status: states[i % 5], section: sections[i % 4], author_id: users[roles[i % 3]].id, dek: "Contenido ficticio para revisar el panel.", body_mdx: "## Una historia de prueba\n\nTexto con **negrita**, _cursiva_ y [un enlace](https://example.com).\n\n- Ensayo\n- Función", updated_at: new Date(Date.UTC(2026, 8, 8, 16, 0) - i * 3600000).toISOString(), published_at: i % 5 === 3 ? "2026-09-08T12:00:00Z" : null, profiles: { display_name: ["Editor de prueba", "Autor de prueba", "Colaborador de prueba"][i % 3] } }));
let failNextWrite = false;
const writes = [];
function token(user) {
  const enc = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${enc({ alg: "HS256", typ: "JWT" })}.${enc({ sub: user.id, role: "authenticated", exp: Math.floor(Date.now() / 1000) + 3600, app_metadata: user.app_metadata })}.local-fixture-only`;
}
function requestUser(request) {
  try {
    const payload = JSON.parse(Buffer.from(request.headers.authorization.split(".")[1], "base64url").toString());
    return Object.values(users).find((user) => user.id === payload.sub);
  } catch { return null; }
}
function json(response, data, status = 200, extra = {}) {
  response.writeHead(status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": `http://127.0.0.1:${APP_PORT}`, "Access-Control-Allow-Credentials": "true", ...extra });
  response.end(data === undefined ? undefined : JSON.stringify(data));
}
async function bodyOf(request) { let body = ""; for await (const chunk of request) body += chunk; return body ? JSON.parse(body) : {}; }

const api = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${API_PORT}`);
    if (url.pathname === "/__fixtures") return json(response, { writes, notes });
    if (url.pathname === "/__fail-next-write") { failNextWrite = true; return json(response, { ok: true }); }
    if (request.method === "OPTIONS") return json(response, {}, 200, { "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,HEAD,OPTIONS" });
    if (url.pathname === "/auth/v1/token") {
      const body = await bodyOf(request);
      const user = users[body.email?.split("@")[0]];
      if (!user || body.password !== "prueba-local") return json(response, { message: "Credenciales de prueba incorrectas" }, 400);
      return json(response, { access_token: token(user), token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: "local-refresh-fixture", user });
    }
    const user = requestUser(request);
    if (url.pathname === "/auth/v1/user") return user ? json(response, user) : json(response, { message: "Sin sesión" }, 401);
    if (url.pathname === "/auth/v1/logout") return json(response, {}, 200);
    if (url.pathname !== "/rest/v1/articles") return json(response, { message: "Ruta de fixture inexistente" }, 404);
    const role = user?.app_metadata.role;
    const staff = ["editor", "administrador"].includes(role);
    const readable = (note) => staff || note.author_id === user?.id || note.status === "publicado";
    const editable = (note) => staff || (note.author_id === user?.id && (role === "autor" || (role === "colaborador" && note.status === "borrador")));
    const filtered = () => {
      let rows = notes.filter(readable);
      for (const field of ["id", "status", "section", "author_id"]) {
        const filter = url.searchParams.get(field); if (filter?.startsWith("eq.")) rows = rows.filter((note) => note[field] === filter.slice(3));
      }
      const title = url.searchParams.get("title");
      if (title?.startsWith("ilike.")) { const term = title.slice(6).replace(/^%|%$/g, "").replace(/\\([%_\\])/g, "$1"); rows = rows.filter((note) => note.title.toLowerCase().includes(term.toLowerCase())); }
      return rows.sort((a, b) => b.updated_at.localeCompare(a.updated_at) || a.id.localeCompare(b.id));
    };
    if (["GET", "HEAD"].includes(request.method)) {
      const rows = filtered(); const count = rows.length;
      const start = Number(url.searchParams.get("offset") ?? 0), limit = Number(url.searchParams.get("limit") ?? 1000);
      const data = rows.slice(start, start + limit);
      const single = request.headers.accept?.includes("application/vnd.pgrst.object+json");
      return json(response, request.method === "HEAD" ? undefined : single ? data[0] ?? null : data, 200, { "Content-Range": `${start}-${Math.max(start, start + data.length - 1)}/${count}` });
    }
    if (!user || !["editor", "administrador", "autor", "colaborador"].includes(role)) return json(response, { code: "42501", message: "Sin permisos" }, 403);
    if (failNextWrite) { failNextWrite = false; return json(response, { code: "XX000", message: "Fallo simulado de guardado" }, 500); }
    const body = await bodyOf(request);
    if (role === "colaborador" && !["borrador", "en_revision"].includes(body.status)) return json(response, { code: "42501", message: "Un colaborador no puede publicar." }, 403);
    if (request.method === "POST") {
      const note = { ...body, id: randomUUID(), profiles: { display_name: "Usuario de prueba" }, updated_at: new Date().toISOString(), published_at: body.status === "publicado" ? new Date().toISOString() : null };
      notes.push(note); writes.push({ action: "insert", id: note.id, role }); return json(response, { id: note.id }, 201);
    }
    if (request.method === "PATCH") {
      const rows = filtered().filter(editable);
      for (const note of rows) { Object.assign(note, body, { updated_at: new Date().toISOString() }); writes.push({ action: "update", id: note.id, role }); }
      return json(response, rows.map(({ id }) => ({ id })));
    }
    return json(response, { message: "Operación no soportada por el fixture" }, 405);
  } catch { return json(response, { message: "Error del fixture local" }, 500); }
});

api.listen(API_PORT, "127.0.0.1", () => {
  console.log(`Fixture local en 127.0.0.1:${API_PORT}. No usa datos reales.`);
  const next = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", String(APP_PORT)], {
    stdio: "inherit",
    env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: `http://127.0.0.1:${API_PORT}`, NEXT_PUBLIC_SUPABASE_ANON_KEY: "local-public-fixture", SUPABASE_SERVICE_ROLE_KEY: "", NEXT_PUBLIC_SITE_URL: `http://127.0.0.1:${APP_PORT}` },
  });
  next.on("exit", () => api.close());
  const stop = () => { next.kill(); api.close(); };
  process.on("SIGINT", stop); process.on("SIGTERM", stop);
});
