/* A real two-sided card: native-size front, expanding enamel back, native-size reader. */
(()=>{'use strict';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width:760px), (pointer:coarse)');
  const ease='cubic-bezier(.22,1,.36,1)';
  let active=null,pressed=null;
  const quiet=()=>reduce.matches||document.body.classList.contains('no-motion');
  const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
  const settled=animation=>animation.finished.catch(()=>{});
  function finish(flight){
    if(active!==flight)return;
    flight.animations.forEach(a=>a.cancel());
    flight.source?.classList.remove('is-motion-source','is-pressed');
    flight.layer?.remove();
    flight.panel.classList.remove('is-tile-flight');
    flight.panel.removeAttribute('data-motion-phase');
    flight.panel.style.opacity=flight.direction==='close'?'0':'';
    flight.panel.style.transform='';
    flight.panel.inert=flight.wasInert;
    active=null;
  }
  const cancel=()=>{if(active)finish(active);};
  function animate(flight,node,frames,options){
    const animation=node.animate(frames,{fill:'both',easing:ease,...options});
    flight.animations.push(animation);return animation;
  }
  function sourceFace(source,rect){
    const face=document.createElement('div');
    face.className='lf-motion-front';
    Object.assign(face.style,{width:`${rect.width}px`,height:`${rect.height}px`,marginLeft:`${-rect.width/2}px`,marginTop:`${-rect.height/2}px`,borderRadius:getComputedStyle(source).borderRadius});
    const clone=source.cloneNode(true);
    clone.classList.remove('is-pressed','is-motion-source','replay','is-performing');
    for(const node of [clone,...clone.querySelectorAll('*')]){
      for(const attr of ['id','data-answer','data-view','data-talk','aria-controls','aria-expanded'])node.removeAttribute(attr);
      if(node.matches('a,button,input,select,textarea,[tabindex]'))node.tabIndex=-1;
    }
    clone.setAttribute('aria-hidden','true');
    const shade=document.createElement('span');shade.className='lf-motion-shade';
    face.append(clone,shade);return {face,shade};
  }
  const turn=(x,y,angle,tilt=0,twist=0,scale=1)=>`perspective(1800px) translate3d(${x}px,${y}px,0) rotateX(${tilt}deg) rotateZ(${twist}deg) rotateY(${angle}deg) scale(${scale})`;
  function prepare({source,dialog,panel},direction){
    const from=source?.getBoundingClientRect(),to=panel.getBoundingClientRect();
    const layer=document.createElement('div');
    layer.className='lf-tile-flight';layer.dataset.phase=direction;
    layer.inert=true;layer.setAttribute('aria-hidden','true');
    const flight={source,dialog,panel,layer,animations:[],phone:compact.matches,direction,wasInert:panel.inert};
    if(from?.width&&from?.height){
      const native={width:source.offsetWidth,height:source.offsetHeight};
      const style=getComputedStyle(source);
      const card=document.createElement('div');card.className='lf-motion-card';
      Object.assign(card.style,{left:`${to.left}px`,top:`${to.top}px`,width:`${to.width}px`,height:`${to.height}px`});
      // Topic color is carried into the physical reverse side. The source card
      // remains the single content surface; the reverse only supplies material.
      card.style.setProperty('--motion-pop',style.getPropertyValue('--motion-pop').trim()||style.getPropertyValue('--tile-pop').trim()||'#3b8bff');
      const {face,shade}=sourceFace(source,native);
      const back=document.createElement('div');back.className='lf-motion-back';
      const surface=document.createElement('div');surface.className='lf-motion-enamel';
      surface.style.borderRadius=getComputedStyle(panel).borderRadius;
      const mark=document.createElement('div');mark.className='lf-motion-mark';
      const boat=document.querySelector('.wordmark .boat')?.cloneNode(true);
      if(boat){boat.removeAttribute('class');mark.append(boat);}
      mark.style.width=mark.style.height=`${Math.min(56,Math.max(26,Math.min(native.width,native.height)*.32))}px`;
      back.append(surface,mark);
      const edge=document.createElement('div');edge.className='lf-motion-edge';
      Object.assign(edge.style,{height:`${native.height*.87}px`,marginTop:`${-native.height*.87/2}px`,marginLeft:`${native.width/2-2}px`});
      card.append(face,edge,back);layer.append(card);
      const x=Math.round(from.left+from.width/2-to.left-to.width/2);
      const y=Math.round(from.top+from.height/2-to.top-to.height/2);
      const sx=native.width/to.width,sy=native.height/to.height;
      flight.card=card;flight.back=back;flight.shade=shade;flight.surface=surface;flight.mark=mark;
      flight.origin={x,y,sx,sy};
      card.style.transform=direction==='open'?turn(x,y,0,0,0,.96):turn(0,0,-180);
      surface.style.transform=direction==='open'?`scale(${sx},${sy})`:'scale(1,1)';
    }
    source?.classList.add('is-motion-source');
    panel.classList.add('is-tile-flight');panel.dataset.motionPhase=direction;
    panel.inert=true;
    dialog.append(layer);active=flight;return flight;
  }
  async function open(options){
    cancel();
    if(quiet()){options.panel.classList.remove('is-tile-flight');return;}
    const flight=prepare(options,'open');
    await nextFrame();await nextFrame();
    if(active!==flight)return;
    if(!flight.card){
      animate(flight,flight.panel,[{opacity:0},{opacity:1}],{duration:160});
    }else{
      const {x,y,sx,sy}=flight.origin;
      const duration=flight.phone?540:620;
      // Front and back stay opaque. Their actual orientation decides which is visible.
      // The front is never enlarged; expansion starts only when it is edge-on.
      animate(flight,flight.card,[
        {offset:0,transform:turn(x,y,0,0,0,.96)},
        {offset:.14,transform:turn(x,y-7,8,3,1.5,1)},
        {offset:.46,transform:turn(x*.65,y*.65-14,-90,5,-3,1)},
        {offset:.82,transform:turn(x*.06,y*.06,-174,1,-.6,1)},
        {offset:1,transform:turn(0,0,-180)}
      ],{duration,easing:'linear'});
      animate(flight,flight.surface,[
        {offset:0,transform:`scale(${sx},${sy})`},
        {offset:.46,transform:`scale(${sx},${sy})`},
        {offset:1,transform:'scale(1,1)'}
      ],{duration,easing:'linear'});
      animate(flight,flight.shade,[{opacity:0},{opacity:.42}],{duration:duration*.46});
      // The reader takes over only after the complete half-turn has landed.
      animate(flight,flight.back,[{opacity:1},{opacity:0}],{duration:110,delay:duration,easing:'ease-out'});
      animate(flight,flight.panel,[{opacity:0},{opacity:1}],{duration:1,delay:duration});
    }
    await Promise.all(flight.animations.map(settled));finish(flight);
  }
  async function close(options){
    if(active){cancel();options.panel.style.opacity='0';return;}
    if(quiet())return;
    const flight=prepare(options,'close');
    if(!flight.card){
      animate(flight,flight.panel,[{opacity:1},{opacity:0}],{duration:140});
    }else{
      const {x,y,sx,sy}=flight.origin;
      const duration=flight.phone?430:490;
      animate(flight,flight.back,[{opacity:0},{opacity:1}],{duration:100});
      animate(flight,flight.panel,[{opacity:1},{opacity:0}],{duration:1,delay:100});
      animate(flight,flight.card,[
        {offset:0,transform:turn(0,0,-180)},
        {offset:100/duration,transform:turn(0,0,-180)},
        {offset:.60,transform:turn(x*.65,y*.65-14,-90,5,-3)},
        {offset:.90,transform:turn(x,y-5,5,2,1)},
        {offset:1,transform:turn(x,y,0)}
      ],{duration,easing:'linear'});
      animate(flight,flight.surface,[
        {offset:0,transform:'scale(1,1)'},
        {offset:100/duration,transform:'scale(1,1)'},
        {offset:.60,transform:`scale(${sx},${sy})`},
        {offset:1,transform:`scale(${sx},${sy})`}
      ],{duration,easing:'linear'});
      animate(flight,flight.shade,[{offset:0,opacity:.42},{offset:.6,opacity:.42},{offset:1,opacity:0}],{duration});
    }
    await Promise.all(flight.animations.map(settled));finish(flight);
  }
  const releasePress=()=>{pressed?.tile.classList.remove('is-pressed');pressed=null;};
  document.querySelectorAll('.tile').forEach(tile=>{
    tile.addEventListener('pointerdown',event=>{
      if(event.button!==0||quiet())return;
      releasePress();pressed={tile,x:event.clientX,y:event.clientY};tile.classList.add('is-pressed');
    });
    tile.addEventListener('pointercancel',releasePress);
    tile.addEventListener('lostpointercapture',releasePress);
  });
  addEventListener('pointerup',releasePress,{passive:true});
  addEventListener('pointermove',event=>{if(pressed&&Math.hypot(event.clientX-pressed.x,event.clientY-pressed.y)>12)releasePress();},{passive:true});
  addEventListener('scroll',releasePress,{passive:true,capture:true});
  addEventListener('resize',cancel,{passive:true});
  addEventListener('pagehide',cancel);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});
  reduce.addEventListener('change',()=>{releasePress();cancel();});
  window.LFTileMotion={open,close,cancel};
})();
