// Task-oriented lookup. Adjacency is a spatial aid, never a circuit assignment.
export function createServiceIndex(model,data){
 const categories=[{id:'all',label:'Everything'},{id:'plumbing',label:'Plumbing'},{id:'electrical',label:'Outlets & electrical'},{id:'structure',label:'Studs & trusses'},{id:'drainage',label:'Drainage & septic'},{id:'hvac',label:'Heating & cooling'}];
 const rooms=[...data.house.rooms.map(({id,name})=>({id,name})),{id:'outside',name:'Outside'},{id:'barn',name:'Barn'}];
 const roomMap=Object.fromEntries(rooms.map(r=>[r.id,r]));
 const objects=model.objects,entries=[],byId=new Map(),seen=new Set();
 const area=poly=>Math.abs(poly.reduce((n,p,i)=>{const q=poly[(i+1)%poly.length];return n+p[0]*q[1]-q[0]*p[1];},0))/2;
 const inside=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>p[1])!==(b[1]>p[1]))&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
 const edgeDistance=(p,poly)=>Math.min(...poly.map((a,i)=>{const b=poly[(i+1)%poly.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}));
 function roomAt(at){if(!at)return 'outside';const candidates=data.house.rooms.map(r=>({r,d:edgeDistance(at,r.polygon),inside:inside(at,r.polygon),area:area(r.polygon)}));const contained=candidates.filter(c=>c.inside).sort((a,b)=>a.area-b.area);if(contained.length)return contained[0].r.id;const nearest=candidates.sort((a,b)=>a.d-b.d||a.area-b.area)[0];return nearest?.d<=18?nearest.r.id:'outside';}
 const fromWorld=o=>{const p=data.local_placement;return[(o.position.z/.3048+p.north_ft)*12,849-(o.position.x/.3048-p.east_ft)*12];};
 function add({id,name,category,roomId='outside',relatedIds=[],keywords='',roomIds,...rest}){
  if(!model.registry[id]||seen.has(id))return;
  seen.add(id);const e={id,name,category,categoryLabel:categories.find(c=>c.id===category)?.label,roomId,roomName:roomMap[roomId]?.name||'Outside',roomIds:roomIds||[roomId],relatedIds:[...new Set([id,...relatedIds].filter(k=>model.registry[k]))],keywords,...rest};
  e.searchText=normalize([e.name,e.category,e.roomName,e.keywords,...e.roomIds.map(r=>roomMap[r]?.name||'')].join(' '));entries.push(e);byId.set(id,e);return e;
 }
 const wet=new Set(['lavatory','sink','toilet','tub','shower','washer','dishwasher','waterHeater']);
 for(const f of data.house.fixtures){
  if(wet.has(f.kind)){const pipes=objects.filter(o=>o.userData.fixture_id===f.id),waste=pipes.find(o=>o.userData.layer==='waste');add({id:waste?.userData.id||f.id,fixtureId:f.id,name:f.name.replace(/\bWC\b/g,'toilet')+' · waste & water',category:'plumbing',roomId:roomAt(f.at),relatedIds:[f.id,...pipes.map(o=>o.userData.id)],keywords:`${f.kind} drain line pipe hot cold supply waste water plumbing ${f.kind==='lavatory'?'sink basin':''}`});}
  else if(['heatPump','airHandler'].includes(f.kind))add({id:f.id,name:f.name,category:'hvac',roomId:f.kind==='heatPump'?'outside':roomAt(f.at),keywords:'AC air conditioning condenser unit heating cooling HVAC'});
 }
 const kinds={receptacle:'Outlet',GFCI:'GFCI outlet',switch:'Light switch',recessed:'Recessed light',pendant:'Pendant light',fan:'Ceiling fan',exhaust:'Exhaust fan','linear-light':'Linear light','smoke-CO':'Smoke / CO detector',disconnect:'Equipment disconnect'};
 const counts={};
 for(const d of data.electrical_devices){const roomId=roomAt(d.at),key=roomId+':'+d.kind,num=counts[key]=(counts[key]||0)+1;add({id:d.id,name:`${kinds[d.kind]||d.kind} ${num}`,category:'electrical',roomId,keywords:`${d.kind} electrical device ${['GFCI','receptacle'].includes(d.kind)?'outlet plug socket receptacle power':''} ${['switch','recessed','pendant','linear-light'].includes(d.kind)?'lighting':''}`});}
 for(const id of ['panel-A','panel-B']){const o=model.registry[id];if(o)add({id,name:o.name,category:'electrical',roomId:roomAt(fromWorld(o)),keywords:'breaker panel circuit power service distribution wire wiring'});}
 for(const w of data.house.walls){const members=objects.filter(o=>o.userData.wall_id===w.id&&o.userData.layer==='walls');if(!members.length)continue;const at=[(w.a[0]+w.b[0])/2,(w.a[1]+w.b[1])/2],roomId=roomAt(at),adjacent=data.house.rooms.filter(r=>edgeDistance(at,r.polygon)<=12).map(r=>r.id);add({id:members[0].userData.id,name:w.name+' · studs & plates',category:'structure',roomId,roomIds:[...new Set([roomId,...adjacent])],relatedIds:members.map(o=>o.userData.id),keywords:'stud framing wall timber wood plate header structure',wallId:w.id});}
 const marks=new Map();for(const o of objects){const d=o.userData;if(d.layer==='trusses'&&d.mark){if(!marks.has(d.mark))marks.set(d.mark,[]);marks.get(d.mark).push(o);}}
 for(const [mark,parts] of marks){const o=parts[0];add({id:o.userData.id,name:`Truss ${mark}`,category:'structure',roomId:roomAt(fromWorld(o)),relatedIds:parts.map(x=>x.userData.id),keywords:'roof truss trusses rafter chord web framing timber structure',trussMark:mark});}
 const barnGroups=new Map();for(const o of objects){const d=o.userData;if(d.layer==='barn'&&!d.barnSkin&&/column|rafter|purlin|girt/.test(d.name)){const key=d.name.replace(/ · (web|flange.*)$/,'').replace(/ (web|flange.*)$/,'');if(!barnGroups.has(key))barnGroups.set(key,[]);barnGroups.get(key).push(o);}}
 for(const [name,parts] of barnGroups)add({id:parts[0].userData.id,name,category:'structure',roomId:'barn',relatedIds:parts.map(o=>o.userData.id),keywords:'barn steel framing beam'});
 for(const o of objects){const d=o.userData;if(seen.has(d.id))continue;
  if((d.layer==='septic'||['sanitary-main','irrigation-channel'].includes(d.id))&&!/location marker|connection unverified/.test(d.name))add({id:d.id,name:d.name.replace(/ · schematic$/,''),category:'drainage',relatedIds:d.id==='sanitary-main'?['septic-tank-1','septic-tank-2']:[],keywords:'drain drainage '+(d.id==='irrigation-channel'?'irrigation runoff':/disposal|drainfield/.test(d.name)?'wastewater sewer septic leach field':'wastewater sewer septic')});
  else if(d.layer==='hvac'&&/duct branch|supply diffuser/.test(d.name)){const room=data.house.rooms.find(r=>d.name.startsWith(r.name+' '));add({id:d.id,name:d.name.replace(/ · schematic$/,''),category:'hvac',roomId:room?.id||'outside',keywords:'AC duct vent air conditioning heating cooling supply HVAC'});}
  else if(d.layer==='waste'&&/vent riser/.test(d.name))add({id:d.id,name:d.name,category:'plumbing',roomId:roomAt(fromWorld(o)),keywords:'vent stack plumbing pipe roof'});
 }
 const aliases={plugs:'outlet',plug:'outlet',sockets:'outlet',socket:'outlet',receptacles:'outlet',receptacle:'outlet',outlets:'outlet',toilets:'toilet',wc:'toilet',lavatory:'sink',lavatories:'sink',studs:'stud',trusses:'truss',trusts:'truss',trust:'truss',drains:'drain',drainage:'drain',draining:'drain',pipes:'pipe',lines:'line',wires:'wire',wiring:'wire',cables:'wire',cable:'wire',switches:'switch',lights:'light',electrical:'electric',electricity:'electric',bathrooms:'bathroom',bath:'bathroom'};
 const stop=new Set(['where','is','are','the','this','that','these','those','a','an','my','our','can','i','we','you','please','find','show','me','it','its','does','do','go','goes','to','from','in','of','for','and','with','which','how','look','at','want']);
 function normalize(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
 function tokens(s){return normalize(s).split(/\s+/).filter(t=>t&&!stop.has(t)).map(t=>aliases[t]||t);}
 // Build canonical tokens after alias definitions; records retain readable keywords.
 for(const e of entries)e.tokens=tokens(e.searchText);
 function search({query='',room='',category='all',limit=60}={}){const q=tokens(query);return entries.filter(e=>(!room||e.roomIds.includes(room))&&(category==='all'||e.category===category)).map(e=>{let score=0;for(const token of q){if(e.tokens.includes(token))score+=8;else if(e.tokens.some(t=>t.startsWith(token)))score+=3;else return null;}if(q.includes('toilet')&&e.fixtureId)score+=5;if(q.includes('outlet')&&/outlet/.test(e.name.toLowerCase()))score+=5;if(/drainage|septic/.test(query.toLowerCase())&&e.category==='drainage')score+=9;return {e,score};}).filter(Boolean).sort((a,b)=>b.score-a.score||a.e.roomName.localeCompare(b.e.roomName)||a.e.name.localeCompare(b.e.name,undefined,{numeric:true})).slice(0,limit).map(x=>x.e);}
 return {rooms,categories,entries,search,get:id=>byId.get(id),related:id=>byId.get(id)?.relatedIds||[id],roomAt};
}
