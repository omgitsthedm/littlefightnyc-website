"""Render a slim miniature desktop window and its precise screen aperture.

This is intentionally an asset-work helper, not application code.  The output is
an isolated transparent frame: approved-site pixels are composited separately
through the aperture described in desktop-frame.json.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

import bpy
import mathutils
from bpy_extras.object_utils import world_to_camera_view


HERE = Path(__file__).resolve().parent
FRAME_PATH = HERE / "desktop-frame.png"
MASK_PATH = HERE / "desktop-frame-aperture-mask.png"
META_PATH = HERE / "desktop-frame.json"
WIDTH, HEIGHT = 1800, 1125


def material(name: str, color: tuple[float, float, float, float], metallic: float, roughness: float):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = color
    mat.use_nodes = True
    principled = mat.node_tree.nodes.get("Principled BSDF")
    principled.inputs["Base Color"].default_value = color
    principled.inputs["Metallic"].default_value = metallic
    principled.inputs["Roughness"].default_value = roughness
    return mat


def rounded_box(name: str, location: tuple[float, float, float], scale: tuple[float, float, float], mat, bevel: float):
    bpy.ops.mesh.primitive_cube_add(location=location)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new("soft precision edges", "BEVEL")
    modifier.width = bevel
    modifier.segments = 5
    modifier.limit_method = "ANGLE"
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.data.materials.append(mat)
    return obj


def rounded_ring(name: str, outer: tuple[float, float, float, float], inner: tuple[float, float, float, float], mat):
    """One continuous, beveled metal surround with a transparent aperture."""
    def loop(bounds, radius, segments=8):
        left, right, bottom, top = bounds
        centers = ((right - radius, top - radius, 0), (left + radius, top - radius, 90),
                   (left + radius, bottom + radius, 180), (right - radius, bottom + radius, 270))
        points = []
        for cx, cz, start in centers:
            for step in range(segments + 1):
                angle = math.radians(start + step * 90 / segments)
                points.append((cx + radius * math.cos(angle), -0.12, cz + radius * math.sin(angle)))
        # The corner joins repeat no points because the arc end belongs to the
        # next corner's beginning; remove those duplicates before making faces.
        deduped = []
        for point in points:
            if not deduped or math.dist(point, deduped[-1]) > 1e-5:
                deduped.append(point)
        if math.dist(deduped[0], deduped[-1]) < 1e-5:
            deduped.pop()
        return deduped

    outer_loop = loop(outer, 0.17)
    inner_loop = loop(inner, 0.05)
    if len(outer_loop) != len(inner_loop):
        raise RuntimeError("desktop ring loops must share a vertex count")
    vertices = outer_loop + inner_loop
    count = len(outer_loop)
    faces = [(i, (i + 1) % count, count + (i + 1) % count, count + i) for i in range(count)]
    mesh = bpy.data.meshes.new(f"{name} mesh")
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(mat)
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    solidify = obj.modifiers.new("anodized depth", "SOLIDIFY")
    solidify.thickness = 0.28
    solidify.offset = 0
    bevel = obj.modifiers.new("soft precision edges", "BEVEL")
    bevel.width = 0.05
    bevel.segments = 4
    for modifier in (solidify, bevel):
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return obj


def sphere(name: str, location: tuple[float, float, float], radius: float, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=location, radius=radius)
    obj = bpy.context.object
    obj.name = name
    obj.scale = (1, 0.42, 1)
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    return obj


def add_area(name: str, location, energy: float, size: float, color):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.name = name
    light.data.energy = energy
    light.data.shape = "DISK"
    light.data.size = size
    light.data.color = color
    light.rotation_euler = (math.radians(90), 0, 0)
    return light


def pixel_from_world(scene, camera, point):
    projected = world_to_camera_view(scene, camera, point)
    return [projected.x * WIDTH, (1 - projected.y) * HEIGHT]


def write_aperture_mask(quad):
    """Write an RGBA white-polygon PNG without depending on Blender's Python extras."""
    pixels = [0.0] * (WIDTH * HEIGHT * 4)
    polygon = [tuple(point) for point in quad]
    for y in range(max(0, int(min(point[1] for point in polygon))), min(HEIGHT, int(max(point[1] for point in polygon)) + 1)):
        intersections = []
        for index, (x1, y1) in enumerate(polygon):
            x2, y2 = polygon[(index + 1) % len(polygon)]
            if (y1 > y) != (y2 > y):
                intersections.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
        intersections.sort()
        for start, end in zip(intersections[0::2], intersections[1::2]):
            for x in range(max(0, math.ceil(start)), min(WIDTH, math.floor(end) + 1)):
                offset = ((HEIGHT - 1 - y) * WIDTH + x) * 4
                pixels[offset : offset + 4] = (1.0, 1.0, 1.0, 1.0)
    image = bpy.data.images.new("desktop frame aperture mask", width=WIDTH, height=HEIGHT, alpha=True)
    image.pixels = pixels
    image.filepath_raw = str(MASK_PATH)
    image.file_format = "PNG"
    image.save()


def main():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for datablocks in (bpy.data.materials, bpy.data.meshes, bpy.data.cameras, bpy.data.lights):
        for block in datablocks:
            datablocks.remove(block)

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = WIDTH
    scene.render.resolution_y = HEIGHT
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = True
    scene.render.image_settings.color_depth = "8"
    scene.view_settings.look = "AgX - Medium High Contrast"

    graphite = material("soft graphite anodized aluminum", (0.075, 0.086, 0.097, 1), 0.82, 0.23)
    graphite_edge = material("dark graphite inner lip", (0.018, 0.022, 0.028, 1), 0.72, 0.29)
    red = material("red signal", (0.95, 0.11, 0.055, 1), 0.22, 0.22)
    yellow = material("yellow signal", (1.0, 0.61, 0.075, 1), 0.18, 0.24)
    green = material("green signal", (0.16, 0.77, 0.36, 1), 0.18, 0.25)

    # All physical pieces parent to the display so its very small yaw produces
    # the restrained rightward fall in the top edge visible in the master.
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    rig = bpy.context.object
    rig.name = "Slim desktop display rig"
    rig.rotation_euler[1] = math.radians(1.2)

    outer_w, outer_h = 10.8, 6.75
    # A true 16:10-ish viewport makes the physical object read as a slim
    # desktop display rather than a tall rounded device.
    x0, x1, z0, z1 = -5.12, 5.12, -3.13, 3.13
    front_y, depth = -0.12, 0.28
    pieces = [rounded_ring("one-piece graphite surround", (-outer_w / 2, outer_w / 2, -outer_h / 2, outer_h / 2), (x0, x1, z0, z1), graphite)]
    for obj in pieces:
        obj.parent = rig

    for i, (mat, label) in enumerate(((red, "red"), (yellow, "yellow"), (green, "green"))):
        light = sphere(f"{label} traffic light", (-4.82 + i * 0.20, -0.295, 3.23), 0.052, mat)
        light.parent = rig

    # Warm key on the traffic-light side, a restrained cool edge opposite, and
    # a broad face lift preserve believable material without visual noise.
    add_area("warm key", (-6.5, -5.2, 7.5), 720, 5.0, (1.0, 0.57, 0.31))
    add_area("cool rim", (7.0, 1.5, 5.8), 860, 4.4, (0.35, 0.62, 1.0))
    add_area("soft face", (0, -7.5, 0), 330, 8.0, (0.70, 0.78, 0.92))

    bpy.ops.object.camera_add(location=(0, -20, 0))
    camera = bpy.context.object
    camera.name = "product camera"
    camera.data.type = "ORTHO"
    camera.data.ortho_scale = 11.3
    camera.rotation_euler = (math.radians(90), 0, 0)
    scene.camera = camera

    # Render and calculate the exact four inner aperture positions in the
    # output coordinate system.  The compositor can project a real site image
    # through this polygon without ever scaling the metal object itself.
    scene.render.filepath = str(FRAME_PATH)
    bpy.ops.render.render(write_still=True)
    corners = [
        (-5.08, -0.205, 3.08),
        (5.08, -0.205, 3.08),
        (5.08, -0.205, -3.08),
        (-5.08, -0.205, -3.08),
    ]
    transformed = [rig.matrix_world @ mathutils.Vector(corner) for corner in corners]
    quad = [pixel_from_world(scene, camera, corner) for corner in transformed]

    write_aperture_mask(quad)
    horizontal_top = math.dist(quad[0], quad[1])
    horizontal_bottom = math.dist(quad[2], quad[3])
    vertical_left = math.dist(quad[0], quad[3])
    vertical_right = math.dist(quad[1], quad[2])
    metadata = {
        "size": [WIDTH, HEIGHT],
        "quad": quad,
        "physicalScreenAspectRatio": round(((horizontal_top + horizontal_bottom) / 2) / ((vertical_left + vertical_right) / 2), 6),
        "frame": "slim graphite desktop window, warm key/cool rim",
        "apertureMask": MASK_PATH.name,
    }
    META_PATH.write_text(json.dumps(metadata, indent=2) + "\n")


if __name__ == "__main__":
    main()
