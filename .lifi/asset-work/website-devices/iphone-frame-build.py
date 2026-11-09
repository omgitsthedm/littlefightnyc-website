"""Render a reusable iPhone frame from Apple's native USDZ-derived blend model.

The model contains both product branches.  This deliberately retains only the
front-facing wUOhcMgiBmCgGaw.001 branch and renders the real screen mesh as a
separate alpha mask so website pixels can be composited without re-creating a
device in CSS or raster paint.
"""
import bpy
import json
import math
from pathlib import Path

from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view


ROOT = Path(__file__).resolve().parent
BLEND = ROOT / "iphone.blend"
OUT = ROOT / "iphone-frame.png"
MASK = ROOT / "iphone-frame-screen-mask.png"
META = ROOT / "iphone-frame.json"
RAW = ROOT / "iphone-frame-raw.png"
RAW_MASK = ROOT / "iphone-frame-screen-mask-raw.png"
# Apple calls this the .001 product branch at its mesh level.  Blender's
# imported branch empty itself is named without the suffix; its screen child
# and all visible meshes retain the .001 suffix.
TARGET = "wUOhcMgiBmCgGaw"
SCREEN = "EHjrGDHNHzgNjtE.001"
FULL_W, FULL_H = 1200, 1680
PAD = 20


def descendants(root):
    return {root, *root.children_recursive}


def aim(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def world_bounds(objects):
    points = [obj.matrix_world @ Vector(corner) for obj in objects if obj.type == "MESH" for corner in obj.bound_box]
    low = Vector(tuple(min(point[i] for point in points) for i in range(3)))
    high = Vector(tuple(max(point[i] for point in points) for i in range(3)))
    return low, high, (low + high) / 2


def material(name, color, roughness=0.4, emission=False):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    if emission:
        shader = nodes.new("ShaderNodeEmission")
        shader.inputs["Color"].default_value = color
        shader.inputs["Strength"].default_value = 1.0
    else:
        shader = nodes.new("ShaderNodeBsdfPrincipled")
        shader.inputs["Base Color"].default_value = color
        shader.inputs["Roughness"].default_value = roughness
        shader.inputs["Metallic"].default_value = 0.0
    mat.node_tree.links.new(shader.outputs[0], output.inputs[0])
    return mat


def render(path):
    bpy.context.scene.render.filepath = str(path)
    bpy.ops.render.render(write_still=True)


def projected_quad(camera, screen):
    # The mesh has rounded corners.  Project the four logical corners of its
    # native display plane, then let the alpha mask clip those corners.  Picking
    # the nearest rounded mesh vertices would inset a web capture by ~60px.
    depsgraph = bpy.context.evaluated_depsgraph_get()
    screen_eval = screen.evaluated_get(depsgraph)
    local_points = [vertex.co for vertex in screen_eval.data.vertices]
    min_x, max_x = min(point.x for point in local_points), max(point.x for point in local_points)
    min_y, max_y = min(point.y for point in local_points), max(point.y for point in local_points)
    min_z, max_z = min(point.z for point in local_points), max(point.z for point in local_points)
    mid_y = (min_y + max_y) / 2
    candidates = {
        # The USDZ's local Z axis runs top-to-bottom after import.
        "TL": screen_eval.matrix_world @ Vector((min_x, mid_y, min_z)),
        "TR": screen_eval.matrix_world @ Vector((max_x, mid_y, min_z)),
        "BR": screen_eval.matrix_world @ Vector((max_x, mid_y, max_z)),
        "BL": screen_eval.matrix_world @ Vector((min_x, mid_y, max_z)),
    }
    result = []
    for label in ("TL", "TR", "BR", "BL"):
        coords = world_to_camera_view(bpy.context.scene, camera, candidates[label])
        result.append([round(coords.x * FULL_W, 3), round((1 - coords.y) * FULL_H, 3)])
    return result, [round(max_x - min_x, 8), round(max_z - min_z, 8)]


bpy.ops.wm.open_mainfile(filepath=str(BLEND))
scene = bpy.context.scene
target = bpy.data.objects[TARGET]
screen = bpy.data.objects[SCREEN]
keep = descendants(target)

# The Apple source contains a back-facing duplicate.  It never enters either
# render pass; leaving it in the blend avoids changing the approved source.
for obj in scene.objects:
    obj.hide_render = obj not in keep

low, high, center = world_bounds(keep)
size = max(high - low)

bpy.ops.object.camera_add(location=center + Vector((0.092, -1.0, 0.026)) * size * 5.0)
camera = bpy.context.object
camera.name = "iPhone frame camera"
camera.data.type = "ORTHO"
camera.data.ortho_scale = 0.181
aim(camera, center + Vector((0.0, 0.0, 0.003)))
scene.camera = camera

for name, offset, energy, color, light_size in (
    ("Warm key", (-1.8, -3.2, 3.3), 315, (1.0, 0.69, 0.43), 2.2),
    ("Cool fill", (3.6, -2.5, 1.2), 180, (0.42, 0.67, 1.0), 2.6),
    ("Edge", (1.2, 2.6, 2.3), 410, (0.82, 0.73, 1.0), 1.4),
):
    bpy.ops.object.light_add(type="AREA", location=center + Vector(offset) * size)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy * size * size
    light.data.color = color
    light.data.shape = "DISK"
    light.data.size = light_size * size
    aim(light, center)

scene.world = bpy.data.worlds.new("iPhone transparent studio")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.025, 0.035, 0.075, 1)
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.23
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = FULL_W
scene.render.resolution_y = FULL_H
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.color_depth = "8"
scene.render.image_settings.compression = 12
scene.render.image_settings.color_management = "FOLLOW_SCENE"
scene.view_settings.look = "AgX - Medium High Contrast"
scene.render.image_settings.color_mode = "RGBA"

# Keep the actual OLED opening but remove Apple's wallpaper.
blank_screen = material("Neutral unlit display", (0.885, 0.86, 0.81, 1), roughness=0.37)
screen.data.materials.clear()
screen.data.materials.append(blank_screen)
render(RAW)

# Blender's embedded Python does not ship Pillow.  It can still read the alpha
# channel directly; the companion finish step performs the identical crop on
# both exported PNGs with the system Python/Pillow environment.
raw_image = bpy.data.images.load(str(RAW), check_existing=False)
width, height = raw_image.size
alpha_pixels = raw_image.pixels[3::4]
xs, ys = [], []
for index, alpha in enumerate(alpha_pixels):
    if alpha > 0.005:
        xs.append(index % width)
        ys.append(index // width)
if not xs:
    raise RuntimeError("The iPhone frame render has no opaque pixels.")
left = max(0, min(xs) - PAD)
# Blender pixels are stored bottom-up while the PNG crop is top-down.
right = min(FULL_W, max(xs) + 1 + PAD)
top = max(0, FULL_H - (max(ys) + 1) - PAD)
bottom = min(FULL_H, FULL_H - min(ys) + PAD)
crop = (left, top, right, bottom)

# A white-only alpha mask from the source screen mesh preserves the native
# rounded corners and Dynamic Island opening while offering a clean composite
# target for an approved site capture.
for obj in keep:
    obj.hide_render = obj != screen
white = material("Screen mask white", (1, 1, 1, 1), emission=True)
screen.data.materials.clear()
screen.data.materials.append(white)
render(RAW_MASK)
quad, physical_size = projected_quad(camera, screen)
(ROOT / "iphone-frame-render.json").write_text(json.dumps({
    "source": "Apple iPhone 18 Pro USDZ, imported into iphone.blend",
    "retainedBranch": TARGET,
    "screenMesh": SCREEN,
    "render": {"originalSize": [FULL_W, FULL_H], "crop": list(crop), "padding": PAD},
    "screenMask": {"path": RAW_MASK.name},
    "screenQuadrilateral": quad,
    "screenQuadrilateralOrder": ["TL", "TR", "BR", "BL"],
    "screenPhysicalSize": {"width": physical_size[0], "height": physical_size[1], "aspect": round(physical_size[0] / physical_size[1], 8)},
}, indent=2) + "\n")

print(json.dumps({"frameRaw": str(RAW), "maskRaw": str(RAW_MASK), "renderMeta": str(ROOT / 'iphone-frame-render.json'), "crop": crop, "quad": quad}))
