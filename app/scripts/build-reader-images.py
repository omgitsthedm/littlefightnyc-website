"""Offline delivery derivatives; cwebp and sips are not build dependencies."""
from pathlib import Path
import hashlib
import json
import re
import subprocess

APP = Path(__file__).resolve().parents[1]
RECEIPTS = APP.parent / '.lifi/design-source/sculpture'
media = json.loads((RECEIPTS / 'portfolio-delivery.json').read_text())['media']
assets = {item['src'] for group in media.values()
          for item in ([group] if 'src' in group else group.values())
          if item and item['src'].endswith('.webp')}
out = APP / 'public/assets/reader-images'
out.mkdir(parents=True, exist_ok=True)
records = {}
for src in sorted(assets):
    source = APP / 'public' / src.lstrip('/')
    digest = hashlib.sha256(source.read_bytes()).hexdigest()
    dimensions = subprocess.check_output(['sips', '-g', 'pixelWidth', '-g', 'pixelHeight', str(source)], text=True)
    width, height = [int(re.search(name + r': (\d+)', dimensions)[1]) for name in ('pixelWidth', 'pixelHeight')]
    variants = []
    for size in (480, 800, 1200):
        if size >= width: continue
        target = out / f'{source.stem}-{digest[:8]}-{size}.webp'
        subprocess.run(['cwebp', '-quiet', '-q', '88', '-m', '6', '-resize', str(size), '0', str(source), '-o', str(target)], check=True)
        variants.append({'src': '/' + str(target.relative_to(APP / 'public')), 'width': size,
                         'sha256': hashlib.sha256(target.read_bytes()).hexdigest()})
    variants.append({'src': src, 'width': width, 'sha256': digest})
    records[src] = {'sourceSha256': digest, 'width': width, 'height': height, 'variants': variants}
(RECEIPTS / 'reader-delivery.json').write_text(json.dumps({'schema': 1, 'method': 'Aspect-preserving delivery sizes from the approved portfolio files; no generated content.', 'images': records}, indent=2) + '\n')
print(f'Prepared responsive delivery for {len(records)} approved portfolio images.')
