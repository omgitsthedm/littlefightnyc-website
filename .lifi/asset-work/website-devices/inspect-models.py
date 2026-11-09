import bpy,json,sys
from pathlib import Path
from mathutils import Vector
p=Path(__file__).resolve().parent
kind=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.wm.usd_import(filepath=str(p/(kind+'.usdz')))
result=[]
for o in bpy.context.scene.objects:
    if o.type!='MESH':continue
    points=[o.matrix_world@Vector(c) for c in o.bound_box]
    result.append({'name':o.name,'vertices':len(o.data.vertices),'bounds':[[min(v[i] for v in points),max(v[i] for v in points)] for i in range(3)],'materials':[s.material.name if s.material else '' for s in o.material_slots]})
(p/(kind+'-meshes.json')).write_text(json.dumps(result,indent=2))
bpy.ops.wm.save_as_mainfile(filepath=str(p/(kind+'.blend')))
print(kind,len(result),'objects',json.dumps(result[:3]))
