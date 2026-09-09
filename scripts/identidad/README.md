# Generación del kit de identidad

Una única salida: `output/identidad/`. No depende de carpetas antiguas.

1. `python scripts/identidad/build_kit.py` genera SVG, iconos, aplicaciones, tokens y catálogo.
2. `python scripts/identidad/generate_manual.py` genera manual y hoja de estilo; utiliza Friend Bestie en curvas para títulos.
3. `node scripts/identidad/render_kit.cjs` exporta PNG en tamaños finales.
4. `python scripts/identidad/verify_kit.py` verifica geometría, tamaños, ausencia de recortes y genera el manifiesto SHA-256.
5. Renderizar los PDF con Poppler y revisar visualmente las páginas antes de distribuir.
6. Comprimir el contenido de `output/identidad/` como `output/Musicales-Kit-de-identidad.zip`.

Fuentes de producción: `assets/brand/` conserva los SVG del logo aprobado; `assets/fonts/poppins/` contiene Poppins y OFL. Friend Bestie se lee de la copia licenciada del titular en `assets/fonts/friend-bestie/`; no se incluye su binario en el kit distribuible.

Los iconos tienen geometría original en `build_kit.py`, cuadrícula de 24 px, trazo 2, uniones y extremos round. El sprite se comprobó en navegador sobre HTTP, junto con la búsqueda sin acentos del catálogo.

Dependencias: fontTools, Pillow, reportlab, svglib, pypdf, Sharp y Poppler. No es necesario ejecutar la aplicación ni acceder a servicios remotos para generar el kit.
