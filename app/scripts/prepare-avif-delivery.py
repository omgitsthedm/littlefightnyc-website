"""AVIF delivery copies for the clay artwork, plus 1152w hero sizes for phones.

Run locally with avifenc, cwebp and ImageMagick installed. Builds use the
checked-in files and need none of these tools.

- Tile art: an .avif beside every public/assets/clay-webp/*.webp, encoded from
  the unchanged PNG master (the 1152w size is resized from the native master).
- Hero art (public/assets/clay-library): a 1152w WebP where the native file is
  wider, and an .avif for every size, encoded from the delivered native file.

Every AVIF is checked against its source: identical dimensions, colour PSNR
>= 38 dB (composited on mid grey) and alpha PSNR >= 45 dB. Quality steps up
from 70 only as far as a file needs. Browsers that cannot decode AVIF keep
receiving the WebP through <picture>.
"""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import subprocess
import tempfile

APP = Path(__file__).resolve().parents[1]
CLAY_PNG = APP / 'public/assets/clay-png'
CLAY_WEBP = APP / 'public/assets/clay-webp'
CLAY_AVIF = APP / 'public/assets/clay-avif'
HERO = APP / 'public/assets/clay-library'
HERO_ASSETS = ['hero-diorama-clean', 'hero-browser-wide', 'rachel-clay-portrait-yellow', 'hero-cat-poses',
               'hero-pigeon-poses', 'hero-small-props', 'hero-printer-front', 'hero-router-front',
               'environment-cloud-cumulus', 'environment-cloud-wisp']
EXTRA = 1152
QUALITIES = (70, 80, 90)
MIN_COLOR, MIN_ALPHA = 38.0, 45.0


def run(*args):
    return subprocess.run([str(a) for a in args], check=True, capture_output=True, text=True)


def psnr(a, b, channel):
    out = subprocess.run(['magick', 'compare', '-channel', channel, '-metric', 'PSNR', str(a), str(b), 'null:'],
                         capture_output=True, text=True).stderr.split()[0]
    return float('inf') if out in ('inf', '0') else float(out)


def flat(source, target):
    run('magick', source, '-background', 'gray50', '-alpha', 'remove', '-alpha', 'off', target)


def encode_avif(source_png, destination):
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        flat(source_png, tmp / 'ref.png')
        for quality in QUALITIES:
            run('avifenc', '-q', quality, '--qalpha', 90, '-s', 4, '-j', 2, source_png, destination)
            run('avifdec', destination, tmp / 'out.png')
            dims = lambda f: run('magick', 'identify', '-format', '%wx%h', f).stdout
            if dims(source_png) != dims(tmp / 'out.png'):
                raise RuntimeError(f'Dimension mismatch: {destination.name}')
            flat(tmp / 'out.png', tmp / 'out-flat.png')
            color, alpha = psnr(tmp / 'ref.png', tmp / 'out-flat.png', 'RGB'), psnr(source_png, tmp / 'out.png', 'A')
            if color >= MIN_COLOR and alpha >= MIN_ALPHA:
                return color, alpha
    raise RuntimeError(f'Quality floor not met: {destination.name} RGB {color:.1f} alpha {alpha:.1f}')


def tile(webp):
    """AVIF from the PNG master behind one clay-webp delivery file."""
    stem = webp.stem
    with tempfile.TemporaryDirectory() as tmp:
        master = CLAY_PNG / (stem + '.png')
        if not master.exists():
            if not stem.endswith(f'-{EXTRA}'):
                raise RuntimeError(f'No PNG master for {webp.name}')
            master = Path(tmp) / 'resized.png'
            run('magick', CLAY_PNG / (stem[:-len(f'-{EXTRA}')] + '.png'), '-filter', 'Lanczos', '-resize', f'{EXTRA}x', master)
        result = encode_avif(master, CLAY_AVIF / (stem + '.avif'))
    return webp.name, webp.stat().st_size, (CLAY_AVIF / (stem + '.avif')).stat().st_size, *result


def hero(name):
    """1152w WebP (when narrower than native) and AVIF for every hero size."""
    out = []
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        native = tmp / 'native.png'
        run('dwebp', '-quiet', HERO / f'{name}.webp', '-o', native)
        width = int(run('magick', 'identify', '-format', '%w', native).stdout)
        sources = {f'{name}.webp': native}
        for size in (384, 768):
            decoded = tmp / f'{size}.png'
            run('dwebp', '-quiet', HERO / f'{name}-{size}.webp', '-o', decoded)
            sources[f'{name}-{size}.webp'] = decoded
        if width > EXTRA:
            resized = tmp / f'{EXTRA}.png'
            run('magick', native, '-filter', 'Lanczos', '-resize', f'{EXTRA}x', resized)
            run('cwebp', '-quiet', '-q', 85, '-alpha_q', 100, '-sharp_yuv', '-m', 6, resized, '-o', HERO / f'{name}-{EXTRA}.webp')
            sources[f'{name}-{EXTRA}.webp'] = resized
        for webp_name, png in sources.items():
            avif = HERO / (Path(webp_name).stem + '.avif')
            color, alpha = encode_avif(png, avif)
            out.append((webp_name, (HERO / webp_name).stat().st_size, avif.stat().st_size, color, alpha))
    return out


CLAY_AVIF.mkdir(exist_ok=True)
with ThreadPoolExecutor(max_workers=4) as pool:
    tiles = list(pool.map(tile, sorted(CLAY_WEBP.glob('*.webp'))))
    heroes = [row for rows in pool.map(hero, HERO_ASSETS) for row in rows]

manifest_path = APP / 'preview-content/clay-library.json'
manifest = json.loads(manifest_path.read_text())
for asset in manifest['assets'].values():
    asset['avifVariants'] = [{'file': Path(v['file']).stem + '.avif', 'width': v['width'], 'height': v['height'],
                              'bytes': (CLAY_AVIF / (Path(v['file']).stem + '.avif')).stat().st_size}
                             for v in asset['webpVariants']]
manifest_path.write_text(json.dumps(manifest, indent=2) + '\n')

rows = tiles + heroes
print(json.dumps({'tileFiles': len(tiles), 'heroFiles': len(heroes),
                  'webpBytes': sum(r[1] for r in rows), 'avifBytes': sum(r[2] for r in rows),
                  'savedPercent': round(100 * (1 - sum(r[2] for r in rows) / sum(r[1] for r in rows)), 1),
                  'minColorPsnr': round(min(r[3] for r in rows), 2), 'minAlphaPsnr': round(min(r[4] for r in rows), 2)}))
