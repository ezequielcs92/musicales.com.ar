"""Render and document the current kit with exact Friend Bestie title outlines."""
from pathlib import Path
from io import BytesIO
import json
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
from build_kit import ROOT,OUT,ICONS,outline,svg,INK,PAPER,RED,PINK,LIGHT
for key,name in [('body','Regular'),('semi','SemiBold'),('bold','Bold')]:pdfmetrics.registerFont(TTFont(key,str(ROOT/f'assets/fonts/poppins/Poppins-{name}.ttf')))
class Book:
 def __init__(self,file,w=960,h=600):self.w=w;self.h=h;self.page=0;self.c=canvas.Canvas(str(file),pagesize=(w,h));self.c.setTitle('Musicales.com.ar | Identidad vigente');self.c.setAuthor('Musicales.com.ar')
 def box(self,x,y,w,h,col):self.c.setFillColor(HexColor(col));self.c.rect(x,self.h-y-h,w,h,fill=1,stroke=0)
 def txt(self,s,x,y,size=16,font='body',color=None):
  color=color or self.ink
  assert x+pdfmetrics.stringWidth(s,font,size)<=self.w-32, f'Text overflow p{self.page}: {s}'
  assert y+size<self.h-22, f'Vertical overflow p{self.page}: {s}'
  self.c.setFillColor(HexColor(color));self.c.setFont(font,size);self.c.drawString(x,self.h-y-size,s)
 def para(self,s,x,y,w=850,size=16,color=None):
  for i,line in enumerate(simpleSplit(s,'body',size,w)):self.txt(line,x,y+i*size*1.55,size,color=color)
 def vector(self,data,x,y,w):
  d=svg2rlg(BytesIO(data.encode()));k=w/d.width
  self.c.saveState();self.c.translate(x,self.h-y-d.height*k);self.c.scale(k,k);renderPDF.draw(d,self.c,0,0);self.c.restoreState()
 def asset(self,file,x,y,w):self.vector((OUT/file).read_text(encoding='utf-8').replace('currentColor',self.ink),x,y,w)
 def title(self,s,x,y,size=40,color=None,maxw=864):
  color=color or self.ink;d,w=outline(s,0,size,size,'display')
  if w>maxw:size*=maxw/w;d,w=outline(s,0,size,size,'display')
  self.vector(svg(f'<path fill="{color}" d="{d}"/>',w+2,size*1.3,s),x,y,w+2)
 def start(self,title,dark=False):
  if self.page:self.c.showPage()
  self.page+=1;self.ink=LIGHT if dark else INK
  self.box(0,0,self.w,self.h,INK if dark else PAPER)
  self.txt('MUSICALES.COM.AR / MANUAL DE IDENTIDAD',48,22,10,'semi');self.title(title,48,69)
  self.txt('IDENTIDAD VIGENTE / 09.09.2026',48,self.h-31,8);self.txt(f'{self.page:02}',self.w-65,self.h-33,10,'semi')
 def finish(self):self.c.save()
b=Book(OUT/'manual/Manual-de-identidad.pdf')
b.start('Una identidad que se siente')
b.asset('logos/logo-claro.svg',48,206,864)
b.para('Teatro musical argentino. Una marca expresiva, cercana y reconocible que conecta historias, artistas y públicos.',48,359,size=20)
b.txt('Friend Bestie + Poppins / Símbolo propio / Iconos redondos',48,491,15,'semi')
b.start('El sistema, de un vistazo')
b.asset('logos/isotipo-claro.svg',48,160,170)
b.title('La escena nos mueve.',264,167,45,maxw=620)
b.para('Friend Bestie da voz al nombre del logo y a los títulos. Poppins sostiene la lectura y los controles. El símbolo de dos trazos curvos mantiene su forma aprobada.',264,255,620)
b.para('Los iconos comparten curvas, trazo uniforme y extremos redondos. Se entregan solos y dentro de un círculo, para distintos contextos de uso.',48,421)
b.start('Logo principal')
b.asset('logos/logo-claro.svg',48,163,864)
b.para('Usar el conjunto horizontal como primera opción. Mantener la escritura en minúsculas, el dominio completo, las proporciones y el espaciado del máster.',48,304)
b.para('El símbolo y el nombre se entregan como curvas vectoriales. No requieren fuentes instaladas para verse correctamente. El isotipo se reserva para avatar, favicon y espacios reducidos.',48,414)
b.start('Variantes que resuelven espacios')
b.asset('logos/logo-claro.svg',48,165,545);b.box(32,285,580,145,INK);b.asset('logos/logo-oscuro.svg',48,315,545)
b.asset('logos/logo-vertical-claro.svg',644,166,264)
b.txt('Horizontal claro / horizontal oscuro',48,462,14,'semi');b.txt('Composición vertical',644,324,14,'semi')
b.para('Las versiones monocromáticas son para una tinta o fondos que exigen simplificar.',48,506,size=14)
b.start('Protección y escala')
b.box(69,151,818,155,'#E9DFE7');b.box(94,176,768,105,PAPER);b.asset('logos/logo-claro.svg',111,184,734)
b.para('Dejar libre alrededor del logo al menos un cuarto del ancho del símbolo. La franja de color ilustra ese espacio: no forma parte del logo.',48,344)
b.para('Pantalla: logo completo desde 240 px de ancho; isotipo desde 24 px. Impresión: logo desde 45 mm e isotipo desde 6 mm. Son mínimos de trabajo; revisar una prueba física según soporte y técnica.',48,435,size=15)
b.start('Monocromía y usos incorrectos')
b.asset('logos/logo-claro-monocromatico.svg',48,166,845)
b.box(32,278,896,135,INK);b.asset('logos/logo-oscuro-monocromatico.svg',48,298,845)
b.para('No estirar, inclinar, agregar sombras, recortar letras ni volver a la marquesina. No sustituir Friend Bestie por una fuente parecida. Usar siempre el archivo de la variante correspondiente.',48,450,size=15)
b.start('Color de marca')
colors=[('Telón',RED,'Símbolo sobre claro'),('Sala',INK,'Texto y fondo oscuro'),('Papel',PAPER,'Fondo de marca'),('Rosa',PINK,'Símbolo sobre oscuro'),('Blanco',LIGHT,'Texto sobre Sala'),('Ámbar','#E0AE42','Acento secundario')]
for i,(name,col,role) in enumerate(colors):
 x=48+(i%3)*296;y=160+(i//3)*173;b.box(x,y,265,70,col);b.txt(name+' / '+col,x,y+79,14,'semi');b.txt(role,x,y+111,12)
b.txt('Usar ámbar con texto oscuro; no como texto pequeño sobre fondos claros.',48,519,13)
b.start('Color en la interfaz digital')
tokens=json.loads((OUT/'tokens/identidad.json').read_text());web=tokens['web']
for i,(key,label) in enumerate([('primary','Primario'),('violet','Violeta'),('magenta','Magenta'),('bg','Fondo claro'),('dark','Fondo oscuro'),('en-cartel','En cartel')]):
 x=48+(i%3)*296;y=160+(i//3)*150;b.box(x,y,265,61,web[key]);b.txt(label+' / '+web[key],x,y+73,14,'semi')
b.para('Esta paleta complementa los colores del logo y documenta la web actual. El primario identifica acciones; violeta y magenta aportan acento. Los estados siempre llevan texto o icono además de color.',48,474,size=14)
b.start('Tipografía: una voz, dos funciones')
b.title('La escena nos mueve.',48,161,65)
b.txt('Friend Bestie / Logo y títulos / Variante sans serif',48,264,17,'semi',RED)
b.para('Poppins hace que historias, datos y controles se lean con calma. Regular 400 para párrafos; SemiBold 600 para etiquetas y acciones; Bold 700 para énfasis.',48,322,size=18)
b.txt('Títulos: 32-56 px. Cuerpo: 16-18 px, interlineado 1,5-1,7.',48,449,15,'semi')
b.txt('Friend Bestie se usa en su peso original, sin negrita o cursiva artificial.',48,498,14)
b.start('Componer títulos y lectura')
b.title('Historias que salen a escena',48,156,49)
b.para('Una tipografía expresiva funciona mejor con espacio alrededor. Usar títulos breves, evitar párrafos enteros en Friend Bestie y mantener una jerarquía clara.',48,267)
b.para('Los textos largos, fechas, precios, navegación y formularios van en Poppins. En textos densos, trabajar con 55-75 caracteres por línea y alinear a la izquierda.',48,373)
b.txt('Evitar mayúsculas sostenidas en textos largos y ajustes de ancho artificiales.',48,499,13)
b.start('Iconos realmente redondos')
b.asset('iconos/lineales/cartelera.svg',62,160,125);b.asset('iconos/circulares/cartelera.svg',243,146,160)
b.para('Cuadrícula lineal: 24 x 24 px. Trazo: 2 px. Extremos y uniones: round. Curvas y radios explícitos en la geometría, sin esquinas miter ni terminales cuadrados.',455,164,450)
b.para('Variante circular: 40 x 40 px, con el mismo dibujo de 24 px centrado y 8 px de margen. El círculo tiene fondo Papel teñido (#E9DFE7) y el símbolo, Telón.',455,310,450)
b.para('No es una colección de glifos tipográficos: cada archivo contiene geometría SVG. Escalar de forma uniforme. El tamaño visual del icono no reemplaza el área táctil del botón.',48,456,size=14)
b.start('Catálogo de iconos lineales')
for i,(name,(_,label)) in enumerate(ICONS.items()):
 x=48+(i%6)*148;y=159+(i//6)*70;b.asset(f'iconos/lineales/{name}.svg',x,y,28);b.txt(label,x,y+36,10)
b.start('Catálogo de iconos circulares')
for i,(name,(_,label)) in enumerate(ICONS.items()):
 x=48+(i%6)*148;y=149+(i//6)*77;b.asset(f'iconos/circulares/{name}.svg',x,y,37);b.txt(label,x,y+42,10)
b.start('Accesibilidad y uso técnico')
b.para('En botones sin texto, dar un nombre accesible a la acción. Si el texto ya explica la acción, ocultar el SVG al lector de pantalla para evitar repeticiones.',48,160)
b.para('Los SVG lineales usan currentColor. Para cambiar el color, incrustarlos o usar el sprite. Un archivo dentro de una etiqueta img no hereda el color del documento.',48,275)
b.para('Entregas: 30 SVG lineales, 30 circulares, sprite con 30 símbolos y 150 PNG de iconos. El catálogo HTML permite buscar y descargar cada variante. Mantener al menos 44 x 44 px de área táctil como criterio de diseño.',48,392)
b.start('Aplicaciones para redes')
for i,name in enumerate(['post-cartelera','post-editorial','post-audiciones']):b.asset(f'aplicaciones/{name}.svg',48+i*296,154,262)
b.txt('1080 x 1350 px / Frases de ejemplo / Texto convertido a curvas',48,517,13)
b.start('Avatar, story y vista previa')
b.asset('aplicaciones/open-graph.svg',48,154,475);b.asset('aplicaciones/avatar.svg',48,447,80);b.asset('aplicaciones/story.svg',678,148,205)
b.txt('Open Graph / 1200 x 630',48,410,12,'semi');b.txt('Avatar / 320 x 320',163,463,12,'semi');b.txt('Story / 1080 x 1920',678,528,11,'semi')
b.start('Voz y composición')
b.para('Hablar con cercanía y precisión: nombres completos, créditos correctos, datos verificables y opinión identificada. Preferir verbos concretos: Ver cartelera, Leer la crítica, Enviar a revisión.',48,158)
b.para('Usar imágenes con gesto y contexto de escena. Respetar permisos y créditos. Evitar texto sobre rostros y usar superficies sólidas cuando una fotografía dificulte la lectura.',48,285)
b.para('Alinear logo, títulos e imágenes a una misma cuadrícula. Espaciados: 8, 16, 24, 32, 48 y 64 px. Radios de interfaz: 12, 20 y píldora. Una historia por pieza y una acción principal.',48,411)
b.start('Archivos y producción')
b.para('Este kit es la única entrega vigente. Incluye manual, hoja de estilo, logos, iconos, aplicaciones, catálogo, tokens y archivos Poppins con licencia OFL. Para trabajar, usar exclusivamente esta entrega vigente.',48,159)
b.para('Friend Bestie está licenciada para el proyecto según el registro vigente. El titular incorporó el archivo OTF a su copia de trabajo. Los títulos y logos están convertidos a curvas. La inclusión del archivo no transfiere la licencia a terceros.' if (OUT/'fuentes/Friend Bestie.otf').exists() else 'Friend Bestie está licenciada para el proyecto. Su archivo propietario no se redistribuye en este paquete. Para editar textos, usar la copia licenciada del titular.',48,286)
b.para('Los SVG son los maestros. Los PNG son RGB para uso digital. Para impresión, el proveedor debe preparar perfiles, separaciones y prueba física. Esta actualización del kit no realiza un despliegue del sitio.',48,424,size=15)
b.finish();print(f'Manual: {b.page} pages')
s=Book(OUT/'manual/Hoja-de-estilo.pdf',595.28,841.89);s.page=1;s.ink=INK;s.box(0,0,s.w,s.h,PAPER)
s.title('Hoja de estilo',34,29,33,maxw=525);s.asset('logos/logo-claro.svg',34,102,527)
s.title('Friend Bestie',34,205,32,maxw=520);s.txt('Logo y títulos. Peso original.',34,258,12)
s.txt('Poppins / Lectura y controles / 400, 600, 700',34,302,14,'semi')
s.para('Cuerpo 16-18 px. Interlineado 1,5-1,7. Títulos 32-56 px. Mantener espacio libre y evitar el uso de Friend Bestie en párrafos.',34,343,520,12)
for i,(name,col,_) in enumerate(colors):
 x=34+i*88;s.box(x,417,77,39,col);s.txt(name,x,465,9,'semi');s.txt(col,x,482,8)
s.title('Iconos redondos',34,527,29,maxw=520)
for i,n in enumerate(list(ICONS)[:8]):s.asset(f'iconos/circulares/{n}.svg',34+i*66,583,43)
s.para('24 px / trazo 2 px / round. Variante circular de 40 px. Logo desde 240 px; isotipo desde 24 px. Usar los archivos maestros.',34,660,520,12)
s.txt('MUSICALES.COM.AR / IDENTIDAD VIGENTE / 09.09.2026',34,790,9,'semi');s.finish()
print('Style sheet: 1 page')
