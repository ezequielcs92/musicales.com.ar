"""Build the visual identity manual and one-page style sheet (embedded fonts)."""
from pathlib import Path
from io import BytesIO
from functools import lru_cache
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import simpleSplit
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg
from build_assets import OUT, ROOT, FONTS, COLORS, ICONS, SALA, PAPEL, LIGHT, DARK, TELON, AMBER, logo_geometry
import json

PDF = ROOT / 'output' / 'pdf'
for name,file in [('display','Archivo-Display-90-750.ttf'),('ui','Archivo-UI-90-650.ttf'),('serif','SourceSerif4-Text-400.ttf'),('serifbold','SourceSerif4-Text-600.ttf'),('mono','IBMPlexMono-Regular.ttf'),('monobold','IBMPlexMono-Medium.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(FONTS/file)))

def luminance(hex):
    values=[int(hex[i:i+2],16)/255 for i in (1,3,5)]
    v=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in values]
    return sum(x*y for x,y in zip(v,[.2126,.7152,.0722]))

def contrast(a,b):
    x,y=sorted([luminance(a),luminance(b)])
    return (y+.05)/(x+.05)

@lru_cache(maxsize=80)
def drawing(relative):
    data=(OUT/relative).read_text(encoding='utf-8').replace('currentColor',SALA)
    return svg2rlg(BytesIO(data.encode()))

class Book:
    def __init__(self,path,w=960,h=600):
        self.w,self.h,self.page=w,h,0
        self.c=canvas.Canvas(str(path),pagesize=(w,h),pageCompression=1)
        self.c.setTitle('Musicales.com.ar | Manual de identidad' if w==960 else 'Musicales.com.ar | Hoja de estilo')
        self.c.setAuthor('Musicales.com.ar')
        self.c.setSubject('Identidad v1.0 basada en el brief v2 del 8 de septiembre de 2026')
    def box(self,x,y,w,h,color,stroke=None,sw=1):
        c=self.c;c.setFillColor(HexColor(color))
        if stroke:c.setStrokeColor(HexColor(stroke));c.setLineWidth(sw)
        c.rect(x,self.h-y-h,w,h,fill=1,stroke=int(bool(stroke)))
    def line(self,x,y,x2,y2,color=SALA,sw=1):
        self.c.setStrokeColor(HexColor(color));self.c.setLineWidth(sw)
        self.c.line(x,self.h-y,x2,self.h-y2)
    def text(self,s,x,y,size=14,font='serif',color=None,maxw=None):
        color=color or self.ink
        if maxw is not None:
            assert pdfmetrics.stringWidth(s,font,size)<=maxw+.1, f'Text overflow page {self.page}: {s}'
        self.c.setFillColor(HexColor(color));self.c.setFont(font,size)
        self.c.drawString(x,self.h-y-size,s)
    def para(self,s,x,y,width,size=15,color=None,font='serif',leading=None):
        leading=leading or size*1.48
        lines=simpleSplit(s,font,size,width)
        for i,line in enumerate(lines):self.text(line,x,y+i*leading,size,font,color,maxw=width)
        return y+len(lines)*leading
    def asset(self,name,x,y,width,height=None):
        d=drawing(name);scale=width/d.width
        if height:scale=min(scale,height/d.height)
        self.c.saveState();self.c.translate(x,self.h-y-d.height*scale);self.c.scale(scale,scale)
        renderPDF.draw(d,self.c,0,0);self.c.restoreState()
        return d.height*scale
    def start(self,section,title=None,dark=False):
        if self.page:self.c.showPage()
        self.page+=1;self.ink=LIGHT if dark else SALA;self.bg=SALA if dark else PAPEL
        self.box(0,0,self.w,self.h,self.bg)
        self.text('MUSICALES.COM.AR',48,25,10,'monobold')
        self.text(section.upper(),self.w/2,25,10,'mono')
        self.line(48,self.h-38,self.w-48,self.h-38,self.ink,.5)
        self.text('IDENTIDAD V1.0  /  BASE: BRIEF V2  /  08.09.2026',48,self.h-27,8,'mono')
        self.text(f'{self.page:02}',self.w-66,self.h-28,10,'monobold')
        if title:self.text(title,48,73,43,'display',maxw=self.w-96)
    def card(self,x,y,title,body,width=260,color=None):
        self.line(x,y,x+width,y,color or self.ink,2)
        title_size=min(23,width/pdfmetrics.stringWidth(title,'display',1))
        self.text(title,x,y+17,title_size,'display',color,maxw=width)
        return self.para(body,x,y+56,width,15)
    def finish(self):self.c.save()

def manual():
    b=Book(PDF/'Musicales-com-ar-Manual-de-identidad.pdf')
    b.start('Manual de identidad',dark=True)
    b.text('UN MEDIO.',48,90,74,'display')
    b.text('TODA UNA ESCENA.',48,166,74,'display')
    b.asset('logos/logo-oscuro.svg',48,296,680)
    b.text('Teatro musical argentino',50,491,23,'serif')
    b.text('SISTEMA VISUAL Y VERBAL',680,501,11,'mono')

    b.start('01 / Fundamento','La escena, con criterio propio.')
    b.para('Musicales.com.ar es un medio digital sobre teatro musical argentino. Informa, consulta, entrevista y opina con una mirada propia.',48,145,800,23)
    b.card(48,275,'PARA QUIÉNES','Intérpretes, estudiantes, docentes, productores y espectadores frecuentes. El alcance inicial es CABA y Gran Buenos Aires.')
    b.card(350,275,'QUÉ ORDENA','Noticias, críticas, entrevistas y opinión. Cartelera consultable, talleres de montaje y audiciones abiertas.')
    b.card(652,275,'CÓMO HABLA','Con información y claridad. Un medio que puede evaluar y argumentar; cercano al oficio y sin tono de gacetilla.')
    b.text('MARCA ESCRITA',48,488,10,'mono',TELON)
    b.text('Musicales.com.ar',230,478,28,'serifbold')
    b.text('Siempre el dominio completo.',540,488,14,'serif')

    b.start('02 / Concepto','Un cartel encendido.')
    b.asset('logos/logo-claro.svg',92,165,776)
    b.card(48,397,'EL MARCO','Una marquesina de esquinas rectas. El nombre siempre vive dentro del marco.',260)
    b.card(350,397,'LAS LÁMPARAS','Dos hileras y dos puntos ámbar. Los puntos del dominio forman parte del mismo sistema.',260)
    b.card(652,397,'LA FIRMA','El dominio se lee como marca. Sin máscaras, telones ilustrados ni notas musicales.',260)

    b.start('03 / Versiones','Un mismo signo, cuatro salidas.')
    for x,y,mode,bg,title in [(48,149,'claro',PAPEL,'01  PRINCIPAL CLARO'),(498,149,'oscuro',SALA,'02  PRINCIPAL OSCURO'),(48,337,'claro-monocromatico',PAPEL,'03  MONOCROMÁTICO POSITIVO'),(498,337,'oscuro-monocromatico',SALA,'04  MONOCROMÁTICO NEGATIVO')]:
        b.box(x,y,414,168,bg)
        b.asset(f'logos/logo-{mode}.svg',x+25,y+20,364)
        b.text(title,x+25,y+134,10,'mono',LIGHT if bg==SALA else SALA)
    b.text('La versión monocromática lleva marco, letras y lámparas en una única tinta.',48,524,13)

    b.start('04 / Construcción','Todo parte de la letra.')
    g=logo_geometry()
    b.asset('logos/logo-claro.svg',60,155,500)
    b.text('F = cuerpo tipográfico, no altura de mayúsculas.',60,300,13)
    b.para('Máster: Archivo, wdth 78 / wght 800. Mayúsculas e interletrado +0,02 em. Los puntos son círculos separados de la tipografía.',60,342,490,16)
    b.para('Se fijan 15 lámparas por hilera: es el mayor número impar dentro del rango 5-16. Se conservan la simetría y el paso de 0,43 F.',60,438,490,14)
    rows=[('Borde del marco','0,048 F'),('Diámetro de lámpara','0,17 F'),('Paso entre centros','0,43 F'),('Borde interno a lámpara','0,22 F'),('Lámpara a mayúscula','0,26 F'),('Margen lateral a letra','0,62 F'),('Diámetro punto dominio','0,15 F'),('Centro punto sobre base','0,26 F')]
    for i,(label,value) in enumerate(rows):
        y=156+i*41;b.text(label,608,y,13,'serif');b.text(value,829,y,12,'mono');b.line(608,y+30,912,y+30,SALA,.4)
    b.text('Los espacios verticales se miden entre bordes.',608,505,10,'serif')

    b.start('05 / Escala y protección','De la cabecera a una pestaña.')
    lw=480; clear=lw/g['width']*50; lh=lw*g['height']/g['width']
    b.c.saveState();b.c.setDash(4,3)
    b.line(70,166,70+lw+2*clear,166,TELON)
    b.line(70,166,70,166+lh+2*clear,TELON)
    b.line(70+lw+2*clear,166,70+lw+2*clear,166+lh+2*clear,TELON)
    b.line(70,166+lh+2*clear,70+lw+2*clear,166+lh+2*clear,TELON)
    b.c.restoreState();b.asset('logos/logo-claro.svg',70+clear,166+clear,lw)
    b.text('0,5 F libres en los cuatro lados',72,330,15,'serifbold')
    b.para('Sin titulares, bordes de anuncios ni otros signos dentro de esa zona. La bajada se compone por fuera del área de protección.',72,363,480,15)
    b.asset('logos/isotipo-claro.svg',663,164,120)
    b.text('M + 3 LÁMPARAS POR HILERA',616,309,11,'mono')
    b.para('Logo completo: desde 160 px de ancho. Debajo de 160 px, usar el isotipo. No comprimir ni quitar partes del nombre.',616,349,290,15)
    b.text('FAVICON',616,455,11,'mono',TELON)
    b.text('32 / 48 / 180 px',616,478,23,'display')
    b.para('El isotipo tiene un ajuste óptico propio. Favicon y avatar usan los márgenes de sus archivos maestros.',72,465,480,13)

    b.start('06 / Color claro','Cinco colores. Cinco funciones.')
    descriptions=['Enlaces, secciones y estreno.','Lámparas y lo que sucede ahora.','Texto y superficies de cabecera.','Fondo frío para leer.','Estado de una obra en cartel.']
    for i,((name,(light,dark)),desc) in enumerate(zip(COLORS.items(),descriptions)):
        x=48+i*176;b.box(x,160,160,185,light, SALA if name=='Papel' else None,.5)
        ink=PAPEL if contrast(light,PAPEL)>4.5 else SALA
        b.text(f'0{i+1}',x+15,176,13,'mono',ink)
        b.text(name.upper(),x,367,22,'display',maxw=160)
        b.text(light,x,403,15,'mono')
        b.para(desc,x,445,156,14)
    b.text('El ámbar aporta significado: no se usa como relleno decorativo ni para cualquier categoría.',48,524,13)

    b.start('07 / Color oscuro','El modo oscuro también se diseña.',dark=True)
    for i,((name,(light,dark)),desc) in enumerate(zip(COLORS.items(),descriptions)):
        x=48+i*176;b.box(x,160,160,185,dark, LIGHT if name=='Papel' else None,.5)
        ink=LIGHT if contrast(dark,LIGHT)>4.5 else SALA
        b.text(f'0{i+1}',x+15,176,13,'mono',ink)
        b.text(name.upper(),x,367,22,'display',maxw=160)
        b.text(dark,x,403,15,'mono')
        b.para(desc,x,445,156,14)
    b.text('Papel oscuro #131019 para lectura. La cabecera puede conservar Sala base #171320.',48,524,13)

    b.start('08 / Accesibilidad','El color tiene que poder leerse.')
    b.para('Referencia: WCAG 2.2, contraste mínimo. Texto normal: 4,5:1. Texto grande: 3:1. El logotipo está exceptuado; las etiquetas de interfaz no.',48,139,840,16)
    pairs=[('Sala / Papel',SALA,PAPEL),('Telón / Papel',TELON,PAPEL),('En cartel / Papel','#2C6E52',PAPEL),('Bombilla / Papel',AMBER,PAPEL),('Sala / Bombilla',SALA,AMBER),('Sala oscuro / Papel oscuro',LIGHT,DARK),('Telón oscuro / Papel oscuro','#E36285',DARK),('En cartel oscuro / Papel oscuro','#6FC79D',DARK)]
    report=[]
    for i,(label,fg,bg) in enumerate(pairs):
        col=i//4;row=i%4;x=48+col*450;y=238+row*59
        b.box(x,y,76,39,bg);b.text('Aa',x+16,y+3,24,'display',fg)
        b.text(label,x+93,y+1,13,'serif');r=contrast(fg,bg)
        b.text(f'{r:.2f}:1  /  '+('AA texto' if r>=4.5 else 'NO texto'),x+93,y+22,11,'mono',TELON if r<4.5 else SALA)
        report.append(dict(pair=label,foreground=fg,background=bg,ratio=round(r,3),aa_normal=r>=4.5))
    b.para('Estados: sumar siempre una palabra. En claro, “Ahora” usa texto Sala sobre Bombilla; “En cartel” usa verde y una etiqueta. No depender solo del color.',48,495,830,14)
    (OUT/'tokens'/'contrastes.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

    b.start('09 / Tipografía','Tres voces que se complementan.')
    for y,label,sample,font,desc in [
        (150,'ARCHIVO','LA ESCENA SE LEE.','display','Marca y títulos · wdth 78-90 · wght 650-800 · mayúsculas'),
        (277,'SOURCE SERIF 4','Una mirada sobre el oficio.','serif','Artículos y bajadas · pesos 400-600 · caja normal'),
        (404,'IBM PLEX MONO','VIE 20:30 / $ 25.000','mono','Fechas, horarios, precios y metadatos · pesos 400-600')]:
        b.text(label,48,y,10,'mono',TELON);b.text(sample,300,y-9,37,font,maxw=612)
        b.text(desc,300,y+45,13,'serif');b.line(48,y+94,912,y+94,SALA,.5)

    b.start('10 / Jerarquía','Un ritmo de lectura reconocible.')
    b.text('ENTREVISTAS',48,155,12,'mono',TELON)
    b.text('EL OFICIO DETRÁS',48,185,41,'display')
    b.text('DE CADA FUNCIÓN',48,230,41,'display')
    b.para('Una conversación sobre ensayos, decisiones y trabajo en equipo.',48,297,460,22)
    b.text('08 SEP 2026  /  6 MIN DE LECTURA',48,382,11,'mono')
    b.para('La información se organiza para que cada lector encuentre primero lo esencial y pueda seguir leyendo con comodidad.',48,421,470,17)
    rows=[('Título principal','48-64 / 1,05'),('Título móvil','32-40 / 1,10'),('Título de sección','28-36 / 1,15'),('Bajada','22-24 / 1,35'),('Texto de artículo','18-20 / 1,55'),('Datos','12-14 / 1,40')]
    for i,(label,value) in enumerate(rows):
        y=155+i*48;b.text(label,615,y,14,'serif');b.text(value,775,y,12,'mono')
    b.para('Escala propuesta en px / interlínea. Texto: 60-75 caracteres por línea. No usar la condensada en párrafos largos.',615,463,297,14)

    b.start('11 / Iconografía','Un vocabulario de veinte signos.')
    for i,name in enumerate(ICONS):
        col=i%5;row=i//5;x=48+col*176;y=156+row*89
        b.asset(f'iconos/{name}.svg',x,y,32)
        b.text(name.upper(),x,y+44,10,'mono',maxw=160)
    b.text('Grilla 24 × 24 · trazo 1,75 · terminal recto · esquinas angulares · color heredable',48,523,13)

    b.start('12 / Reglas de iconos','Claridad antes que ornamento.')
    b.asset('iconos/cartelera.svg',73,171,146)
    b.c.saveState();b.c.setDash(2,3)
    for i in range(7):
        b.line(73+i*24.33,171,73+i*24.33,317,TELON,.4)
        b.line(73,171+i*24.33,219,171+i*24.33,TELON,.4)
    b.c.restoreState()
    b.text('24 × 24',93,345,15,'mono')
    b.card(314,162,'CONSTRUCCIÓN','Trazo centrado de 1,75 unidades. Mantener márgenes ópticos de 2-3 unidades. No deformar ni agregar resplandores.',260)
    b.card(652,162,'EN INTERFACES','Tamaño habitual: 20 o 24 px. En acciones, acompañar con texto visible o un nombre accesible. No asumir que el icono se entiende solo.',260)
    b.line(48,420,912,420,SALA)
    b.para('Color: Sala para navegación; Telón para acción activa. En cartel solo expresa disponibilidad. Bombilla queda reservada a “Ahora”.',48,444,410,15)
    b.para('Los iconos funcionales acompañan al medio. No se incorporan al marco del logotipo ni se convierten en una segunda marca.',502,444,410,15)

    b.start('13 / Composición','Estructura editorial, espacio real.')
    b.box(48,151,506,343,PAPEL,SALA,1)
    b.asset('logos/logo-claro.svg',72,170,230)
    b.line(72,240,530,240,SALA,1)
    b.text('NOTICIAS   CARTELERA   TALLERES',72,252,10,'mono')
    b.text('TODA UNA ESCENA',72,291,31,'display')
    b.para('Información, voces y datos para seguir el teatro musical argentino.',72,342,270,16)
    b.box(379,288,151,183,PAPEL,SALA,.5)
    b.text('PUBLICIDAD',392,305,9,'mono')
    b.para('Bloque externo con espacio reservado.',393,366,122,12)
    b.para('Grilla web propuesta: 12 columnas en escritorio, 4 en móvil. Márgenes de 24-48 px y ritmo de espaciado de 8 px.',600,161,300,16)
    b.para('La publicidad se identifica y ocupa su propio bloque. Respetar el área de protección del logo y evitar que los anuncios imiten la cabecera.',600,288,300,16)
    b.para('La fotografía editorial puede acompañar las notas. El logo siempre se apoya en una superficie plana separada.',600,421,300,15)
    b.text('Esquema de composición, sin noticias ni avisos reales.',48,517,12,'serif')

    b.start('14 / Aplicaciones digitales','Hecho para circular.',dark=True)
    b.asset('aplicaciones/open-graph.svg',48,154,600)
    b.asset('aplicaciones/avatar.svg',707,165,160)
    b.text('AVATAR / 320 × 320',691,348,12,'mono')
    b.text('COMPARTIR / 1200 × 630',48,489,12,'mono')
    b.para('Mantener completo el marco y su área de protección en cada recorte.',691,401,208,15)

    b.start('15 / Redes','Una familia de piezas editoriales.')
    for i,name in enumerate(['post-editorial','post-cartelera','post-audiciones']):
        b.asset(f'aplicaciones/{name}.svg',48+i*225,153,204)
        b.text(['ENTREVISTA','CARTELERA','AUDICIONES'][i],48+i*225,427,11,'mono')
    b.asset('aplicaciones/story.svg',744,153,168)
    b.text('STORY',744,467,11,'mono')
    b.para('Feed: 1080 × 1350. Story: 1080 × 1920, con contenido esencial entre y=250 e y=1600. Verificar la previsualización en cada plataforma.',48,489,640,13)
    b.text('Copys de muestra; no anuncian eventos reales.',48,531,10,'mono')

    b.start('16 / Identidad verbal','Informado. Directo. Con mirada.')
    b.card(48,155,'DECIR LO CONCRETO','Escribir qué pasa, dónde, cuándo y por qué importa. Diferenciar taller de montaje, entrenamiento y audición.')
    b.card(350,155,'SOSTENER LA OPINIÓN','Argumentar las valoraciones. Separar información comprobable de apreciaciones de una crítica.')
    b.card(652,155,'HABLAR CON CERCANÍA','Voseo en llamados a la acción: “Consultá”, “Leé”, “Encontrá”. Nombres y créditos revisados antes de publicar.')
    b.text('EVITAR',48,388,11,'mono',TELON)
    b.para('“Una experiencia única e imperdible que revolucionará la escena.”',48,425,386,21)
    b.text('PREFERIR',502,388,11,'mono',TELON)
    b.para('“Una nueva puesta abre temporada. Consultá sala, funciones y elenco.”',502,425,386,21)

    b.start('17 / Usos incorrectos','El sistema también tiene límites.')
    for i,(title,body) in enumerate([
        ('NO ABREVIAR','El nombre es Musicales.com.ar, siempre completo. La M sola corresponde únicamente al isotipo.'),
        ('NO DESARMAR','No quitar el marco, las hileras ni los puntos-lámpara. No reemplazarlos por puntos tipográficos.'),
        ('NO DEFORMAR','Escalar proporcionalmente. Sin inclinar el marco, redondear esquinas ni alterar el eje de la letra.'),
        ('NO AGREGAR EFECTOS','Sin degradados, sombras, biseles, 3D, neón ni resplandor. Sin colores ajenos a la paleta.'),
        ('NO SUPERPONER','El logo no va directamente sobre fotos. Usar un bloque plano con espacio suficiente alrededor.'),
        ('NO SUMAR CLICHÉS','Sin máscaras, telones ilustrados, notas musicales, focos, cortinas, mascotas ni ilustraciones de marca.')]):
        x=48+(i%3)*302;y=158+(i//3)*193;b.card(x,y,title,body,260)

    b.start('18 / Producción','Archivos preparados para usarse.')
    b.card(48,154,'DIGITAL','SVG con viewBox, sin texto vivo y sin dimensiones fijas. PNG en los tamaños de cada aplicación. El texto de los PDF lleva fuentes incrustadas.')
    b.card(350,154,'UNA TINTA','Usar el máster monocromático. Para reproducción en negro, convertir toda la marca a una sola tinta de proceso. Nunca convertir cada color por separado.')
    b.card(652,154,'IMPRESIÓN','Los HEX son la referencia digital. La conversión CMYK depende del perfil de imprenta y del soporte. Pedir una prueba física antes de una tirada.')
    b.line(48,412,912,412,SALA)
    b.para('Referencia inicial para impresión: logo completo desde 35 mm de ancho. Validar legibilidad y ganancia de punto sobre el material elegido; no es un mínimo universal certificado.',48,438,410,15)
    b.para('Las fuentes originales y sus licencias OFL se incluyen en el kit. Para editar textos de las plantillas, recomponerlos con esas fuentes y volver a convertirlos a curvas.',502,438,410,15)

    b.start('19 / Entrega y control','Una base clara para seguir creando.')
    b.card(48,153,'DEFINIDO EN EL BRIEF','Nombre, marquesina, puntos-lámpara, cinco colores en dos modos, tres familias tipográficas, protección y mínimo digital.',260)
    b.card(350,153,'DESARROLLADO EN ESTE KIT','Másters vectoriales, ajuste óptico del isotipo, 20 iconos, jerarquía editorial, plantillas, tokens y pautas verbales.',260)
    b.card(652,153,'SIGUIENTE APLICACIÓN','Revisar el manual y luego integrar los másters al sitio. El paquete no modifica la web ni publica piezas en redes.',260)
    b.text('FUENTES DE REFERENCIA',48,414,11,'mono',TELON)
    sources=[('Brief de identidad v2','docs/brief-identidad.md'),('Google Fonts / Archivo, Source Serif 4 e IBM Plex Mono','https://github.com/google/fonts/tree/main/ofl'),('WCAG 2.2 / Contraste mínimo','https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html')]
    for i,(label,url) in enumerate(sources):
        y=443+i*28;b.text(label,48,y,12,'serif');b.text(url,438,y+1,8,'mono')
        if url.startswith('http'):b.c.linkURL(url,(438,b.h-y-17,912,b.h-y+2),relative=0)
    b.finish()
    print(f'Manual: {b.page} pages')

def sheet():
    b=Book(PDF/'Musicales-com-ar-Hoja-de-estilo.pdf',595.276,841.89)
    b.page=1;b.ink=SALA;b.bg=PAPEL;b.box(0,0,b.w,b.h,PAPEL)
    b.text('MUSICALES.COM.AR  /  HOJA DE ESTILO',36,29,10,'mono')
    b.asset('logos/logo-claro.svg',36,68,523)
    b.text('Teatro musical argentino',36,206,20,'serif')
    b.line(36,248,559,248,SALA)
    b.text('COLOR / CLARO Y OSCURO',36,265,11,'mono',TELON)
    for i,(name,(light,dark)) in enumerate(COLORS.items()):
        x=36+i*107;b.box(x,297,93,35,light,SALA if name=='Papel' else None,.4)
        b.box(x,335,93,22,dark,SALA if name=='Papel' else None,.4)
        b.text(name.upper(),x,368,13,'display');b.text(light,x,392,9,'mono');b.text(dark,x,409,9,'mono')
    b.text('TIPOGRAFÍA',36,453,11,'mono',TELON)
    for y,title,font,detail in [(482,'Archivo','display','Marca 78/800 · títulos 78-90 / 650-800'),(527,'Source Serif 4','serif','Lectura · pesos 400-600'),(572,'IBM Plex Mono','mono','Fechas, horarios y precios · pesos 400-600')]:
        b.text(title,36,y,22,font);b.text(detail,253,y+7,10,'serif')
    b.line(36,620,559,620,SALA)
    b.text('PROTECCIÓN Y ESCALA',36,637,11,'mono',TELON)
    b.para('Área libre: 0,5 F por lado. F es el cuerpo tipográfico del logo. Logo completo desde 160 px; por debajo, isotipo. Escalar siempre de forma proporcional.',36,666,374,13)
    b.asset('logos/isotipo-claro.svg',466,649,74)
    b.text('32 / 48 / 180',461,735,10,'mono')
    b.para('Marco completo · puntos como lámparas · fondo plano · sin efectos. Ámbar solo para lámparas y “Ahora”. No usar ámbar como texto sobre Papel.',36,749,510,11)
    b.text('V1.0  /  BRIEF V2  /  08.09.2026',36,809,8,'mono')
    b.finish();print('Style sheet: 1 page')

if __name__=='__main__':manual();sheet()
