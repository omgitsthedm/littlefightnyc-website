import bpy,sys,json,math
from pathlib import Path
from mathutils import Vector
p=Path(__file__).resolve().parent
kind=sys.argv[sys.argv.index('--')+1]
bpy.ops.wm.open_mainfile(filepath=str(p/(kind+'.blend')))
scene=bpy.context.scene
points=[o.matrix_world@Vector(c) for o in scene.objects if o.type=='MESH' for c in o.bound_box]
lo=Vector([min(v[i] for v in points) for i in range(3)])
hi=Vector([max(v[i] for v in points) for i in range(3)])
center=(lo+hi)/2
size=max(hi-lo)
def aim(o,target):o.rotation_euler=(target-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=center+Vector((.25,-1,.12))*size*4)
cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=size*1.18;aim(cam,center);scene.camera=cam
for name,offset,power,color,area in [('Key',(-2,-3,3),130,(1,.86,.70),2),('Fill',(3,-2,1),75,(.73,.84,1),2),('Rim',(-2,2,2),110,(1,.69,.42),1)]:
 bpy.ops.object.light_add(type='AREA',location=center+Vector(offset)*size)
 light=bpy.context.object;light.name=name;light.data.energy=power*size*size;light.data.color=color;light.data.shape='DISK';light.data.size=size*area;aim(light,center)
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.35,.4,.5,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.35
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1100;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
scene.render.filepath=str(p/(kind+'-reference-render.png'))
(p/(kind+'-hierarchy.txt')).write_text('\n'.join(f'{o.name}: type={o.type} parent={o.parent.name if o.parent else None} loc={tuple(o.location)}' for o in scene.objects))
bpy.ops.render.render(write_still=True)
