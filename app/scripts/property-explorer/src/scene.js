import * as THREE from 'three';
import {demoPlan,demoRooms,demoRoutes} from './demo-data.js';

const M={
  grass:new THREE.MeshStandardMaterial({color:'#6f8e57',roughness:1}),
  concrete:new THREE.MeshStandardMaterial({color:'#bdb6aa',roughness:.86}),
  cream:new THREE.MeshStandardMaterial({color:'#e8dfca',roughness:.78}),
  trim:new THREE.MeshStandardMaterial({color:'#faf6eb',roughness:.62}),
  roof:new THREE.MeshStandardMaterial({color:'#29373a',roughness:.85}),
  glass:new THREE.MeshStandardMaterial({color:'#7c9ead',roughness:.24,metalness:.12,transparent:true,opacity:.77}),
  wood:new THREE.MeshStandardMaterial({color:'#a47a50',roughness:.82}),
  darkWood:new THREE.MeshStandardMaterial({color:'#443b31',roughness:.9}),
  stud:new THREE.MeshStandardMaterial({color:'#cfa46d',roughness:.86}),
  mutedStud:new THREE.MeshStandardMaterial({color:'#ad9579',roughness:.9,transparent:true,opacity:.3}),
  orange:new THREE.MeshStandardMaterial({color:'#d7773d',roughness:.5,emissive:'#391006',emissiveIntensity:.16}),
  blue:new THREE.MeshStandardMaterial({color:'#398ec6',roughness:.48,emissive:'#05243b',emissiveIntensity:.12}),
  yellow:new THREE.MeshStandardMaterial({color:'#ddb137',roughness:.5,emissive:'#372400',emissiveIntensity:.12}),
  teal:new THREE.MeshStandardMaterial({color:'#5895a0',roughness:.42,emissive:'#082a2c',emissiveIntensity:.1}),
  septic:new THREE.MeshStandardMaterial({color:'#897357',roughness:.88,transparent:true,opacity:.76}),
  leaf:new THREE.MeshStandardMaterial({color:'#496b3e',roughness:1}),
  rock:new THREE.MeshStandardMaterial({color:'#827b69',roughness:1}),
  metal:new THREE.MeshStandardMaterial({color:'#657177',roughness:.55,metalness:.55}),
  white:new THREE.MeshStandardMaterial({color:'#f5f0e5',roughness:.8})
};
const ft=value=>value*.3048;
const inch=value=>value*.0254;
const feetText=metres=>{const total=Math.round(metres/0.0254),feet=Math.floor(total/12),inches=total%12;return `${feet}′ ${inches}″`;};
const routeLength=points=>points.slice(1).reduce((sum,point,index)=>sum+new THREE.Vector3(...point).distanceTo(new THREE.Vector3(...points[index])),0);

function group(name){const g=new THREE.Group();g.name=name;return g;}
function mesh(geometry,material,name=''){const o=new THREE.Mesh(geometry,material);o.name=name;o.castShadow=true;o.receiveShadow=true;return o;}
function box(parent,size,position,material,name=''){const o=mesh(new THREE.BoxGeometry(...size),material,name);o.position.set(...position);parent.add(o);return o;}
function cylinderBetween(parent,a,b,r,material,name=''){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),mid=start.clone().add(end).multiplyScalar(.5),length=start.distanceTo(end);const o=mesh(new THREE.CylinderGeometry(r,r,length,10),material,name);o.position.copy(mid);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.clone().sub(start).normalize());parent.add(o);return o;}
function markItem(item){item.object.traverse(o=>{o.userData.itemId=item.id;o.userData.selectable=true;});return item;}
function addWindow(parent,x,z,width=1.55,height=1.55,side='front'){
 const w=group('Window');const isFront=side==='front'||side==='back';
 const glass=mesh(new THREE.PlaneGeometry(width-.18,height-.18),M.glass,'Glazing');
 if(isFront){const outside=side==='front'?-1:1;glass.position.set(x,2.1,z+outside*.09);glass.rotation.y=side==='front'?Math.PI:0;for(const y of [2.1-height/2,2.1+height/2])box(w,[width,.12,.16],[x,y,z+outside*.1],M.trim,'Window frame');for(const xx of [x-width/2,x+width/2])box(w,[.12,height,.16],[xx,2.1,z+outside*.1],M.trim,'Window frame');box(w,[.08,height-.12,.16],[x,2.1,z+outside*.11],M.trim,'Mullion');box(w,[width-.12,.08,.16],[x,2.1,z+outside*.11],M.trim,'Rail');}
 else {const outside=x<0?-1:1;glass.rotation.y=outside<0?-Math.PI/2:Math.PI/2;glass.position.set(x+outside*.09,2.1,z);for(const y of [2.1-height/2,2.1+height/2])box(w,[.16,.12,width],[x+outside*.1,y,z],M.trim,'Window frame');for(const zz of [z-width/2,z+width/2])box(w,[.16,height,.12],[x+outside*.1,2.1,zz],M.trim,'Window frame');box(w,[.16,height-.12,.08],[x+outside*.11,2.1,z],M.trim,'Mullion');box(w,[.16,.08,width-.12],[x+outside*.11,2.1,z],M.trim,'Rail');}
 w.add(glass);parent.add(w);return w;
}
function addTree(parent,x,z,scale=1){const t=group('Planting tree');box(t,[.34*scale,2.5*scale,.34*scale],[x,1.25*scale,z],M.darkWood,'Tree trunk');for(const [dx,dy,dz,s] of [[0,3.2,0,1.25],[-.55,2.85,.15,.85],[.58,2.9,-.18,.9]]){const crown=mesh(new THREE.IcosahedronGeometry(s*scale,2),M.leaf,'Tree canopy');crown.position.set(x+dx*scale,dy*scale,z+dz*scale);t.add(crown);}parent.add(t);}
function addRock(parent,x,z,s=.45){const r=mesh(new THREE.DodecahedronGeometry(s,1),M.rock,'Landscape rock');r.position.set(x,s*.42,z);r.scale.set(1.3,.6,.85);r.rotation.set(.2,x*.2,z*.15);parent.add(r);}
function addTruss(parent,x){const t=group('24 inch roof truss');const y=3.55,half=4.2,rise=2.15;box(t,[.13,.16,8.4],[x,y,0],M.stud,'Truss bottom chord');for(const side of [-1,1]){const chord=box(t,[.13,.16,Math.hypot(half,rise)],[x,y+rise/2,side*half/2],M.stud,'Truss top chord');chord.rotation.x=side*Math.atan2(rise,half);}
 for(const z of [-2.1,0,2.1])cylinderBetween(t,[x,y,z],[x,y+rise,0],.055,M.stud,'Truss web');parent.add(t);return t;}

export function createSceneModel(){
 const root=group('Fictional barnhouse showcase');
 const layers={site:group('Site and landscape'),skin:group('Finished exterior'),roof:group('Roof assembly'),structure:group('Frame and trusses'),services:group('Schematic services'),fixtures:group('Interior fixtures')};
 Object.values(layers).forEach(layer=>root.add(layer));
 const items=[]; const rooms=demoRooms.map(room=>({...room,position:[room.x+room.width/2,0,room.z+room.depth/2]}));

 // Site: a deliberately abstract, self-contained property setting.
 const lawn=mesh(new THREE.PlaneGeometry(42,30),M.grass,'Grass court');lawn.rotation.x=-Math.PI/2;lawn.receiveShadow=true;layers.site.add(lawn);
 const drive=mesh(new THREE.BoxGeometry(26,.09,4.8),M.concrete,'Concrete drive');drive.position.set(-10,.035,-8.2);drive.rotation.y=-.05;layers.site.add(drive);
 const terrace=mesh(new THREE.BoxGeometry(9,.12,3.2),M.concrete,'Terrace');terrace.position.set(-1,.06,6.05);layers.site.add(terrace);
 const rockPositions=[[-8,-6],[-6.8,-6.2],[-4.9,-6.1],[4.4,-5.8],[6.1,-5.65],[8.8,5.8],[6.7,5.7],[-7,6.2],[-5.3,6.15]];rockPositions.forEach(([x,z],i)=>addRock(layers.site,x,z,.28+(i%3)*.08));
 addTree(layers.site,-14,7,1.2);addTree(layers.site,-13,-2,.9);addTree(layers.site,13,7,1.05);addTree(layers.site,14,-5,.85);
 // Connected gate: a complete, fictional driveway threshold.
 const gate=group('Driveway gate');gate.position.set(-18,0,-8.5);gate.rotation.y=Math.PI/2;const leafA=group('Gate leaf A'),leafB=group('Gate leaf B');
 box(gate,[.38,2.1,.38],[-2,1.05,0],M.darkWood,'Gate post');box(gate,[.38,2.1,.38],[2,1.05,0],M.darkWood,'Gate post');
 for(const [leaf,side] of [[leafA,1],[leafB,-1]]){for(const y of [.5,1.1,1.7])box(leaf,[2,.1,.12],[side,y,0],M.darkWood,'Gate rail');const brace=box(leaf,[2.32,.1,.1],[side,1.1,0],M.darkWood,'Gate brace');brace.rotation.z=side*.55;leaf.position.x=-side*2;gate.add(leaf);}
 layers.site.add(gate);
 // 18 m × 9 m barnhouse shell.
 box(layers.skin,[18,3.45,9],[0,1.725,0],M.cream,'Cream barnhouse envelope');
 const frontDoor=box(layers.skin,[1.35,2.35,.22],[-6.45,1.175,-4.57],M.darkWood,'Front door');box(layers.skin,[1.65,.22,.28],[-6.45,2.42,-4.64],M.trim,'Door head trim');
 for(const z of [-4.63,4.63])box(layers.skin,[18.3,.18,.18],[0,.17,z],M.trim,'Foundation edge trim');for(const x of [-9.14,9.14])box(layers.skin,[.18,.18,9.3],[x,.17,0],M.trim,'Foundation edge trim');
 [-3.7,-.7,2.3,5.3].forEach(x=>addWindow(layers.skin,x,-4.57,1.65,1.55,'front'));
 [-4.5,.3,4.5].forEach(x=>addWindow(layers.skin,x,4.57,1.55,1.5,'back'));
 [-2.2,1.6].forEach(z=>addWindow(layers.skin,-9.07,z,1.45,1.45,'side'));
 [1.2].forEach(z=>addWindow(layers.skin,9.07,z,1.7,1.55,'side'));
 // Gable ends cover the pitch cleanly above the rectangular envelope.
 for(const x of [-9.02,9.02]){const gable=new THREE.BufferGeometry();gable.setAttribute('position',new THREE.Float32BufferAttribute([x,3.43,-4.5,x,3.43,4.5,x,5.7,0],3));gable.setIndex([0,1,2]);gable.computeVertexNormals();const infill=mesh(gable,M.cream,'Gable infill');infill.material.side=THREE.DoubleSide;layers.skin.add(infill);}
 const roofRun=Math.hypot(4.9,2.3),roofPitch=Math.atan2(2.3,4.9);for(const side of [-1,1]){const r=box(layers.roof,[19,.18,roofRun],[0,4.56,side*2.38],M.roof,'Dark pitched roof');r.rotation.x=side*roofPitch;for(let z=.38;z<4.72;z+=.58){const seam=box(layers.roof,[19.15,.035,.06],[0,5.74-z*(2.3/4.9),side*z],M.metal,'Standing roof seam');seam.rotation.x=side*roofPitch;}}
 // Pergola and terrace details.
 const pergola=group('Terrace pergola');for(const x of [-4.2,4.2])for(const z of [5.4,8.2])box(pergola,[.18,2.7,.18],[x,1.35,z],M.wood,'Pergola post');for(const z of [5.4,8.2])box(pergola,[8.7,.18,.18],[0,2.65,z],M.wood,'Pergola beam');for(let x=-3.6;x<=3.6;x+=.8)box(pergola,[.12,.1,3.15],[x,2.72,6.8],M.wood,'Pergola cross slat');layers.skin.add(pergola);
 const frontWalk=mesh(new THREE.BoxGeometry(1.3,.1,4.15),M.concrete,'Front entry walk');frontWalk.position.set(-6.45,.05,-6.55);layers.site.add(frontWalk);const workshopPath=mesh(new THREE.BoxGeometry(4.4,.1,1.15),M.concrete,'Workshop path');workshopPath.position.set(10.1,.05,1.0);layers.site.add(workshopPath);
 const shrubBeds=[[-7.8,-4.95],[-5.2,-4.95],[-2.4,-4.95],[1,-4.95],[4.5,-4.95],[7.6,-4.95],[-7.8,4.95],[-4.6,4.95],[3.6,4.95],[7.1,4.95]];for(const [x,z] of shrubBeds){const bed=mesh(new THREE.CircleGeometry(.72,14),M.rock,'Rock planting bed');bed.rotation.x=-Math.PI/2;bed.position.set(x,.025,z);layers.site.add(bed);const shrub=mesh(new THREE.IcosahedronGeometry(.42,1),M.leaf,'Low shrub');shrub.position.set(x,.42,z);shrub.scale.set(1.15,.8,1);layers.site.add(shrub);}
 // Small detached workshop.
 const workshop=group('Detached workshop');box(workshop,[6.4,2.8,5.2],[12,1.4,4],M.cream,'Workshop shell');for(const side of [-1,1]){const r=box(workshop,[6.9,.16,3],[12,3.6,4+side*1.22],M.roof,'Workshop roof');r.rotation.x=side*.48;}box(workshop,[2.4,2.2,.18],[12,1.1,1.35],M.darkWood,'Workshop door');layers.skin.add(workshop);
 // Outdoor equipment remains part of the finished property, not technical finder layers.
 for(const [x,z] of [[7.4,4.9],[8.7,4.9]]){const ac=group('Outdoor condenser');box(ac,[1.05,.72,.5],[x,.36,z],M.metal,'AC cabinet');const fan=mesh(new THREE.CylinderGeometry(.23,.23,.08,18),M.darkWood,'AC fan');fan.rotation.x=Math.PI/2;fan.position.set(x,.76,z);ac.add(fan);layers.skin.add(ac);}
 // Structural grid: 16 inch stud cadence and 24 inch truss cadence.
 const foundation=group('Foundation and slab');layers.structure.add(foundation);box(foundation,[18.5,.34,9.5],[0,-.17,0],M.concrete,'Foundation slab');box(foundation,[17.7,.08,8.7],[0,.04,0],M.concrete,'Interior concrete floor');foundation.traverse(o=>{o.userData.keepMaterial=true;});
 const studGroup=group('Wall stud families'),trussGroup=group('Roof truss families');layers.structure.add(studGroup,trussGroup);
 const studSpacing=inch(16);for(let x=-8.5;x<=8.5+.01;x+=studSpacing){box(studGroup,[.09,3.35,.14],[x,1.675,-4.28],M.stud,'16 inch wall stud');box(studGroup,[.09,3.35,.14],[x,1.675,4.28],M.stud,'16 inch wall stud');}
 for(let z=-4.0;z<=4.0+.01;z+=studSpacing){box(studGroup,[.14,3.35,.09],[-8.78,1.675,z],M.stud,'16 inch wall stud');box(studGroup,[.14,3.35,.09],[8.78,1.675,z],M.stud,'16 inch wall stud');}
 for(const partition of [{x:-.1,z:-1.3,w:.12,d:5.9},{x:5.55,z:-2.6,w:2.7,d:.12},{x:5.55,z:.0,w:2.7,d:.12}]){const horizontal=partition.w>partition.d;const span=horizontal?partition.w:partition.d;for(let p=-span/2;p<=span/2+.01;p+=studSpacing){const pos=horizontal?[partition.x+p,1.675,partition.z]:[partition.x,1.675,partition.z+p];box(studGroup,horizontal?[.09,3.35,.14]:[.14,3.35,.09],pos,M.stud,'Interior wall stud');}}
 for(let x=-8.2;x<=8.2+.01;x+=inch(24))addTruss(trussGroup,x);
 // Interior fixtures.
 const toilet=group('Bath toilet');box(toilet,[.68,.42,.8],[6.8,.42,-.15],M.white,'Toilet bowl');box(toilet,[.58,.72,.25],[6.8,.75,.2],M.white,'Toilet tank');layers.fixtures.add(toilet);
 box(layers.fixtures,[3.4,.9,.7],[2.7,.45,-3.55],M.white,'Kitchen counter');const outletFixture=group('Kitchen outlet fixture');layers.fixtures.add(outletFixture);box(outletFixture,[.24,.32,.06],[2.2,1.05,-4.07],M.white,'Kitchen outlet');
 // Service routes and conceptual tank.
 const serviceMap={};for(const route of demoRoutes){const service=group(route.title);const mat=route.id==='toilet-drain'?M.orange:route.id==='kitchen-outlet'?M.yellow:route.id==='hvac-supply'?M.teal:M.septic;for(let i=1;i<route.points.length;i++)cylinderBetween(service,route.points[i-1],route.points[i],route.id==='kitchen-outlet'?.045:.11,mat,route.title);layers.services.add(service);serviceMap[route.id]=service;}
 const tank=box(layers.services,[3.1,.95,1.6],[12.1,-.1,-2.8],M.septic,'Concept septic tank');
 const kitchenAssembly=group('Kitchen outlet and cable');layers.fixtures.remove(outletFixture);layers.services.remove(serviceMap['kitchen-outlet']);kitchenAssembly.add(outletFixture,serviceMap['kitchen-outlet']);layers.services.add(kitchenAssembly);serviceMap['kitchen-outlet']=kitchenAssembly;
 const septicAssembly=group('Concept tank and connection');layers.services.remove(tank);layers.services.remove(serviceMap['septic-tank']);septicAssembly.add(tank,serviceMap['septic-tank']);layers.services.add(septicAssembly);serviceMap['septic-tank']=septicAssembly;
 // Finder catalog. Positions are exact fictional scene metres and child meshes inherit selectable item ids.
 const add=(id,title,category,room,description,dimensions,position,object,dimensionText)=>{const item=markItem({id,title,category,room,description,dimensions,dimensionText,position,object});items.push(item);return item;};
 add('toilet-drain','Toilet drain','plumbing','Bath','Illustrative waste route from the fictional bath fixture.',[2.2,1.6,9.8],[6.8,.45,-.25],serviceMap['toilet-drain'],`${feetText(routeLength(demoRoutes.find(route=>route.id==='toilet-drain').points))} illustrative run`);
 add('kitchen-outlet','Kitchen outlet','electrical','Kitchen','Illustrative outlet and concealed cable route.',[.79,1.05,.2],[2.2,1.05,-4.0],kitchenAssembly,'9″ × 13″ plate');serviceMap['kitchen-outlet'].traverse(o=>{o.userData.itemId='kitchen-outlet';o.userData.selectable=true;});
 add('wall-studs','Wall studs','structure','Living room','Fictional 16 inch on-center exterior stud layout.',['16 in on center'],[-3,1.67,-4.28],studGroup,'16″ on center');
 add('roof-truss','Roof truss','structure','Roof frame','Fictional 24 inch on-center roof truss assembly.',['24 in on center'],[0,4.2,0],trussGroup,'24″ on center');
 add('hvac-supply','HVAC supply','hvac','Living room','Illustrative supply route for the showcase finder.',[18,10,12],[-2.3,2.7,-.8],serviceMap['hvac-supply'],`${feetText(routeLength(demoRoutes.find(route=>route.id==='hvac-supply').points))} conceptual run`);
 add('septic-tank','Concept septic tank','septic','Site','Illustrative underground marker with no survey or installation claim.',[10.2,3.1,5.25],[12.1,-.1,-2.8],septicAssembly,'10′ 2″ × 3′ 1″ × 5′ 3″');serviceMap['septic-tank'].traverse(o=>{o.userData.itemId='septic-tank';o.userData.selectable=true;});tank.traverse(o=>{o.userData.itemId='septic-tank';o.userData.selectable=true;});

 let mode='property',section=1,night=false;
 const sectionTargets=[];root.traverse(o=>{if(o.isMesh&&o.position.z!==undefined)sectionTargets.push(o);});
 const isSiteObject=object=>{for(let node=object;node;node=node.parent)if(node===layers.site)return true;return false;};
 function setMode(next){mode=next;items.forEach(item=>{item.object.visible=true;});const property=next==='property',inside=next==='inside';layers.site.visible=true;layers.skin.visible=property;layers.roof.visible=property;layers.structure.visible=!property;layers.services.visible=!property;layers.fixtures.visible=!property;layers.structure.traverse(o=>{if(o.isMesh&&!o.userData.keepMaterial)o.material=inside?M.stud:M.mutedStud;});layers.services.traverse(o=>{if(o.isMesh)o.visible=true;});if(property){serviceMap['septic-tank'].visible=false;tank.visible=false;}else{tank.visible=true;}root.userData.mode=mode;setSection(section);}
 function setGate(open){leafA.rotation.y=open?.95:0;leafB.rotation.y=open?-.95:0;}
 function setNight(on){night=Boolean(on);M.glass.emissive.set(night?'#d59b55':'#000000');M.glass.emissiveIntensity=night?.7:0;root.userData.night=night;}
 function setSection(value){
  section=THREE.MathUtils.clamp(Number(value)||0,0,1);
  const planes=mode==='property'||section>=.995?[]:[new THREE.Plane(new THREE.Vector3(0,-1,0),section*5.75)];
  for(const material of Object.values(M)){material.clippingPlanes=planes;material.clipShadows=true;material.needsUpdate=true;}
  root.userData.section=section;
 }

 setGate(false);setNight(false);setMode('property');
 root.userData={fictional:true,units:'metres',plan:demoPlan,mode,section,night};
 return {root,layers,items,rooms,setMode,setGate,setNight,setSection};
}
