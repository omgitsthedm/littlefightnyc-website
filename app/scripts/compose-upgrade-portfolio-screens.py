"""Project authenticated current-production captures into existing physical devices.

This keeps every source capture in the public provenance manifest. The only
image operations are an explicit viewport crop, uniform scaling, perspective
projection, and the existing device aperture mask.
"""
from pathlib import Path
from PIL import Image, ImageChops
import hashlib
import json
import numpy as np

APP = Path(__file__).resolve().parents[1]
ROOT = APP.parent
CAPTURES = APP / 'public/assets/portfolio-upgrade-20261009'
FRAMES = ROOT / '.lifi/design-source/sculpture/website-devices'
RECEIPT = ROOT / '.lifi/design-source/sculpture/screen-composites.json'
OUT = APP / 'public/assets/sculpture'

jobs = (
    {'name': 'website-the-tarot-hotline', 'device': 'duo', 'source': 'the-tarot-hotline-desktop'},
    {'name': 'browser-after-hours-agenda', 'device': 'desktop', 'source': 'after-hours-agenda-desktop'},
    {'name': 'browser-venuecircuit', 'device': 'desktop', 'source': 'venuecircuit-desktop', 'crop': [0, 0, 1440, 1000]},
)

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

manifest = json.loads((CAPTURES / 'provenance.json').read_text())
sources = {record['key']: record for record in manifest['captures']}
receipts = json.loads(RECEIPT.read_text())

for job in jobs:
    source = sources[job['source']]
    source_path = CAPTURES / source['file']
    if digest(source_path) != source['sha256']:
        raise ValueError(f"Capture failed integrity: {source['file']}")
    original = Image.open(source_path).convert('RGBA')
    device = job['device']
    frame = Image.open(FRAMES / f'{device}-frame.png').convert('RGBA')
    mask_name = 'desktop-frame-aperture-mask.png' if device == 'desktop' else f'{device}-frame-mask.png'
    mask_image = Image.open(FRAMES / mask_name).convert('RGBA')
    mask = ImageChops.multiply(mask_image.getchannel('R'), mask_image.getchannel('A'))
    metadata = json.loads((FRAMES / f'{device}-frame.json').read_text())
    quad = metadata.get('screenQuadrilateral') or metadata['quad']
    if isinstance(quad, dict):
        quad = [quad[key] for key in ('TL', 'TR', 'BR', 'BL')]
    aspect = metadata.get('screenAspect') or metadata.get('physicalScreenAspectRatio')
    if not aspect or frame.size != mask.size:
        raise ValueError(f'Invalid {device} frame set')
    crop = job.get('crop') or [0, 0, original.width, original.height]
    available = original.crop(crop)
    width = available.width
    height = round(width / aspect)
    if available.height >= height:
        crop = [crop[0], crop[1], crop[2], crop[1] + height]
    else:
        width = round(available.height * aspect)
        left = crop[0] + (available.width - width) // 2
        crop = [left, crop[1], left + width, crop[3]]
        width = original.crop(crop).width
        height = original.crop(crop).height
    capture = original.crop(crop).resize((width, height), Image.Resampling.LANCZOS)
    matrix = []
    vector = []
    for (x, y), (u, v) in zip(quad, ((0, 0), (width, 0), (width, height), (0, height))):
        matrix.extend(((x, y, 1, 0, 0, 0, -u * x, -u * y), (0, 0, 0, x, y, 1, -v * x, -v * y)))
        vector.extend((u, v))
    coeff = np.linalg.solve(np.array(matrix), np.array(vector))
    warped = capture.transform(frame.size, Image.Transform.PERSPECTIVE, coeff, Image.Resampling.BICUBIC)
    warped.putalpha(ImageChops.multiply(warped.getchannel('A'), mask))
    result = Image.alpha_composite(frame, warped)
    bounds = result.getbbox()
    padding = 12
    bounds = (max(0, bounds[0] - padding), max(0, bounds[1] - padding), min(result.width, bounds[2] + padding), min(result.height, bounds[3] + padding))
    result = result.crop(bounds)
    target = OUT / f"{job['name']}.webp"
    result.save(target, 'WEBP', quality=91, method=6)
    receipts = [receipt for receipt in receipts if receipt['name'] != job['name']]
    receipts.append({
        'name': job['name'],
        'source': f"public/assets/portfolio-upgrade-20261009/{source['file']}",
        'sourceSha256': source['sha256'],
        'crop': crop,
        'frame': device,
        'frameSource': f".lifi/design-source/sculpture/website-devices/{device}-frame.png",
        'frameSha256': digest(FRAMES / f'{device}-frame.png'),
        'screenQuadrilateral': quad,
        'screenAspect': aspect,
        'safeAreaPixels': {'top': 0, 'bottom': 0},
        'outputSize': result.size,
        'outputSha256': digest(target),
        'method': 'Authentic current-production capture, explicit viewport crop, uniform scaling and deterministic perspective within the existing physical device frame; no generated client pixels.'
    })
    print(f"{job['name']}: {result.size}, crop {crop}")

RECEIPT.write_text(json.dumps(receipts, indent=2) + '\n')
