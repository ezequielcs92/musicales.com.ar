import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // Las derivadas (AVIF y WebP en cuatro anchos) se generan al subir la imagen
    // desde el panel y se guardan en R2. Se sirven con `srcset` plano, sin
    // optimizador en tiempo real: es el unico recurso que todas las plataformas
    // cobran distinto, y asi la app queda portable.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "img.musicales.com.ar" }],
  },
};

export default nextConfig;

// Expone los bindings de Cloudflare (R2, secretos) dentro de `next dev`.
initOpenNextCloudflareForDev();
