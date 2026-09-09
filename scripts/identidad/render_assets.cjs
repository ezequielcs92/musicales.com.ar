// Rasterize the deterministic SVG masters with the project's Sharp dependency.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const out = path.join(root, 'output/identidad');

async function main() {
  const apps = path.join(out, 'aplicaciones');
  for (const size of [32,48,180]) {
    await sharp(path.join(apps,'favicon.svg'), {density:300})
      .resize(size,size).png().toFile(path.join(apps,`favicon-${size}.png`));
  }
  const dimensions = {'avatar':[320,320], 'open-graph':[1200,630],
    'post-editorial':[1080,1350], 'post-cartelera':[1080,1350],
    'post-audiciones':[1080,1350], 'story':[1080,1920]};
  for (const [name,[width,height]] of Object.entries(dimensions)) {
    await sharp(path.join(apps,name+'.svg'),{density:144}).resize(width,height)
      .png().toFile(path.join(apps,name+'.png'));
  }
  for (const mode of ['claro','oscuro']) {
    const background = mode === 'claro' ? '#F4F3F6' : '#171320';
    const input = path.join(out,'logos',`logo-${mode}.svg`);
    await sharp(input,{density:144}).resize(1600).png().toFile(path.join(out,'logos',`logo-${mode}.png`));
    await sharp(input,{density:144}).resize(1600).flatten({background}).png()
      .toFile(path.join(out,'logos',`logo-${mode}-sobre-fondo.png`));
  }
  if ((await fs.readdir(out)).includes('vista-general.svg')) {
    await sharp(path.join(out,'vista-general.svg'),{density:96}).resize(1600).png().toFile(path.join(out,'vista-general.png'));
  }
  console.log('PNG exports rendered at the requested dimensions.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
