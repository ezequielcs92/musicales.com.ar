# Brief de identidad · Musicales.com.ar

## Actualización vigente del usuario · 2026-09-09

- La marquesina y las lámparas quedan **descartadas**. El usuario pidió un logo desde cero.
- **Símbolo y concepto aprobados:** conservar el monograma original de dos trazos curvos. Por decisión posterior del usuario, el nombre que acompaña al símbolo usará la misma tipografía que los títulos.
- **Elección definitiva: Friend Bestie, variante sans serif gruesa y redondeada, para el nombre del logo y los títulos. Poppins para textos y controles.** Confirmada por el usuario el 2026-09-09. Las comparativas previas quedan históricas.
- **Logo actualizado localmente:** Friend Bestie aplicada al nombre desde el ZIP aportado por el usuario. Símbolo conservado exactamente; SVG con letras a curvas, PNG, Open Graph y componente web actualizados. Los títulos de página y el manual PDF todavía requieren la actualización tipográfica correspondiente.
- El archivo `Read Me.txt` del ZIP indica uso personal únicamente. Licencia comercial pendiente para publicación; no se realizó despliegue.
- Entrega actual en `output/identidad-v2/`; manual vigente de la propuesta en `output/pdf/Musicales-com-ar-Manual-de-identidad-v2.pdf`.
- El manual y kit v1 se conservan como históricos. Sus reglas de logo y tipografía ya no gobiernan el proyecto.
- Administrador con barra lateral y editor visual Tiptap, siguiendo la referencia WordPress/TinyMCE. Contenido persistido en Markdown. No se desplegó a producción.

**El brief v2 que sigue se conserva como referencia histórica. Las indicaciones anteriores prevalecen donde hay conflicto.**

> **Cómo usar este documento.** La identidad ya está definida: nombre, concepto,
> paleta y tipografías son decisiones tomadas, no sugerencias. Lo que se pide es
> **ejecutarlas y producir los archivos**, no reinterpretarlas. Si algo parece
> mejorable, señalalo aparte; no lo cambies por cuenta propia.

---

## 1. Qué es el proyecto

**Musicales.com.ar** es un medio digital sobre teatro musical argentino. Cubre
noticias, críticas, entrevistas y opinión, y además funciona como base de datos
consultable de tres cosas que hoy nadie ordena bien:

- **Cartelera** de musicales en cartel, con salas, funciones y precios.
- **Talleres de montaje**, distinguiéndolos del entrenamiento semanal.
- **Audiciones y castings** abiertos.

**Público:** intérpretes, estudiantes de comedia musical, docentes, productores y
espectadores frecuentes. Gente que conoce el rubro, no turistas.

**Alcance inicial:** Ciudad de Buenos Aires y Gran Buenos Aires.

**Tono:** informado y directo, sin solemnidad ni jerga de gacetilla. Es un medio,
no una agencia de prensa: puede opinar y calificar.

**Contexto técnico relevante:** el sitio se financia con publicidad, así que el
logo convive permanentemente con bloques de anuncios. Tiene que sostenerse en un
entorno visualmente ruidoso y a tamaños chicos.

---

## 2. El nombre y el concepto

La marca es el dominio: **Musicales.com.ar**. Se escribe siempre completo, con el
`.com.ar` incluido. No existe una versión abreviada a «Musicales».

### El concepto: la marquesina

Una **marquesina** es el cartel iluminado sobre la entrada del teatro: un marco
con lámparas donde se anuncia qué se está dando. Es una de las formas más
reconocibles del rubro y no necesita explicación.

El logo es el nombre encerrado en ese marco, con hileras de lámparas arriba y
abajo del texto, dentro del borde.

### La idea que hace que funcione

Un dominio usado como marca corre el riesgo de leerse a desgano, como si nadie se
hubiera tomado el trabajo de nombrar el sitio.

**Lo que lo resuelve: los dos puntos del dominio son lámparas.** Tienen la forma
exacta de una bombilla de marquesina. Puestos en el mismo ámbar que las del
marco, la dirección deja de ser una URL escrita y pasa a ser un cartel encendido.

```
┌───────────────────────────────────┐
│  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │
│                                   │
│     MUSICALES ● COM ● AR          │   ← los puntos del dominio,
│                                   │      en ámbar, como lámparas
│  ● ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●  │
└───────────────────────────────────┘
```

Es el único recurso conceptual de la marca. No hace falta agregarle nada más:
ni máscaras de teatro, ni telones ilustrados, ni notas musicales.

---

## 3. Paleta

Cinco colores, cada uno con un trabajo asignado. **No agregar colores nuevos.**

| Nombre | Hex claro | Hex oscuro | Para qué |
|---|---|---|---|
| **Telón** | `#9E1B3C` | `#E36285` | Acento de marca: enlaces, títulos de sección, estados de estreno |
| **Bombilla** | `#E0AE42` | `#F0CB72` | Solo las lámparas del logo y lo que está pasando ahora mismo |
| **Sala** | `#171320` | `#F0EDF4` | Texto, cabecera y pie. Es el "negro" de la marca |
| **Papel** | `#F4F3F6` | `#131019` | Fondo de lectura |
| **En cartel** | `#2C6E52` | `#6FC79D` | Color de estado: indica que una obra se está dando |

Notas que importan:

- **El negro no es negro.** `#171320` tiene una vuelta hacia el violeta. Lo mismo
  el papel: es frío a propósito, porque el crema cálido ya lo usa todo el mundo.
- **El ámbar no es decorativo.** Significa «esto está encendido / esto está
  pasando ahora». Si se usa de adorno, la marca pierde su única señal.
- **Los dos modos están diseñados, no derivados.** El telón sube a rosa en modo
  oscuro para seguir siendo legible; no es una inversión automática.

---

## 4. Tipografía

Tres familias, todas de Google Fonts, todas gratuitas para uso comercial.

| Rol | Familia | Ajustes |
|---|---|---|
| **Display / marca** | Archivo | Ancho `wdth 78–90`, peso `wght 650–800`, mayúsculas |
| **Texto corrido** | Source Serif 4 | Peso 400–600 |
| **Datos** | IBM Plex Mono | Peso 400–600, para fechas, horarios y precios |

**Archivo es la letra del logo.** Se usa en su eje condensado: alta, angosta,
como la tipografía de los carteles de teatro. Si la herramienta no soporta
fuentes variables, usar **Archivo Narrow Bold** o **Archivo Black** como
sustituto, en ese orden de preferencia.

En el logotipo: `wdth 78`, `wght 800`, mayúsculas, interletrado `+0.02em`.

---

## 5. Construcción del logotipo

Todas las medidas son proporcionales al **cuerpo tipográfico del nombre (F)**,
para que el logo escale sin romperse.

| Elemento | Medida |
|---|---|
| Grosor del borde del marco | `0.048 F` |
| Diámetro de cada lámpara del marco | `0.17 F` |
| Separación entre lámparas, centro a centro | `0.43 F` |
| Borde interno → hilera de lámparas | `0.22 F` |
| Hilera de lámparas → altura de mayúsculas | `0.26 F` |
| Margen lateral interno (borde → texto) | `0.62 F` |
| Diámetro de los puntos del dominio | `0.15 F` |
| Posición vertical de los puntos del dominio | Sobre la línea de base, centrados a `0.26 F` de altura |

Las hileras de lámparas van **centradas** y se reparten en el ancho disponible.
La cantidad se ajusta al tamaño: entre 5 y 16 por hilera, siempre número impar
para que una quede en el eje central.

### SVG de referencia

Punto de partida, no resultado final. Requiere Archivo cargada; en el archivo
final el texto debe ir **trazado a curvas**.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 150" role="img"
     aria-label="Musicales.com.ar">
  <rect x="3" y="3" width="514" height="144" fill="none"
        stroke="#171320" stroke-width="5"/>
  <g fill="#E0AE42">
    <!-- hilera superior: repetir cx cada 30px desde 40 hasta 480 -->
    <circle cx="40" cy="26" r="7"/><circle cx="70" cy="26" r="7"/>
    <!-- … -->
    <circle cx="40" cy="124" r="7"/><circle cx="70" cy="124" r="7"/>
    <!-- … -->
  </g>
  <text x="260" y="92" text-anchor="middle" fill="#171320"
        font-family="Archivo" font-weight="800" font-stretch="78%"
        font-size="82" letter-spacing="1.6">MUSICALES</text>
  <!-- los puntos del dominio van como <circle>, nunca como carácter "." -->
</svg>
```

---

## 6. Entregables

### Logotipo

1. **Principal**, marco completo, sobre fondo claro — SVG con texto trazado
2. **Principal**, versión para fondo oscuro (marco y texto en `#F0EDF4`) — SVG
3. **Monocromático** de una sola tinta, para serigrafía o fondos difíciles: todo
   en un color, incluidas las lámparas — SVG
4. **Isotipo**: la letra `M` sola dentro del marco, con tres lámparas por hilera —
   SVG, versión clara y oscura

### Aplicaciones

5. **Favicon** — SVG + PNG de 32, 48 y 180 px. Usa el isotipo, nunca el logo
   completo
6. **Avatar de redes** — PNG 320×320, isotipo centrado sobre `#171320`
7. **Open Graph / compartir** — PNG 1200×630, logo completo sobre `#171320` con
   la bajada «Teatro musical argentino»

### Documentación

8. **Hoja de estilo** de una página: paleta con hex, tipografías, área de
   protección del logo y tamaño mínimo

---

## 7. Restricciones

**Siempre**

- El nombre completo con `.com.ar`. Nunca solo «Musicales».
- Los puntos del dominio como círculos ámbar, nunca como puntos tipográficos.
- El marco completo, o el isotipo. El nombre suelto sin marco no es el logo: es
  una dirección web escrita.
- Área de protección alrededor del logo: como mínimo `0.5 F` por cada lado.
- Tamaño mínimo del logo completo: **160 px** de ancho. Por debajo, isotipo.

**Nunca**

- Máscaras de teatro, telones ilustrados, notas musicales, focos de escenario,
  cortinas rojas ni ningún otro cliché del rubro.
- Degradados, sombras, biselados, 3D, efectos de resplandor o neón.
- Bordes redondeados en el marco: las esquinas son rectas.
- El logo sobre una fotografía. El marco necesita fondo plano.
- Colores fuera de la paleta de la sección 3.
- Mascota, personaje o ilustración de cualquier tipo.

---

## 8. Criterios de aceptación

Un entregable está bien si cumple todo esto:

- [ ] El favicon de 32 px se distingue de cualquier otro en una barra de pestañas
- [ ] El logo se lee sobre `#F4F3F6` y sobre `#171320` sin retoques
- [ ] Impreso en blanco y negro sigue funcionando
- [ ] Los puntos del dominio se leen como lámparas, no como suciedad
- [ ] Ningún archivo depende de una fuente instalada: todo el texto está trazado
- [ ] Los SVG están limpios: sin capas vacías, sin grupos innecesarios, con
      `viewBox` y sin dimensiones fijas en píxeles

---

## 9. Prompt para pegar

> Sos director de arte. Ejecutá la identidad visual especificada en el documento
> adjunto para **Musicales.com.ar**, un medio digital sobre teatro musical
> argentino.
>
> El concepto ya está definido y no hay que reinterpretarlo: el logo es el
> nombre del dominio encerrado en una marquesina de teatro —un marco con
> hileras de lámparas arriba y abajo— y **los dos puntos del dominio son
> lámparas ámbar**, no puntos tipográficos.
>
> Respetá exactamente la paleta de la sección 3, las tipografías de la sección 4
> y las proporciones de la sección 5. Producí los ocho entregables de la sección
> 6 y verificá los criterios de la sección 8 antes de entregar.
>
> Entregá los SVG como código, no como imágenes rasterizadas. Si algo de la
> especificación te parece mejorable, anotalo al final en una lista aparte, pero
> entregá primero lo pedido tal como está escrito.

---

*Documento generado el 8 de septiembre de 2026. Identidad v2.*
