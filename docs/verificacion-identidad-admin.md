# Verificación local - 2026-09-09

- Logo SVG vectorial y Poppins aplicados en inicio, ingreso, administrador y favicon.
- Manual v2: 12 páginas renderizadas con Poppler; revisión visual y corrección de cuadrícula de iconos. 20 iconos + sprite.
- npm run lint: correcto. npm run build: correcto, incluido TypeScript.
- npx tsx --test scripts/contenido.test.ts: 4/4, Markdown y protección contra HTML/URLs ejecutables.
- Navegador con scripts/probar-admin-local.mjs: API y cuentas ficticias locales, sin datos remotos. Creación y edición guardaron body_mdx; fallo de escritura conservó entrada; reintento guardó correctamente.
- Escritorio y tabla con 20 filas por página, menú móvil funcional, sin desbordamiento horizontal a 390 px; consola de errores del navegador vacía.
- Advertencia existente de Next: convención middleware deprecada. Auditoría npm detectó 4 alertas altas en la cadena de herramientas Cloudflare (miniflare/sharp/wrangler/OpenNext); no se ejecutó actualización forzada.
- No probado contra base remota ni desplegado. Las pruebas locales no sustituyen la validación RLS de PostgreSQL.

El editor visual usa Tiptap, no TinyMCE. Los contenidos avanzados permanecen en modo fuente para evitar conversiones con pérdida. El logo es una nueva propuesta implementada, no una aprobación estética atribuida al usuario.
