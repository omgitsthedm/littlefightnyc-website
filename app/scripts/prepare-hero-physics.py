"""Place approved capture pixels into the two independent physical hero displays.

Only screenshot crops, uniform resizing and screen-plane projection are applied.
Physical frame pixels remain the selected generated asset, never a code drawing.
"""
from pathlib import Path
import json
import sys
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageChops
from approved_screens import APP, LIBRARY, selected_originals, sha256

ROOT = APP.parent
WORK = ROOT / '.lifi/asset-work/hero-physics'
PUBLIC = APP / 'public/assets/sculpture'
SOURCES = selected_originals()
PLAN = json.loads((WORK / 'screens.json').read_text())
receipt_path = ROOT / '.lifi/design-source/sculpture/screen-composites.json'
receipts = json.loads(receipt_path.read_text())
selected = set(sys.argv[1:])

def projection(layer, size, quad):
    matrix, values = [], []
    for (x, y), (u, v) in zip(quad, [(0,0),(layer.width,0),(layer.width,layer.height),(0,layer.height)]):
        matrix.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]])
        values.extend([u,v])
    coefficients = np.linalg.solve(np.array(matrix), np.array(values))
    return layer.transform(size, Image.Transform.PERSPECTIVE, coefficients, Image.Resampling.BICUBIC)

for record in PLAN:
    if selected and record['name'] not in selected:
        continue
    source = SOURCES[record['sourceKey']]
    frame_path = WORK / record['frameFile']
    frame = Image.open(frame_path).convert('RGBA')
    original = Image.open(source['path']).convert('RGBA')
    size = tuple(record['screenSize'])
    # ImageOps.fit has ONE scale for both axes. It crops surplus pixels; it
    # cannot make a building, face, typeface or logo wider than its source.
    screen = ImageOps.fit(original, size, Image.Resampling.LANCZOS, centering=(.5,0))
    mask = Image.new('L', size)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,size[0]-1,size[1]-1), radius=record['cornerRadius'], fill=255)
    screen.putalpha(mask)
    projected = Image.new('RGBA', frame.size)
    if record.get('halves'):
        half = size[0] // 2
        for crop, quad in zip([(0,0,half,size[1]),(half,0,size[0],size[1])], record['halves']):
            projected.alpha_composite(projection(screen.crop(crop), frame.size, quad))
    else:
        projected.alpha_composite(projection(screen, frame.size, record['quad']))
    if record.get('apertureMask'):
        # This mask is the selected frame's actual glass opening, extracted
        # from its blank screen. It preserves the physical rounded edge.
        aperture = Image.open(WORK / record['apertureMask']).convert('L')
        projected.putalpha(ImageChops.multiply(projected.getchannel('A'), aperture))
    frame.alpha_composite(projected)
    crop = tuple(record['frameCrop'])
    frame = frame.crop(crop)
    output = PUBLIC / (record['name'] + '.webp')
    frame.save(output, 'WEBP', quality=94, method=6)
    frame.save(WORK / (record['name'] + '.png'))
    receipt = {
        'name':record['name'], 'frame':'independent-hero-display',
        'source':str(source['path']), 'sourceSha256':source['sha256'],
        'frameSource':str(frame_path.relative_to(ROOT)), 'frameSourceSha256':sha256(frame_path),
        'screenSize':record['screenSize'], 'screenMapping':record.get('halves',record.get('quad')),
        'sourceSize':list(original.size), 'frameCrop':record['frameCrop'],
        'apertureMask':record.get('apertureMask'),
        'apertureMaskSha256':sha256(WORK / record['apertureMask']) if record.get('apertureMask') else None,
        'outputSize':list(frame.size), 'outputSha256':sha256(output),
        'method':'One uniform source-pixel scale and crop, then projection onto the physical screen. No generated client content, reconstructed client UI, recoloring or nonuniform screenshot resize.'
    }
    receipts = [item for item in receipts if item['name'] != record['name']] + [receipt]
    print(record['name'], list(frame.size), 'approved:',source['key'])
receipt_path.write_text(json.dumps(receipts, indent=2)+'\n')
