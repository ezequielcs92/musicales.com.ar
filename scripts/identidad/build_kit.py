"""Build the single current identity kit. No dependency on historical output folders."""
from pathlib import Path
import json, shutil, html, re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output/identidad'
INK='#171320'; PAPER='#F4F3F6'; RED='#9E1B3C'; PINK='#E36285'; LIGHT='#F0EDF4'
for d in ['logos','iconos/lineales','iconos/circulares','aplicaciones','fuentes/poppins','tokens','manual']: (OUT/d).mkdir(parents=True,exist_ok=True)
fonts={n:TTFont(ROOT/f'assets/fonts/poppins/Poppins-{f}.ttf') for n,f in [('body','Regular'),('semi','SemiBold'),('bold','Bold')]}
fonts['display']=TTFont(ROOT/'assets/fonts/friend-bestie/Friend Bestie.otf')
def outline(text,x,y,size=32,font='body'):
 f=fonts[font];gs=f.getGlyphSet();cm=f.getBestCmap();k=size/f['head'].unitsPerEm;p=SVGPathPen(gs);cursor=x
 for ch in text:
  if ord(ch) not in cm:raise ValueError(f'Missing glyph {ch} in {font}')
  g=gs[cm[ord(ch)]];g.draw(TransformPen(p,(k,0,0,-k,cursor,y)));cursor+=g.width*k
 return p.getCommands(),cursor-x
def text(s,x,y,size=32,font='body',color=INK):
 d,w=outline(s,x,y,size,font);return f'<path fill="{color}" d="{d}"/>'
def rect(x,y,w,h,color,rx=0):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{color}"/>'
def svg(body,w,h,label):return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="{html.escape(label,quote=True)}">{body}</svg>'
def save(name,body): (OUT/name).write_text(body,encoding='utf-8')
def inner(file):return re.sub(r'^<svg[^>]*>|</svg>\s*$','',file.read_text(encoding='utf-8'))
import xml.etree.ElementTree as ET
source=ROOT/'assets/brand'
root=ET.parse(source/'logo-claro.svg').getroot(); W,H=map(float,root.attrib['viewBox'].split()[2:]); MARK=root[0].attrib['d']
def logo(x,y,width,dark=False,mono=False):
 name=f'logo-{"oscuro" if dark else "claro"}{"-monocromatico" if mono else ""}.svg'
 return f'<g transform="translate({x} {y}) scale({width/W})">{inner(source/name)}</g>'
def mark(x,y,size,color=RED):return f'<g transform="translate({x} {y}) scale({size/100})"><path fill="{color}" d="{MARK}"/></g>'
for f in source.glob('*.svg'):shutil.copy2(f,OUT/'logos'/f.name)
for dark in [False,True]:
 mode='oscuro' if dark else 'claro'; color=LIGHT if dark else INK
 word=ET.parse(source/f'logo-{mode}.svg').getroot()[1].attrib['d']
 save(f'logos/logo-vertical-{mode}.svg',svg(mark(335,10,180,PINK if dark else RED)+f'<g transform="translate(-63 215) scale(1.06)"><path fill="{color}" d="{word}"/></g>',850,350,'Musicales.com.ar'))
 save(f'logos/isotipo-{mode}-monocromatico.svg',svg(mark(0,0,100,color),100,100,'Musicales.com.ar'))
# All silhouettes are original, explicit geometry in a shared 24 px grid.
ICONS={
'cartelera':('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18m-14 5h3m4 0h3m-10 3h3"/>','Cartelera'),
'obras':('<path d="M4 5h16a1 1 0 0 1 1 1v3a3 3 0 0 0 0 6v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a3 3 0 0 0 0-6V6a1 1 0 0 1 1-1Z"/><path d="M15 8v2m0 4v2"/>','Obras y entradas'),
'artistas':('<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>','Artistas'),
'salas':('<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M3 9h18M9 21v-7a3 3 0 0 1 6 0v7M7 6.5h.01m5 0h.01m5 0h.01"/>','Salas'),
'talleres':('<path d="m2 8 10-5 10 5-10 5L2 8Zm4 3v6c4 3 8 3 12 0v-6m4-3v9"/>','Talleres'),
'audiciones':('<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M6 11v1a6 6 0 0 0 12 0v-1m-6 7v3m-3 0h6"/>','Audiciones'),
'criticas':('<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>','Críticas y valoración'),
'noticias':('<rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8m-8 4h8m-8 4h3m3 0h2m-8 3h8"/>','Noticias'),
'entrevistas':('<path d="M6 4h12a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3h-7l-6 4v-4a2 2 0 0 1-2-2V7a3 3 0 0 1 3-3Z"/><path d="M7 9h10m-10 4h6"/>','Entrevistas'),
'eventos':('<path d="m4 20 4-13 9 9-13 4Zm8-16v2m5-3-1 4m5 2-4 1m3 3h1M7 12l5 5"/>','Eventos y convocatorias'),
'ubicacion':('<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>','Ubicación'),
'horario':('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>','Horario'),
'buscar':('<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>','Buscar'),
'filtrar':('<path d="M3 6h18M6 12h12m-9 6h6"/>','Filtrar'),
'menu':('<path d="M4 6h16M4 12h16M4 18h16"/>','Menú'),
'cerrar':('<path d="m6 6 12 12M18 6 6 18"/>','Cerrar'),
'flecha':('<path d="M4 12h16m-6-6 6 6-6 6"/>','Avanzar'),
'externo':('<path d="M14 3h7v7m0-7L10 14m0-10H6a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-4"/>','Enlace externo'),
'compartir':('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/>','Compartir'),
'favoritos':('<path d="M12 21 3.8 13a5.5 5.5 0 0 1 8.2-7 5.5 5.5 0 0 1 8.2 7L12 21Z"/>','Favoritos'),
'guardar':('<path d="M7 3h10a2 2 0 0 1 2 2v16l-7-4-7 4V5a2 2 0 0 1 2-2Z"/>','Guardar'),
'confirmado':('<circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/>','Confirmado'),
'informacion':('<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>','Información'),
'alerta':('<path d="m10.3 4-8 14a2 2 0 0 0 1.7 3h16a2 2 0 0 0 1.7-3l-8-14a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/>','Aviso'),
'correo':('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>','Correo'),
'editar':('<path d="m14 4 6 6M4 20l5-1L20 8a2.8 2.8 0 0 0-4-4L5 15l-1 5Zm1-5 4 4"/>','Editar'),
'imagen':('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="2"/><path d="m3 17 5-5 4 4 4-6 5 7"/>','Imagen'),
'agregar':('<path d="M12 4v16M4 12h16"/>','Agregar'),
'sol':('<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>','Tema claro'),
'luna':('<path d="M20.5 14A9 9 0 0 1 10 3a9 9 0 1 0 10.5 11Z"/>','Tema oscuro'),
}
def icon_body(name,color='currentColor'):
 return f'<g fill="none" stroke="{color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICONS[name][0]}</g>'
for name,(_,label) in ICONS.items():
 save(f'iconos/lineales/{name}.svg',svg(icon_body(name),24,24,label))
 circular=f'<circle cx="20" cy="20" r="20" fill="#E9DFE7"/><g transform="translate(8 8)">{icon_body(name,RED)}</g>'
 save(f'iconos/circulares/{name}.svg',svg(circular,40,40,label))
save('iconos/sprite.svg','<svg xmlns="http://www.w3.org/2000/svg">'+''.join(f'<symbol id="icono-{n}" viewBox="0 0 24 24">{icon_body(n)}</symbol>' for n in ICONS)+'</svg>')
# A real render of the symbol sprite through <use>, independently checked later.
save('iconos/prueba-sprite.svg',svg(''.join(f'<use href="sprite.svg#icono-{n}" x="{(i%10)*32+4}" y="{(i//10)*32+4}" width="24" height="24"/>' for i,n in enumerate(ICONS)),320,96,'Prueba del sprite'))
board=rect(0,0,1500,1060,PAPER)+text('Iconos redondos',58,79,54,'display')+text('30 símbolos / 24 px / trazo 2 px / extremos y uniones redondos',58,126,23)
for i,(name,(_,label)) in enumerate(ICONS.items()):
 x=58+(i%6)*239;y=181+(i//6)*165
 board+=f'<g transform="translate({x} {y}) scale(1.7)">{inner(OUT/f"iconos/circulares/{name}.svg")}</g>'
 board+=f'<g transform="translate({x+99} {y+20}) scale(1.3)">{icon_body(name,INK)}</g>'
 board+=text(label,x,y+104,17,'semi')
save('iconos/catalogo.svg',svg(board,1500,1060,'Catálogo de iconos'))
# Useful, self-contained brand applications; no raster effects or external images.
save('aplicaciones/favicon.svg',svg(rect(0,0,100,100,INK,22)+mark(8,8,84,PINK),100,100,'Musicales.com.ar'))
save('aplicaciones/avatar.svg',svg(rect(0,0,320,320,INK)+mark(54,54,212,PINK),320,320,'Musicales.com.ar'))
save('aplicaciones/open-graph.svg',svg(rect(0,0,1200,630,INK)+logo(100,215,1000,True)+text('Teatro musical argentino',100,410,42,'display',LIGHT),1200,630,'Vista previa social'))
for name,category,lines,caption in [
 ('post-cartelera','Cartelera',['Tu próxima','salida al teatro.'],'Descubrí obras, salas y funciones.'),
 ('post-editorial','Entrevistas',['Las voces','de la escena.'],'Conversaciones sobre el oficio y el proceso.'),
 ('post-audiciones','Audiciones',['Tu próximo','paso en escena.'],'Convocatorias, requisitos y fechas.')]:
 b=rect(0,0,1080,1350,PAPER)+logo(72,62,640)+text(category,72,290,30,'semi',RED)
 for i,line in enumerate(lines):b+=text(line,72,443+i*115,91,'display')
 b+=rect(72,640,936,420,INK,40)+mark(610,660,390,PINK)+text('Musicales',112,860,85,'display',LIGHT)+text('se vive.',112,958,85,'display',LIGHT)
 b+=text(caption,72,1152,28)+text('musicales.com.ar',72,1268,27,'semi',RED)
 save(f'aplicaciones/{name}.svg',svg(b,1080,1350,category))
b=rect(0,0,1080,1920,INK)+logo(90,250,900,True)+text('La escena',90,770,125,'display',LIGHT)+text('nos mueve.',90,925,125,'display',LIGHT)+mark(110,1000,440,PINK)+text('Historias, voces y nuevas miradas.',90,1530,34,'body',LIGHT)+text('musicales.com.ar',90,1640,40,'semi',PINK)
save('aplicaciones/story.svg',svg(b,1080,1920,'Historia para redes'))
save('aplicaciones/firma-correo.svg',svg(logo(24,16,440)+text('Teatro musical argentino',24,102,20)+text('musicales.com.ar',24,143,17,'semi',RED),520,180,'Firma de correo'))
preview=rect(0,0,1600,1100,PAPER)+text('Musicales.com.ar / Identidad',64,75,37,'display')+logo(64,170,1472)+text('Friend Bestie para logo y títulos. Poppins para lectura.',64,405,28)+rect(0,490,1600,360,INK)+logo(64,596,1240,True)+mark(1370,570,150,PINK)
for i,n in enumerate(list(ICONS)[:10]):preview+=f'<g transform="translate({64+i*150} 912) scale(1.8)">{inner(OUT/f"iconos/circulares/{n}.svg")}</g>'
save('vista-general.svg',svg(preview,1600,1100,'Identidad de Musicales.com.ar'))
for f in (ROOT/'assets/fonts/poppins').iterdir():shutil.copy2(f,OUT/'fuentes/poppins'/f.name)
save('fuentes/LEEME.md','# Tipografías\n\nFriend Bestie (sans serif): logo y títulos. El proyecto ya dispone de la fuente bajo licencia; el archivo propietario no se redistribuye en este kit. Para editar, usar la copia licenciada del titular. Los SVG incluyen los contornos exactos.\n\nPoppins: textos y controles; archivos Regular, SemiBold y Bold y licencia OFL incluidos.\n')
tokens={'brand':{'telon':RED,'sala':INK,'papel':PAPER,'rosa':PINK,'blanco':LIGHT,'ambar':'#E0AE42'},'typography':{'display':'Friend Bestie','body':'Poppins','ui':'Poppins'},'icons':{'grid':24,'stroke':2,'linecap':'round','linejoin':'round','circle':40},'spacing':[8,16,24,32,48,64],'radii':[12,20,999]}
css=(ROOT/'src/app/globals.css').read_text(encoding='utf-8'); light=css.split(':root {',1)[1].split('}',1)[0]
tokens['web']=dict(re.findall(r'--([\w-]+):\s*(#[0-9a-fA-F]{6})',light))
save('tokens/identidad.json',json.dumps(tokens,ensure_ascii=False,indent=2)+'\n')
save('tokens/identidad.css',':root {\n'+''.join(f'  --marca-{k}: {v};\n' for k,v in tokens['brand'].items())+'  --fuente-titulos: "Friend Bestie", sans-serif;\n  --fuente-textos: "Poppins", sans-serif;\n  --icono-trazo: 2;\n}\n.icono { fill: none; stroke: currentColor; stroke-width: var(--icono-trazo); stroke-linecap: round; stroke-linejoin: round; }\n')
save('iconos/LEEME.md','# Iconos redondos\n\n30 iconos originales en dos variantes: lineales (24 x 24) y circulares (40 x 40). Trazo 2, extremos y uniones round, margen mínimo 1 px incluido el trazo. Mantener la relación de aspecto. PNG: 24/48/96 para lineales, 40/80 para circulares.\n\nLos SVG lineales usan currentColor. Para aplicar color mediante CSS, incrustar el SVG o utilizar el sprite. Un SVG cargado con img no hereda el color de la página. Los circulares incluyen fondo y color de marca.\n\nSprite: <svg width="24" height="24" aria-hidden="true"><use href="/iconos/sprite.svg#icono-buscar"/></svg>. En botones sin texto, poner aria-label en el botón; junto a texto, ocultar el SVG de la accesibilidad. Probar el sprite sobre HTTP del mismo origen.\n')
cards=''.join(f'<article data-label="{n} {label}"><img src="circulares/{n}.svg" alt=""><img src="lineales/{n}.svg" alt=""><h2>{label}</h2><a href="lineales/{n}.svg" download>SVG lineal</a> · <a href="circulares/{n}.svg" download>SVG circular</a></article>' for n,(_,label) in ICONS.items())
save('iconos/titulo.svg',svg(text('Iconos redondos',0,57,58,'display'),650,80,'Iconos redondos'))
save('iconos/catalogo.html','<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Iconos Musicales</title><style>@font-face{font-family:Poppins;src:url(../fuentes/poppins/Poppins-Regular.ttf)}body{font:16px Poppins,Arial;background:#f4f3f6;color:#171320;margin:40px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px}article{background:white;border-radius:20px;padding:24px}img{width:48px;height:48px;margin-right:20px}h2{font-size:16px}a{color:#9e1b3c}input{padding:12px;margin:16px 0 28px;width:min(80%,450px)}</style><h1><img style="width:min(100%,650px);height:auto" src="titulo.svg" alt="Iconos redondos"></h1><p>30 iconos, dos variantes. Trazos y uniones redondeados.</p><label>Buscar <input id="buscar" type="search"></label><main>'+cards+'</main><script>document.querySelector("#buscar").addEventListener("input",e=>{const q=e.target.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");document.querySelectorAll("article").forEach(c=>c.hidden=!c.dataset.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").includes(q))})</script></html>')
save('LEEME.md','# Kit único de identidad - Musicales.com.ar\n\nEstado: Friend Bestie en el logo y títulos, Poppins para lectura y controles, monograma aprobado y 30 iconos originales redondos.\n\n- manual/: manual completo y hoja de estilo PDF.\n- logos/: variantes horizontales, verticales, isotipos y monocromáticas, SVG y PNG.\n- iconos/: lineales, circulares, PNG en tamaños reales, sprite y catálogo consultable.\n- aplicaciones/: avatar, favicon, Open Graph, posts, story y firma.\n- fuentes/: Poppins y su licencia; indicaciones para Friend Bestie.\n- tokens/: JSON y CSS.\n- VERIFICACION.json: controles geométricos, render y manifiesto.\n\nSVG con texto a curvas: se visualizan sin instalar fuentes. Para cambiar las frases de las plantillas, regenerar desde los scripts con la fuente licenciada. No son documentos con texto vivo.\n\nEsta entrega reemplaza las anteriores. No se desplegó el sitio durante esta actualización. Regeneración: consultar scripts/identidad/README.md en el proyecto.\n')
print(f'Current kit built: {len(ICONS)} icons x 2 variants, exact approved logo, applications and tokens.')

# Preserve and document an owner-provided font added to the working kit.
if (OUT/"fuentes/Friend Bestie.otf").exists():
 save("fuentes/LEEME.md", "# Tipografías\n\nFriend Bestie.otf fue agregada por el titular para editar el logo y los títulos. Copia de trabajo del propietario; la licencia no se transfiere a terceros.\n\nPoppins: textos y controles; fuentes y OFL incluidas.\n")
