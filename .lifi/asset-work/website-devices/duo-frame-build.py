import bpy,sys,json,math
from pathlib import Path
from mathutils import Vector,Matrix
from bpy_extras.object_utils import world_to_camera_view
p=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(p/'duo.blend'))
scene=bpy.context.scene
# The official model ships closed. Unfold the outer-display body at its
# physical left hinge; the second housing keeps its original dimensions.
pivot=Vector((-.04135,0,0))
unfold=Matrix.Translation(pivot)@Matrix.Rotation(math.pi,4,'Z')@Matrix.Translation(-pivot)
body=bpy.data.objects['upTUAKvMVkPOMKq']
body.matrix_world=unfold@body.matrix_world
screen=bpy.data.objects['UXtsBZYlaUvHoEh']
inverse=screen.matrix_world.inverted()
for v in screen.data.vertices:
 q=screen.matrix_world@v.co
 if q.y<0:q=unfold@q
 v.co=inverse@q
screen.data.update()
# Invisible Quick Look collision envelope must not affect framing.
bpy.data.objects['lJPfQMFXvvcmdtA'].hide_render=True
bpy.context.view_layer.update()
points=[o.matrix_world@Vector(c) for o in scene.objects if o.type=='MESH' and not o.hide_render for c in o.bound_box]
lo=Vector([min(v[i] for v in points) for i in range(3)]);hi=Vector([max(v[i] for v in points) for i in range(3)])
center=(lo+hi)/2;size=max(hi-lo)
def aim(o):o.rotation_euler=(center-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=center+Vector((.16,-1,.1))*size*4)
cam=bpy.context.object;cam.data.type='ORTHO';cam.data.ortho_scale=size*1.09;aim(cam);scene.camera=cam
for name,offset,power,color,area in [('Key',(-2,-3,3),170,(1,.88,.74),2),('Fill',(3,-2,1),120,(.75,.85,1),2),('Rim',(-2,2,2),150,(1,.72,.48),1)]:
 bpy.ops.object.light_add(type='AREA',location=center+Vector(offset)*size)
 light=bpy.context.object;light.name=name;light.data.energy=power*size*size;light.data.color=color;light.data.shape='DISK';light.data.size=size*area;aim(light)
scene.world=bpy.data.worlds.new('Studio');scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs['Color'].default_value=(.35,.4,.5,1);scene.world.node_tree.nodes['Background'].inputs['Strength'].default_value=.35
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1800;scene.render.resolution_y=1350;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
# The shipping AR asset contains the inner display in its folded position.
# A continuous flat aperture restores that display for the fully open pose,
# retaining the official two housings, edge geometry and physical proportions.
x0,x1,z0,z1=-.12055,.03785,.0032,.1147
radius=.0055;verts=[]
for cx,cz,start in [(x1-radius,z1-radius,0),(x0+radius,z1-radius,90),(x0+radius,z0+radius,180),(x1-radius,z0+radius,270)]:
 for i in range(17):
  a=math.radians(start+i*90/16)
  verts.append((cx+radius*math.cos(a),-.0057,cz+radius*math.sin(a)))
mesh=bpy.data.meshes.new('Continuous unfolded display');mesh.from_pydata(verts,[],[list(range(len(verts)))]);mesh.update()
display=bpy.data.objects.new('Continuous unfolded display',mesh);scene.collection.objects.link(display)
def emission(name,color):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');s=n.new('ShaderNodeEmission');s.inputs[0].default_value=(*color,1);m.node_tree.links.new(s.outputs[0],out.inputs['Surface']);return m
display.data.materials.append(emission('Blank display',(.8,.8,.8)))
scene.render.filepath=str(p/'duo-frame.png')
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath=str(p/'duo-open.blend'))
quad=[]
for q in [(x0,-.0057,z1),(x1,-.0057,z1),(x1,-.0057,z0),(x0,-.0057,z0)]:
 v=world_to_camera_view(scene,cam,Vector(q));quad.append([v.x*1800,(1-v.y)*1350])
(p/'duo-frame.json').write_text(json.dumps({'screenQuadrilateral':quad,'screenAspect':(x1-x0)/(z1-z0),'source':'https://www.apple.com/iphone-duo/','modelSource':'https://www.apple.com/105/media/us/iphone-duo/2026/9305e4b9-72d9-4c05-9381-b572adadd5e5/ar/iPhone_Duo_e-sim_Star-White_Variant.usdz','pose':'Native housings unfolded flat at physical hinge; continuous flat internal aperture.'},indent=2))
black=emission('Mask black',(0,0,0));white=emission('Mask white',(1,1,1))
for o in scene.objects:
 if o.type=='MESH':o.data.materials.clear();o.data.materials.append(white if o==display else black)
scene.view_settings.view_transform='Standard';scene.render.filepath=str(p/'duo-frame-mask.png');scene.cycles.samples=8
bpy.ops.render.render(write_still=True)
