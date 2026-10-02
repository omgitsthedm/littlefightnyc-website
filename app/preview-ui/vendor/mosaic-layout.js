/* A true square-cell mosaic: four eight-cell service anchors, compact stories. */
(()=>{'use strict';
const canvas=document.querySelector('#canvas'),cards=[...canvas.querySelectorAll(':scope>.tile')],phone=matchMedia('(max-width:760px)');
const id=c=>c.dataset.answer||'brand',anchor=family=>cards.find(c=>c.dataset.anchor===family),find=key=>cards.find(c=>id(c)===key);
function dimensions(c,index){
 index=[...id(c)].reduce((sum,ch)=>sum+ch.charCodeAt(0),0);
 if(c.dataset.anchor||c.classList.contains('brand-tile'))return [4,2];
 if(c.dataset.kind==='photo-album')return [4,4];
 const face=c.dataset.cellFace,length=(c.dataset.cellTitle||'').length;
 if(face==='icon')return index%2?[1,1]:[1,2];
 if(face==='strip')return length<17?[2,1]:[3,1];
 if(['website','onsite','software','maps','booking','it-shared-inbox-owner','it-new-hire-access','web-search-answer','web-newsletter-choice'].includes(id(c)))return [2,2];
 if(face==='lab'||face==='project')return index%3===0?[2,3]:index%3===1?[3,2]:[2,2];
 if(length<24&&index%3===0)return [3,1];
 if(length<34&&index%5===0)return [4,1];
 if(length>30&&index%4===0)return [2,3];
 if(index%7===0)return [3,2];
 return [2,2];
}
function layout(world='all'){
 const mobile=phone.matches,cols=mobile?6:12,occupied=[],placed=new Map();
 const fit=(x,y,w,h)=>x+w<=cols&&Array.from({length:h},(_,j)=>Array.from({length:w},(_,i)=>!occupied[y+j]?.[x+i]).every(Boolean)).every(Boolean);
 const put=(card,x,y,w,h)=>{if(!card)return;for(let j=0;j<h;j++){occupied[y+j]??=[];for(let i=0;i<w;i++)occupied[y+j][x+i]=true;}placed.set(card,{x,y,w,h});};
 if(world==='all'){
  if(mobile){put(anchor('web'),0,0,4,2);put(anchor('it'),2,2,4,2);put(find('brand'),1,4,4,2);put(anchor('software'),0,6,4,2);put(anchor('consulting'),2,8,4,2);}
  else{put(anchor('web'),0,0,4,2);put(anchor('it'),8,0,4,2);put(find('brand'),4,2,4,2);put(anchor('software'),0,4,4,2);put(anchor('consulting'),8,4,4,2);}
  // Eight sixteen-cell photo windows are woven through the existing questions.
  const albums=cards.filter(c=>c.dataset.kind==='photo-album'),startRow=mobile?10:6;
  const cells=cards.reduce((sum,c,i)=>{const [w,h]=dimensions(c,i);return sum+w*h},0);
  const albumStep=Math.max(4,Math.floor((Math.ceil(cells/cols)-startRow-4)/Math.max(1,albums.length-1)));
  albums.forEach((c,i)=>put(c,mobile?(i%2)*2:[4,0,8,4,0,8,4,0][i],startRow+i*albumStep,4,4));
 }else{put(anchor(world),0,0,4,2);put(find('brand'),mobile?2:4,mobile?2:0,4,2);}
 const buckets=Object.fromEntries(['web','it','software','consulting','other'].map(f=>[f,cards.filter(c=>!placed.has(c)&&(c.dataset.family||'other')===f)]));
 const woven=[];while(Object.values(buckets).some(b=>b.length))for(const family of ['web','it','software','consulting','other'])woven.push(...buckets[family].splice(0,family==='web'||family==='it'?2:1));
 const order=world==='all'?woven:[...woven.filter(c=>c.dataset.family===world),...woven.filter(c=>c.dataset.family!==world)];
 for(const [i,card]of order.entries()){const [w,h]=dimensions(card,cards.indexOf(card));let found=false;for(let y=0;!found;y++)for(let x=0;x<=cols-w;x++)if(fit(x,y,w,h)){put(card,x,y,w,h);found=true;break;}}
 const style=getComputedStyle(canvas),gap=parseFloat(style.columnGap)||8,available=canvas.clientWidth-parseFloat(style.paddingLeft)-parseFloat(style.paddingRight),unit=(available-gap*(cols-1))/cols;
 let rows=0;for(const [card,{x,y,w,h}]of placed){card.style.gridArea=`${y+1}/${x+1}/${y+h+1}/${x+w+1}`;Object.assign(card.dataset,{cells:String(w*h),columns:String(w),rows:String(h),shape:h===1?'strip':w<h?'tower':w>h?'landscape':'square'});card.style.setProperty('--tile-columns',w);rows=Math.max(rows,y+h);}
 canvas.style.gridTemplateRows=`repeat(${rows},${unit}px)`;canvas.style.setProperty('--cell-unit',unit+'px');canvas.dataset.tileCount=String(cards.length);canvas.dataset.gridRevision='3';
 const route=canvas.querySelector('.world-route');[...placed].sort((a,b)=>a[1].y-b[1].y||a[1].x-b[1].x).forEach(([c])=>canvas.insertBefore(c,route));
}
window.LF_MOSAIC={layout};layout();
let previousWidth=canvas.clientWidth;new ResizeObserver(()=>{if(Math.abs(canvas.clientWidth-previousWidth)>.5){previousWidth=canvas.clientWidth;layout(canvas.dataset.world||'all')}}).observe(canvas);
phone.addEventListener('change',()=>layout(canvas.dataset.world||'all'));
})();
