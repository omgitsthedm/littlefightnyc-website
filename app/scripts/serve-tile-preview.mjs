import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),process.env.TILE_DIST==='production'?'../dist':'../preview-dist');
const port=Number(process.env.TILE_PORT||4393);
const config=fs.readFileSync(path.resolve(root,'../../netlify.toml'),'utf8');
const productionCsp=config.match(/Content-Security-Policy = "([^"\n]+)"/)?.[1];
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end('Read-only preview');}
  let requestPath;try{requestPath=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
  // Mirror only the three existing public-feed rewrites. No functions, form
  // submissions, credentials or private engine endpoints run in local QA.
  if(process.env.TILE_DIST==='production' && /^\/vera\/data\/(public|archive|meta)\.json$/.test(requestPath)){
    try{
      const upstream=await fetch('https://raw.githubusercontent.com/omgitsthedm/vera-apartment-search/feed/'+path.basename(requestPath));
      const body=Buffer.from(await upstream.arrayBuffer());
      res.writeHead(upstream.status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'});
      return res.end(req.method==='HEAD'?undefined:body);
    }catch{res.writeHead(502);return res.end('Public feed unavailable');}
  }
  const file=path.resolve(root,'.'+requestPath);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(400);return res.end();}
  let target=file,status=200;
  try{if(fs.statSync(target).isDirectory())target=path.join(target,'index.html');}catch{target=path.join(root,'404.html');status=404;}
  try{
    let body=fs.readFileSync(target);const type=mime[path.extname(target)]||'application/octet-stream';
    const headers={'Content-Type':type,'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow, noarchive','Vary':'Accept-Encoding'};
    if(process.env.TILE_DIST==='production' && !/^\/(vera|examples\/(audit|lab)|brand-kit)\//.test(requestPath))headers['Content-Security-Policy']=productionCsp;
    if(/text|json|svg/.test(type)&&/gzip/.test(req.headers['accept-encoding']||'')){body=zlib.gzipSync(body);headers['Content-Encoding']='gzip';}
    headers['Content-Length']=body.length;res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>process.stdout.write(`Little Fight review: http://127.0.0.1:${port}/\n`));
