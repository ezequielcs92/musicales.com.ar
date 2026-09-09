from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
import re
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'output/titulos-exploracion'
fonts={'body':TTFont(ROOT/'output/identidad-v2/fuentes/Poppins-Regular.ttf'),'label':TTFont(ROOT/'output/identidad-v2/fuentes/Poppins-SemiBold.ttf')}
for key in ['outfit','plusjakartasans','manrope']:
 file=next(f for f in (OUT/'fuentes').glob(key+'-*.ttf') if 'Italic' not in f.name)
 fonts[key]=instantiateVariableFont(TTFont(file),{'wght':700},inplace=False)
parts=['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 1590"><rect width="1500" height="1590" fill="#F4F3F6"/>']
def text(s,x,y,size,font='body',color='#171320'):
 f=fonts[font];gs=f.getGlyphSet();cm=f.getBestCmap();k=size/f['head'].unitsPerEm;p=SVGPathPen(gs)
 for ch in s:
  g=gs[cm[ord(ch)]];g.draw(TransformPen(p,(k,0,0,-k,x,y)));x+=g.width*k
 parts.append(f'<path fill="{color}" d="{p.getCommands()}"/>')
text('Títulos con carácter. Textos en Poppins.',64,86,38,'label')
text('El logo aprobado se mantiene. Tres alternativas para la jerarquía editorial.',64,131,21)
logo=(ROOT/'output/identidad-v2/logos/logo-claro.svg').read_text();inside=re.sub(r'^<svg[^>]*>|</svg>$','',logo)
parts.append(f'<g transform="translate(65 157) scale(.49)">{inside}</g>')
for i,(key,name,desc) in enumerate([('outfit','01 / Outfit 700','Mi recomendación: curvas expresivas y un tono cercano al símbolo.'),('plusjakartasans','02 / Plus Jakarta Sans 700','Una alternativa equilibrada, con una presencia más sobria.'),('manrope','03 / Manrope 700','Una alternativa más compacta, con un ritmo más técnico.')]):
 y=240+i*420
 parts.append(f'<rect x="48" y="{y}" width="1404" height="388" rx="16" fill="white"/>')
 text(name,80,y+48,23,'label','#9E1B3C')
 text('La escena que nos mueve',80,y+139,64,key)
 text('Historias, voces y nuevas miradas',80,y+195,37,key)
 text('El teatro musical argentino tiene mucho para contar. Descubrí estrenos,',80,y+251,23)
 text('entrevistas y críticas para seguir de cerca lo que pasa en escena.',80,y+287,23)
 text(desc,80,y+349,19,'label','#686174')
text('Mismo tamaño y peso en las tres opciones. Párrafos: Poppins 400.',64,1553,20)
parts.append('</svg>');(OUT/'comparativa-titulos.svg').write_text(''.join(parts),encoding='utf-8')
