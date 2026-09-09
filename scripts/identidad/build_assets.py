"""Rebuild the outlined identity assets from the supplied Google Fonts files."""
from pathlib import Path
import json
import html
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'output' / 'identidad'
FONTS = OUT / 'fuentes'
COLORS = {
    'Telón': ('#9E1B3C', '#E36285'), 'Bombilla': ('#E0AE42', '#F0CB72'),
    'Sala': ('#171320', '#F0EDF4'), 'Papel': ('#F4F3F6', '#131019'),
    'En cartel': ('#2C6E52', '#6FC79D'),
}
SALA, PAPEL, LIGHT, DARK = '#171320', '#F4F3F6', '#F0EDF4', '#131019'
TELON, AMBER = '#9E1B3C', '#E0AE42'

def instance(source, dest, axes):
    target = FONTS / dest
    if not target.exists():
        font = instantiateVariableFont(TTFont(FONTS / source), axes, inplace=False)
        font.save(target)
    return target

def prepare_fonts():
    instance('Archivo-Variable.ttf', 'Archivo-Logo-78-800.ttf', {'wdth':78, 'wght':800})
    instance('Archivo-Variable.ttf', 'Archivo-Display-90-750.ttf', {'wdth':90, 'wght':750})
    instance('Archivo-Variable.ttf', 'Archivo-UI-90-650.ttf', {'wdth':90, 'wght':650})
    instance('SourceSerif4-Variable.ttf', 'SourceSerif4-Text-400.ttf', {'opsz':20, 'wght':400})
    instance('SourceSerif4-Variable.ttf', 'SourceSerif4-Text-600.ttf', {'opsz':20, 'wght':600})

FONT_CACHE = {}
def get_font(name='Archivo-Logo-78-800.ttf'):
    if name not in FONT_CACHE:
        FONT_CACHE[name] = TTFont(FONTS / name)
    return FONT_CACHE[name]

def outline(text, size, x=0, baseline=0, fontname='Archivo-Logo-78-800.ttf', tracking=0):
    font = get_font(fontname)
    glyphs, cmap = font.getGlyphSet(), font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    pen = SVGPathPen(glyphs)
    cursor = x
    for i, char in enumerate(text):
        glyphname = cmap.get(ord(char))
        if glyphname is None:
            raise ValueError(f'Missing glyph: {char!r}')
        glyphs[glyphname].draw(TransformPen(pen, (scale, 0, 0, -scale, cursor, baseline)))
        cursor += glyphs[glyphname].width * scale + (tracking if i < len(text)-1 else 0)
    return pen.getCommands(), cursor-x

def path(text, size, x, baseline, fill=SALA, font='Archivo-Display-90-750.ttf', tracking=0):
    d, _ = outline(text, size, x, baseline, font, tracking)
    return f'<path fill="{fill}" d="{d}"/>'

def svg(body, width, height, label):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:g} {height:g}" role="img" aria-label="{html.escape(label, quote=True)}">{body}</svg>'

def rect(x,y,w,h,fill,stroke=None,sw=1):
    return f'<rect x="{x:g}" y="{y:g}" width="{w:g}" height="{h:g}" fill="{fill}"' + (f' stroke="{stroke}" stroke-width="{sw:g}"' if stroke else '') + '/>'

def circle(x,y,r,fill):
    return f'<circle cx="{x:g}" cy="{y:g}" r="{r:g}" fill="{fill}"/>'

def logo_geometry():
    font = get_font()
    glyphs = font.getGlyphSet()
    cap_pen=BoundsPen(glyphs)
    glyphs[font.getBestCmap()[ord('H')]].draw(cap_pen)
    cap=cap_pen.bounds[3]/font['head'].unitsPerEm*100
    parts=[]
    cursor=0
    for i, word in enumerate(['MUSICALES','COM','AR']):
        d, advance = outline(word, 100, cursor, 0, tracking=2)
        parts.append(('path',d))
        cursor+=advance
        if i<2:
            cursor+=9
            parts.append(('dot',cursor+7.5))
            cursor+=15+9
    # Use visible bounds so the lateral space is measured from the ink.
    from fontTools.pens.recordingPen import RecordingPen
    first=BoundsPen(glyphs); glyphs[font.getBestCmap()[ord('M')]].draw(first)
    last=BoundsPen(glyphs); glyphs[font.getBestCmap()[ord('R')]].draw(last)
    scale=100/font['head'].unitsPerEm
    left=first.bounds[0]*scale
    right=(glyphs[font.getBestCmap()[ord('R')]].width-last.bounds[2])*scale
    width=cursor-left-right+2*(4.8+62)
    cap_top=4.8+22+17+26
    baseline=cap_top+cap
    height=baseline+26+17+22+4.8
    return dict(parts=parts,width=width,height=height,cap=cap,baseline=baseline,
                tx=4.8+62-left,bulb_top=4.8+22+8.5,bulb_bottom=height-4.8-22-8.5)

def logo_body(mode='light', mono=False, bulbs=15):
    g=logo_geometry(); w,h=g['width'],g['height']
    ink= SALA if mode=='light' else LIGHT
    amber=ink if mono else (AMBER if mode=='light' else '#F0CB72')
    body=rect(2.4,2.4,w-4.8,h-4.8,'none',ink,4.8)
    for y in [g['bulb_top'],g['bulb_bottom']]:
        for i in range(bulbs):
            body+=circle(w/2+(i-(bulbs-1)/2)*43,y,8.5,amber)
    paths=''.join(f'<path fill="{ink}" d="{v}"/>' if k=='path' else circle(v,-26,7.5,amber) for k,v in g['parts'])
    body+=f'<g transform="translate({g["tx"]:g} {g["baseline"]:g})">{paths}</g>'
    return body,w,h

def place_logo(x,y,width,mode='light',mono=False):
    body,w,h=logo_body(mode,mono)
    return f'<g transform="translate({x:g} {y:g}) scale({width/w:g})">{body}</g>'

def iso_body(mode='light', mono=False):
    ink= SALA if mode=='light' else LIGHT
    amber=ink if mono else (AMBER if mode=='light' else '#F0CB72')
    body=rect(2.35,2.35,95.3,95.3,'none',ink,4.7)
    for y in [17,83]:
        for x in [30,50,70]: body+=circle(x,y,3.9,amber)
    font=get_font(); glyphs=font.getGlyphSet(); name=font.getBestCmap()[ord('M')]
    bounds=BoundsPen(glyphs); glyphs[name].draw(bounds)
    scale=60/font['head'].unitsPerEm
    x=50-(bounds.bounds[0]+bounds.bounds[2])*scale/2
    baseline=50+(bounds.bounds[1]+bounds.bounds[3])*scale/2
    body+=path('M',60,x,baseline,ink,'Archivo-Logo-78-800.ttf')
    return body

def place_iso(x,y,size,mode='dark'):
    return f'<g transform="translate({x:g} {y:g}) scale({size/100:g})">{iso_body(mode)}</g>'

ICONS = {
 'noticias': '<rect x="4" y="4" width="16" height="16"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 'criticas': '<path d="M5 20h14M7 16l-3 1 1-3L16 3l3 3Z M14 5l3 3"/>',
 'entrevistas': '<path d="M3 4h18v12H10l-5 4v-4H3Z M7 8h10M7 12h6"/>',
 'opinion': '<path d="M4 7h6v6H6v4H3v-5Zm11 0h6v6h-4v4h-3v-5Z"/>',
 'cartelera': '<rect x="3" y="5" width="18" height="16"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M14 14h3M7 17h3"/>',
 'talleres': '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 17.5h7M17.5 14v7"/>',
 'audiciones': '<circle cx="10" cy="7" r="3"/><path d="M3 20v-3a7 7 0 0 1 12-5M16 17h6M19 14l3 3-3 3"/>',
 'ubicacion': '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
 'horario': '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
 'entrada': '<path d="M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4Z M16 5v3M16 11v2M16 16v3"/>',
 'buscar': '<circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/>',
 'menu': '<path d="M3 6h18M3 12h18M3 18h18"/>',
 'cerrar': '<path d="m5 5 14 14M19 5 5 19"/>',
 'flecha': '<path d="M3 12h17M14 6l6 6-6 6"/>',
 'externo': '<path d="M14 3h7v7M21 3 11 13M10 5H3v16h16v-7"/>',
 'compartir': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m9 10 6-4M9 14l6 4"/>',
 'guardar': '<path d="M6 3h12v18l-6-4-6 4Z"/>',
 'filtro': '<path d="M3 6h18M3 12h18M3 18h18"/><rect x="7" y="4" width="3" height="4" fill="currentColor"/><rect x="14" y="10" width="3" height="4" fill="currentColor"/><rect x="6" y="16" width="3" height="4" fill="currentColor"/>',
 'confirmado': '<path d="m4 12 5 5L20 6"/>',
 'informacion': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7" r=".65" fill="currentColor"/>',
}

def icon_body(name, color='currentColor'):
    return f'<g fill="none" stroke="{color}" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter">{ICONS[name].replace("currentColor",color)}</g>'

def save(relative,content):
    (OUT/relative).write_text(content,encoding='utf-8')

def build():
    prepare_fonts()
    for mode,label in [('light','claro'),('dark','oscuro')]:
        for mono,suffix in [(False,''),(True,'-monocromatico')]:
            body,w,h=logo_body(mode,mono)
            save(f'logos/logo-{label}{suffix}.svg',svg(body,w,h,'Musicales.com.ar'))
        save(f'logos/isotipo-{label}.svg',svg(iso_body(mode),100,100,'Musicales.com.ar'))
    save('logos/isotipo-monocromatico.svg',svg(iso_body('light',True),100,100,'Musicales.com.ar'))
    save('aplicaciones/favicon.svg',svg(rect(0,0,100,100,SALA)+place_iso(8,8,84),100,100,'Musicales.com.ar'))
    save('aplicaciones/avatar.svg',svg(rect(0,0,320,320,SALA)+place_iso(70,70,180),320,320,'Musicales.com.ar'))
    og=rect(0,0,1200,630,SALA)+place_logo(120,176,960,'dark')
    title='Teatro musical argentino'
    _,tw=outline(title,40, fontname='SourceSerif4-Text-400.ttf')
    og+=path(title,40,(1200-tw)/2,482,LIGHT,'SourceSerif4-Text-400.ttf')
    save('aplicaciones/open-graph.svg',svg(og,1200,630,'Musicales.com.ar. Teatro musical argentino'))
    for name in ICONS:
        save(f'iconos/{name}.svg',svg(icon_body(name),24,24,name))
    sprite='<svg xmlns="http://www.w3.org/2000/svg">'+''.join(f'<symbol id="{n}" viewBox="0 0 24 24">{icon_body(n)}</symbol>' for n in ICONS)+'</svg>'
    save('iconos/sprite.svg',sprite)
    # Editable social layouts: all vector objects; typography is outlined.
    for name,category,lines in [
        ('post-editorial','ENTREVISTAS',['LAS VOCES','DE LA ESCENA']),
        ('post-cartelera','CARTELERA',['TU PRÓXIMA','SALIDA AL TEATRO']),
        ('post-audiciones','AUDICIONES',['EL PRÓXIMO','PASO EN ESCENA']),
    ]:
        body=rect(0,0,1080,1350,PAPEL)+place_logo(80,80,520)
        body+=path(category,28,80,335,TELON,'IBMPlexMono-Medium.ttf')
        for i,line in enumerate(lines):body+=path(line,88,80,465+i*96)
        body+=rect(80,660,920,4,SALA)
        captions={'post-editorial':['Conversaciones sobre el oficio,','el proceso y lo que viene.'],
                  'post-cartelera':['Obras, salas y funciones.','Consultá la información actualizada.'],
                  'post-audiciones':['Convocatorias para intérpretes.','Requisitos y fechas en cada ficha.']}
        for i,line in enumerate(captions[name]):body+=path(line,38,80,745+i*54,SALA,'SourceSerif4-Text-400.ttf')
        body+=path('Leé más en Musicales.com.ar',25,80,1200,TELON,'IBMPlexMono-Medium.ttf')
        save(f'aplicaciones/{name}.svg',svg(body,1080,1350,f'Musicales.com.ar - {category}'))
    body=rect(0,0,1080,1920,SALA)+place_logo(90,280,900,'dark')
    body+=path('TEATRO MUSICAL',86,90,800,LIGHT)+path('ARGENTINO',112,90,925,LIGHT)
    body+=path('Noticias, miradas y cartelera.',37,90,1090,LIGHT,'SourceSerif4-Text-400.ttf')
    body+=path('Entrá a Musicales.com.ar',29,90,1510,'#E36285','IBMPlexMono-Medium.ttf')
    save('aplicaciones/story.svg',svg(body,1080,1920,'Musicales.com.ar. Teatro musical argentino'))
    tokens={}
    css=['/* Musicales.com.ar | Identidad v1.0 | Base: brief v2 */',':root {']
    names=['telon','bombilla','sala','papel','en-cartel']
    for slug,(label,values) in zip(names,COLORS.items()):
        tokens[slug]={'name':label,'light':values[0],'dark':values[1]}
        css.append(f'  --marca-{slug}: {values[0]};')
    css+=['}','[data-theme="dark"] {']
    for slug,t in tokens.items():css.append(f'  --marca-{slug}: {t["dark"]};')
    css+=['}','.marca-display { font-family: "Archivo", sans-serif; font-variation-settings: "wdth" 90, "wght" 750; }',
          '.marca-texto { font-family: "Source Serif 4", serif; }',
          '.marca-datos { font-family: "IBM Plex Mono", monospace; font-variant-numeric: tabular-nums; }']
    save('tokens/colores.json',json.dumps(tokens,ensure_ascii=False,indent=2)+'\n')
    save('tokens/identidad.css','\n'.join(css)+'\n')
    g=logo_geometry()
    save('tokens/construccion.json',json.dumps({k:v for k,v in g.items() if k!='parts'},indent=2)+'\n')
    print(f'Logo viewBox: {g["width"]:.3f} x {g["height"]:.3f}; cap height: {g["cap"]:.3f}')
    print(f'Generated {len(ICONS)} icons and SVG identity assets.')

if __name__=='__main__':build()
