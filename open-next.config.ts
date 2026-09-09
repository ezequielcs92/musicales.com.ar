import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Sin caché incremental persistente, por ahora.
 *
 * Se intentó con R2 y no se pudo desplegar: al declarar el binding
 * `NEXT_INC_CACHE_R2_BUCKET`, tanto `opennextjs-cloudflare deploy` como
 * `wrangler deploy` precargan el caché subiendo ~83 objetos uno por uno, y esas
 * escrituras agotan el tiempo de espera desde esta conexión. Tres despliegues
 * perdidos antes de revertirlo.
 *
 * Consecuencia medida: las páginas cacheadas tardan 1,3 a 2,5 s en vez de
 * ~0,2 s, porque el caché en memoria del worker no sobrevive entre
 * invocaciones y cada visita regenera la página.
 *
 * Para retomarlo: correr el despliegue desde CI (GitHub Actions ya existe) o
 * desde una conexión con mejor salida a Cloudflare. El bucket `musicales-cache`
 * ya está creado.
 */
export default defineCloudflareConfig({});
