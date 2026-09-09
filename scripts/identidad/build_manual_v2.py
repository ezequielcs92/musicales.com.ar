"""Current identity manual: original ribbon monogram and Poppins."""
from pathlib import Path
from io import BytesIO
import shutil, json
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
ROOT=Path(__file__).resolve().parents[2]; OUT=ROOT/'output/identidad-v2'; PDF=ROOT/'output/pdf/Musicales-com-ar-Manual-de-identidad-v2.pdf'
shutil.copytree(ROOT/'output/identidad/iconos',OUT/'iconos',dirs_exist_ok=True)
for n,f in [('regular','Regular'),('bold','Bold'),('semi','SemiBold')]:pdfmetrics.registerFont(TTFont(n,str(OUT/f'fuentes/Poppins-{f}.ttf')))
INK='#171320'; PAPER='#F4F3F6'; RED='#9E1B3C'; PINK='#E36285'
c=canvas.Canvas(str(PDF),pagesize=(960,600));c.setTitle('Musicales.com.ar | Identidad visual v2');c.setAuthor('Musicales.com.ar');page=0

def box(x,y,w,h,color):c.setFillColor(HexColor(color));c.rect(x,600-y-h,w,h,fill=1,stroke=0)
def text(s,x,y,size=16,font='regular',color=INK):
 c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,600-y-size,s)
def para(s,x,y,w=810,size=16,color=INK):
 for i,line in enumerate(simpleSplit(s,'regular',size,w)):text(line,x,y+i*size*1.6,size,color=color)
def asset(file,x,y,w):
 data=(OUT/file).read_text(encoding='utf-8').replace('currentColor',INK)
 if file.startswith('iconos/'):data=data.replace('<svg ', '<svg width='+chr(34)+'24'+chr(34)+' height='+chr(34)+'24'+chr(34)+' ')
 d=svg2rlg(BytesIO(data.encode()));scale=w/d.width
 c.saveState();c.translate(x,600-y-d.height*scale);c.scale(scale,scale);renderPDF.draw(d,c,0,0);c.restoreState()
def start(title,dark=False):
 global page
 if page:c.showPage()
 page+=1;box(0,0,960,600,INK if dark else PAPER);color=PAPER if dark else INK
 text('MUSICALES.COM.AR / IDENTIDAD V2',48,24,10,'semi',color);text(title,48,75,34,'bold',color)
 text('09.09.2026 / Nueva propuesta aplicada en el proyecto local',48,566,9,color=color);text(f'{page:02}',888,562,13,'semi',color)

start('Una identidad en movimiento')
asset('logos/logo-claro.svg',48,204,864)
para('Un medio dedicado al teatro musical argentino. Una marca cercana, contemporánea y reconocible, construida con un símbolo propio y un nombre que se lee completo.',48,365)
text('Logo / Color / Tipografía / Iconos / Aplicaciones / Interfaz',48,488,14,'semi')
start('El concepto')
asset('logos/isotipo-claro.svg',55,200,245)
para('Dos trazos curvos forman una m abstracta. La continuidad de las formas propone encuentro, movimiento y una escena que se construye entre muchas personas.',350,193,550)
para('El símbolo puede vivir solo en espacios pequeños. El nombre completo mantiene la dirección del medio y utiliza Poppins en minúsculas.',350,345,550)
start('Logo principal y variantes')
asset('logos/logo-claro.svg',48,165,800)
box(32,315,896,200,INK);asset('logos/logo-oscuro.svg',48,366,800)
text('Principal sobre fondo claro',48,273,13,'semi');text('Versión clara con símbolo rosa sobre fondo oscuro',48,477,13,'semi',PAPER)
start('Área de protección y tamaños')
asset('logos/logo-claro.svg',96,180,760)
para('Reservar alrededor del conjunto un espacio libre de al menos un cuarto del ancho del símbolo. Mantener sus proporciones y la separación entre símbolo y nombre.',48,315)
para('Mínimo recomendado en pantalla: 240 px de ancho para el logo completo. Para espacios menores, utilizar el isotipo desde 24 px. En impresión, partir de 45 mm y 6 mm respectivamente; validar siempre una prueba física.',48,407)
start('Uso monocromático')
asset('logos/logo-claro-monocromatico.svg',48,170,840)
box(32,304,896,175,INK);asset('logos/logo-oscuro-monocromatico.svg',48,341,840)
text('Usar las variantes provistas para una sola tinta, sellos o fondos exigentes.',48,504,15)
start('Color con función')
colors=[('Telón',RED,'Marca y acción principal'),('Sala',INK,'Texto y fondos oscuros'),('Papel',PAPER,'Fondo principal'),('Rosa',PINK,'Marca sobre oscuro'),('Ámbar','#E0AE42','Acentos editoriales'),('En cartel','#2C6E52','Confirmación y estado')]
for i,(name,hex,role) in enumerate(colors):
 x=48+(i%3)*298;y=156+(i//3)*170;box(x,y,270,70,hex);text(name+' / '+hex,x,y+82,15,'semi');text(role,x,y+113,12)
text('Ámbar se acompaña con texto Sala. Los estados siempre incluyen una etiqueta.',48,516,13)
start('Poppins, de la marca a la lectura')
text('La escena se cuenta.',48,172,49,'bold')
text('Cartelera, críticas y nuevas voces.',48,257,27,'semi')
para('La tipografía es sans serif en toda la experiencia: títulos, lectura, navegación y formularios. Poppins 700 aporta carácter; 600 organiza la información; 400 sostiene los textos largos.',48,331)
text('Web: H1 36-56 / H2 24-32 / cuerpo 16-18 / etiquetas 12-14 px.',48,465,15,'semi')
text('Interlineado de lectura: 1,5-1,7. Evitar mayúsculas en párrafos.',48,503,14)
start('Un sistema de iconos')
icons=sorted(f for f in (OUT/'iconos').glob('*.svg') if f.stem != 'sprite')
for i,f in enumerate(icons):
 x=48+(i%6)*145;y=157+(i//6)*89;asset('iconos/'+f.name,x,y,30);text(f.stem,x,y+39,10)
text('20 SVG. Trazo consistente, uso monocromático y etiquetas en acciones ambiguas.',48,527,12)
start('Composición y fotografía')
para('La información manda: título claro, una imagen protagonista, contexto breve y una acción principal. Usar espacio libre para separar bloques y alinear texto, logo e imagen a una misma cuadrícula.',48,161)
para('Elegir fotografías con emoción, gesto y contexto de escena. Respetar créditos y permisos. Evitar texto sobre rostros; cuando una imagen dificulte la lectura, ubicar el contenido en una superficie sólida.',48,294)
para('Escala de espaciado recomendada: 8, 16, 24, 32, 48 y 64 px. En móvil, márgenes de 20-24 px. La marca aparece una vez por pieza, con jerarquía secundaria frente a la historia.',48,426)
start('Aplicaciones digitales')
asset('aplicaciones/open-graph.svg',48,152,590);asset('aplicaciones/avatar.svg',701,164,165)
text('Vista previa social / 1200 x 630 px',48,481,14,'semi');text('Avatar',701,350,14,'semi')
para('El favicon conserva el símbolo solo. Revisar contraste y reconocimiento a tamaño real.',701,394,200,13)
start('Una redacción familiar')
para('El administrador organiza el trabajo con una barra superior, un menú lateral y un escritorio con estados y actividad reciente. En pantallas pequeñas, el menú se abre desde un botón visible.',48,160)
para('El editor visual ofrece títulos, negrita, listas, citas, enlaces e imágenes. El contenido se guarda en Markdown, con modo Texto y vista previa. La columna de publicación concentra estado, sección y guardado.',48,296)
para('Los permisos editoriales gobiernan las acciones. El colaborador puede preparar borradores y enviarlos a revisión. Los errores de guardado deben conservar el contenido para que el trabajo no se pierda.',48,431)
start('Reglas de uso y archivos')
para('Usar siempre los SVG maestros. No estirar, inclinar, agregar efectos ni reescribir el nombre con otra fuente. No encerrar el logo en marcos decorativos ni volver al concepto de marquesina o lámparas.',48,158)
para('La voz editorial es clara, informada y cercana: nombres bien escritos, datos verificables y opinión identificada. Preferir verbos concretos y llamados como Ver cartelera, Leer la crítica o Enviar a revisión.',48,291)
para('El kit incluye logos claros, oscuros y monocromáticos; isotipo; PNG; favicon; avatar; Open Graph; iconos y Poppins con licencia OFL. El manual anterior queda como histórico. Esta propuesta no implica aprobación estética del usuario ni despliegue público.',48,424,size=14)
c.save()
(OUT/'LEEME.md').write_text('# Identidad v2\n\nConcepto nuevo: monograma de dos trazos curvos + Poppins. La marquesina queda descartada por indicación expresa del usuario.\n\nLos SVG son maestros vectoriales con letras convertidas a curvas. El PNG concepto-generado.png es la exploración de imagen; los archivos de logos son la reconstrucción vectorial de producción.\n\nManual actual: ../pdf/Musicales-com-ar-Manual-de-identidad-v2.pdf. Fuentes con licencia OFL en fuentes/. El kit v1 es histórico. No implica despliegue ni aprobación estética final.\n',encoding='utf-8')
(OUT/'tokens.json').write_text(json.dumps({'fontFamily':'Poppins','colors':dict((name,hex) for name,hex,role in colors),'spacing':[8,16,24,32,48,64]},indent=2),encoding='utf-8')
print(f'{page} pages: {PDF}')



