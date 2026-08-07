import json
import struct

glb_path = r"c:\Users\palar\OneDrive\Desktop\digital-twin-health-ai\frontend\aura-health\public\human_anatomy.glb"

with open(glb_path, "rb") as f:
    magic, version, length = struct.unpack("<4sII", f.read(12))
    chunk_length, chunk_type = struct.unpack("<II", f.read(8))
    json_data = f.read(chunk_length)
    gltf = json.loads(json_data.decode("utf-8"))

print("Materials detail:")
print(json.dumps(gltf.get("materials", []), indent=2))
print("Textures detail:")
print(json.dumps(gltf.get("textures", []), indent=2))
print("Images count:", len(gltf.get("images", [])))
