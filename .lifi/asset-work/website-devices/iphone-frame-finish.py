"""Crop matching iPhone frame and mask exports without changing their pixels."""
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent
raw = ROOT / "iphone-frame-raw.png"
raw_mask = ROOT / "iphone-frame-screen-mask-raw.png"
frame = ROOT / "iphone-frame.png"
mask = ROOT / "iphone-frame-screen-mask.png"
render_meta = ROOT / "iphone-frame-render.json"
meta = ROOT / "iphone-frame.json"

data = json.loads(render_meta.read_text())
left, top, right, bottom = data["render"]["crop"]
for source, output in ((raw, frame), (raw_mask, mask)):
    with Image.open(source) as image:
        image.crop((left, top, right, bottom)).save(output)

for point in data["screenQuadrilateral"]:
    point[0] = round(point[0] - left, 3)
    point[1] = round(point[1] - top, 3)
with Image.open(frame) as image:
    frame_size = list(image.size)
with Image.open(mask) as image:
    mask_size = list(image.size)
data["render"]["size"] = frame_size
data["screenMask"] = {"path": mask.name, "size": mask_size}
meta.write_text(json.dumps(data, indent=2) + "\n")
print(json.dumps({"frame": str(frame), "mask": str(mask), "meta": str(meta), "size": frame_size, "quad": data["screenQuadrilateral"]}))
