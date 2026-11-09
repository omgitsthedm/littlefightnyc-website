"""Blender offline art: exact logo extrusion and screen-free physical frames.

Run with installed Blender. A separate deterministic compositor places original
captures into the projected screen quadrilateral; no client image is generated.
"""
import bpy, json, math, sys
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view

APP=Path(__file__).resolve().parents[1]
OUT=APP.parent/'.lifi/evidence/visual-overhaul/frames';OUT.mkdir(parents=True,exist_ok=True)
scene=bpy.context.scene
ONLY=set(sys.argv[sys.argv.index('--')+1:]) if '--' in sys.argv else set()
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1200;scene.render.resolution_y=960;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
scene.world.color=(.25,.25,.25)

def material(name,color,metal=0,rough=.4):
    m=bpy.data.materials.new(name);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    return m
graphite=material('Cast graphite resin',(.028,.033,.036),.28,.29)
rim=material('Brushed aluminium edge',(.27,.29,.3),.78,.3)
black=material('Black glass recess',(.001,.002,.003),.1,.24)
orange=material('Orange painted clay',(.98,.095,.008),0,.48)
wood=material('Warm pale ash frame',(.58,.4,.22),0,.44)
colors=[material('Stop',(.85,.075,.025)),material('Wait',(.95,.55,.025)),material('Go',(.07,.42,.07))]

def box(name,loc,size,mat,bevel=.04):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.name=name;o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    o.data.materials.append(mat)
    mod=o.modifiers.new('Machined roundover','BEVEL');mod.width=bevel;mod.segments=5
    o.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
    return o

def aim(o,point):o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(2,-12,6));camera=bpy.context.object;scene.camera=camera;camera.data.type='ORTHO';camera.data.ortho_scale=6.5
aim(camera,(0,0,1.8))
for name,loc,power,size in [('Softbox left',(-4,-6,7),700,5),('Window right',(5,-2,5),450,4),('Edge light',(1,4,6),850,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.shape='DISK';o.data.size=size;aim(o,(0,0,1.8))

def clear_models():
    for o in list(bpy.data.objects):
        if o.type not in ('CAMERA','LIGHT'):bpy.data.objects.remove(o,do_unlink=True)

def render(name,quad=None):
    if ONLY and name not in ONLY:return
    scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True)
    if quad:
        points=[]
        for p in quad:
            v=world_to_camera_view(scene,camera,Vector(p));points.append([v.x*1200,(1-v.y)*960])
        (OUT/(name+'.json')).write_text(json.dumps({'quad':points,'size':[1200,960]},indent=2))

for kind in ['browser','phone','photo','tablet']:
    clear_models()
    if kind in ('phone','tablet'):
        w,h=(1.8,3.7) if kind=='phone' else (2.8,4.0);z=h/2;camera.location=(3,-12,5.1);aim(camera,(0,0,1.9));camera.data.ortho_scale=5.4
        box('Phone body',(0,0,z),(w,.24,h),graphite,.16)
        box('Silver edge',(0,-.02,z),(w+.02,.2,h+.02),rim,.16)
        box('Black glass',(0,-.13,z),(w-.055,.04,h-.06),black,.15)
        left,right,bottom,top=-w/2+.13,w/2-.13,.17,h-.17;depth=-.158
        box('Side button',(w/2+.015,0,z+.45),(.06,.10,.38),graphite,.025)
    else:
        w,h=4.8,3.4;z=h/2;camera.location=(1.8,-14,5.1);aim(camera,(0,0,1.8));camera.data.ortho_scale=5.9
        box('Outer precision edge',(0,.025,z),(w+.04,.25,h+.04),rim if kind=='browser' else wood,.11)
        box('Cast bezel',(0,-.09,z),(w,.16,h),graphite if kind=='browser' else wood,.10)
        left,right,bottom,top=-w/2+.12,w/2-.12,.13,h-(.30 if kind=='browser' else .13);depth=-.179
        if kind=='browser':
            for index,mat in enumerate(colors):
                bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,radius=.048,location=(-w/2+.20+index*.17,-.185,h-.14));bpy.context.object.data.materials.append(mat)
    box('Screen recess',((left+right)/2,depth+.005,(bottom+top)/2),(right-left,.018,top-bottom),black,.008)
    quad=[(left,depth-.008,top),(right,depth-.008,top),(right,depth-.008,bottom),(left,depth-.008,bottom)]
    render(kind,quad)

clear_models()
quads=[]
for side in (-1,1):
    angle=-side*math.radians(25);center=Vector((side*.94*math.cos(angle),-.94*abs(math.sin(angle)),2))
    o=box('Foldable continuous display half',center,(1.91,.16,4.0),graphite,.10);o.rotation_euler.z=angle
    bpy.context.view_layer.update()
    local=[(-.86,-.092,1.88),(.86,-.092,1.88),(.86,-.092,-1.88),(-.86,-.092,-1.88)]
    quad=[tuple(o.matrix_world@Vector(point)) for point in local]
    # Both screen halves meet on the same display crease, in front of the
    # single hinge. No center bezel splits this into two separate phones.
    if side==-1:quad[1]=(0,-.14,3.88);quad[2]=(0,-.14,.12)
    else:quad[0]=(0,-.14,3.88);quad[3]=(0,-.14,.12)
    quads.append(quad)
box('Single central hinge',(0,-.09,2),(.12,.14,3.88),graphite,.025)
camera.location=(1,-12,5);aim(camera,(0,-.3,2));camera.data.ortho_scale=5.7
render('foldable')
projected=[]
for quad in quads:
    projected.append([[world_to_camera_view(scene,camera,Vector(p)).x*1200,(1-world_to_camera_view(scene,camera,Vector(p)).y)*960] for p in quad])
(OUT/'foldable.json').write_text(json.dumps({'quads':projected,'size':[1200,960]},indent=2))

clear_models()
# Blender's SVG curve importer retains the official contour and interior holes.
bpy.ops.import_curve.svg(filepath=str(APP/'preview-ui/assets/boat-orange.svg'))
curves=[o for o in bpy.context.scene.objects if o.type=='CURVE']
for o in curves:
    o.data.dimensions='2D';o.data.fill_mode='BOTH';o.data.resolution_u=24
    o.data.materials.clear();o.data.materials.append(orange)
points=[o.matrix_world@Vector(corner) for o in curves for corner in o.bound_box]
mn=Vector(tuple(min(p[i] for p in points) for i in range(3)));mx=Vector(tuple(max(p[i] for p in points) for i in range(3)))
scale=4.4/(mx.x-mn.x)
for o in curves:
    for spline in o.data.splines:
        for point in spline.bezier_points:
            for attr in ('co','handle_left','handle_right'):
                v=getattr(point,attr);v.x=(v.x-(mn.x+mx.x)/2)*scale;v.y=(v.y-mn.y)*scale
    o.data.extrude=.19;o.data.bevel_depth=.025;o.data.bevel_resolution=4;o.rotation_euler.x=math.pi/2
camera.location=(2.4,-12,5.1);aim(camera,(0,0,1.6));camera.data.ortho_scale=5.8
render('boat')

clear_models()
# A single cast pointer, with a firm silhouette and a shallow bevel. It is
# ornamental hero art; the actual project links remain selectable HTML.
outline=[(-.85,3.1),(-.62,.95),(-.13,1.47),(.46,.35),(.88,.58),(.29,1.70),(1.04,1.75)]
vertices=[(x,y,z) for y in (-.16,.16) for x,z in outline]
n=len(outline)
faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
mesh=bpy.data.meshes.new('One-piece pointer');mesh.from_pydata(vertices,[],faces);mesh.update()
pointer=bpy.data.objects.new('Cast graphite cursor',mesh);scene.collection.objects.link(pointer);pointer.data.materials.append(graphite)
edge=pointer.modifiers.new('Soft cast edges','BEVEL');edge.width=.055;edge.segments=4
pointer.modifiers.new('Weighted surface normals','WEIGHTED_NORMAL')
camera.location=(2.4,-12,5.1);aim(camera,(0,0,1.65));camera.data.ortho_scale=4.1
render('cursor')
