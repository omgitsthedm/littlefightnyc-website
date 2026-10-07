import * as T from 'three';
import data from './farm-house-inside-data.json';
export {data};
export const IN=.0254,FT=.3048;
export const layerDefs=[
 ['terrain','Ground & grading','#bfa782',true],['landscaping','Finished landscape','#74864b',true],['boundaries','Survey & easements','#89633c',false],['hardscape','Driveways & patios','#c3beb1',true],['fences','Fences & gates','#4e554b',true],
 ['foundation','Concrete foundations','#aaa69a',true],['reinforcement','Rebar & anchors','#695f53',false],['walls','Wall framing','#ba936b',false],['insulation','Insulation','#d4c894',false],['sheathing','Sheathing & EPS','#ceb797',false],['finishes','Walls & finishes','#ece8dc',true],['floors','Room floors','#c4ae8e',true],['ceilings','Ceilings','#ede9dc',true],['roof','Roof covering','#363f3b',true],['trusses','Trusses & beams','#af815b',false],['openings','Doors & windows','#33483f',true],['fixtures','Fixtures & cabinets','#d9d7c9',true],
 ['water','Water supply · schematic','#397daf',false],['waste','Waste & vents · schematic','#a26642',false],['electrical','Electrical devices & circuits','#dca64e',false],['hvac','HVAC · schematic ducts','#8ba6a1',false],['septic','Septic tanks & drainfields','#718c65',true],['barn','Barn steel & cladding','#d1d2c8',true],['annotations','Room & site labels','#f1ecdd',true],['proposals','Saved planning objects','#99774a',true]
];
export function createModel(){
 const root=new T.Group();root.name='Farm House · drawing-based model';
 const layers=Object.fromEntries(layerDefs.map(([id,name,color,visible])=>{const g=new T.Group();g.name=name;g.visible=visible;g.userData.layer=id;root.add(g);return[id,g];}));
 const objects=[],labels=[],circuits=[],roomTargets=[],colliders=[];let serial=0;
 const mats={};
 function mat(key,color,props={}){if(!mats[key])mats[key]=new T.MeshStandardMaterial({color,roughness:.8,...props});return mats[key];}
 function riverRockTexture(){const s=128,pixels=new Uint8Array(s*s*4);let seed=61729;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;},pebbles=Array.from({length:105},()=>({x:random()*s,y:random()*s,rx:2+random()*4.4,ry:1.3+random()*3.1,t:random()*Math.PI,c:132+random()*37}));for(let y=0;y<s;y++)for(let x=0;x<s;x++){let base=148+(Math.sin(x*.17+y*.11)*3),shade=0;for(const p of pebbles){const dx=x-p.x,dy=y-p.y,ct=Math.cos(p.t),st=Math.sin(p.t),u=(dx*ct+dy*st)/p.rx,v=(-dx*st+dy*ct)/p.ry,d=u*u+v*v;if(d<1){base=p.c;shade+=(1-d)*15+u*4-v*8;}}const i=(y*s+x)*4;pixels[i]=Math.max(0,Math.min(255,base+shade-7));pixels[i+1]=Math.max(0,Math.min(255,base+shade-3));pixels[i+2]=Math.max(0,Math.min(255,base+shade+1));pixels[i+3]=255;}const tex=new T.DataTexture(pixels,s,s,T.RGBAFormat);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipMapLinearFilter;tex.needsUpdate=true;return tex;}
 const M={concrete:mat('concrete','#aaa79d'),wood:mat('wood','#b68b5f'),woodDark:mat('woodDark','#75523a'),gypsum:mat('gypsum','#ece8df'),clad:mat('clad','#f0eee7',{roughness:.9}),roof:mat('roof','#414340',{roughness:.94}),steel:mat('steel','#816955',{metalness:.5}),barn:mat('barn','#e2e0d4',{metalness:.25}),metal:mat('metal','#3d4940',{metalness:.65}),glass:mat('glass','#78988d',{transparent:true,opacity:.34,roughness:.18,metalness:.15,side:T.DoubleSide,depthWrite:false}),floor:mat('floor','#baa486'),tile:mat('tile','#d3cdbf'),fixture:mat('fixture','#f2eee1',{roughness:.25}),counter:mat('counter','#ded6c4'),cabinet:mat('cabinet','#a6ac98'),water:mat('water','#358ab0'),hot:mat('hot','#c55b4c'),waste:mat('waste','#886349'),wire:mat('wire','#c49237'),duct:mat('duct','#8aadb0',{metalness:.25}),earth:mat('earth','#b8a88c'),grass:mat('grass','#425b35',{roughness:1}),riverRock:mat('riverRock','#ffffff',{roughness:1,side:T.DoubleSide,map:riverRockTexture()}),boulder:mat('boulder','#696c66',{roughness:.94}),bark:mat('bark','#604b35',{roughness:1}),foliage:mat('foliage','#50683b',{roughness:.95}),septic:mat('septic','#779582',{transparent:true,opacity:.76,depthWrite:false}),insulation:mat('insulation','#d7c793',{transparent:true,opacity:.83}),osb:mat('osb','#b59a72'),eps:mat('eps','#e5e1d3'),reinforcement:mat('rebar','#74604c',{metalness:.6}),unknown:mat('unknown','#c08d42'),highlight:mat('highlight','#dba94d')};
 // River-rock texture coordinates are baked from local X/Z after geometry is
 // placed. The DataTexture therefore travels through GLB and Blender as an
 // ordinary mapped material without relying on browser-only shader hooks.
 function bakeRiverRockUVs(){root.traverse(o=>{if(!o.isMesh||o.material!==M.riverRock||!o.geometry?.attributes?.position)return;const g=o.geometry.clone(),pos=g.attributes.position,uv=new Float32Array(pos.count*2),p=new T.Vector3();for(let i=0;i<pos.count;i++){p.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);uv[i*2]=p.x*.78;uv[i*2+1]=p.z*.78;}g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));o.geometry=g;});}
 function register(obj,layer,name,info={}){const{source,notes,source_path_index,source_page,raw_tag,position_basis,at_original_plan,...safeInfo}=info;obj.name=name;obj.userData={id:safeInfo.id||'FH-'+String(++serial).padStart(5,'0'),layer,name,confidence:safeInfo.confidence||'approximate',...safeInfo};obj.castShadow=layer!=='terrain';obj.receiveShadow=true;obj.userData.baseY=obj.position.y;layers[layer].add(obj);objects.push(obj);return obj;}
 function box(layer,name,at,size,material,info={}){const o=new T.Mesh(new T.BoxGeometry(...size),material);o.position.set(...at);register(o,layer,name,{dimensions_in:size.map(x=>x/IN),...info});return o;}
 function sphere(layer,name,at,scale,material,info={}){const o=new T.Mesh(new T.SphereGeometry(1,18,12),material);o.position.set(...at);o.scale.set(...scale);return register(o,layer,name,info);}
 function cylinder(layer,name,a,b,r,material,info={}){const A=new T.Vector3(...a),B=new T.Vector3(...b),length=A.distanceTo(B);const o=new T.Mesh(new T.CylinderGeometry(r,r,length,8),material);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),B.sub(A).normalize());return register(o,layer,name,info);}
 function beam(layer,name,a,b,w,d,material,info={}){const A=new T.Vector3(...a),B=new T.Vector3(...b),length=A.distanceTo(B);const o=new T.Mesh(new T.BoxGeometry(w,d,length),material);o.position.copy(A).add(B).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),B.sub(A).normalize());return register(o,layer,name,info);}
 function line(layer,name,points,color,info={},dashed=false){const geom=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const o=new T.Line(geom,dashed?new T.LineDashedMaterial({color,dashSize:.45,gapSize:.22}):new T.LineBasicMaterial({color}));if(dashed)o.computeLineDistances();return register(o,layer,name,info);}
 function slab(layer,name,pts,top,depth,material,info={}){const s=new T.Shape();pts.forEach(([x,z],i)=>i?s.lineTo(x,-z):s.moveTo(x,-z));s.closePath();const g=new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:1});g.rotateX(-Math.PI/2);const mesh=new T.Mesh(g,material);mesh.position.y=top-depth;return register(mesh,layer,name,info);}
 function surface(layer,name,pts,material,info={}){const g=new T.BufferGeometry();const vs=pts.flat();g.setAttribute('position',new T.Float32BufferAttribute(vs,3));const indices=[];for(let i=1;i<pts.length-1;i++)indices.push(0,i,i+1);g.setIndex(indices);g.computeVertexNormals();const o=new T.Mesh(g,material);o.material.side=T.DoubleSide;return register(o,layer,name,info);}
 const placement=data.local_placement;
 const P=(u,v,y=0)=>[(placement.east_ft+(849-v)/12)*FT,y,(-placement.north_ft+u/12)*FT];
 const PP=(a,y=0)=>P(a[0],a[1],y);
 const SP=(e,n,y=-.15)=>[e*FT,y,-n*FT];
 const BP=(length,width,y=0)=>[length*FT,y,-width*FT];
 function label(name,at,entity,scale=1){labels.push({name,at,entity,scale});}
 function route(layer,name,pts,material,diameter,info={}){const group=new T.Group();for(let i=1;i<pts.length;i++){const aa=new T.Vector3(...pts[i-1]),bb=new T.Vector3(...pts[i]),L=aa.distanceTo(bb);if(L<.001)continue;const o=new T.Mesh(new T.CylinderGeometry(diameter/2,diameter/2,L,7),material);o.position.copy(aa).add(bb).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bb.sub(aa).normalize());group.add(o);}return register(group,layer,name,{confidence:'schematic',...info});}
 const housePolygon=data.house.outline.map(q=>{const a=PP(q);return[a[0],a[2]];});
 // House foundation and individually inspectable room floor regions.
 const hp=data.house.outline.map(a=>{const q=PP(a);return[q[0],q[2]];});
 slab('foundation','House concrete slab · 4 inches',hp,0,4*IN,M.concrete,{id:'house-slab',source:'',confidence:'dimensioned',thickness_in:4,notes:''});
 slab('foundation','House ABC base · 4 inches',hp,-4*IN,4*IN,mat('abc','#8f8471'),{source:'',confidence:'dimensioned',thickness_in:4});
 slab('floors','House floor finish · illustrative',hp,.012,.012,M.floor,{source:'',confidence:'approximate',notes:''});
 for(const r of data.house.rooms){const pts=r.polygon.map(a=>{const q=PP(a);return[q[0],q[2]];});if(r.finish==='tile'||r.finish==='concrete')slab('floors',r.name+' floor',pts,.017,.009,r.finish==='tile'?M.tile:M.concrete,{id:'room-floor-'+r.id,source:r.source,confidence:r.confidence,notes:r.notes,room:r.id});
  const center=PP(r.center,.03);label(r.name,center,'room-'+r.id);roomTargets.push({...r,position:PP(r.center,66*IN)});
  const mesh=slab('ceilings',r.name+' ceiling',pts,r.ceiling_in*IN,.5*IN,M.gypsum,{id:'room-'+r.id,confidence:'derived',height_in:r.ceiling_in});
  if(['kitchen','living_room','dining_room','library','foyer'].includes(r.id)){mesh.visible=false;mesh.userData.alwaysHidden=true;
   function half(points,greater){const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ai=greater?a[1]>=596.5:a[1]<=596.5,bi=greater?b[1]>=596.5:b[1]<=596.5;if(ai)out.push(a);if(ai!==bi){const t=(596.5-a[1])/(b[1]-a[1]);out.push([a[0]+(b[0]-a[0])*t,596.5]);}}return out;}
   for(const greater of [false,true]){const poly=half(r.polygon,greater);if(poly.length<3)continue;const shape=new T.Shape();poly.forEach(([u,v],i)=>i?shape.lineTo(u,v):shape.moveTo(u,v));shape.closePath();const geo=new T.ShapeGeometry(shape),pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const u=pos.getX(i),v=pos.getY(i),height=(120+Math.max(0,Math.min(v-348,845-v))*.375)*IN;pos.setXYZ(i,...P(u,v,height));}geo.computeVertexNormals();const vm=new T.Mesh(geo,M.gypsum);vm.material.side=T.DoubleSide;register(vm,'ceilings',r.name+' vaulted ceiling',{source:'',confidence:'conflict',pitch:4.5,notes:''});}
  }
 }
 for(const por of data.house.porches){const pts=por.polygon.map(a=>{const q=PP(a);return[q[0],q[2]];});slab('hardscape',por.name,pts,-.025,4*IN,M.concrete,{id:por.id,source:'',confidence:'derived',notes:''});}

 function wallPiece(w,start,end,bottom,top,layer,material,thickness,offset=0){if(end-start<.1||top-bottom<.1)return;const a=w.a,b=w.b,L=Math.hypot(b[0]-a[0],b[1]-a[1]),du=(b[0]-a[0])/L,dv=(b[1]-a[1])/L;
  const mid=[a[0]+du*(start+end)/2-dv*offset,a[1]+dv*(start+end)/2+du*offset];const o=box(layer,w.name,PP(mid,(top+bottom)/2*IN),[(end-start)*IN,(top-bottom)*IN,thickness*IN],material,{wall_id:w.id,confidence:'derived',dimensions_in:[end-start,top-bottom,thickness]});
  const pa=PP(a),pb=PP(b);o.rotation.y=-Math.atan2(pb[2]-pa[2],pb[0]-pa[0]);return o;
 }
 for(const w of data.house.walls){const L=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]),holes=[...w.openings].sort((a,b)=>a.offset_in-b.offset_in);let spans=[],cursor=0;
  for(const o of holes){let l=Math.max(cursor,o.offset_in-o.width_in/2),r=Math.min(L,o.offset_in+o.width_in/2);if(l>cursor)spans.push([cursor,l,0,w.height_in]);if(o.sill_in>0)spans.push([l,r,0,o.sill_in]);if(o.sill_in+o.height_in<w.height_in)spans.push([l,r,o.sill_in+o.height_in,w.height_in]);cursor=Math.max(cursor,r);}
  if(cursor<L)spans.push([cursor,L,0,w.height_in]);
  for(const seg of spans){wallPiece(w,...seg,'insulation',M.insulation,w.core_in);for(const side of [-1,1])wallPiece(w,...seg,'finishes',w.exterior?M.clad:M.gypsum,.5,side*(w.core_in/2+.25));
   if(w.exterior){wallPiece(w,...seg,'sheathing',M.osb,.375,w.core_in/2+.1875);wallPiece(w,...seg,'sheathing',M.eps,1,w.core_in/2+.875);}
   let [a,b,z0,z1]=seg;for(let at=Math.ceil(a/16)*16;at<b;at+=16)wallPiece(w,Math.max(a,at-.75),Math.min(b,at+.75),z0,z1,'walls',M.wood,w.core_in);
   if(b-a>3){wallPiece(w,a,b,z0,z0+1.5,'walls',M.wood,w.core_in);wallPiece(w,a,b,Math.max(z0,z1-3),z1,'walls',M.wood,w.core_in);}
  }
  const pa=PP(w.a,-.38),pb=PP(w.b,-.38);
  if(w.exterior)beam('foundation',w.name+' continuous footing',pa,pb,18*IN,10*IN,M.concrete,{source:'',confidence:'derived',dimensions_in:[18,10],notes:''});
  for(const o of holes){const l=o.offset_in-o.width_in/2,r=o.offset_in+o.width_in/2;for(const t of [l-1.5,r+1.5])wallPiece(w,t-1.5,t+1.5,0,120,'walls',M.wood,w.core_in);
   wallPiece(w,l-3,r+3,o.height_in+o.sill_in,o.height_in+o.sill_in+7.25,'walls',M.woodDark,w.core_in);
   const du=(w.b[0]-w.a[0])/L,dv=(w.b[1]-w.a[1])/L,center=[w.a[0]+du*o.offset_in,w.a[1]+dv*o.offset_in],wp=PP(center,(o.sill_in+o.height_in/2)*IN),axisA=PP(w.a),axisB=PP(w.b),rotation=-Math.atan2(axisB[2]-axisA[2],axisB[0]-axisA[0]);
   const recovered=null;
   const g=recovered?.children.length?recovered:new T.Group();g.position.set(...wp);g.rotation.y=rotation;
   if(!recovered?.children.length){
   const panelMaterial=['window','folding'].includes(o.kind)?M.glass:o.kind==='garage'?M.metal:M.cabinet;
   const pane=new T.Mesh(new T.BoxGeometry(Math.max(.1,(o.width_in-3)*IN),(o.height_in-3)*IN,1.5*IN),panelMaterial);g.add(pane);
   for(const xx of [-o.width_in/2+1,o.width_in/2-1]){const f=new T.Mesh(new T.BoxGeometry(2*IN,o.height_in*IN,3*IN),M.metal);f.position.x=xx*IN;g.add(f);}
   for(const yy of [-o.height_in/2+1,o.height_in/2-1]){const f=new T.Mesh(new T.BoxGeometry(o.width_in*IN,2*IN,3*IN),M.metal);f.position.y=yy*IN;g.add(f);}
   if(o.kind==='garage'){for(let yy=-o.height_in/2+24;yy<o.height_in/2;yy+=24){const seam=new T.Mesh(new T.BoxGeometry(o.width_in*IN,.025,.05),M.woodDark);seam.position.y=yy*IN;g.add(seam);}}
   if(o.kind==='folding'){for(let xx=-o.width_in/2+36;xx<o.width_in/2;xx+=36){const mullion=new T.Mesh(new T.BoxGeometry(2*IN,o.height_in*IN,3*IN),M.metal);mullion.position.x=xx*IN;g.add(mullion);}}
   if(o.kind==='window'&&o.width_in>=24){const vertical=new T.Mesh(new T.BoxGeometry(.8*IN,o.height_in*IN,2*IN),M.metal);g.add(vertical);const rows=o.height_in>=60?4:2;for(let i=1;i<rows;i++){const horizontal=new T.Mesh(new T.BoxGeometry(o.width_in*IN,.8*IN,2*IN),M.metal);horizontal.position.y=(-o.height_in/2+o.height_in*i/rows)*IN;g.add(horizontal);}}
   }
   register(g,'openings',o.name,{...o,legacyOpening:recovered?.userData.legacyOpening,confidence:o.confidence||'approximate',dimensions_in:[o.width_in,o.height_in],opening:true});
   if(o.kind!=='window')g.userData.operable=true;
  }
 }
 // Restore the continuous lower exterior trim at the wall footprint.
 const lowerTrim=mat('lower-exterior-trim','#eeeee6',{roughness:.55});
 for(const w of data.house.walls.filter(w=>w.exterior)){
  const L=Math.hypot(w.b[0]-w.a[0],w.b[1]-w.a[1]);let cursor=0;
  for(const opening of [...w.openings].filter(o=>o.sill_in<6).sort((a,b)=>a.offset_in-b.offset_in)){
   const lo=Math.max(0,opening.offset_in-opening.width_in/2),hi=Math.min(L,opening.offset_in+opening.width_in/2);
   if(lo>cursor){const part=wallPiece(w,cursor,lo,0,6,'finishes',lowerTrim,1.25,-w.core_in/2-.625);if(part){part.name='Lower exterior trim · '+w.id;part.userData.restoredExteriorTrim=true;}}
   cursor=Math.max(cursor,hi);
  }
  if(cursor<L){const part=wallPiece(w,cursor,L,0,6,'finishes',lowerTrim,1.25,-w.core_in/2-.625);if(part){part.name='Lower exterior trim · '+w.id;part.userData.restoredExteriorTrim=true;}}
 }
 // Rebar grid is a general design layer; local detail exceptions remain visible.
 function rebarSpan(axis,fixed,polygon,spacing,source){const other=1-axis,crossings=[];for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length];if((a[axis]<=fixed&&b[axis]>fixed)||(b[axis]<=fixed&&a[axis]>fixed))crossings.push(a[other]+(b[other]-a[other])*(fixed-a[axis])/(b[axis]-a[axis]));}crossings.sort((a,b)=>a-b);for(let i=1;i<crossings.length;i+=2){const lo=crossings[i-1]+3,hi=crossings[i]-3;if(hi<=lo)continue;let ranges=[[lo,hi]];if(source==='geometry'){if(axis===0&&fixed<294)ranges=ranges.flatMap(([a,b])=>[[a,Math.min(b,382)],[Math.max(a,852),b]]);if(axis===1&&fixed>=385&&fixed<=849)ranges=ranges.map(([a,b])=>[Math.max(a,297),b]);}for(const [a,b] of ranges)if(b>a){const aa=axis===0?[fixed,a]:[a,fixed],bb=axis===0?[fixed,b]:[b,fixed];cylinder('reinforcement','#4 slab grid · '+spacing+'-inch spacing',PP(aa,-(axis===0?2:2.5)*IN),PP(bb,-(axis===0?2:2.5)*IN),.25*IN,M.reinforcement,{source,confidence:'derived',notes:''});}}}
 for(let u=12;u<1310;u+=36)rebarSpan(0,u,data.house.outline,36,'geometry');for(let v=12;v<849;v+=36)rebarSpan(1,v,data.house.outline,36,'geometry');
 const garagePoly=[[0,385],[294,385],[294,849],[0,849]];for(let u=12;u<294;u+=24)rebarSpan(0,u,garagePoly,24,'geometry');for(let v=397;v<849;v+=24)rebarSpan(1,v,garagePoly,24,'geometry');
 // Beam / porch posts and independently removable roof planes.
 const porchPosts=[];
 for(let u=448;u<=1133;u+=137)porchPosts.push([u,989]);
 for(let u of [662,846])porchPosts.push([u,208]);
 for(const [u,v] of porchPosts){const q=P(u,v,60*IN);box('trusses','Porch 6x6 post',q,[5.5*IN,120*IN,5.5*IN],M.wood,{source:'',confidence:'derived',notes:''});box('finishes','Porch post finish',q,[5.6*IN,120*IN,5.6*IN],M.clad,{source:'',confidence:'approximate',notes:''});box('foundation','Porch post pad footing',P(u,v,-.45),[30*IN,10*IN,30*IN],M.concrete,{source:'',confidence:'approximate',notes:''});}
 beam('trusses','Rear patio GLB beam',P(478,208,114*IN),P(1030,208,114*IN),5.125*IN,18*IN,M.woodDark,{source:'',confidence:'dimensioned',dimensions_in:[552,18,5.125],notes:''});
 beam('trusses','Front porch GLB beam',P(448,989,114*IN),P(1133,989,114*IN),5.125*IN,12*IN,M.woodDark,{source:'',confidence:'derived'});

 const roofParts=[],trussParts=[];
 function gable(name,u0,v0,u1,v1,axis='v',pitch=9,heel=7.125){const across=axis==='v'?v1-v0:u1-u0,base=120+heel,ridge=base+across/2*pitch/12,over=18;
  const a=axis==='v'?[[u0-over,v0-over,base-over*pitch/12],[u1+over,v0-over,base-over*pitch/12],[u1+over,(v0+v1)/2,ridge],[u0-over,(v0+v1)/2,ridge]]:[[u0-over,v0-over,base-over*pitch/12],[u0-over,v1+over,base-over*pitch/12],[(u0+u1)/2,v1+over,ridge],[(u0+u1)/2,v0-over,ridge]];
  const b=axis==='v'?[[u0-over,(v0+v1)/2,ridge],[u1+over,(v0+v1)/2,ridge],[u1+over,v1+over,base-over*pitch/12],[u0-over,v1+over,base-over*pitch/12]]:[[(u0+u1)/2,v0-over,ridge],[(u0+u1)/2,v1+over,ridge],[u1+over,v1+over,base-over*pitch/12],[u1+over,v0-over,base-over*pitch/12]];
  for(const pts of [a,b]){const obj=surface('roof',name+' roof plane',pts.map(([u,v,y])=>P(u,v,y*IN)),M.roof,{source:'',confidence:'derived',pitch,notes:''});roofParts.push(obj);}
  for(const edge of [axis==='v'?[[u0,v0],[u0,v1]]:[[u0,v0],[u1,v0]],axis==='v'?[[u1,v0],[u1,v1]]:[[u0,v1],[u1,v1]]]){
    const [a,b]=edge;surface('roof',name+' gable infill',[P(...a,120*IN),P(...b,120*IN),P((a[0]+b[0])/2,(a[1]+b[1])/2,ridge*IN)],M.clad,{source:'',confidence:'derived'});
  }
 }
 gable('Main vaulted body',545,348,1038,845,'v');gable('Garage / office body',0,385,545,827,'v');gable('Master / bedroom wing',1038,348,1310,826,'v');
 gable('Guest cross gable',171,0,478,348,'u');gable('Laundry cross gable',0,243,478,385,'u');gable('Master bath cross gable',1030,208,1310,348,'u');gable('Master rear closet gable',1160,43,1310,208,'u');gable('Garage front cross gable',0,655,294,849,'u');
 const porchRoof=surface('roof','Front porch roof · manufacturer 3:12 variant',[P(448,820,162*IN),P(1133,820,162*IN),P(1133,1007,115.25*IN),P(448,1007,115.25*IN)],M.roof,{source:'',confidence:'conflict',variant:'manufacturer',notes:''});roofParts.push(porchRoof);
 const rearRoof=surface('roof','Rear patio roof',[P(478,208,117*IN),P(1030,208,117*IN),P(1030,348,152*IN),P(478,348,152*IN)],M.roof,{source:'',confidence:'conflict',notes:''});roofParts.push(rearRoof);
 // Three front dormers are elevation features; sizes are explicitly illustrative.
 for(const u of [660,805,945]){const v=775,info={source:'',confidence:'derived',notes:''};
  for(const side of [-1,1])surface('roof','Dormer cheek',[P(u+side*32,665,180*IN),P(u+side*32,v,180*IN),P(u+side*32,v,240*IN),P(u+side*32,665,240*IN)],M.clad,info);
  for(const [a,b,lo,hi] of [[-32,-14,180,240],[14,32,180,240],[-14,14,180,185],[-14,14,237,240]])surface('roof','Dormer front trim',[P(u+a,v,lo*IN),P(u+b,v,lo*IN),P(u+b,v,hi*IN),P(u+a,v,hi*IN)],M.clad,info);
  surface('roof','Dormer gable',[P(u-32,v,240*IN),P(u+32,v,240*IN),P(u,v,264*IN)],M.clad,info);
  for(const side of [-1,1])roofParts.push(surface('roof','Dormer roof plane',[P(u+side*35,662,240*IN),P(u+side*35,v+4,240*IN),P(u,v+4,266*IN),P(u,662,266*IN)],M.roof,info));
  box('roof','Dormer glazing',P(u,v+.5,211*IN),[1*IN,52*IN,28*IN],M.glass,info);
  for(const offset of [-14,0,14])box('roof','Dormer vertical muntin',P(u+offset,v+1,211*IN),[1.5*IN,52*IN,1.2*IN],M.metal,info);
  for(const y of [185,198,211,224,237])box('roof','Dormer horizontal muntin',P(u,v+1,y*IN),[1.5*IN,1.2*IN,28*IN],M.metal,info);
 }
 // Local truss contours preserve their recovered profile geometry.
 const vectorProfiles=new Map(data.truss_vectors.map(v=>[v.mark,v])),trussGeometries=new Map();
 function trussProfile(mark){const t=data.trusses.find(t=>t.mark===mark),v=vectorProfiles.get(mark),g=new T.Group();if(!t||!v)return g;
  v.members.forEach((member,index)=>{const key=mark+'-'+index;if(!trussGeometries.has(key)){const shape=new T.Shape();member.polygon_in.forEach(([x,y],i)=>i?shape.lineTo(x*IN,y*IN):shape.moveTo(x*IN,y*IN));shape.closePath();const geo=new T.ExtrudeGeometry(shape,{depth:1.5*t.plies*IN,bevelEnabled:false,curveSegments:1});geo.translate(0,0,-.75*t.plies*IN);trussGeometries.set(key,geo);}const part=new T.Mesh(trussGeometries.get(key),M.wood);part.userData={vectorMember:true,member_width_in:member.width_in};g.add(part);});return g;
 }
 function truss(mark,u,v,axis='v',height=120){const t=data.trusses.find(t=>t.mark===mark);if(!t)return;const W=t.profile_width_in,H=t.profile_height_in,ply=1.5*t.plies,slope=t.top_chord_pitch_over_12/12;
  if(vectorProfiles.has(mark)){const profile=trussProfile(mark),parts=[];for(const [i,part] of [...profile.children].entries()){part.position.set(...P(u,v,height*IN));part.rotation.y=axis==='v'?Math.PI:-Math.PI/2;register(part,'trusses',mark+' · lumber member '+(i+1),{...part.userData,mark,quantity:t.quantity,plies:t.plies,profile_width_in:W,profile_height_in:H,confidence:'derived'});parts.push(part);}trussParts.push(...parts);return parts;}
  const point=(x,y)=>axis==='v'?P(u,v+x,(height+y)*IN):P(u+x,v,(height+y)*IN);
  let top;
  if(t.type.includes('Piggyback Base')){const run=(H-7.125)/slope;top=[[0,7.125],[Math.min(run,W/2),H],[Math.max(W-run,W/2),H],[W,7.125]];}
  else if(t.type.includes('Monopitch')||mark.startsWith('G')||mark.startsWith('JK'))top=[[0,5.9375],[W,H]];
  else top=[[0,7.125],[W/2,H],[W,7.125]];
  const bottom=mark.startsWith('K')?[[0,0],[W/2,Math.max(0,(W/2-5.5)*.375)],[W,0]]:[[0,0],[W,0]];
  const parts=[];const spec={source:'',confidence:'derived',mark,quantity:t.quantity,plies:t.plies,profile_width_in:W,profile_height_in:H,notes:''};
  for(const chain of [top,bottom])for(let i=1;i<chain.length;i++)parts.push(beam('trusses',mark+' chord',point(...chain[i-1]),point(...chain[i]),ply*IN,5.5*IN,M.wood,spec));
  const n=Math.max(2,Math.ceil(W/75));for(let i=0;i<n;i++){const x=W*i/n,x2=W*(i+1)/n;const ty=top.length===2?top[0][1]+(H-top[0][1])*x2/W:Math.min(H,7.125+Math.min(x2,W-x2)*slope),by=mark.startsWith('K')?Math.min(x,W-x)*.375:0;parts.push(beam('trusses',mark+' web',point(x,by),point(x2,ty),ply*IN,3.5*IN,M.wood,spec));}
  trussParts.push(...parts);return parts;
 }
 for(let i=0;i<10;i++)truss('A01',171,12+i*24,'u');truss('A01G',171,0,'u');
 for(let i=0;i<4;i++)truss('B01',0,267+i*24,'u');truss('B02',0,385,'u');
 for(let i=0;i<15;i++)truss('L01',12+i*24,385);for(let i=0;i<6;i++)truss('L02',376+i*24,385);
 for(let i=0;i<13;i++)truss('K01',555+i*24,348);for(let i=0;i<6;i++)truss('K03',886+i*24,348);
 for(let i=0;i<7;i++)truss('H01',1049+i*24,348);for(let i=0;i<4;i++)truss('H02',1220+i*24,348);
 for(let i=0;i<6;i++)truss('D01',1160,52+i*24,'u');for(let i=0;i<5;i++)truss('E01',1030,221+i*24,'u');
 for(let i=0;i<20;i++)truss('PB06',555+i*24,348+(497-137)/2,'v',120+142.125-1.5);
 for(let i=0;i<21;i++)truss('PB02',12+i*24,385+(442-82)/2,'v',120+142.125-1.5);
 for(let i=0;i<11;i++)truss('PB04',1049+i*24,348+(427-67)/2,'v',120+142.125-1.5);
 for(let i=0;i<8;i++)truss('G03',640+i*24,845,'v',111);
 truss('B01G',0,243,'u');truss('C01G',0,849,'u');truss('C01',0,825,'u');truss('C02',0,801,'u');truss('D01G',1160,43,'u');truss('E01G',1030,208,'u');truss('H01G',1310,348);truss('K01G',545,348);truss('K03G',1038,348);truss('L01G',0,385);
 // Every design can also be opened individually without claiming an installed count.
 const trussGallery=new T.Group();trussGallery.name='Individual truss design inspection';trussGallery.visible=false;

 // Fixtures use distinct recognizable envelopes, with no invented product claim.
 function fixture(f){const originalPlanAt=f.at,[x,y,z]=PP(f.at),g=new T.Group();g.position.set(x,0,z);g.rotation.y=T.MathUtils.degToRad(f.angle);
  const add=(size,pos,material=M.fixture,round=false)=>{const o=new T.Mesh(round?new T.SphereGeometry(1,20,12):new T.BoxGeometry(...size),material);if(round)o.scale.set(...size);o.position.set(...pos);o.castShadow=true;g.add(o);return o;};
  const in3=a=>a.map(x=>x*IN);
  if(f.kind==='toilet'){add(in3([8,8,13]),in3([0,10,4]),M.fixture,true);add(in3([18,22,7]),in3([0,20,-9]));add(in3([8,1,11]),in3([0,17,5]),M.metal,true);}
  else if(f.kind==='tub'){add(in3([31,21,65]),in3([0,10.5,0]));add(in3([25,4,55]),in3([0,21,0]),mat('basin','#91a49a'));}
  else if(f.kind==='shower'){add(in3([48,3,52]),in3([0,1.5,0]),M.tile);add(in3([.5,80,52]),in3([24,41,0]),M.glass);add(in3([48,80,.5]),in3([0,41,-26]),M.glass);add(in3([7,1,7]),in3([0,78,-15]),M.metal);}
  else if(f.kind==='lavatory'||f.kind==='sink'){const w=f.kind==='sink'?36:28;add(in3([w,34,24]),in3([0,17,0]),M.cabinet);add(in3([w+1,2,25]),in3([0,35,0]),M.counter);add(in3([w/2-3,1,8]),in3([0,36.1,1]),mat('basin','#91a49a'),true);add(in3([1,9,1]),in3([0,40,-9]),M.metal);}
  else if(f.kind==='waterHeater'){const o=new T.Mesh(new T.CylinderGeometry(12*IN,12*IN,58*IN,20),M.fixture);o.position.y=29*IN;g.add(o);}
  else if(f.kind==='counter'){const [w,d,h]=f.size_in;add(in3([w,h-2,d]),in3([0,(h-2)/2,0]),M.cabinet);add(in3([w+1,2,d+1]),in3([0,h-1,0]),M.counter);}
  else{const dims=({heatPump:[36,36,36],airHandler:[28,58,28],refrigerator:[36,70,32],washer:[28,40,30],dryer:[28,40,30],dishwasher:[24,34,24],cooktop:[30,36,25],oven:[30,56,26],microwave:[28,18,20]})[f.kind]||[30,36,28];add(in3(dims),in3([0,dims[1]/2,0]),f.kind==='heatPump'?mat('condenser-housing','#777e75',{roughness:.58,metalness:.25}):f.kind==='airHandler'?M.duct:M.fixture);if(f.kind==='heatPump'){
   add(in3([42,6,42]),in3([0,-3,0]),M.concrete);
   const fan=new T.Mesh(new T.CylinderGeometry(12*IN,12*IN,1*IN,32),M.metal);fan.position.y=36.5*IN;g.add(fan);
   for(let i=1;i<=5;i++){const ring=new T.Mesh(new T.TorusGeometry(i*2.2*IN,.18*IN,4,28),M.duct);ring.rotation.x=Math.PI/2;ring.position.y=37.1*IN;g.add(ring);}
   for(let at=-15;at<=15;at+=3)for(const side of [-1,1]){add(in3([.32,28,.32]),in3([at,18,side*18.2]),M.metal);add(in3([.32,28,.32]),in3([side*18.2,18,at]),M.metal);}
  }else{add(in3([dims[0]-5,dims[1]*.4,1]),in3([0,dims[1]*.6,dims[2]/2+.5]),M.metal);}}
  const layer=['heatPump','airHandler'].includes(f.kind)?'hvac':'fixtures';register(g,layer,f.name,{...f,outdoorEquipment:f.kind==='heatPump',at_original_plan:originalPlanAt,source:'',confidence:f.confidence,notes:'',dimensions_in:f.size_in||null});return g;
 }
 data.house.fixtures.forEach(fixture);

 // Schematic services are in separate optional layers with persistent provenance.
 const wet=data.house.fixtures.filter(f=>['lavatory','sink','toilet','tub','shower','washer','dishwasher','waterHeater'].includes(f.kind));
 const wasteMain=[P(1100,480,-.55),P(500,480,-.55),P(220,480,-.55),SP(10,100,-.55)];route('waste','4-inch sanitary collector · schematic',wasteMain,M.waste,4*IN,{id:'sanitary-main',source:'',dimensions_in:[4],notes:''});
 for(const f of wet){const q=PP(f.at),trunk=P(f.at[0],480,-.55);route('waste',f.name+' waste branch',[[q[0],.45,q[2]],[q[0],-.55,q[2]],trunk],M.waste,(f.kind==='toilet'?3:2)*IN,{source:'',fixture_id:f.id});
  if(f.kind!=='toilet')route('water',f.name+' hot water · schematic',[[q[0]-.05,.8,q[2]],[q[0]-.05,2.6,q[2]],[P(470,0)[0],2.6,q[2]]],M.hot,.5*IN,{source:'',fixture_id:f.id});
  route('water',f.name+' cold water · schematic',[[q[0]+.05,.8,q[2]],[q[0]+.05,2.7,q[2]],[P(475,0)[0],2.7,q[2]]],M.water,.75*IN,{source:'',fixture_id:f.id});
 }
 for(let u of [230,410,835,1040,1260])route('waste','Plumbing vent riser · schematic',[P(u,450,-.5),P(u,450,4.5)],M.waste,2*IN,{source:'',confidence:'schematic'});
 const panels=[{id:'panel-A',u:0,v:370,name:'Panel A · 400 A service',rating:'400 A'},{id:'panel-B',u:1275,v:550,name:'Panel B · approximate service',rating:'Approximate'}];
 for(const pa of panels){const q=P(pa.u,pa.v,1.45);box('electrical',pa.name,q,[.13,.6,.42],M.metal,{id:pa.id,source:'',confidence:pa.id==='panel-B'?'conflict':'dimensioned',rating:pa.rating,notes:''});label(pa.name,q,pa.id);}
 for(const device of data.electrical_devices){const g=new T.Group();g.position.set(...PP(device.at,device.height_in*IN));const lamp=mat('lamp','#eee2bf',{emissive:'#f5ce89',emissiveIntensity:.3});
  function part(size,at,material){const o=new T.Mesh(new T.BoxGeometry(...size),material);o.position.set(...at);g.add(o);return o;}
  if(device.kind==='fan'){const hub=new T.Mesh(new T.CylinderGeometry(.1,.1,.12,16),M.metal);g.add(hub);for(let i=0;i<4;i++){const blade=part([.62,.025,.10],[0,-.03,0],M.woodDark);blade.rotation.y=i*Math.PI/2;blade.position.set(Math.cos(i*Math.PI/2)*.3,-.03,Math.sin(i*Math.PI/2)*.3);}}
  else if(['recessed','pendant','smoke-CO','exhaust'].includes(device.kind)){const r=device.kind==='exhaust'?.12:device.kind==='smoke-CO'?.065:.08;const disk=new T.Mesh(new T.CylinderGeometry(r,r,.035,16),device.kind==='smoke-CO'?M.fixture:lamp);g.add(disk);}
  else if(device.kind==='linear-light')part([1.2,.06,.22],[0,0,0],lamp);
  else{part([.08,.13,.028],[0,0,0],device.kind==='disconnect'?M.metal:M.fixture);part([.012,.02,.032],[-.017,.025,0],M.metal);part([.012,.02,.032],[.017,.025,0],M.metal);}
  register(g,'electrical',device.kind.replaceAll('-',' ')+' fixture',{...device,dimensions_in:null});
 }
 for(const pa of panels){const dest=pa.id==='panel-A'?P(450,480,2.95):P(1180,600,2.95);line('electrical',pa.name+' distribution path',[P(pa.u,pa.v,2.95),dest],'#c89a40',{source:'',confidence:'schematic',notes:''},true);}
 for(const r of data.house.rooms.filter(r=>!r.name.includes('closet')&&!r.name.includes('Garage')&&!r.name.includes('mechanical'))){const unit=r.center[0]<700?P(200,58,2.8):P(1285,575,2.8),dest=PP(r.center,2.8);route('hvac',r.name+' duct branch · schematic',[unit,[dest[0],unit[1],unit[2]],dest],M.duct,.23,{source:'',confidence:'schematic',notes:''});box('hvac',r.name+' supply diffuser',dest,[.35,.04,.25],M.fixture,{source:'',confidence:'schematic'});}


 // Barn geometry uses local placement only.
 const theta=T.MathUtils.degToRad(1+18/60+20/3600),C=Math.cos(theta),S=Math.sin(theta),NAD=(e,n)=>[e*C+n*S,-e*S+n*C],northeast=[208.241483858,204.703896459];
 const barnAngle=T.MathUtils.degToRad(3+8/3600)-theta,bE=new T.Vector2(Math.cos(barnAngle),-Math.sin(barnAngle)),bS=new T.Vector2(Math.sin(barnAngle),Math.cos(barnAngle)),angN=T.MathUtils.degToRad(3+8/3600),normalN=[-Math.sin(angN),Math.cos(angN)],eastAng=T.MathUtils.degToRad(21/60+14/3600),normalW=[-Math.cos(eastAng),Math.sin(eastAng)],dn=northeast[0]*normalN[0]+northeast[1]*normalN[1]-15,dw=northeast[0]*normalW[0]+northeast[1]*normalW[1]+10+4/12,det=normalN[0]*normalW[1]-normalN[1]*normalW[0],neNAD=[(dn*normalW[1]-normalN[1]*dw)/det,(normalN[0]*dw-dn*normalW[0])/det],neLocal=NAD(...neNAD),ne=[neLocal[0]*FT,-neLocal[1]*FT],barnPoint=(l,w,y=0)=>[ne[0]+bE.x*(l-60)*FT+bS.x*w*FT,y,ne[1]+bE.y*(l-60)*FT+bS.y*w*FT],barnPlan=[barnPoint(0,0),barnPoint(60,0),barnPoint(60,40),barnPoint(0,40)].map(v=>[v[0],v[2]]);
 slab('barn','Barn slab',barnPlan,0,5*IN,M.concrete,{id:'barn-slab',confidence:'dimensioned'});
 function steelI(name,a,b){const A=new T.Vector3(...a),B=new T.Vector3(...b),length=A.distanceTo(B),g=new T.Group();g.position.copy(A).add(B).multiplyScalar(.5);g.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),B.sub(A).normalize());for(const [w,h,y]of[[6,.25,4.875],[6,.25,-4.875],[.2,9.5,0]]){const q=new T.Mesh(new T.BoxGeometry(w*IN,h*IN,length),M.steel);q.position.y=y*IN;g.add(q)}register(g,'barn',name,{confidence:'derived',barnStructure:true});}
 for(const x of[0,20,40,60]){steelI('Barn frame '+(x/20+1)+' north column',barnPoint(x,0,0),barnPoint(x,0,18*FT));steelI('Barn frame '+(x/20+1)+' south column',barnPoint(x,40,0),barnPoint(x,40,18*FT));steelI('Barn frame '+(x/20+1)+' north rafter',barnPoint(x,0,18*FT),barnPoint(x,20,(19+8/12)*FT));steelI('Barn frame '+(x/20+1)+' south rafter',barnPoint(x,20,(19+8/12)*FT),barnPoint(x,40,18*FT));}
 for(let z=0;z<=40;z+=5)beam('barn','Barn roof purlin',barnPoint(0,z,(18+Math.min(z,40-z)/12)*FT-4*IN),barnPoint(60,z,(18+Math.min(z,40-z)/12)*FT-4*IN),2.5*IN,8*IN,M.steel,{confidence:'derived',barnStructure:true});
 for(const elevation of [44,88,120,156,192])for(const side of [.11,39.89])beam('barn','Barn wall girt',barnPoint(0,side,elevation*IN),barnPoint(60,side,elevation*IN),2.5*IN,8*IN,M.steel,{confidence:'dimensioned',barnStructure:true});
 for(const side of [0,40])for(const [a,b] of [[[20,0],[40,18]],[[40,0],[20,18]]])cylinder('barn','Barn cable bracing',barnPoint(a[0],side,a[1]*FT),barnPoint(b[0],side,b[1]*FT),.125*IN,M.metal,{confidence:'derived',barnStructure:true});
 root.updateMatrixWorld(true);
 // Geometry and confidence values remain intact in the public construction study.
 const registry=Object.fromEntries(objects.map(o=>[o.userData.id,o]));
 return {root,layers,objects,registry,labels,roomTargets,circuits,roofParts,trussParts,trussGallery,trussProfile,barnTarget:barnPoint(30,20,3),batches:[],materials:M,P,SP,BP,helpers:{box,beam,line,route,register},metadata:{wallSegments:data.house.walls.length,rooms:data.house.rooms.length,houseOpenings:data.house.openings.length,fixtureGroups:data.house.fixtures.length,electricalSymbols:data.electrical_devices.length,trussVectorContours:data.truss_vectors.reduce((n,t)=>n+t.members.length,0)}};
}
