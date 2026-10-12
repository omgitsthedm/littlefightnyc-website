"""Prepare responsive, lossless PNG delivery from the approved transparent masters.

Run manually with the Desktop library path. Site builds need only the manifest
and prepared assets, not ImageMagick or access to the owner's Desktop.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import shutil
import struct
import subprocess
import sys

APP = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
destination = APP / 'public/assets/clay-png'
destination.mkdir(parents=True, exist_ok=True)
provenance = json.loads((source / 'prompts.json').read_text())
items = provenance['items']
fronts = {asset['id']: asset for asset in provenance['delivery']['heroLivingLoop']['assets']}
overrides = {'object-printer': 'hero-printer-front', 'object-router': 'hero-router-front'}
coverage = json.loads((source / 'tile-coverage.json').read_text())
# Small pictograms and review stars retain their original vector artwork.
needed = {asset for tile in coverage for asset in tile['assets']
          if asset.startswith('object-') or asset in {'symbol-browser', 'symbol-tugboat'}}
needed.add('object-operating-system')

def prepare(item):
    name = item['id']
    master = fronts[overrides[name]] if name in overrides else item
    original = source / master['file']
    data = original.read_bytes()
    width, height = struct.unpack('>II', data[16:24])
    assert data[:8] == b'\x89PNG\r\n\x1a\n' and data[25] == 6, name
    assert hashlib.sha256(data).hexdigest() == master['sha256'], name
    large = item['kind'] == 'object' or name in {'symbol-browser', 'symbol-tugboat'}
    widths = [384, 768, width] if large else [192, 384, 768]
    widths = sorted(set(min(w, width) for w in widths))
    variants = []
    for size in widths:
        filename = name + ('' if size == widths[-1] else '-' + str(size)) + '.png'
        target = destination / filename
        if size == width:
            shutil.copy2(original, target)
        else:
            subprocess.run(['magick', str(original), '-resize', str(size) + 'x>',
                            '-strip', '-define', 'png:color-type=6',
                            '-define', 'png:compression-level=9', str(target)], check=True)
        output = target.read_bytes()
        w, h = struct.unpack('>II', output[16:24])
        assert output[25] == 6 and w == size, filename
        variants.append({'file': filename, 'width': w, 'height': h,
                         'bytes': len(output), 'sha256': hashlib.sha256(output).hexdigest()})
    return name, {'sourceWidth': width, 'sourceHeight': height,
                  'sourceFile': master['file'], 'sourceSha256': master['sha256'], 'variants': variants}

selected = [item for item in items if item['id'] in needed]
assert {item['id'] for item in selected} == needed
with ThreadPoolExecutor(max_workers=4) as pool:
    if len(sys.argv) > 2:
        selected = [item for item in selected if item['id'] in sys.argv[2:]]
        assets = json.loads((APP / 'preview-content/clay-library.json').read_text())['assets']
        assets.update(pool.map(prepare, selected))
    else:
        assets = dict(pool.map(prepare, selected))
manifest = {'format': 'RGBA PNG', 'artworkEdited': False,
            'resampling': 'Downsampled delivery sizes; full masters retained in the Desktop library.',
            'assets': assets}
(APP / 'preview-content/clay-library.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps({'assets': len(assets), 'pngFiles': sum(len(a['variants']) for a in assets.values()),
                  'bytes': sum(v['bytes'] for a in assets.values() for v in a['variants'])}))
