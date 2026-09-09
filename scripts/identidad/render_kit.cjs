const fs=require('node:fs/promises');
const path=require('node:path');
const sharp=require('sharp');
const root=path.resolve(__dirname,'../../output/identidad');
async function render(file,width,height){await sharp(file,{density:144}).resize(width,height).png().toFile(file.replace(/\.svg$/,'.png'));}
async function main(){
 for(const dir of ['logos','aplicaciones'])for(const name of await fs.readdir(path.join(root,dir))){if(!name.endsWith('.svg'))continue;const file=path.join(root,dir,name); if(dir==='logos')await render(file,name.startsWith('isotipo')?512:1800); else {const meta=await sharp(file).metadata();await render(file,meta.width,meta.height);}}
 for(const kind of ['lineales','circulares'])for(const name of await fs.readdir(path.join(root,'iconos',kind))){if(!name.endsWith('.svg'))continue;const file=path.join(root,'iconos',kind,name); for(const size of kind==='lineales'?[24,48,96]:[40,80])await sharp(file).resize(size,size).png().toFile(file.replace('.svg',`-${size}.png`));}
 for(const size of [16,32,48,180,512])await sharp(path.join(root,'aplicaciones/favicon.svg')).resize(size,size).png().toFile(path.join(root,'aplicaciones',`favicon-${size}.png`));
 await render(path.join(root,'iconos/catalogo.svg'),1500);await render(path.join(root,'vista-general.svg'),1600);
 console.log('Rendered logos, applications, favicon sizes and 150 icon PNGs.');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
