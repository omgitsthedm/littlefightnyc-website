"""Render licensed Phosphor silhouettes as individual cast-resin sculptures.

The official vector contours are imported unchanged, including their holes.
Only material, depth, edge rounding, light and camera are added. No invented
screenshots, shared boxes, or generic fallback illustration enters a tile.
Run with the installed Blender; optional arguments select cast asset names.
"""
import bpy
import hashlib
import json
import math
import sys
from pathlib import Path
from mathutils import Vector

APP = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(APP / 'scripts'))
from sculpture_tiles import TOPIC_ART, SERVICES

OUT = APP.parent / '.lifi/evidence/visual-overhaul/topic-renders'
OUT.mkdir(parents=True, exist_ok=True)
ONLY = set(sys.argv[sys.argv.index('--') + 1:]) if '--' in sys.argv else set()
scene = bpy.context.scene
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
scene.render.engine = 'CYCLES'
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 960
scene.render.resolution_y = 768
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.film_transparent = True
scene.view_settings.view_transform = 'AgX'
scene.world.color = (.22, .22, .22)

def aim(obj, point):
    obj.rotation_euler = (Vector(point) - obj.location).to_track_quat('-Z', 'Y').to_euler()

def material(name, color, background=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    shader = nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = .4 if background else .29
    shader.inputs['Metallic'].default_value = .08
    shader.inputs['Coat Weight'].default_value = .15
    texture = nodes.new('ShaderNodeTexNoise')
    texture.inputs['Scale'].default_value = 125
    texture.inputs['Detail'].default_value = 2
    bump = nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .1
    bump.inputs['Distance'].default_value = .012
    mat.node_tree.links.new(texture.outputs['Fac'], bump.inputs['Height'])
    mat.node_tree.links.new(bump.outputs['Normal'], shader.inputs['Normal'])
    return mat

palette = {'web':(.12,.36,.76), 'it':(.95,.57,.035),
           'consulting':(.16,.46,.23), 'software':(.62,.10,.32)}
materials = {key:(material(key+' glazed clay', color),
                  material(key+' inset mineral', tuple(v*.42 for v in color), True))
             for key,color in palette.items()}
bpy.ops.object.camera_add(location=(2.6,-12,5.1))
camera = bpy.context.object
camera.data.type = 'ORTHO'
camera.data.ortho_scale = 5.7
scene.camera = camera
aim(camera,(0,0,2))
for name,loc,power,size in [('Softbox',(-4,-6,7),700,5),
                           ('Fill',(5,-3,5),400,4),('Rim',(1,4,6),800,3)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    light = bpy.context.object
    light.name = name
    light.data.energy = power
    light.data.shape = 'DISK'
    light.data.size = size
    aim(light,(0,0,2))

inventory = json.loads((APP/'dist/sculpture-inventory.json').read_text())
families = {row['id']:row.get('family') for row in inventory}
# The previous artifact predates the family receipt. The original HTML is
# authoritative for service colors while migrating that artifact.
from html.parser import HTMLParser
class Families(HTMLParser):
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if values.get('data-answer'):
            families[values['data-answer']] = values.get('data-family', 'web')
Families().feed((APP/'dist/index.html').read_text())
assets = {art:families[identity] for identity,art in TOPIC_ART.items() if art.startswith('cast-')}
assets.update({values[2]:family for family,values in SERVICES.items() if values[2].startswith('cast-')})
receipt_path = APP.parent/'.lifi/design-source/sculpture/topic-sculptures.json'
receipts = json.loads(receipt_path.read_text()) if receipt_path.is_file() else {}
for name,family in sorted(assets.items()):
    if ONLY and name not in ONLY:
        continue
    for obj in list(bpy.data.objects):
        if obj.type not in ('CAMERA','LIGHT'):
            bpy.data.objects.remove(obj,do_unlink=True)
    source = APP/'preview-ui/assets/mineral'/(name.removeprefix('cast-')+'-duotone.svg')
    assert source.is_file(), source
    bpy.ops.import_curve.svg(filepath=str(source))
    curves = [obj for obj in scene.objects if obj.type=='CURVE']
    points = [obj.matrix_world@Vector(corner) for obj in curves for corner in obj.bound_box]
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    scale = 3.9 / max(high.x-low.x, high.y-low.y)
    offset = Vector(((low.x+high.x)/2, (low.y+high.y)/2, 0))
    for index,obj in enumerate(curves):
        obj.data.dimensions = '2D'
        obj.data.fill_mode = 'BOTH'
        obj.data.resolution_u = 24
        for spline in obj.data.splines:
            for point in spline.bezier_points:
                for attr in ('co','handle_left','handle_right'):
                    value = getattr(point,attr)
                    value.x = (value.x-offset.x)*scale
                    value.y = (value.y-offset.y)*scale+2
            for point in spline.points:
                point.co.x = (point.co.x-offset.x)*scale
                point.co.y = (point.co.y-offset.y)*scale+2
        background = index==0 and 'opacity=' in source.read_text()
        obj.data.materials.clear()
        obj.data.materials.append(materials[family][int(background)])
        obj.data.extrude = .11 if background else .20
        obj.data.bevel_depth = .035
        obj.data.bevel_resolution = 4
        obj.rotation_euler.x = math.pi/2
    scene.render.filepath = str(OUT/(name+'.png'))
    bpy.ops.render.render(write_still=True)
    receipts[name] = {'icon':str(source.relative_to(APP)),
                      'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),
                      'family':family, 'renderer':'Blender Cycles, 32 samples',
                      'modifications':'Unchanged official paths; extruded, beveled, clay materials and studio light'}
    receipt_path.write_text(json.dumps(receipts,indent=2)+'\n')
    print('Rendered',name,flush=True)
