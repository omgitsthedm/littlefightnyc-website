"""An editable, solid taxi miniature with clean rendered alpha.

The generated candidates retained a background aura. This native model uses
actual geometry and studio lighting, matching the site's cast-object system.
"""
import bpy, math
from pathlib import Path
from mathutils import Vector
APP=Path(__file__).resolve().parents[1]
scene=bpy.context.scene
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene.render.engine='CYCLES';scene.cycles.samples=48;scene.cycles.use_denoising=True
scene.render.resolution_x=1200;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=True
scene.view_settings.view_transform='AgX';scene.world.color=(.24,.24,.24)
def mat(name,color,metal=0,rough=.35):
 m=bpy.data.materials.new(name);m.use_nodes=True;s=m.node_tree.nodes.get('Principled BSDF')
 s.inputs['Base Color'].default_value=(*color,1);s.inputs['Metallic'].default_value=metal;s.inputs['Roughness'].default_value=rough
 return m
yellow=mat('Yellow cast resin',(.98,.52,.005),0,.32)
rubber=mat('Soft charcoal rubber',(.018,.021,.025),0,.5)
glass=mat('Opaque frosted window',(.27,.45,.49),.1,.29)
silver=mat('Satin nickel',(.43,.47,.48),.6,.29)
ivory=mat('Warm porcelain light',(.95,.85,.64),0,.25)
red=mat('Rear lamp',(.6,.012,.008),0,.3)
def box(name,loc,size,material,bevel=.05):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(material)
 edge=o.modifiers.new('Soft cast edge','BEVEL');edge.width=bevel;edge.segments=6
 o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return o
def cylinder(name,loc,radius,depth,material):
 bpy.ops.mesh.primitive_cylinder_add(vertices=64,radius=radius,depth=depth,location=loc,rotation=(math.pi/2,0,0))
 o=bpy.context.object;o.name=name;o.data.materials.append(material)
 edge=o.modifiers.new('Rounded rim','BEVEL');edge.width=.055;edge.segments=4
 o.modifiers.new('Weighted normals','WEIGHTED_NORMAL');return o
box('Main cast body',(0,0,.74),(4.3,1.8,.85),yellow,.24)
box('Raised passenger cabin',(-.35,0,1.37),(2.4,1.62,1.08),yellow,.25)
box('Front windshield',(.858,0,1.48),(.025,1.30,.56),glass,.08)
box('Rear windshield',(-1.563,0,1.48),(.025,1.28,.54),glass,.07)
for side in (-1,1):
 for x in (-.89,.20):
  box('Side window',(x,side*.819,1.49),(.93,.028,.55),glass,.07)
  box('Door handle',(x-.28,side*.838,1.10),(.23,.035,.045),silver,.02)
 for x in (-1.32,1.31):
  cylinder('Rubber tire',(x,side*.94,.48),.46,.27,rubber)
  cylinder('Metal hub',(x,side*1.09,.48),.26,.034,silver)
  cylinder('Hub center',(x,side*1.115,.48),.095,.044,ivory)
 for i in range(16):
  for row in range(2):
   if (i+row)%2==0:box('Checker enamel',(-1.22+i*.16,side*.906,.78+row*.14),(.15,.017,.13),rubber,.004)
box('Front bumper',(2.16,0,.47),(.21,1.83,.17),silver,.07)
box('Rear bumper',(-2.16,0,.47),(.21,1.83,.17),silver,.07)
box('Front grille',(2.154,0,.79),(.03,.62,.27),rubber,.03)
for z in (.70,.79,.88):box('Grille slat',(2.177,0,z),(.025,.55,.023),silver,.012)
for y in (-.62,.62):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=16,radius=.15,location=(2.12,y,.85));o=bpy.context.object;o.name='Round headlamp';o.scale.x=.45;o.data.materials.append(ivory)
 box('Rear lamp',(-2.14,y,.82),(.035,.22,.16),red,.045)
box('Roof light foot',(-.2,0,1.92),(.8,.40,.09),rubber,.035)
box('Unlettered roof light',(-.2,0,2.03),(.68,.29,.22),ivory,.06)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(6,-9,5.1));camera=bpy.context.object;camera.data.type='ORTHO';camera.data.ortho_scale=5.8;aim(camera,(0,0,1));scene.camera=camera
for loc,power,size in [((-4,-6,7),750,5),((5,-2,5),380,4),((1,4,6),650,3)]:
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.data.energy=power;o.data.shape='DISK';o.data.size=size;aim(o,(0,0,1))
scene.render.filepath=str(APP.parent/'.lifi/design-source/sculpture/yellow-taxi.png')
bpy.ops.render.render(write_still=True)
