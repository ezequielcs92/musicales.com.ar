"""Outlined Poppins/Montserrat type specimens; these are not final logos."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'output'/'identidad-exploracion-sans'
FONTS=OUT/'fuentes'
INK,PAPER,ACCENT='#171320','#F4F3F6','#9E1B3C'
fonts={('Poppins',w):TTFont(FONTS/name) for w,name in [(400,'Poppins-Regular.ttf'),(600,'Poppins-SemiBold.ttf'),(700,'Poppins-Bold.ttf')]}
for w in [400,600,700]:
    fonts['Montserrat',w]=instantiateVariableFont(TTFont(FONTS/'Montserrat-Variable.ttf'),{'wght':w},inplace=False)

body=[]
def rect(x,y,w,h,color):body.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}"/>')
def text(label,x,y,size=22,family='Poppins',weight=400,color=INK,maxw=720):
    font=fonts[family,weight];glyphs=font.getGlyphSet();cmap=font.getBestCmap()
    scale=size/font['head'].unitsPerEm;cursor=x;pen=SVGPathPen(glyphs);bounds=BoundsPen(glyphs)
    for char in label:
        glyph=glyphs[cmap[ord(char)]]
        transform=(scale,0,0,-scale,cursor,y)
        glyph.draw(TransformPen(pen,transform));glyph.draw(TransformPen(bounds,transform))
        cursor+=glyph.width*scale
    assert cursor-x<=maxw,(label,cursor-x,maxw)
    if bounds.bounds:
        x0,y0,x1,y1=bounds.bounds
        assert 0<=x0<x1<=1800 and 0<=y0<y1<=1230,(label,bounds.bounds)
    body.append(f'<path fill="{color}" d="{pen.getCommands()}"/>')

rect(0,0,1800,1230,PAPER)
text('MUSICALES.COM.AR / EXPLORACIÓN TIPOGRÁFICA',64,57,18,weight=600,maxw=1600)
text('Una identidad sans serif.',64,130,48,weight=600,maxw=1600)
text('Mismo contenido, tamaño y peso para comparar las formas de cada familia.',64,179,23,maxw=1600)
rect(899,238,1,876,INK)
for i,family in enumerate(['Poppins','Montserrat']):
    x=64+i*900
    text(f'0{i+1} / {family}',x,269,36,family,600,ACCENT)
    text('NOMBRE / BOLD 700',x,330,15,family,600)
    text('Musicales.com.ar',x,409,65,family,700,maxw=776)
    text('Teatro musical argentino',x,458,26,family)
    rect(x,514,772,1,INK)
    text('TÍTULOS / SEMIBOLD 600',x,561,15,family,600)
    text('Las voces detrás',x,625,46,family,600)
    text('de cada función.',x,684,46,family,600)
    text('LECTURA / REGULAR 400',x,757,15,family,600)
    for j,line in enumerate(['Historias, entrevistas y miradas sobre el teatro',
                             'musical argentino. Un espacio para seguir',
                             'la cartelera y conocer el trabajo de quienes',
                             'hacen posible cada puesta.']):
        text(line,x,803+j*40,25,family,maxw=776)
    rect(x,1000,223,58,ACCENT)
    text('Ver cartelera',x+25,1038,22,family,600,PAPER,maxw=180)
    text('VIE 20:30 · CABA',x+262,1038,22,family,600)
text('Estudio de letra: el diseño del logo sigue abierto.',64,1184,20,weight=400,maxw=1600)
(OUT/'comparativa-poppins-montserrat.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1230" role="img" aria-label="Comparativa tipográfica de Poppins y Montserrat para Musicales.com.ar">'+''.join(body)+'</svg>',encoding='utf-8')
print('Comparison SVG created. All text outlined; bounds verified.')
