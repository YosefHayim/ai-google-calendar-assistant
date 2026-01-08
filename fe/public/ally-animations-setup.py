"""
Ally 3D Character Animation Setup Script for Blender 5.0+
=========================================================
Run this script in Blender with ally-3d.blend open.
"""

import bpy
import math
from mathutils import Vector

FRAME_RATE = 30
IDLE_CYCLE_FRAMES = 120
BOBBING_AMPLITUDE = 0.05
BREATHING_SCALE = 0.02

SHAPE_KEYS = {
    "mouth_open": "MouthOpen",
    "mouth_smile": "MouthSmile",
    "mouth_sad": "MouthSad",
    "eyes_happy": "EyesHappy",
    "eyes_sad": "EyesSad",
    "eyes_wide": "EyesWide",
    "brow_up": "BrowUp",
    "brow_down": "BrowDown",
}

ACTIONS = {
    "idle": "Ally_Idle",
    "talking": "Ally_Talking",
    "listening": "Ally_Listening",
    "thinking": "Ally_Thinking",
    "happy": "Ally_Happy",
    "sad": "Ally_Sad",
}


def get_main_mesh():
    for obj in bpy.data.objects:
        if obj.type == "MESH" and "ally" in obj.name.lower():
            return obj
    for obj in bpy.data.objects:
        if obj.type == "MESH":
            return obj
    return None


def get_or_create_armature():
    for obj in bpy.data.objects:
        if obj.type == "ARMATURE":
            return obj

    bpy.ops.object.armature_add(enter_editmode=True)
    armature = bpy.context.active_object
    armature.name = "Ally_Armature"

    bone = armature.data.edit_bones["Bone"]
    bone.name = "Root"
    bone.head = Vector((0, 0, 0))
    bone.tail = Vector((0, 0, 0.5))

    body_bone = armature.data.edit_bones.new("Body")
    body_bone.head = Vector((0, 0, 0.5))
    body_bone.tail = Vector((0, 0, 1.0))
    body_bone.parent = bone

    head_bone = armature.data.edit_bones.new("Head")
    head_bone.head = Vector((0, 0, 1.0))
    head_bone.tail = Vector((0, 0, 1.5))
    head_bone.parent = body_bone

    bpy.ops.object.mode_set(mode="OBJECT")
    return armature


def ensure_shape_keys(mesh_obj):
    if mesh_obj.data.shape_keys is None:
        mesh_obj.shape_key_add(name="Basis", from_mix=False)

    existing_keys = [sk.name for sk in mesh_obj.data.shape_keys.key_blocks]

    for key_id, key_name in SHAPE_KEYS.items():
        if key_name not in existing_keys:
            sk = mesh_obj.shape_key_add(name=key_name, from_mix=False)
            sk.value = 0.0
            print(f"Created shape key: {key_name}")
        else:
            print(f"Shape key exists: {key_name}")

    return mesh_obj.data.shape_keys


def create_idle_animation(armature, mesh_obj):
    body_bone = armature.pose.bones.get("Body")
    if not body_bone:
        print("Warning: Body bone not found")
        return

    for frame in range(IDLE_CYCLE_FRAMES + 1):
        bpy.context.scene.frame_set(frame)
        progress = frame / IDLE_CYCLE_FRAMES
        angle = progress * 2 * math.pi

        bob_offset = math.sin(angle) * BOBBING_AMPLITUDE
        body_bone.location.z = bob_offset
        body_bone.keyframe_insert(data_path="location", index=2, frame=frame)

        breath_scale = 1.0 + math.sin(angle * 1.5) * BREATHING_SCALE
        body_bone.scale = Vector((breath_scale, breath_scale, breath_scale))
        body_bone.keyframe_insert(data_path="scale", frame=frame)

        sway = math.sin(angle * 0.5) * 0.01
        body_bone.location.x = sway
        body_bone.keyframe_insert(data_path="location", index=0, frame=frame)

    print(f"Created idle animation keyframes")


def create_talking_animation(armature, mesh_obj):
    shape_keys = mesh_obj.data.shape_keys
    if not shape_keys:
        print("Warning: No shape keys for talking animation")
        return

    mouth_open = shape_keys.key_blocks.get(SHAPE_KEYS["mouth_open"])
    if not mouth_open:
        print("Warning: MouthOpen shape key not found")
        return

    talk_frames = 60
    mouth_pattern = [0, 0.6, 0.3, 0.8, 0.2, 0.7, 0.1, 0.5, 0.4, 0.9, 0.2, 0.6]

    for i, value in enumerate(mouth_pattern):
        frame = int(i * (talk_frames / len(mouth_pattern)))
        mouth_open.value = value
        mouth_open.keyframe_insert(data_path="value", frame=frame)

    mouth_open.value = 0
    mouth_open.keyframe_insert(data_path="value", frame=talk_frames)

    print(f"Created talking animation keyframes")


def create_listening_animation(armature, mesh_obj):
    head_bone = armature.pose.bones.get("Head")
    body_bone = armature.pose.bones.get("Body")

    listen_frames = 90

    for frame in range(listen_frames + 1):
        bpy.context.scene.frame_set(frame)
        progress = frame / listen_frames
        angle = progress * 2 * math.pi

        if head_bone:
            head_bone.rotation_euler.z = math.sin(angle * 0.5) * 0.05
            head_bone.rotation_euler.x = 0.1
            head_bone.keyframe_insert(data_path="rotation_euler", frame=frame)

        if body_bone:
            body_bone.location.z = math.sin(angle) * 0.02
            body_bone.keyframe_insert(data_path="location", index=2, frame=frame)

    print(f"Created listening animation keyframes")


def create_thinking_animation(armature, mesh_obj):
    head_bone = armature.pose.bones.get("Head")
    body_bone = armature.pose.bones.get("Body")

    think_frames = 60

    for frame in range(think_frames + 1):
        bpy.context.scene.frame_set(frame)
        progress = frame / think_frames
        angle = progress * 2 * math.pi

        if head_bone:
            head_bone.rotation_euler.x = -0.15 + math.sin(angle * 2) * 0.05
            head_bone.rotation_euler.z = 0.1 + math.sin(angle) * 0.08
            head_bone.keyframe_insert(data_path="rotation_euler", frame=frame)

        if body_bone:
            body_bone.rotation_euler.z = math.sin(angle) * 0.03
            body_bone.keyframe_insert(data_path="rotation_euler", index=2, frame=frame)

    shape_keys = mesh_obj.data.shape_keys
    if shape_keys:
        eyes_wide = shape_keys.key_blocks.get(SHAPE_KEYS["eyes_wide"])
        brow_up = shape_keys.key_blocks.get(SHAPE_KEYS["brow_up"])

        if eyes_wide:
            eyes_wide.value = 0.3
            eyes_wide.keyframe_insert(data_path="value", frame=0)
            eyes_wide.keyframe_insert(data_path="value", frame=think_frames)

        if brow_up:
            for frame in range(think_frames + 1):
                progress = frame / think_frames
                brow_up.value = 0.2 + math.sin(progress * math.pi * 4) * 0.1
                brow_up.keyframe_insert(data_path="value", frame=frame)

    print(f"Created thinking animation keyframes")


def create_happy_animation(armature, mesh_obj):
    shape_keys = mesh_obj.data.shape_keys
    if not shape_keys:
        print("Warning: No shape keys for happy animation")
        return

    happy_frames = 90

    mouth_smile = shape_keys.key_blocks.get(SHAPE_KEYS["mouth_smile"])
    eyes_happy = shape_keys.key_blocks.get(SHAPE_KEYS["eyes_happy"])

    for frame in range(happy_frames + 1):
        progress = frame / happy_frames
        angle = progress * 2 * math.pi

        if mouth_smile:
            mouth_smile.value = 0.8 + math.sin(angle * 2) * 0.1
            mouth_smile.keyframe_insert(data_path="value", frame=frame)

        if eyes_happy:
            eyes_happy.value = 0.6 + math.sin(angle * 3) * 0.1
            eyes_happy.keyframe_insert(data_path="value", frame=frame)

    body_bone = armature.pose.bones.get("Body")
    if body_bone:
        for frame in range(happy_frames + 1):
            progress = frame / happy_frames
            angle = progress * 2 * math.pi
            body_bone.location.z = abs(math.sin(angle * 3)) * 0.08
            body_bone.keyframe_insert(data_path="location", index=2, frame=frame)

    print(f"Created happy animation keyframes")


def create_sad_animation(armature, mesh_obj):
    shape_keys = mesh_obj.data.shape_keys
    if not shape_keys:
        print("Warning: No shape keys for sad animation")
        return

    sad_frames = 120

    mouth_sad = shape_keys.key_blocks.get(SHAPE_KEYS["mouth_sad"])
    eyes_sad = shape_keys.key_blocks.get(SHAPE_KEYS["eyes_sad"])
    brow_down = shape_keys.key_blocks.get(SHAPE_KEYS["brow_down"])

    for frame in range(sad_frames + 1):
        progress = frame / sad_frames
        angle = progress * 2 * math.pi

        if mouth_sad:
            mouth_sad.value = 0.7 + math.sin(angle) * 0.1
            mouth_sad.keyframe_insert(data_path="value", frame=frame)

        if eyes_sad:
            eyes_sad.value = 0.6 + math.sin(angle * 0.5) * 0.1
            eyes_sad.keyframe_insert(data_path="value", frame=frame)

        if brow_down:
            brow_down.value = 0.4
            brow_down.keyframe_insert(data_path="value", frame=frame)

    body_bone = armature.pose.bones.get("Body")
    head_bone = armature.pose.bones.get("Head")

    if body_bone:
        for frame in range(sad_frames + 1):
            progress = frame / sad_frames
            angle = progress * 2 * math.pi
            body_bone.location.z = math.sin(angle * 0.5) * 0.02 - 0.03
            body_bone.keyframe_insert(data_path="location", index=2, frame=frame)

    if head_bone:
        for frame in range(sad_frames + 1):
            head_bone.rotation_euler.x = 0.15
            head_bone.keyframe_insert(data_path="rotation_euler", index=0, frame=frame)

    print(f"Created sad animation keyframes")


def export_for_web(filepath):
    bpy.ops.object.select_all(action="SELECT")

    bpy.ops.export_scene.gltf(
        filepath=filepath,
        export_format="GLB",
        export_animations=True,
        export_skins=True,
        export_morph=True,
        export_morph_normal=False,
        export_materials="EXPORT",
        export_colors=True,
        export_cameras=False,
        export_lights=False,
        export_apply=True,
        export_yup=True,
    )
    print(f"Exported to: {filepath}")


def main():
    print("\n" + "=" * 60)
    print("ALLY 3D CHARACTER ANIMATION SETUP")
    print("=" * 60 + "\n")

    bpy.context.scene.render.fps = FRAME_RATE

    mesh_obj = get_main_mesh()
    if not mesh_obj:
        print("ERROR: No mesh object found!")
        return
    print(f"Found mesh: {mesh_obj.name}")

    armature = get_or_create_armature()
    print(f"Using armature: {armature.name}")

    print("\nSetting up shape keys...")
    ensure_shape_keys(mesh_obj)

    print("\nCreating animations...")
    create_idle_animation(armature, mesh_obj)
    create_talking_animation(armature, mesh_obj)
    create_listening_animation(armature, mesh_obj)
    create_thinking_animation(armature, mesh_obj)
    create_happy_animation(armature, mesh_obj)
    create_sad_animation(armature, mesh_obj)

    print("\n" + "=" * 60)
    print("ANIMATION SETUP COMPLETE!")
    print("=" * 60)

    export_path = (
        "/Applications/Github/ai-google-calendar-assistant/fe/public/ally-3d.glb"
    )
    print(f"\nExporting to {export_path}...")
    export_for_web(export_path)


if __name__ == "__main__":
    main()
