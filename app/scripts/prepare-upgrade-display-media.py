"""Encode compact portfolio media from the authenticated October 9 captures.

Every output is an explicit resize or viewport crop of an authenticated capture.
The three social cards use the already-receipted physical display composite on
the existing charcoal canvas; no browser UI or client pixels are invented.
"""
from pathlib import Path
from PIL import Image
import hashlib
import json

APP = Path(__file__).resolve().parents[1]
PUBLIC = APP / 'public'
ROOT = APP.parent
OUT = PUBLIC / 'assets/portfolio-upgrade-20261009'
MANIFEST = OUT / 'provenance.json'

def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def encode(source, target, crop=None):
    image = Image.open(source).convert('RGB')
    if crop:
        image = image.crop(crop)
    image.save(target, 'WEBP', quality=88, method=6)
    return image.size

payload = json.loads(MANIFEST.read_text())
captures = {item['key']: item for item in payload['captures']}
for item in captures.values():
    if digest(OUT / item['file']) != item['sha256']:
        raise ValueError(f"Capture integrity failed: {item['file']}")

display_jobs = (
    ('after-hours-agenda-desktop-display', 'after-hours-agenda-desktop', 'after-hours-agenda-desktop.webp', None),
    ('after-hours-agenda-phone-display', 'after-hours-agenda-phone', 'after-hours-agenda-phone.webp', None),
    ('the-tarot-hotline-desktop-display', 'the-tarot-hotline-desktop', 'the-tarot-hotline-desktop.webp', None),
    ('the-tarot-hotline-phone-display', 'the-tarot-hotline-phone', 'the-tarot-hotline-phone.webp', None),
    ('venuecircuit-desktop-display', 'venuecircuit-desktop', 'venuecircuit-desktop-top.webp', [0, 0, 1440, 900]),
    ('venuecircuit-phone-display', 'venuecircuit-phone', 'venuecircuit-phone-top.webp', [0, 0, 390, 844]),
)
derivatives = []
for key, source_key, filename, crop in display_jobs:
    source = captures[source_key]
    target = OUT / filename
    size = encode(OUT / source['file'], target, crop)
    derivatives.append({
        'key': key, 'file': filename, 'sha256': digest(target),
        'sourceKey': source_key, 'sourceSha256': source['sha256'],
        'crop': crop,
        'method': 'Lossy WebP encoding of an authenticated current-production capture' + (' after the declared top-of-page crop.' if crop else '.')
    })

share_jobs = (
    ('after-hours-agenda-share', 'after-hours-agenda-desktop', 'share-after-hours-agenda.jpg', 'browser-after-hours-agenda'),
    ('the-tarot-hotline-share', 'the-tarot-hotline-desktop', 'share-the-tarot-hotline.jpg', 'website-the-tarot-hotline'),
    ('venuecircuit-share', 'venuecircuit-desktop', 'share-venuecircuit.jpg', 'browser-venuecircuit'),
)
for key, source_key, filename, composite in share_jobs:
    source = captures[source_key]
    framed = Image.open(PUBLIC / 'assets/sculpture' / f'{composite}.webp').convert('RGBA')
    framed.thumbnail((1110, 600), Image.Resampling.LANCZOS)
    card = Image.new('RGBA', (1200, 630), (7, 9, 12, 255))
    card.alpha_composite(framed, ((1200-framed.width)//2, (630-framed.height)//2))
    target = OUT / filename
    card.convert('RGB').save(target, 'JPEG', quality=91, optimize=True)
    composite_path = PUBLIC / 'assets/sculpture' / f'{composite}.webp'
    derivatives.append({
        'key': key, 'file': filename, 'sha256': digest(target),
        'sourceKey': source_key, 'sourceSha256': source['sha256'],
        'composition': f'assets/sculpture/{composite}.webp',
        'compositionSha256': digest(composite_path),
        'method': 'Authenticated current-production capture in the existing physical display, centered on the established opaque charcoal social canvas.'
    })

payload['derivatives'] = derivatives
MANIFEST.write_text(json.dumps(payload, indent=2) + '\n')
print(f'Prepared {len(derivatives)} authenticated display and share derivatives.')
