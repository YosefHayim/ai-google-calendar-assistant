"""
Ally 3D Character Creation Script for Blender 4.0+
===================================================
Creates the Ally character to match the logo exactly.

Run this script in Blender: Text Editor > Open > Run Script
Or paste into Blender's Python console.
"""

import bpy
import math
from mathutils import Vector


# Clear existing objects
def clear_scene():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)

    # Clear orphan data
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)


# Create materials
def create_materials():
    materials = {}

    # Body material - soft white with subtle blue tint
    mat_body = bpy.data.materials.new(name="Ally_Body")
    mat_body.use_nodes = True
    nodes = mat_body.node_tree.nodes
    nodes.clear()

    # Principled BSDF for body
    principled = nodes.new("ShaderNodeBsdfPrincipled")
    principled.inputs["Base Color"].default_value = (
        0.95,
        0.97,
        1.0,
        1.0,
    )  # Slight blue-white
    principled.inputs["Roughness"].default_value = 0.3
    principled.inputs["Subsurface Weight"].default_value = 0.2
    principled.inputs["Subsurface Radius"].default_value = (0.1, 0.1, 0.1)
    principled.location = (0, 0)

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (300, 0)
    mat_body.node_tree.links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    materials["body"] = mat_body

    # Eye material - bright cyan/blue with emission
    mat_eye = bpy.data.materials.new(name="Ally_Eye")
    mat_eye.use_nodes = True
    nodes = mat_eye.node_tree.nodes
    nodes.clear()

    principled = nodes.new("ShaderNodeBsdfPrincipled")
    principled.inputs["Base Color"].default_value = (0.0, 0.7, 1.0, 1.0)  # Cyan blue
    principled.inputs["Roughness"].default_value = 0.1
    principled.inputs["Emission Color"].default_value = (0.0, 0.5, 0.9, 1.0)
    principled.inputs["Emission Strength"].default_value = 0.3
    principled.location = (0, 0)

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (300, 0)
    mat_eye.node_tree.links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    materials["eye"] = mat_eye

    # Eye highlight material - white glossy
    mat_highlight = bpy.data.materials.new(name="Ally_Highlight")
    mat_highlight.use_nodes = True
    nodes = mat_highlight.node_tree.nodes
    nodes.clear()

    principled = nodes.new("ShaderNodeBsdfPrincipled")
    principled.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    principled.inputs["Roughness"].default_value = 0.0
    principled.inputs["Emission Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    principled.inputs["Emission Strength"].default_value = 0.5
    principled.location = (0, 0)

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (300, 0)
    mat_highlight.node_tree.links.new(
        principled.outputs["BSDF"], output.inputs["Surface"]
    )
    materials["highlight"] = mat_highlight

    # Headphone material - blue
    mat_headphone = bpy.data.materials.new(name="Ally_Headphone")
    mat_headphone.use_nodes = True
    nodes = mat_headphone.node_tree.nodes
    nodes.clear()

    principled = nodes.new("ShaderNodeBsdfPrincipled")
    principled.inputs["Base Color"].default_value = (0.0, 0.45, 0.85, 1.0)  # Blue
    principled.inputs["Roughness"].default_value = 0.3
    principled.inputs["Metallic"].default_value = 0.1
    principled.location = (0, 0)

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (300, 0)
    mat_headphone.node_tree.links.new(
        principled.outputs["BSDF"], output.inputs["Surface"]
    )
    materials["headphone"] = mat_headphone

    # Microphone material - green
    mat_mic = bpy.data.materials.new(name="Ally_Mic")
    mat_mic.use_nodes = True
    nodes = mat_mic.node_tree.nodes
    nodes.clear()

    principled = nodes.new("ShaderNodeBsdfPrincipled")
    principled.inputs["Base Color"].default_value = (0.2, 0.8, 0.3, 1.0)  # Green
    principled.inputs["Roughness"].default_value = 0.3
    principled.location = (0, 0)

    output = nodes.new("ShaderNodeOutputMaterial")
    output.location = (300, 0)
    mat_mic.node_tree.links.new(principled.outputs["BSDF"], output.inputs["Surface"])
    materials["mic"] = mat_mic

    # Google colors for accent feathers
    google_colors = [
        ("red", (0.92, 0.26, 0.21, 1.0)),
        ("yellow", (1.0, 0.76, 0.03, 1.0)),
        ("green", (0.2, 0.66, 0.33, 1.0)),
        ("blue", (0.26, 0.52, 0.96, 1.0)),
    ]

    for name, color in google_colors:
        mat = bpy.data.materials.new(name=f"Ally_Google_{name}")
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        nodes.clear()

        principled = nodes.new("ShaderNodeBsdfPrincipled")
        principled.inputs["Base Color"].default_value = color
        principled.inputs["Roughness"].default_value = 0.3
        principled.location = (0, 0)

        output = nodes.new("ShaderNodeOutputMaterial")
        output.location = (300, 0)
        mat.node_tree.links.new(principled.outputs["BSDF"], output.inputs["Surface"])
        materials[f"google_{name}"] = mat

    return materials


def create_body():
    """Create the ghost/blob body shape"""
    # Create a UV sphere and sculpt it into blob shape
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.0, segments=64, ring_count=32, location=(0, 0, 0.5)
    )
    body = bpy.context.active_object
    body.name = "Ally_Body"

    # Scale to make it more blob-like (wider at top, narrower at bottom)
    body.scale = (1.0, 0.85, 1.2)
    bpy.ops.object.transform_apply(scale=True)

    # Add subdivision for smoothness
    subsurf = body.modifiers.new(name="Subdivision", type="SUBSURF")
    subsurf.levels = 2
    subsurf.render_levels = 3

    # Enter edit mode to shape the body
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")

    # Use proportional editing to shape - flatten bottom
    bpy.ops.object.mode_set(mode="OBJECT")

    # Shape the mesh vertices for blob shape
    mesh = body.data
    for vert in mesh.vertices:
        # Flatten and widen the bottom
        if vert.co.z < 0:
            # Pull bottom vertices down and inward for tapered look
            factor = abs(vert.co.z) / 0.5
            vert.co.z *= 0.6  # Flatten bottom
            vert.co.x *= 1.0 - factor * 0.3  # Taper inward
            vert.co.y *= 1.0 - factor * 0.3

        # Round out the top/head area
        if vert.co.z > 0.8:
            # Make top more rounded
            vert.co.z *= 1.1

    # Add smooth shading
    bpy.ops.object.shade_smooth()

    return body


def create_eye(side="left"):
    """Create an eye with highlight"""
    x_offset = -0.35 if side == "left" else 0.35

    # Main eye - oval shape
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.22, segments=32, ring_count=16, location=(x_offset, -0.75, 0.85)
    )
    eye = bpy.context.active_object
    eye.name = f"Ally_Eye_{side}"
    eye.scale = (0.8, 0.4, 1.0)  # Oval shape
    bpy.ops.object.transform_apply(scale=True)
    bpy.ops.object.shade_smooth()

    # Eye highlight - small white dot
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.06, segments=16, ring_count=8, location=(x_offset - 0.05, -0.92, 0.95)
    )
    highlight = bpy.context.active_object
    highlight.name = f"Ally_Highlight_{side}"
    bpy.ops.object.shade_smooth()

    return eye, highlight


def create_mouth():
    """Create a simple curved smile"""
    # Create curve for smile
    bpy.ops.curve.primitive_bezier_curve_add(location=(0, -0.85, 0.5))
    curve = bpy.context.active_object
    curve.name = "Ally_Mouth"

    # Shape the curve into a smile
    curve.data.splines[0].bezier_points[0].co = (-0.15, 0, 0)
    curve.data.splines[0].bezier_points[0].handle_left = (-0.2, 0, 0.05)
    curve.data.splines[0].bezier_points[0].handle_right = (-0.1, 0, -0.05)

    curve.data.splines[0].bezier_points[1].co = (0.15, 0, 0)
    curve.data.splines[0].bezier_points[1].handle_left = (0.1, 0, -0.05)
    curve.data.splines[0].bezier_points[1].handle_right = (0.2, 0, 0.05)

    # Add bevel for thickness
    curve.data.bevel_depth = 0.025
    curve.data.bevel_resolution = 4

    # Convert to mesh
    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.shade_smooth()

    return curve


def create_headphones():
    """Create the blue headphones"""
    headphone_parts = []

    # Headband - torus arc over head
    bpy.ops.mesh.primitive_torus_add(
        major_radius=0.85,
        minor_radius=0.06,
        major_segments=48,
        minor_segments=12,
        location=(0, 0, 1.3),
    )
    headband = bpy.context.active_object
    headband.name = "Ally_Headband"
    headband.rotation_euler = (math.radians(90), 0, 0)

    # Delete bottom half of torus
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="DESELECT")
    bpy.ops.object.mode_set(mode="OBJECT")

    mesh = headband.data
    for vert in mesh.vertices:
        if vert.co.y < -0.1:  # Select bottom vertices
            vert.select = True

    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.delete(type="VERT")
    bpy.ops.object.mode_set(mode="OBJECT")
    bpy.ops.object.shade_smooth()
    headphone_parts.append(headband)

    # Left ear cup
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.2, depth=0.12, location=(-0.85, 0, 0.9)
    )
    left_cup = bpy.context.active_object
    left_cup.name = "Ally_EarCup_Left"
    left_cup.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.shade_smooth()
    headphone_parts.append(left_cup)

    # Left ear cup padding (inner circle)
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.15, depth=0.05, location=(-0.92, 0, 0.9)
    )
    left_pad = bpy.context.active_object
    left_pad.name = "Ally_EarPad_Left"
    left_pad.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.shade_smooth()
    headphone_parts.append(left_pad)

    # Right ear cup
    bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=0.12, location=(0.85, 0, 0.9))
    right_cup = bpy.context.active_object
    right_cup.name = "Ally_EarCup_Right"
    right_cup.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.shade_smooth()
    headphone_parts.append(right_cup)

    # Right ear cup padding
    bpy.ops.mesh.primitive_cylinder_add(
        radius=0.15, depth=0.05, location=(0.92, 0, 0.9)
    )
    right_pad = bpy.context.active_object
    right_pad.name = "Ally_EarPad_Right"
    right_pad.rotation_euler = (0, math.radians(90), 0)
    bpy.ops.object.shade_smooth()
    headphone_parts.append(right_pad)

    return headphone_parts


def create_microphone():
    """Create the green microphone boom"""
    mic_parts = []

    # Mic boom arm - curved
    bpy.ops.curve.primitive_bezier_curve_add(location=(-0.85, -0.1, 0.75))
    boom = bpy.context.active_object
    boom.name = "Ally_MicBoom"

    # Shape the boom curve
    spline = boom.data.splines[0]
    spline.bezier_points[0].co = (0, 0, 0)
    spline.bezier_points[0].handle_right = (0.1, -0.1, -0.1)
    spline.bezier_points[1].co = (0.3, -0.4, -0.2)
    spline.bezier_points[1].handle_left = (0.2, -0.3, -0.1)

    boom.data.bevel_depth = 0.025
    boom.data.bevel_resolution = 4

    bpy.ops.object.convert(target="MESH")
    bpy.ops.object.shade_smooth()
    mic_parts.append(boom)

    # Mic head - small sphere
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=0.06, segments=16, ring_count=8, location=(-0.55, -0.5, 0.55)
    )
    mic_head = bpy.context.active_object
    mic_head.name = "Ally_MicHead"
    bpy.ops.object.shade_smooth()
    mic_parts.append(mic_head)

    return mic_parts


def create_google_accent():
    """Create the Google colors feather/accent decoration"""
    feathers = []
    colors = ["blue", "green", "yellow", "red"]  # Bottom to top

    base_x = 0.9
    base_y = 0.1
    base_z = 0.95

    for i, color in enumerate(colors):
        # Create elongated capsule shape for each feather
        bpy.ops.mesh.primitive_uv_sphere_add(
            radius=0.04,
            segments=16,
            ring_count=8,
            location=(base_x + i * 0.02, base_y - i * 0.05, base_z + i * 0.12),
        )
        feather = bpy.context.active_object
        feather.name = f"Ally_Feather_{color}"
        feather.scale = (0.6, 0.6, 2.0)  # Elongate
        feather.rotation_euler = (
            math.radians(-20 + i * 10),
            math.radians(30),
            math.radians(10 * i),
        )
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        bpy.ops.object.shade_smooth()
        feathers.append((feather, color))

    return feathers


def apply_materials(materials):
    """Apply materials to all objects"""
    # Body
    body = bpy.data.objects.get("Ally_Body")
    if body:
        body.data.materials.append(materials["body"])

    # Eyes
    for side in ["left", "right"]:
        eye = bpy.data.objects.get(f"Ally_Eye_{side}")
        if eye:
            eye.data.materials.append(materials["eye"])

        highlight = bpy.data.objects.get(f"Ally_Highlight_{side}")
        if highlight:
            highlight.data.materials.append(materials["highlight"])

    # Mouth
    mouth = bpy.data.objects.get("Ally_Mouth")
    if mouth:
        mouth.data.materials.append(materials["eye"])  # Same cyan as eyes

    # Headphones
    for name in [
        "Ally_Headband",
        "Ally_EarCup_Left",
        "Ally_EarCup_Right",
        "Ally_EarPad_Left",
        "Ally_EarPad_Right",
    ]:
        obj = bpy.data.objects.get(name)
        if obj:
            obj.data.materials.append(materials["headphone"])

    # Microphone
    for name in ["Ally_MicBoom", "Ally_MicHead"]:
        obj = bpy.data.objects.get(name)
        if obj:
            obj.data.materials.append(materials["mic"])

    # Google accent feathers
    for color in ["red", "yellow", "green", "blue"]:
        feather = bpy.data.objects.get(f"Ally_Feather_{color}")
        if feather:
            feather.data.materials.append(materials[f"google_{color}"])


def setup_scene():
    """Setup lighting and camera"""
    # Add soft lighting
    bpy.ops.object.light_add(type="AREA", location=(2, -3, 4))
    key_light = bpy.context.active_object
    key_light.name = "Key_Light"
    key_light.data.energy = 500
    key_light.data.size = 3

    bpy.ops.object.light_add(type="AREA", location=(-2, -2, 3))
    fill_light = bpy.context.active_object
    fill_light.name = "Fill_Light"
    fill_light.data.energy = 200
    fill_light.data.size = 2

    # Add camera
    bpy.ops.object.camera_add(location=(0, -4, 1), rotation=(math.radians(80), 0, 0))
    camera = bpy.context.active_object
    camera.name = "Ally_Camera"
    bpy.context.scene.camera = camera

    # Set world background to light blue
    world = bpy.data.worlds.get("World")
    if world:
        world.use_nodes = True
        bg_node = world.node_tree.nodes.get("Background")
        if bg_node:
            bg_node.inputs["Color"].default_value = (0.7, 0.85, 1.0, 1.0)  # Light blue


def parent_all_to_empty():
    """Create parent empty for all Ally parts"""
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    parent = bpy.context.active_object
    parent.name = "Ally_Root"

    for obj in bpy.data.objects:
        if obj.name.startswith("Ally_") and obj.name != "Ally_Root":
            obj.parent = parent


def export_glb(filepath):
    """Export as GLB for web use"""
    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        export_animations=True,
        export_skins=True,
        export_morph=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
    )
    print(f"Exported to: {filepath}")


def main():
    print("\n" + "=" * 60)
    print("CREATING ALLY 3D CHARACTER")
    print("=" * 60 + "\n")

    # Clear scene
    print("Clearing scene...")
    clear_scene()

    # Create materials
    print("Creating materials...")
    materials = create_materials()

    # Create character parts
    print("Creating body...")
    create_body()

    print("Creating eyes...")
    create_eye("left")
    create_eye("right")

    print("Creating mouth...")
    create_mouth()

    print("Creating headphones...")
    create_headphones()

    print("Creating microphone...")
    create_microphone()

    print("Creating Google accent...")
    create_google_accent()

    # Apply materials
    print("Applying materials...")
    apply_materials(materials)

    # Setup scene
    print("Setting up scene...")
    setup_scene()

    # Parent all parts
    print("Organizing hierarchy...")
    parent_all_to_empty()

    print("\n" + "=" * 60)
    print("ALLY CHARACTER CREATED SUCCESSFULLY!")
    print("=" * 60)
    print("\nTo export: Run export_glb('/path/to/ally-3d.glb')")


if __name__ == "__main__":
    main()
