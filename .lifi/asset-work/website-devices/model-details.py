import bpy,json,sys
from pathlib import Path
from mathutils import Vector
p=Path(__file__).resolve().parent
kind=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.open_mainfile(filepath=str(p/(kind+'.blend')))
def branch(o,depth=0):
 if depth>3:return
 print('  '*depth,o.name,o.type,len(o.children_recursive), tuple(round(x,4) for x in o.rotation_euler))
 for c in o.children:branch(c,depth+1)
for o in bpy.context.scene.objects:
 if o.parent is None:branch(o)
print('frames',bpy.context.scene.frame_start,bpy.context.scene.frame_end,'actions',[(a.name,a.frame_range[:]) for a in bpy.data.actions])
for o in bpy.context.scene.objects:
 if o.type!='MESH':continue
 pts=[o.matrix_world@Vector(c) for c in o.bound_box]
 dims=[max(v[i] for v in pts)-min(v[i] for v in pts) for i in range(3)]
 if sum(v>.045 for v in dims)<2:continue
 print('SURFACE',o.name,'dimensions',dims,'center',tuple(round(x,4) for x in sum(pts,Vector())/8),'verts',len(o.data.vertices))
 for m in o.data.materials:
  if not m or not m.use_nodes:continue
  print(' MAT',m.name,'images',[(n.name,n.image.name,tuple(n.image.size)) for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image],'emission',[(i.name,str(i.default_value)) for n in m.node_tree.nodes if n.type in ['BSDF_PRINCIPLED','EMISSION'] for i in n.inputs if i.name.startswith('Emission')])
