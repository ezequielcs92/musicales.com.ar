"""Create a vector contact sheet of the finished identity, not a mock brand."""
from build_assets import *

def main():
    body=rect(0,0,1600,1140,PAPEL)
    body+=rect(0,0,1600,440,SALA)
    body+=path('MUSICALES.COM.AR / IDENTIDAD',18,64,55,LIGHT,'IBMPlexMono-Medium.ttf')
    body+=place_logo(100,113,1050,'dark')+place_iso(1310,127,180,'dark')
    body+=path('Teatro musical argentino',28,100,408,LIGHT,'SourceSerif4-Text-400.ttf')
    for i,(name,(light,dark)) in enumerate(COLORS.items()):
        x=64+i*306
        body+=rect(x,457,278,105,light)
        if name=='Papel':body+=rect(x,457,278,105,'none',SALA,1)
        body+=path(name.upper(),23,x,603)
        body+=path(light,18,x,635,SALA,'IBMPlexMono-Regular.ttf')
    body+=path('ARCHIVO',24,64,710,TELON)
    body+=path('TODA UNA ESCENA.',53,64,782)
    body+=path('Source Serif 4',24,690,710,TELON,'SourceSerif4-Text-400.ttf')
    body+=path('Una mirada propia.',36,690,775,SALA,'SourceSerif4-Text-400.ttf')
    body+=path('IBM PLEX MONO',20,1190,710,TELON,'IBMPlexMono-Medium.ttf')
    body+=path('VIE 20:30',28,1190,775,SALA,'IBMPlexMono-Regular.ttf')
    body+=rect(64,842,1472,2,SALA)
    for i,name in enumerate(list(ICONS)[:10]):
        x=64+i*151
        body+=f'<g transform="translate({x} 894) scale(1.8)">{icon_body(name,SALA)}</g>'
        body+=path(name.upper(),12,x,973,SALA,'IBMPlexMono-Regular.ttf')
    body+=path('LOGOS / COLOR / TIPOGRAFÍA / ICONOS / APLICACIONES',18,64,1074,SALA,'IBMPlexMono-Regular.ttf')
    save('vista-general.svg',svg(body,1600,1140,'Sistema de identidad de Musicales.com.ar'))

if __name__=='__main__':main()
