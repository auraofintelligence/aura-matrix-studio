"""Aura Matrix Studio explainer importer. Run in Blender's Scripting workspace.

Creates a NEW scene. Never deletes or replaces another scene.
For automation: blender --background --python tools/blender_import.py -- explainer.json output.blend
Original work: Luke Nathan Hayes / Strange But True / Aura of Intelligence.
"""
import json
import math
import sys

ROWS, COLS = 12, 24
SHELLS = [('Red', '#e23a2e'), ('Orange', '#f2801f'), ('Yellow', '#edc119'),
          ('Green', '#35a24f'), ('Blue', '#2f6fed'), ('Indigo', '#5546c8'), ('Violet', '#9a4fd6')]
PRESETS = {
    'flat': (0, 0, 0, 0, 0), 'tube': (1, 0, 0, 0, 0), 'ring': (1, 1, 0, 0, 0),
    'horn': (1, 1, 1, 0, 0), 'nested': (1, 1, 1, 1, 0), 'body': (1, 1, 1, 1, 1)
}
CAMERAS = {'front': (0, 0), 'quarter': (.55, .4), 'top': (0, 1.5)}


def validate(data):
    if data.get('format') != 'aura-explainer/1' or data.get('lattice') != 'aura-lattice/1.0.0' or data.get('rows') != ROWS or data.get('columns') != COLS:
        raise ValueError('This importer requires an Aura explainer with the fixed 12 x 24 matrix.')
    if type(data.get('shell')) is not int or not 0 <= data['shell'] <= 6:
        raise ValueError('Invalid selected shell.')
    if not isinstance(data.get('story'), list) or not data['story']:
        raise ValueError('The explainer has no shots.')
    for shot in data['story']:
        if shot.get('preset') not in PRESETS or shot.get('camera') not in CAMERAS:
            raise ValueError('Unknown shape or camera.')
        duration = shot.get('duration')
        if not isinstance(duration, (int, float)) or not math.isfinite(duration) or not 1 <= duration <= 120:
            raise ValueError('Shot duration must be 1 to 120 seconds.')
        if not isinstance(shot.get('caption'), str) or len(shot['caption']) > 700:
            raise ValueError('Invalid caption.')
    return data


def pose_at(story, time):
    time = max(0, min(time, sum(s['duration'] for s in story)))
    begin, index = 0, 0
    for i, shot in enumerate(story):
        index = i
        if time < begin + shot['duration'] or i == len(story) - 1:
            break
        begin += shot['duration']
    shot, previous = story[index], story[max(0, index - 1)]
    t = max(0, min(1, (time - begin) / min(3, shot['duration'] * .65)))
    t = t * t * (3 - 2 * t)
    pose = [a + (b - a) * t for a, b in zip(PRESETS[previous['preset']], PRESETS[shot['preset']])]
    camera = [a + (b - a) * t for a, b in zip(CAMERAS[previous['camera']], CAMERAS[shot['camera']])]
    return pose, camera


def point(u, v, pose):
    curl, ring, pinch, nest, arrange = pose
    tau = 2 * math.pi
    radius, axial = ROWS / tau, COLS + (ROWS - COLS) * pinch
    av, au = curl * tau, ring * tau
    t = ROWS / av * math.sin((v - 1) * av) if av > 1e-6 else (v - 1) * ROWS
    g = ROWS / av * (1 - math.cos((v - 1) * av)) if av > 1e-6 else 0
    dr, y = g - radius * curl, -(t + ROWS / 2 * (1 - curl))
    if au <= 1e-6:
        return ((u - .5) * axial, y, dr)
    rho, psi = axial / au, (u - .5) * au
    return ((rho + dr) * math.sin(psi), y, (rho + dr) * math.cos(psi) - rho + axial / tau * ring)


def shell_point(u, v, pose, shell):
    x, y, z = point(u, v, pose)
    nest, arrange = pose[3:]
    scale = 1 + (((shell + 1) / 7 + (.44 - (shell + 1) / 7) * arrange) - 1) * nest
    return x * scale, y * scale + (shell - 3) * 2.3 * arrange * nest, z * scale


def to_blender(xyz):
    # Source Y-up to Blender Z-up, preserving handedness.
    x, y, z = xyz
    return x, -z, y


def create_scene(data):
    import bpy
    from mathutils import Vector
    validate(data)
    scene = bpy.data.scenes.new('Aura Matrix Explainer')
    if bpy.context.window:
        bpy.context.window.scene = scene
    scene['aura_lattice'] = 'aura-lattice/1.0.0'
    scene['source_explainer'] = json.dumps(data)
    scene.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [x.identifier for x in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'CYCLES'
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.render.resolution_percentage = 100
    scene.render.fps = 24
    scene.frame_start = 1
    scene.frame_end = round(sum(s['duration'] for s in data['story']) * 24) + 1
    world = bpy.data.worlds.new('Aura paper world')
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes['Background'].inputs['Color'].default_value = (.8, .82, .78, 1)
    world.node_tree.nodes['Background'].inputs['Strength'].default_value = .6
    samples = sorted(set([1, scene.frame_end] + list(range(1, scene.frame_end + 1, 4))))
    # Include exact shot boundaries as well as six sampled poses per second.
    start = 0
    for i, shot in enumerate(data['story']):
        samples.extend([round(start * 24) + 1, round((start + min(3, shot['duration'] * .65)) * 24) + 1])
        marker = scene.timeline_markers.new(f'{i+1}. {shot["caption"][:80]}', frame=round(start * 24) + 1)
        start += shot['duration']
    samples = sorted(set(samples))
    uv = [(c / COLS, r / ROWS) for r in range(ROWS + 1) for c in range(COLS + 1)]
    faces = [(r * 25 + c, r * 25 + c + 1, (r + 1) * 25 + c + 1, (r + 1) * 25 + c) for r in range(ROWS) for c in range(COLS)]
    pose, _ = pose_at(data['story'], 0)
    for shell, (name, colour) in enumerate(SHELLS):
        mesh = bpy.data.meshes.new(f'{name} 12x24 lattice')
        mesh.from_pydata([to_blender(shell_point(u, v, pose, shell)) for u, v in uv], [], faces)
        mesh.update()
        cell_attr = mesh.attributes.new(name='aura_cell', type='INT', domain='FACE')
        for i, cell in enumerate(cell_attr.data):
            cell.value = i + 1
        obj = bpy.data.objects.new(f'Aura {name}', mesh)
        scene.collection.objects.link(obj)
        obj['rows'], obj['columns'], obj['shell'] = ROWS, COLS, name
        obj['address_convention'] = f'{name} I1..I288 / O1..O288'
        material = bpy.data.materials.new(f'Aura {name} colour')
        rgba = tuple(int(colour[i:i+2], 16) / 255 for i in (1, 3, 5)) + (1,)
        material.diffuse_color = rgba
        material.use_nodes = True
        material.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = rgba
        material.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value = .5
        mesh.materials.append(material)
        # Wire surfaces keep all seven nested matrices visible without opacity sorting.
        wire = obj.modifiers.new('Address grid', 'WIREFRAME')
        wire.thickness = .022
        wire.use_replace = True
        obj.shape_key_add(name='Basis')
        keys = mesh.shape_keys
        keys.use_relative = False
        for frame in samples:
            pose, _ = pose_at(data['story'], (frame - 1) / 24)
            if frame == 1:
                key = keys.key_blocks[0]
            else:
                key = obj.shape_key_add(name=f'Pose {frame:05d}')
            key.interpolation = 'KEY_LINEAR'
            for i, (u, v) in enumerate(uv):
                key.data[i].co = to_blender(shell_point(u, v, pose, shell))
            keys.eval_time = key.frame
            keys.keyframe_insert(data_path='eval_time', frame=frame)
            obj.hide_render = obj.hide_viewport = pose[3] <= .001 and shell != data['shell']
            obj.keyframe_insert(data_path='hide_render', frame=frame)
            obj.keyframe_insert(data_path='hide_viewport', frame=frame)
    camera_data = bpy.data.cameras.new('Aura explainer camera')
    camera = bpy.data.objects.new('Aura explainer camera', camera_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera_data.type = 'PERSP'
    camera_data.sensor_fit = 'VERTICAL'
    camera_data.sensor_height = 24
    camera_data.lens = 24 / (2 * math.tan(math.radians(18)))
    camera_data.clip_end = 300
    for frame in samples:
        pose, (theta, phi) = pose_at(data['story'], (frame - 1) / 24)
        size = max(9, 24 * (1 - pose[1]) + 13 * pose[1], 20 * pose[4])
        distance = max(size / 1.65 * 1.85, 31 * pose[4])
        camera.location = to_blender((math.sin(theta) * math.cos(phi) * distance, math.sin(phi) * distance, math.cos(theta) * math.cos(phi) * distance))
        camera.rotation_euler = (-Vector(camera.location)).to_track_quat('-Z', 'Y').to_euler()
        camera.keyframe_insert(data_path='location', frame=frame)
        camera.keyframe_insert(data_path='rotation_euler', frame=frame)
    light_data = bpy.data.lights.new('Aura soft light', type='AREA')
    light_data.energy, light_data.shape, light_data.size = 1800, 'DISK', 12
    light = bpy.data.objects.new('Aura soft light', light_data)
    scene.collection.objects.link(light)
    light.location = (0, -10, 14)
    light.rotation_euler = (-Vector(light.location)).to_track_quat('-Z', 'Y').to_euler()
    scene.frame_set(1)
    return scene


def main():
    import bpy
    if '--' in sys.argv:
        args = sys.argv[sys.argv.index('--') + 1:]
        with open(args[0], encoding='utf-8') as file:
            scene = create_scene(json.load(file))
        if len(args) > 1:
            bpy.ops.wm.save_as_mainfile(filepath=args[1])
        print(f'AURA_IMPORT_OK: {len(scene.objects)} objects; {scene.frame_end} frames; 7 x 288 fixed cells')
        return
    from bpy.props import StringProperty
    from bpy_extras.io_utils import ImportHelper

    class AURA_OT_import_explainer(bpy.types.Operator, ImportHelper):
        bl_idname = 'aura.import_matrix_explainer'
        bl_label = 'Import Aura explainer into a new scene'
        filename_ext = '.json'
        filter_glob: StringProperty(default='*.json', options={'HIDDEN'})

        def execute(self, context):
            try:
                with open(self.filepath, encoding='utf-8') as file:
                    create_scene(json.load(file))
                self.report({'INFO'}, 'Aura animation created in a new scene.')
                return {'FINISHED'}
            except (ValueError, KeyError, OSError) as error:
                self.report({'ERROR'}, str(error))
                return {'CANCELLED'}

    existing = getattr(bpy.types, 'AURA_OT_import_explainer', None)
    if existing:
        bpy.utils.unregister_class(existing)
    bpy.utils.register_class(AURA_OT_import_explainer)
    bpy.ops.aura.import_matrix_explainer('INVOKE_DEFAULT')


if __name__ == '__main__':
    main()
