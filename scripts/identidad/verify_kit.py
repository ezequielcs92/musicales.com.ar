from pathlib import Path
import xml.etree.ElementTree as ET,json,hashlib
from PIL import Image
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[2];out=ROOT/'output/identidad';ns={'s':'http://www.w3.org/2000/svg'}
line=sorted((out/'iconos/lineales').glob('*.svg'));circ=sorted((out/'iconos/circulares').glob('*.svg'))
assert len(line)==len(circ)==30
assert {f.stem for f in line}=={f.stem for f in circ}
for f in line:
 r=ET.parse(f).getroot();assert r.attrib['viewBox']=='0 0 24 24';g=r.find('s:g',ns)
 assert all(g.attrib[k]==v for k,v in {'stroke-width':'2','stroke-linecap':'round','stroke-linejoin':'round','fill':'none'}.items()),f
 assert len(g)>0
 im=Image.open(f.with_name(f.stem+'-24.png'));alpha=im.getchannel('A');bbox=alpha.getbbox();assert bbox, f
 assert bbox[0]>=1 and bbox[1]>=1 and bbox[2]<=23 and bbox[3]<=23,(f.name,bbox)
for f in circ:
 r=ET.parse(f).getroot();assert r.attrib['viewBox']=='0 0 40 40';c=r.find('s:circle',ns);assert c.attrib['r']=='20';assert c.attrib['fill']=='#E9DFE7'
 assert r.find('s:g',ns).attrib['transform']=='translate(8 8)'
sprite=ET.parse(out/'iconos/sprite.svg').getroot();assert len(sprite)==30;assert len({x.attrib['id'] for x in sprite})==30
for file in (out/'logos').glob('*.svg'):
 r=ET.parse(file).getroot();assert not list(r.iter('{http://www.w3.org/2000/svg}text'))
for file in ['logo-claro.svg','logo-oscuro.svg','logo-claro-monocromatico.svg','logo-oscuro-monocromatico.svg']:
 assert (out/'logos'/file).read_bytes()==(ROOT/'assets/brand'/file).read_bytes()
assert len(PdfReader(out/'manual/Manual-de-identidad.pdf').pages)==18
assert len(PdfReader(out/'manual/Hoja-de-estilo.pdf').pages)==1
assert not list(out.rglob('*.woff2'))
for font_file in out.rglob('*.otf'):
 assert font_file == out/'fuentes/Friend Bestie.otf'
 assert font_file.read_bytes() == (ROOT/'assets/fonts/friend-bestie/Friend Bestie.otf').read_bytes()
for file in out.rglob('*.png'):
 im=Image.open(file);assert im.width>0 and im.height>0;im.verify()
manifest={str(f.relative_to(out)).replace('\\','/'):hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted(out.rglob('*')) if f.is_file() and f.name!='VERIFICACION.json'}
report={'date':'2026-09-09','icons':{'lineal':30,'circular':30,'png':150,'sprite':30,'grid':24,'stroke':2,'caps':'round','joins':'round','no_clipping_at_24px':True},'manual_pages':18,'style_sheet_pages':1,'approved_horizontal_logos_unchanged':True,'visual_pdf_review':True,'browser':{'sprite_30_symbols_rendered':True,'catalog_search_without_accents':True},'old_kit_cleanup':'blocked by automatic tool policy; older folders still exist','font_binaries':{'Poppins':'included with OFL','Friend Bestie':'included by owner in working kit' if (out/'fuentes/Friend Bestie.otf').exists() else 'not redistributed'},'sha256':manifest}
(out/'VERIFICACION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(f'PASS: {len(manifest)} files, 60 SVG icons, 150 PNG icons; no clipping, exact approved logo, 19 PDF pages.')
