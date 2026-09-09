const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
async function main() {
 const root=path.resolve(__dirname,'../../output/identidad-v2');
 for(const dir of ['logos','aplicaciones','']) {
  for(const name of await fs.readdir(path.join(root,dir))) {
   if(!name.endsWith('.svg')) continue;
   const file=path.join(root,dir,name);
   await sharp(file,{density:144}).resize(dir==='logos'?1800:undefined).png().toFile(file.replace(/\.svg$/,'.png'));
  }
 }
 await sharp(path.join(root,'aplicaciones/favicon.svg')).resize(256,256).png().toFile(path.join(root,'aplicaciones/favicon-256.png'));
 await sharp(path.join(root,'aplicaciones/open-graph.svg')).resize(1200,630).png().toFile(path.resolve(__dirname,'../../public/marca/open-graph.png'));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
