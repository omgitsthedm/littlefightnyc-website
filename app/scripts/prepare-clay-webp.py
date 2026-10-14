"""Lossless delivery copies of the approved PNGs; verify every decoded RGBA pixel.

Run locally with cwebp and ImageMagick installed. Builds use the checked-in
derivatives and need neither tool. Original masters remain unchanged.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import subprocess

APP = Path(__file__).resolve().parents[1]
SOURCE = APP / 'public/assets/clay-png'
DEST = APP / 'public/assets/clay-webp'
DEST.mkdir(exist_ok=True)


def convert(source):
    destination = DEST / (source.stem + '.webp')
    subprocess.run(['cwebp', '-quiet', '-lossless', '-exact', '-m', '6',
                    str(source), '-o', str(destination)], check=True)
    def pixels(file):
        return subprocess.check_output(['magick', str(file), '-depth', '8', 'rgba:-'])
    if pixels(source) != pixels(destination):
        raise RuntimeError(f'Lossless pixel verification failed: {source.name}')
    return source.stat().st_size, destination.stat().st_size


with ThreadPoolExecutor(max_workers=4) as pool:
    sizes = list(pool.map(convert, sorted(SOURCE.glob('*.png'))))

manifest_path = APP / 'preview-content/clay-library.json'
manifest = json.loads(manifest_path.read_text())
for asset in manifest['assets'].values():
    asset['webpVariants'] = []
    for original in asset['variants']:
        file = DEST / (Path(original['file']).stem + '.webp')
        asset['webpVariants'].append({
            'file': file.name, 'width': original['width'], 'height': original['height'],
            'bytes': file.stat().st_size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(),
        })
manifest['deliveryFormat'] = 'Lossless RGBA WebP; decoded pixels identical to PNG masters'
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')
before, after = map(sum, zip(*sizes))
print(json.dumps({'files': len(sizes), 'pngBytes': before, 'webpBytes': after,
                  'savedPercent': round(100 * (1 - after / before), 1), 'rgbaPixelEquality': True}))
