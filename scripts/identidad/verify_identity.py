"""Structural and visual QA support for the deliverable package."""
from pathlib import Path
import json, re, hashlib
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw
from pypdf import PdfReader
from pypdf.generic import ContentStream
from build_assets import OUT, ROOT, COLORS
from build_manual import drawing

def main():
    ns={'s':'http://www.w3.org/2000/svg'}
    allowed={v.upper() for pair in COLORS.values() for v in pair}
    reports=[]
    for f in OUT.rglob('*.svg'):
        tree=ET.parse(f);root=tree.getroot();source=f.read_text(encoding='utf-8')
        assert not root.findall('.//s:text',ns), f'Text not outlined: {f}'
        assert not root.findall('.//s:image',ns), f'Raster image in SVG: {f}'
        assert 'width' not in root.attrib and 'height' not in root.attrib
        if f.name=='sprite.svg':
            assert len(root.findall('s:symbol',ns))==20
            continue
        assert 'viewBox' in root.attrib
        for color in re.findall(r'#[0-9a-fA-F]{6}',source):
            assert color.upper() in allowed,(f,color)
        d=drawing(str(f.relative_to(OUT)));x0,y0,x1,y1=d.getBounds()
        assert x0>=-.1 and y0>=-.1 and x1<=d.width+.1 and y1<=d.height+.1, (f,(x0,y0,x1,y1),(d.width,d.height))
        reports.append(str(f.relative_to(OUT)))
    for mode in ['claro','oscuro','claro-monocromatico','oscuro-monocromatico']:
        root=ET.parse(OUT/'logos'/f'logo-{mode}.svg').getroot()
        circles=root.findall('.//s:circle',ns)
        assert len(circles)==32
        assert sum(float(c.attrib['r'])==7.5 for c in circles)==2
        for y in [35.3,173.0]:
            assert len([c for c in circles if abs(float(c.attrib['cy'])-y)<.01])==15
    expected={'favicon-32':(32,32),'favicon-48':(48,48),'favicon-180':(180,180),'avatar':(320,320),'open-graph':(1200,630),'post-editorial':(1080,1350),'post-cartelera':(1080,1350),'post-audiciones':(1080,1350),'story':(1080,1920)}
    for name,size in expected.items():
        assert Image.open(OUT/'aplicaciones'/f'{name}.png').size==size
    pages={}
    for name,count in [('Manual-de-identidad',20),('Hoja-de-estilo',1)]:
        reader=PdfReader(ROOT/'output'/'pdf'/f'Musicales-com-ar-{name}.pdf')
        assert len(reader.pages)==count
        for i,page in enumerate(reader.pages):
            assert page.extract_text().strip(), (name,i)
            used_fonts=set();current_font=None
            for operands,operator in ContentStream(page.get_contents(),reader).operations:
                if operator==b'Tf':current_font=operands[0]
                if operator in [b'Tj',b'TJ',b"'",b'"'] and any(str(v).strip() for v in operands):used_fonts.add(current_font)
            for key in used_fonts:
                font=page['/Resources']['/Font'][key]
                data=font.get_object()
                desc=data.get('/FontDescriptor')
                assert desc and any(k in desc.get_object() for k in ['/FontFile','/FontFile2','/FontFile3'])
        pages[name]=count
    result={'svg_checked':len(reports),'icons':20,'png_dimensions':expected,'pdf_pages':pages,
        'structural_checks':'PASS','visual_review':'See rendered pages and small-size proof; no uniqueness guarantee against other favicons.'}
    (OUT/'verificacion.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    qa=ROOT/'tmp'/'pdfs'
    images=sorted(qa.glob('manual-*.png'))
    for start in range(0,len(images),6):
        sheet=Image.new('RGB',(1440,3*485),PAPER_RGB)
        draw=ImageDraw.Draw(sheet)
        for j,file in enumerate(images[start:start+6]):
            im=Image.open(file).convert('RGB');im.thumbnail((700,440))
            x=10+(j%2)*720;y=25+(j//2)*485;sheet.paste(im,(x,y));draw.text((x,y-18),file.stem,fill='#171320')
        sheet.save(qa/f'contact-{start//6+1}.png')
    print(json.dumps(result,ensure_ascii=True))

PAPER_RGB=(244,243,246)
if __name__=='__main__':main()
