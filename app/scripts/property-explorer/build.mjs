import {build} from 'esbuild';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const packageRoot=resolve(fileURLToPath(new URL('.',import.meta.url)));
const source=resolve(packageRoot,'src');
const output=resolve(packageRoot,'../../public/examples/lab/concepts/house-explorer');
const check=process.argv.includes('--check');
const bundle=await build({entryPoints:[resolve(source,'app.js')],bundle:true,format:'esm',target:['es2022'],minify:true,write:false,legalComments:'none'});
const files={
  'index.html':await readFile(resolve(source,'index.html'),'utf8'),
  'house-explorer.css':await readFile(resolve(source,'style.css'),'utf8'),
  'house-explorer.js':bundle.outputFiles[0].text.replace(/[\t ]+(?=\r?\n)/g,''),
  'lab-bootstrap.js':await readFile(resolve(source,'lab-bootstrap.js'),'utf8'),
  'icon.svg':await readFile(resolve(packageRoot,'assets/icon.svg')),
  'fonts/barlow-400.woff2':await readFile(resolve(packageRoot,'assets/fonts/barlow-400.woff2')),
  'fonts/barlow-700.woff2':await readFile(resolve(packageRoot,'assets/fonts/barlow-700.woff2')),
  'fonts/oswald.woff2':await readFile(resolve(packageRoot,'assets/fonts/oswald.woff2')),
  'BARLOW-LICENSE.txt':await readFile(resolve(packageRoot,'assets/BARLOW-LICENSE.txt')),
  'OSWALD-LICENSE.txt':await readFile(resolve(packageRoot,'assets/OSWALD-LICENSE.txt')),
  'THREE-LICENSE.txt':await readFile(resolve(packageRoot,'assets/THREE-LICENSE.txt')),
  'CREDITS.txt':Buffer.from('Property Explorer\nFictional procedural demonstration created for Little Fight NYC.\n\nRuntime\nThree.js 0.180.0 — MIT License\nhttps://threejs.org/\n\nThis showcase contains no client property data, drawings, imagery, or source geometry.\n')
};
if(check){
  for(const [name,contents] of Object.entries(files)){
    const target=resolve(output,name);
    if(!existsSync(target)||!Buffer.from(await readFile(target)).equals(Buffer.from(contents)))throw new Error(`${name} is not the reproducible Property Explorer output`);
  }
  console.log(JSON.stringify({ok:true,files:Object.keys(files)}));
}else{
  await mkdir(output,{recursive:true});
  for(const [name,contents] of Object.entries(files)){const target=resolve(output,name);await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,contents);}
  console.log(JSON.stringify({output,files:Object.keys(files)}));
}
