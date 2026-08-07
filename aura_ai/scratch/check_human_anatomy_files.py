import os
import struct

paths = [
    r"c:\Users\palar\OneDrive\Desktop\digital-twin-health-ai\._human_anatomy.glb",
    r"c:\Users\palar\OneDrive\Desktop\digital-twin-health-ai\human_anatomy.glb",
    r"c:\Users\palar\OneDrive\Desktop\digital-twin-health-ai\frontend\aura-health\public\human_anatomy.glb"
]

for p in paths:
    if os.path.exists(p):
        size = os.path.getsize(p)
        print(f"File exists: {p} (size={size} bytes)")
        with open(p, "rb") as f:
            header = f.read(12)
            if len(header) >= 12:
                magic, version, length = struct.unpack("<4sII", header)
                print(f"   Header magic: {magic}, version: {version}, length: {length}")
    else:
        print(f"File DOES NOT exist: {p}")
