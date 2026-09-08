import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// El caché incremental se activa cuando exista el bucket R2 `musicales-cache`:
//
//   import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
//   export default defineCloudflareConfig({ incrementalCache: r2IncrementalCache });
//
// Va en R2 y no en KV a propósito: el plan gratuito de KV tiene un techo de
// escrituras diarias que la revalidación de la cartelera consumiría rápido.
export default defineCloudflareConfig({});
