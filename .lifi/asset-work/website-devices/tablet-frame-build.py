"""Render a portrait iPad frame from Apple's supplied USDZ-derived Blender model.

The imported model contains keyboard and Pencil siblings.  This deliberately
renders only the actual iPad branch and uses the model's own screen mesh for
both the blank display and the matching aperture mask.
"""
from pathlib import Path
import json
import math

import bpy
import numpy as np
from mathutils import Matrix, Vector
from bpy_extras.object_utils import world_to_camera_view


HERE = Path(__file__).resolve().parent
SOURCE = HERE / "ipad.blend"
OUT = HERE / "tablet-frame.png"
MASK = HERE / "tablet-frame-mask.png"
META = HERE / "tablet-frame.json"
TMP = HERE / "tablet-frame-render.png"
TMP_MASK = HERE / "tablet-frame-mask-render.png"

DEVICE_ROOT = "zRrSLDpdYmKeRJQ"
SCREEN_NAME = "lsDiIbtoSGSmWWZ"


def descendants(root):
    return [root, *root.children_recursive]


def aim(obj, target):
    obj.rotation_euler = (target - obj.location).to_track_quat("-Z", "Y").to_euler()


def fresh_material(name, color, emission=0.0):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    shader.inputs["Base Color"].default_value = color
    shader.inputs["Roughness"].default_value = 0.22
    shader.inputs["Metallic"].default_value = 0.0
    if "Emission Color" in shader.inputs:
        shader.inputs["Emission Color"].default_value = color
        shader.inputs["Emission Strength"].default_value = emission
    material.node_tree.links.new(shader.outputs["BSDF"], output.inputs["Surface"])
    return material


def screen_basis(screen):
    points = np.array([tuple(screen.matrix_world @ vertex.co) for vertex in screen.data.vertices])
    center = Vector(points.mean(axis=0))
    _, _, vh = np.linalg.svd(points - points.mean(axis=0), full_matrices=False)
    long_axis = Vector(vh[0]).normalized()
    short_axis = Vector(vh[1]).normalized()
    normal = long_axis.cross(short_axis).normalized()
    return center, long_axis, short_axis, normal


def rotate_device_to_portrait(root, screen):
    """Map the real model's wide display to an upright portrait display."""
    center, long_axis, short_axis, normal = screen_basis(screen)
    # The screen's original long edge becomes vertical.  Its short edge becomes
    # horizontal and the original front faces the camera on -Y.
    source_basis = Matrix((long_axis, short_axis, normal)).transposed()
    target_basis = Matrix((Vector((0, 0, 1)), Vector((1, 0, 0)), Vector((0, -1, 0)))).transposed()
    rotation = target_basis @ source_basis.inverted()
    root.matrix_world = (
        Matrix.Translation(center)
        @ rotation.to_4x4()
        @ Matrix.Translation(-center)
        @ root.matrix_world
    )
    bpy.context.view_layer.update()


def bounds(objects):
    points = [obj.matrix_world @ Vector(corner) for obj in objects if obj.type == "MESH" for corner in obj.bound_box]
    low = Vector([min(point[i] for point in points) for i in range(3)])
    high = Vector([max(point[i] for point in points) for i in range(3)])
    return low, high, (low + high) / 2


def setup_camera(scene, model_objects):
    low, high, center = bounds(model_objects)
    height = high.z - low.z
    width = high.x - low.x
    bpy.ops.object.camera_add(location=center + Vector((0.17 * width, -3.55 * height, 0.055 * height)))
    camera = bpy.context.object
    camera.name = "Portrait tablet camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = max(height * 1.10, width * 1.26)
    aim(camera, center + Vector((0, 0, 0.015 * height)))
    scene.camera = camera
    return camera


def add_lights(center, size):
    lights = [
        ("Warm key", (-2.3, -3.1, 2.8), 420, (1.0, 0.72, 0.51), 2.3),
        ("Cool rim", (2.5, 0.8, 2.2), 520, (0.39, 0.73, 1.0), 1.7),
        ("Soft fill", (-2.1, -2.2, -0.4), 180, (0.86, 0.89, 1.0), 3.0),
    ]
    for name, offset, power, color, area in lights:
        bpy.ops.object.light_add(type="AREA", location=center + Vector(offset) * size)
        light = bpy.context.object
        light.name = name
        light.data.energy = power * size * size
        light.data.color = color
        light.data.shape = "DISK"
        light.data.size = size * area
        aim(light, center)


def set_render(scene, path):
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 1800
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.filepath = str(path)
    scene.view_settings.look = "AgX - Medium High Contrast"


def crop_and_scale(source, destination, crop=None):
    image = bpy.data.images.load(str(source), check_existing=False)
    width, height = image.size
    pixels = np.asarray(image.pixels[:], dtype=np.float32).reshape(height, width, 4)
    if crop is None:
        alpha = pixels[:, :, 3]
        ys, xs = np.where(alpha > 0.005)
        if len(xs) == 0:
            raise RuntimeError(f"No alpha content in {source}")
        pad = 20
        crop = (
            max(0, int(xs.min()) - pad), max(0, int(ys.min()) - pad),
            min(width, int(xs.max()) + 1 + pad), min(height, int(ys.max()) + 1 + pad),
        )
    cropped_pixels = pixels[crop[1]:crop[3], crop[0]:crop[2], :]
    target_height = 1500
    target_width = round(cropped_pixels.shape[1] * target_height / cropped_pixels.shape[0])
    cropped = bpy.data.images.new("tablet crop", cropped_pixels.shape[1], cropped_pixels.shape[0], alpha=True, float_buffer=False)
    cropped.pixels.foreach_set(cropped_pixels.ravel())
    cropped.scale(target_width, target_height)
    cropped.filepath_raw = str(destination)
    cropped.file_format = "PNG"
    cropped.save()
    bpy.data.images.remove(image)
    bpy.data.images.remove(cropped)
    return crop, (target_width, target_height)


def project_screen_quad(scene, camera, screen, crop, result_size):
    vertices = [screen.matrix_world @ vertex.co for vertex in screen.data.vertices]
    projected = []
    for vertex in vertices:
        point = world_to_camera_view(scene, camera, vertex)
        projected.append(Vector((point.x * scene.render.resolution_x, (1 - point.y) * scene.render.resolution_y)))
    # Use the actual projected mesh boundary, choosing a stable corner from each
    # quadrant.  It follows the display's perspective rather than its body box.
    center = sum(projected, Vector((0, 0))) / len(projected)
    candidates = {
        "TL": [point for point in projected if point.x <= center.x and point.y <= center.y],
        "TR": [point for point in projected if point.x >= center.x and point.y <= center.y],
        "BR": [point for point in projected if point.x >= center.x and point.y >= center.y],
        "BL": [point for point in projected if point.x <= center.x and point.y >= center.y],
    }
    choice = {
        "TL": min(candidates["TL"], key=lambda point: point.x + point.y),
        "TR": min(candidates["TR"], key=lambda point: -point.x + point.y),
        "BR": max(candidates["BR"], key=lambda point: point.x + point.y),
        "BL": max(candidates["BL"], key=lambda point: -point.x + point.y),
    }
    sx = result_size[0] / (crop[2] - crop[0])
    sy = result_size[1] / (crop[3] - crop[1])
    return {
        name: [round((point.x - crop[0]) * sx, 2), round((point.y - crop[1]) * sy, 2)]
        for name, point in choice.items()
    }


def mask_quad_from_output(path):
    """Return the rendered aperture's straight-edge quadrilateral in PNG pixels.

    The source mesh has rounded display corners, so using its nearest corner
    vertices gives a false inset.  The final aperture mask is the compositing
    authority.  Blender exposes image pixels bottom-up; flip them here so the
    JSON follows normal PNG (top-left origin) coordinates.
    """
    image = bpy.data.images.load(str(path), check_existing=False)
    pixels = np.asarray(image.pixels[:], dtype=np.float32).reshape(image.size[1], image.size[0], 4)[::-1, :, 3]
    opaque = pixels >= 0.5
    rows, cols = np.where(opaque)
    if not len(rows):
        raise RuntimeError("Tablet aperture mask has no opaque pixels")
    top, bottom = int(rows.min()), int(rows.max())
    left, right = int(cols.min()), int(cols.max())
    # Ignore rounded corners to sample the display's four true straight edges.
    trim_y = max(12, round((bottom - top + 1) * 0.08))
    trim_x = max(12, round((right - left + 1) * 0.08))
    left_edges = [np.where(opaque[y])[0].min() for y in range(top + trim_y, bottom - trim_y + 1)]
    right_edges = [np.where(opaque[y])[0].max() for y in range(top + trim_y, bottom - trim_y + 1)]
    top_edges = [np.where(opaque[:, x])[0].min() for x in range(left + trim_x, right - trim_x + 1)]
    bottom_edges = [np.where(opaque[:, x])[0].max() for x in range(left + trim_x, right - trim_x + 1)]
    quad = {
        "TL": [float(np.median(left_edges)), float(np.median(top_edges))],
        "TR": [float(np.median(right_edges)), float(np.median(top_edges))],
        "BR": [float(np.median(right_edges)), float(np.median(bottom_edges))],
        "BL": [float(np.median(left_edges)), float(np.median(bottom_edges))],
    }
    bounds = {"left": left, "top": top, "rightExclusive": right + 1, "bottomExclusive": bottom + 1}
    bpy.data.images.remove(image)
    return quad, bounds


def main():
    bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
    scene = bpy.context.scene
    root = bpy.data.objects[DEVICE_ROOT]
    screen = bpy.data.objects[SCREEN_NAME]

    # Keyboard and Pencil are sibling branches. Keep the actual iPad only.
    root.parent = None
    retained = set(descendants(root))
    for obj in scene.objects:
        obj.hide_render = obj not in retained

    rotate_device_to_portrait(root, screen)
    screen.data.materials.clear()
    screen.data.materials.append(fresh_material("Tablet display off white", (0.965, 0.935, 0.87, 1), 0.10))

    model_objects = descendants(root)
    _, _, center = bounds(model_objects)
    camera = setup_camera(scene, model_objects)
    add_lights(center, max((bounds(model_objects)[1] - bounds(model_objects)[0])))
    world = bpy.data.worlds.new("Transparent studio")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.075, 0.065, 0.09, 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.16
    scene.world = world

    set_render(scene, TMP)
    bpy.ops.render.render(write_still=True)
    crop, final_size = crop_and_scale(TMP, OUT)

    # Render the real screen aperture alone, in the same camera and crop.
    for obj in model_objects:
        obj.hide_render = obj is not screen
    screen.data.materials.clear()
    screen.data.materials.append(fresh_material("Tablet aperture mask", (1, 1, 1, 1), 1.0))
    for obj in scene.objects:
        if obj.type == "LIGHT":
            obj.hide_render = True
    set_render(scene, TMP_MASK)
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    bpy.ops.render.render(write_still=True)
    _, mask_size = crop_and_scale(TMP_MASK, MASK, crop)
    if mask_size != final_size:
        raise RuntimeError("Mask crop diverged from tablet crop")
    bpy.context.view_layer.update()
    quad, mask_bounds = mask_quad_from_output(MASK)

    META.write_text(json.dumps({
        "source": "ipad.blend",
        "modelBranch": DEVICE_ROOT,
        "screenMesh": SCREEN_NAME,
        "render": str(OUT.name),
        "mask": str(MASK.name),
        "dimensions": {"width": final_size[0], "height": final_size[1]},
        "screenQuadrilateral": quad,
        "maskOpaqueBounds": mask_bounds,
        "screenAspect": round((abs(quad["TR"][0] - quad["TL"][0]) + abs(quad["BR"][0] - quad["BL"][0])) / (abs(quad["BL"][1] - quad["TL"][1]) + abs(quad["BR"][1] - quad["TR"][1])), 5),
        "order": ["TL", "TR", "BR", "BL"],
        "sourceNotes": "Apple USDZ-derived iPad model; keyboard and Pencil sibling branches hidden.",
        "quadrilateralMethod": "Final aperture-mask straight edges in top-left-origin PNG pixels.",
    }, indent=2) + "\n")


if __name__ == "__main__":
    main()
