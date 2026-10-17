"""High-quality lossy delivery copies of the approved transparent PNGs.

Run locally with cwebp and ImageMagick installed. Builds use the checked-in
derivatives and need neither tool. Original PNG masters remain unchanged.

Colour is encoded at quality 85 (raised to 90 or 95 only where a file needs it) with sharp RGB->YUV conversion; the alpha
channel is kept at full quality so cut-out edges stay clean. Every file is
checked against its master: identical dimensions, colour PSNR >= 38 dB and
alpha PSNR >= 45 dB. A 1152w delivery size is added between 768w and the
native master so a 420px tile on a 2x screen no longer downloads the
full-size file.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import hashlib
import json
import subprocess
import tempfile

APP = Path(__file__).resolve().parents[1]
SOURCE = APP / 'public/assets/clay-png'
DEST = APP / 'public/assets/clay-webp'
DEST.mkdir(exist_ok=True)
QUALITIES = ('85', '90', '95')
EXTRA_WIDTH = 1152
MIN_COLOR_PSNR = 38.0
MIN_ALPHA_PSNR = 45.0


def psnr(reference, candidate, channel):
    result = subprocess.run(['magick', 'compare', '-channel', channel, '-metric', 'PSNR',
                             str(reference), str(candidate), 'null:'],
                            capture_output=True, text=True)
    value = result.stderr.split()[0]
    return float('inf') if value in ('inf', '0') else float(value)


def encode_once(source_png, destination, quality):
    subprocess.run(['cwebp', '-quiet', '-q', quality, '-alpha_q', '100', '-sharp_yuv', '-m', '6',
                    str(source_png), '-o', str(destination)], check=True)
    with tempfile.TemporaryDirectory() as tmp:
        decoded = Path(tmp) / 'decoded.png'
        subprocess.run(['dwebp', '-quiet', str(destination), '-o', str(decoded)], check=True)
        size = lambda f: subprocess.check_output(['magick', 'identify', '-format', '%wx%h', str(f)]).decode()
        if size(source_png) != size(decoded):
            raise RuntimeError(f'Dimension mismatch: {destination.name}')
        # Colour is judged as seen: both images composited on mid grey, so
        # RGB hidden under fully transparent pixels does not count.
        flat = []
        for name, file in (('ref', source_png), ('out', decoded)):
            target = Path(tmp) / f'{name}-flat.png'
            subprocess.run(['magick', str(file), '-background', 'gray50', '-alpha', 'remove',
                            '-alpha', 'off', str(target)], check=True)
            flat.append(target)
        return psnr(*flat, 'RGB'), psnr(source_png, decoded, 'A')


def encode(source_png, destination):
    # Small, dense variants can need more bits; step quality up only as far
    # as the fidelity floor requires.
    for quality in QUALITIES:
        color, alpha = encode_once(source_png, destination, quality)
        if color >= MIN_COLOR_PSNR and alpha >= MIN_ALPHA_PSNR:
            return color, alpha
    raise RuntimeError(f'Quality check failed for {destination.name}: RGB {color:.1f} dB, alpha {alpha:.1f} dB')


def convert(source):
    color, alpha = encode(source, DEST / (source.stem + '.webp'))
    return source.name, source.stat().st_size, (DEST / (source.stem + '.webp')).stat().st_size, color, alpha


def convert_extra(master_name):
    master = SOURCE / master_name
    destination = DEST / (Path(master_name).stem + f'-{EXTRA_WIDTH}.webp')
    with tempfile.TemporaryDirectory() as tmp:
        resized = Path(tmp) / 'resized.png'
        subprocess.run(['magick', str(master), '-filter', 'Lanczos', '-resize', f'{EXTRA_WIDTH}x',
                        str(resized)], check=True)
        color, alpha = encode(resized, destination)
        height = int(subprocess.check_output(['magick', 'identify', '-format', '%h', str(resized)]))
    return master_name, height, color, alpha


manifest_path = APP / 'preview-content/clay-library.json'
manifest = json.loads(manifest_path.read_text())
masters = {asset['variants'][-1]['file']: asset for asset in manifest['assets'].values()}

with ThreadPoolExecutor(max_workers=4) as pool:
    sizes = list(pool.map(convert, sorted(SOURCE.glob('*.png'))))
    extras = {name: (height, color, alpha) for name, height, color, alpha in pool.map(
        convert_extra, sorted(name for name, asset in masters.items()
                              if asset['variants'][-1]['width'] > EXTRA_WIDTH))}

for master_name, asset in masters.items():
    asset['webpVariants'] = []
    for original in asset['variants']:
        if original is asset['variants'][-1] and master_name in extras:
            file = DEST / (Path(master_name).stem + f'-{EXTRA_WIDTH}.webp')
            asset['webpVariants'].append({
                'file': file.name, 'width': EXTRA_WIDTH, 'height': extras[master_name][0],
                'bytes': file.stat().st_size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(),
            })
        file = DEST / (Path(original['file']).stem + '.webp')
        asset['webpVariants'].append({
            'file': file.name, 'width': original['width'], 'height': original['height'],
            'bytes': file.stat().st_size, 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(),
        })
manifest['deliveryFormat'] = ('Lossy RGBA WebP (quality 85, raised to 90/95 where needed; full-quality alpha); '
                              f'colour PSNR >= {MIN_COLOR_PSNR:g} dB and alpha PSNR >= {MIN_ALPHA_PSNR:g} dB '
                              'against the PNG masters, which remain unchanged')
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')

before = sum(s[1] for s in sizes)
after = sum(s[2] for s in sizes)
checks = [(s[3], s[4]) for s in sizes] + [(c, a) for _, c, a in extras.values()]
print(json.dumps({'files': len(sizes), 'extraVariants': len(extras), 'pngBytes': before, 'webpBytes': after,
                  'savedPercent': round(100 * (1 - after / before), 1),
                  'minColorPsnr': round(min(c for c, _ in checks), 2),
                  'minAlphaPsnr': round(min(a for _, a in checks), 2)}))
