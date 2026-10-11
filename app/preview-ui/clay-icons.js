/* Reviewed clay study: fourteen held poses, one shot, no idle animation.
 * The original photo is the progressive baseline. Articulated layers load only
 * on intent, and the site's existing links and physical card flow keep control. */
(() => {
'use strict';
const ROOT='/assets/sculpture/', FPS=12, LAST=13, DURATION=LAST/FPS*1000;
const names=['browser','storefront','router','notebook','software'];
let serial=0;
const image=(id,clean=false)=>'<image href="'+ROOT+'clay-'+id+'-v1'+(clean?'-clean':'')+'.webp" width="1536" height="1024"/>';
const path=d=>'<path d="'+d+'"/>';
const ellipse=(cx,cy,rx,ry)=>'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'"/>';
function scene(icon){
 const uid='s'+(++serial),id=icon.id;let defs='<filter id="'+uid+'-soft"><feGaussianBlur stdDeviation="2"/></filter>',patches='',parts='';
 const clip=(name,shape)=>{const cid=uid+'-'+name;defs+='<clipPath id="'+cid+'">'+shape+'</clipPath>';return cid;};
 const patch=(name,shape)=>{const mid=uid+'-patch-'+name;defs+='<mask id="'+mid+'" maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><g fill="white" filter="url(#'+uid+'-soft)">'+shape+'</g></mask>';patches+='<g mask="url(#'+mid+')">'+image(id,true)+'</g>';};
 const layer=(name,body)=>'<g data-layer="'+name+'">'+body+'</g>';
 const cut=(name,shape)=>layer(name,'<g clip-path="url(#'+clip(name,shape)+')">'+image(id)+'</g>');
 const shadow=(name,cx,cy,rx,ry,angle=0)=>layer(name,'<ellipse cx="'+cx+'" cy="'+cy+'" rx="'+rx+'" ry="'+ry+'" transform="rotate('+angle+' '+cx+' '+cy+')" fill="#100b08" opacity=".55" filter="url(#'+uid+'-soft)"/>');
 const mesh=(name,shape,x,y,w,h,cols,rows)=>{
  const objectClip=clip(name+'-shape',shape);let out='';
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
   const p00=[x+c*w/cols,y+r*h/rows],p10=[x+(c+1)*w/cols,p00[1]],p01=[p00[0],y+(r+1)*h/rows],p11=[p10[0],p01[1]];
   for(const [j,p]of [[0,[p00,p10,p11]],[1,[p00,p11,p01]]]){
    const mx=(p[0][0]+p[1][0]+p[2][0])/3,my=(p[0][1]+p[1][1]+p[2][1])/3;
    const points=p.map(q=>[mx+(q[0]-mx)*1.009,my+(q[1]-my)*1.009].join(',')).join(' ');
    const tri=clip(name+'-'+r+'-'+c+'-'+j,'<polygon points="'+points+'"/>');
    out+='<g data-mesh="'+name+'" data-triangle="'+JSON.stringify(p)+'"><g clip-path="url(#'+tri+')"><g clip-path="url(#'+objectClip+')">'+image(id)+'</g></g></g>';
   }
  }return out;
 };
 if(id==='browser'){
  patch('beads','<rect x="457" y="254" width="252" height="114" rx="15"/>');
  [[495,294,30,32],[573,304,30,31],[650,314,29,30]].forEach(([x,y,rx,ry],i)=>{parts+=shadow('shadow-'+i,x+18,y+17,31,18,20)+cut('bead-'+i,ellipse(x,y,rx,ry));});
 }else if(id==='storefront'){
  const awning='M382 453 L709 503 Q719 513 712 554 L701 576 Q695 585 681 582 L653 579 L626 579 L600 573 L572 574 L542 569 L517 565 L486 563 L463 554 L434 551 L407 550 L382 544 Q362 545 364 525 Z';
  patch('awning',path('M370 443 L723 492 L729 595 L351 576 Z'));
  patch('sign','<rect x="366" y="637" width="171" height="194" rx="12"/>');
  patch('door',path('M743 597 L850 606 L843 820 L741 810 Z'));
  parts+=shadow('awning-shadow',545,576,166,18,7)+mesh('awning',path(awning),359,447,370,151,14,1);
  parts+=shadow('sign-shadow',464,801,67,13,4);
  parts+=cut('sign',path('M403 647 Q408 645 421 648 L505 655 Q511 659 511 674 L518 782 Q517 789 507 788 L495 768 L491 806 Q489 820 479 819 L470 816 L469 801 L396 790 L392 800 Q383 806 376 799 Z'));
  parts+=cut('door',path('M748 603 L841 611 L838 811 L748 802 Z'));
 }else if(id==='router'){
  patch('antennas',path('M505 185 L647 185 L647 516 L550 516 Z M886 182 L1007 182 L1007 501 L882 503 Z'));
  patch('buttons','<rect x="805" y="615" width="214" height="82" rx="15"/>');
  const left='M516 230 Q510 211 530 208 Q552 198 565 222 L631 492 Q635 503 617 505 L590 508 Q578 508 576 498 Z';
  const right='M897 480 L934 220 Q937 200 955 200 Q980 195 990 212 L994 228 L950 483 Q949 492 931 493 L907 491 Q895 490 897 480 Z';
  parts+=mesh('antenna-0',path(left),505,193,139,319,1,12)+mesh('antenna-1',path(right),886,182,121,319,1,12);
  [[841,654,25,27],[911,649,25,26],[981,644,25,26]].forEach(([x,y,rx,ry],i)=>{parts+=shadow('button-shadow-'+i,x+7,y+8,24,17,0)+cut('button-'+i,ellipse(x,y,rx,ry));});
 }else if(id==='notebook'){
  patch('pencil',path('M609 451 L655 450 L927 663 L956 726 L906 752 L626 528 Z'));
  parts+=shadow('pencil-shadow',794,610,174,25,40);
  parts+=cut('pencil',path('M632 469 Q627 471 630 480 L652 510 L827 662 L836 681 L869 708 Q884 719 896 708 L916 690 Q923 680 911 667 L879 637 L697 492 L646 475 Z'));
 }else{
  patch('podium-tops','<rect x="170" y="95" width="900" height="555" rx="12"/>');
  const shapes=[
   'M244 387 Q241 371 262 361 L307 338 Q323 333 340 337 L419 349 Q436 351 438 371 L441 457 Q440 479 423 494 L383 526 Q374 532 350 527 L263 514 Q244 512 244 496 Z',
   'M487 166 Q486 144 509 136 L554 120 Q570 115 592 120 L692 138 Q717 143 717 166 L717 421 Q716 438 702 455 L665 489 Q656 499 630 494 L505 478 Q488 476 488 458 Z',
   'M774 468 Q772 446 794 434 L831 413 Q844 407 862 411 L947 430 Q966 434 966 455 L966 550 Q965 572 950 588 L929 609 Q919 619 897 614 L792 597 Q774 594 774 575 Z'
  ];
  [[339,516,92,19],[607,480,111,22],[870,602,94,19]].forEach(([x,y,rx,ry],i)=>{parts+=shadow('shadow-'+i,x+13,y+5,rx,ry,7)+cut('cube-'+i,path(shapes[i]));});
 }
 return '<svg class="clay-rig" viewBox="0 0 1536 1024" aria-hidden="true" focusable="false"><defs>'+defs+'</defs><g data-photo>'+image(id)+'</g><g data-rig style="display:none">'+image(id)+patches+parts+'</g></svg>';
}
function view(root){return{root,photo:root.querySelector('[data-photo]'),rig:root.querySelector('[data-rig]'),ref:root.querySelector('[data-reference]'),layers:Object.fromEntries([...root.querySelectorAll('[data-layer]')].map(n=>[n.dataset.layer,n])),meshes:[...root.querySelectorAll('[data-mesh]')].map(n=>({node:n,name:n.dataset.mesh,p:JSON.parse(n.dataset.triangle)}))};}
const scale=(x,y,sx,sy,dx=0,dy=0,angle=0)=>'translate('+(x+dx)+' '+(y+dy)+') rotate('+angle+') scale('+sx+' '+sy+') translate('+(-x)+' '+(-y)+')';
const hop=[0,5,9,-42,-75,-39,6,-5,1,0,0,0,0,0],bend=[0,-.15,-.26,.55,1,-.55,.27,-.14,.04,0,0,0,0,0],roll=[0,-.035,-.09,.18,.54,.88,1,.94,.57,.15,-.09,.045,0,0];
function triangleTransform(p,q){const x1=p[1][0]-p[0][0],x2=p[2][0]-p[0][0],y1=p[1][1]-p[0][1],y2=p[2][1]-p[0][1],det=x1*y2-x2*y1,u1=q[1][0]-q[0][0],u2=q[2][0]-q[0][0],v1=q[1][1]-q[0][1],v2=q[2][1]-q[0][1],a=(u1*y2-u2*y1)/det,c=(u2*x1-u1*x2)/det,b=(v1*y2-v2*y1)/det,d=(v2*x1-v1*x2)/det;return'matrix('+[a,b,c,d,q[0][0]-a*p[0][0]-c*p[0][1],q[0][1]-b*p[0][0]-d*p[0][1]].join(' ')+')';}
function renderView(v,i,n){
 const rest=n===0||n===LAST;
 v.photo.style.display=rest?'':'none';v.rig.style.display=rest?'none':'';
 const move=(key,t)=>v.layers[key].setAttribute('transform',t);
 if(i===0){
  [495,573,650].forEach((x,k)=>{const y=[294,304,314][k],d=hop[Math.max(0,n-k*2)];move('bead-'+k,scale(x,y,d>0?1.08:d<0?.96:1,d>0?.92:d<0?1.08:1,0,d,d<0?(k-1)*6:0));move('shadow-'+k,scale(x+18,y+17,d<0?1.12:1,d<0?.9:1,d<0?12:0,0));});
 }else if(i===1){
  const door=[0,-.015,-.025,.15,.62,1,1,.82,.35,.1,-.035,.015,0,0][n];
  move('door','matrix('+(1-door*.51)+' '+(-door*.09)+' 0 1 '+(841*door*.51)+' '+(841*door*.09)+')');
  const rock=[0,0,0,-1.5,-5,7,-4,2,-1,.5,0,0,0,0][n];
  move('sign','rotate('+rock+' 436 799)');move('sign-shadow',scale(464,801,1,1,rock*.8,0));move('awning-shadow',scale(545,576,1,1,0,-Math.abs(bend[n])*9));
 }else if(i===2){
  [841,911,981].forEach((x,k)=>{const f=Math.max(0,n-k*2),press=[0,0,0,0,.6,1,.45,0,0,0,0,0,0,0,0][f],y=[654,649,644][k];move('button-'+k,scale(x,y,1-press*.08,1-press*.08,press*3,press*3));move('button-shadow-'+k,scale(x+7,y+8,1-press*.15,1-press*.2));});
 }else if(i===3){const r=roll[n];move('pencil',scale(781,592,1,1,-r*31,r*52,-r*3.8));move('pencil-shadow',scale(794,610,1,1,-r*31,r*52,-r*3.8));
 }else{
  [339,607,870].forEach((x,k)=>{const d=hop[Math.max(0,n-k*2)]*.9,y=[520,490,610][k];move('cube-'+k,scale(x,y,d>0?1.08:d<0?.96:1,d>0?.92:d<0?1.04:1,0,d,d<0?(k===1?-1.5:2):0));move('shadow-'+k,scale(x+13,y,d<0?1.12:1,d<0?1.05:1,d<0?12:0,0));});
 }
 for(const m of v.meshes){const deform=([x,y])=>{
  if(m.name==='awning'){const t=Math.max(0,Math.min(1,(y-(452+(x-365)*.15))/112)),phase=(x-359)/370*Math.PI*1.7-n*.78,amount=n<2||n>10?0:Math.sin(Math.PI*(n-2)/9);return[x,y+Math.sin(phase)*22*amount*t];}
  const k=m.name==='antenna-0'?0:1,f=Math.max(0,n-k*2),base=k?493:505,t=Math.max(0,(base-y)/306),a=bend[f]*(k?-1:1);return[x+a*62*t*t,y-Math.abs(a)*8*t];
 };m.node.setAttribute('transform',triangleTransform(m.p,m.p.map(deform)));}
 v.root.dataset.pose=n;
}

const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const activeScenes=new Set(), known=new WeakSet(), loadedAssets=new Map();
const enabled=st=>!document.hidden&&!reduce.matches&&!document.body.classList.contains('no-motion')&&!document.body.classList.contains('explore-open')&&(!st.tile||!document.body.classList.contains('reader-open'));
function asset(src){
 if(!loadedAssets.has(src)) loadedAssets.set(src,new Promise((resolve,reject)=>{const img=new Image();img.decoding='async';img.onload=()=>img.decode().then(resolve,reject);img.onerror=reject;img.src=src;}));
 return loadedAssets.get(src);
}
function draw(st,n){
 st.frame=n;
 st.root.dataset.clayPose=String(n);
 st.root.dataset.clayRunning=String(st.running);
 st.root.dataset.clayPlays=String(st.plays);
 if(st.view)renderView(st.view,st.index,n);
 st.root.classList.toggle('is-articulated',Boolean(st.view)&&n>0&&n<LAST);
}
function stop(st){cancelAnimationFrame(st.raf);st.running=false;st.pending=false;st.epoch++;draw(st,0);}
async function warm(st){
 if(!st.ready){
  await Promise.all(['','-clean'].map(s=>asset(ROOT+'clay-'+st.id+'-v1'+s+'.webp')));
  if(!st.root.isConnected)return;
  if(!st.view){const host=document.createElement('span');host.className='clay-animation';host.innerHTML=scene({id:st.id});st.root.append(host);st.view=view(host);}
  st.ready=true;
 }
}
async function play(st){
 if(!enabled(st)||st.running||st.pending)return;
 st.pending=true;const epoch=st.epoch;
 try{await warm(st);}catch{st.pending=false;return;}
 if(epoch!==st.epoch||!enabled(st)||!st.root.isConnected){st.pending=false;return;}
 st.pending=false;st.running=true;st.plays++;const start=performance.now();draw(st,0);
 const tick=now=>{if(!enabled(st)||!st.root.isConnected){stop(st);return;}
  if(now-start>=DURATION){st.running=false;draw(st,LAST);return;}
  const n=Math.min(LAST-1,Math.floor((now-start)*FPS/1000));if(n!==st.frame)draw(st,n);
  st.raf=requestAnimationFrame(tick);
 };st.raf=requestAnimationFrame(tick);
}
function scan(scope){
 const roots=[...(scope.matches?.('[data-clay-icon]')?[scope]:[]),...scope.querySelectorAll('[data-clay-icon]')];
 for(const root of roots){
  if(known.has(root))continue;
  const id=root.dataset.clayIcon,index=names.indexOf(id),trigger=root.closest('.tile,[data-clay-trigger]');
  if(index<0||!trigger)continue;
  known.add(root);
  const st={root,id,index,tile:root.closest('.tile'),view:null,frame:0,ready:false,running:false,pending:false,raf:0,plays:0,epoch:0};activeScenes.add(st);draw(st,0);
  trigger.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')void play(st);},{passive:true});
  trigger.addEventListener('focusin',()=>void play(st));
  trigger.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')void play(st);},{passive:true});
  if(!st.tile)trigger.addEventListener('click',()=>void play(st));
 }
 for(const st of activeScenes)if(!st.root.isConnected){stop(st);activeScenes.delete(st);}
}
const reconcile=()=>{for(const st of activeScenes)if(!enabled(st))stop(st);};
reduce.addEventListener('change',reconcile);document.addEventListener('visibilitychange',reconcile);
new MutationObserver(reconcile).observe(document.body,{attributes:true,attributeFilter:['class']});
const reader=document.querySelector('#detail-body');
if(reader)new MutationObserver(()=>scan(reader)).observe(reader,{childList:true});
scan(document);
})();
