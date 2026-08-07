import json
import struct

glb_path = r"c:\Users\palar\OneDrive\Desktop\digital-twin-health-ai\frontend\aura-health\public\human_anatomy.glb"

with open(glb_path, "rb") as f:
    magic, version, length = struct.unpack("<4sII", f.read(12))
    chunk_length, chunk_type = struct.unpack("<II", f.read(8))
    json_data = f.read(chunk_length)
    gltf = json.loads(json_data.decode("utf-8"))

print("Nodes in GLB:")
for i, node in enumerate(gltf.get("nodes", [])):
    name = node.get("name", f"unnamed_{i}")
    mesh_idx = node.get("mesh")
    print(f"Node {i}: name='{name}', mesh={mesh_idx}")

print("\nMeshes in GLB:")
for i, mesh in enumerate(gltf.get("meshes", [])):
    name = mesh.get("name", f"unnamed_{i}")
    print(f"Mesh {i}: name='{name}'")

print("\nMaterials in GLB:")
for i, mat in enumerate(gltf.get("materials", [])):
    name = mat.get("name", f"unnamed_{i}")
    print(f"Material {i}: name='{name}'")
