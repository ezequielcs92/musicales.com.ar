# Musicales.com.ar

Medio digital sobre teatro musical argentino: cartelera, criticas, noticias,
talleres de montaje y audiciones. Alcance de lanzamiento: CABA y Gran Buenos
Aires.

## Stack

| Pieza | Eleccion |
| --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) |
| Hosting | Cloudflare Workers vía [OpenNext](https://opennext.js.org/cloudflare) |
| Datos | Supabase (Postgres + Auth), con RLS |
| Imagenes | Cloudflare R2, servidas desde `img.musicales.com.ar` |
| Estilos | Tailwind v4 |
| Animacion | Motion 13 |

**OpenNext y no vinext**, aunque vinext sea lo que Cloudflare recomienda hoy:
vinext no es Next.js sino una reimplementacion de su API con huecos declarados,
y este sitio depende de que Google lo indexe bien. Reevaluable mas adelante.

## Puesta en marcha

```bash
npm install
cp .env.example .env.local        # completar con los valores del panel de Supabase
cp .dev.vars.example .dev.vars    # secretos para el runtime de Workers
npm run dev
```

`.env.local` lo lee `next dev`; `.dev.vars` lo leen `wrangler dev` y
`npm run preview`. Hay que mantener los dos en sincronia. Ninguno se commitea.

## Scripts

| Comando | Que hace |
| --- | --- |
| `npm run dev` | Desarrollo con Turbopack. Rapido, pero **no** es el runtime real |
| `npm run preview` | Compila y sirve el worker de Cloudflare de verdad |
| `npm run deploy` | Compila y despliega a Workers |
| `npm run cf-typegen` | Regenera los tipos de los bindings de Cloudflare |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run probar:politicas` | Prueba las politicas RLS con usuarios reales de cada rol |

**Antes de cada despliegue hay que pasar por `npm run preview`.** El
comportamiento de `next dev` y el del worker no son identicos, y descubrir la
diferencia en produccion es el error caro.

## Presupuesto del worker

El plan gratuito de Workers admite **3 MiB** comprimidos. Medicion actual:

```bash
npm run build && npx opennextjs-cloudflare build
npx wrangler deploy --dry-run --outdir=.wrangler/dry
```

| Fecha | Estado del proyecto | Comprimido | Uso del limite |
| --- | --- | --- | --- |
| 2026-09-08 | Fase 0, sitio vacio | 953 KiB | 31 % |
| 2026-09-08 | Fase 1, panel + clientes Supabase | 1420 KiB | 47 % |

El salto de 467 KiB es casi todo `@supabase/supabase-js` del lado servidor: se
paga una vez y no se repite por cada seccion nueva.

Conviene medir al cerrar cada fase. Si se acerca al techo, el panel de
administracion sale a su propio worker antes que pagar el plan.

## Prueba de las politicas

`npm run probar:politicas` crea usuarios temporales de cada rol contra la base
vinculada, ejecuta lo que cada uno deberia y no deberia poder hacer, y borra
todo al terminar. Necesita `SUPABASE_SERVICE_ROLE_KEY` en `.env.local`.

Correrlo **despues de cada cambio a las politicas o a los disparadores**. Un
esquema que aplica sin errores no dice nada sobre si los permisos funcionan:
eso solo lo dice un colaborador intentando publicar y recibiendo el rechazo.

Cubre 16 casos, entre ellos:

- El colaborador crea borradores, los manda a revision y **no puede publicar**.
- Una vez en revision, el colaborador pierde la nota.
- El autor publica lo propio y no toca lo ajeno; el editor si.
- Nadie firma una nota a nombre de otro.
- **Nadie se asciende de rol a si mismo.**
- El publico solo ve notas publicadas, y nunca `audit_log`.
- Publicar deja rastro en `audit_log`.

## Publicar

El orden importa: cada paso habilita el siguiente.

**1. Autenticar Cloudflare** (una sola vez, en tu maquina)

```bash
npx wrangler login
```

Abre el navegador. El token queda en tu almacen de credenciales y no pasa por
ningun archivo del repo.

**2. Cargar el secreto en Cloudflare** (una sola vez)

```bash
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

Pide el valor por teclado y lo guarda del lado de Cloudflare. `.env.local` sirve
para desarrollo; en produccion el secreto vive aca.

Las variables `NEXT_PUBLIC_*` no se cargan asi: Next las incrusta en el codigo
al compilar, tomandolas de `.env.local` de la maquina que hace el build.

**3. Desplegar**

```bash
npm run deploy
```

Compila con OpenNext y sube. La primera vez sale en `musicales.<subdominio>.workers.dev`.

**4. Habilitar el ingreso en produccion**

En Supabase, **Authentication → URL Configuration**, agregar la URL del sitio a
*Site URL* y a *Redirect URLs*. Sin esto el enlace de acceso al panel falla en
produccion aunque funcione en local: Supabase rechaza redirigir a un dominio que
no tiene en su lista.

**5. Pasar al dominio propio**

Descomentar el bloque `routes` de `wrangler.jsonc`, poner `workers_dev` en
`false`, volver a desplegar. La redireccion de `www` al dominio sin `www` se
configura como regla 301 en el panel de Cloudflare, no como segunda ruta del
worker: dos rutas servirian el mismo contenido en dos direcciones indexables.

## Convenciones

- **Interfaz y contenido en español rioplatense.** Codigo, nombres de variables
  y mensajes de commit en ingles.
- **La seguridad vive en la base, no en la aplicacion.** Todo acceso a datos pasa
  por politicas RLS de Postgres; el codigo no es la ultima linea de defensa.
- **El rol del usuario va en `app_metadata` del JWT, nunca en `user_metadata`**,
  que el propio usuario puede editar desde el cliente.
- **Ningun bloque de publicidad dentro de un contenedor animado**, y todo espacio
  publicitario con altura reservada. Es lo que mantiene el CLS bajo control.
- **Solo se animan `transform` y `opacity`.**

## Documentacion

- `docs/brief-identidad.md` — identidad visual: concepto, paleta, tipografia y
  construccion del logotipo.
