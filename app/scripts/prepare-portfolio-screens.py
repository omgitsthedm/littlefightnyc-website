"""Build deterministic screenshot delivery from the verified original library.

No client pixels are generated or recolored. Historical viewport crops retain
their raw source and crop coordinates in the manifest.
"""
from pathlib import Path
from PIL import Image, ImageOps
from urllib.parse import urlsplit
import hashlib
import json

from approved_screens import APP, LIBRARY, selected_originals, sha256

PUBLIC = APP / 'public'
OUT = PUBLIC / 'assets/portfolio-20261007'
OUT.mkdir(parents=True, exist_ok=True)
selected = selected_originals()
cases = json.loads((APP / 'preview-content/cases.json').read_text())
visuals = json.loads((APP / 'preview-content/case-visuals.json').read_text())['cases']
labs = json.loads((APP / 'preview-content/labs.json').read_text())
outputs = []
media = {}
replacements = {}

def asset(path):
    im = Image.open(path)
    return {'src': '/' + path.relative_to(PUBLIC).as_posix(), 'width': im.width, 'height': im.height}

def record(path, source, method):
    outputs.append({'file': path.relative_to(PUBLIC).as_posix(), 'sha256': sha256(path),
                    'sourceKey': source['key'], 'sourceSha256': source['sha256'],
                    'source': str(source['path']), 'crop': source.get('crop'), 'method': method})
    return asset(path)

def raw(key):
    source = selected[key]
    im = Image.open(source['path']).convert('RGB')
    if source.get('crop'): im = im.crop(source['crop'])
    width = min(im.width, 780 if source['profile'] == 'phone' else 1600)
    im = im.resize((width, round(im.height * width / im.width)), Image.Resampling.LANCZOS)
    path = OUT / (key + '.webp')
    im.save(path, 'WEBP', quality=92, method=6)
    return record(path, source, 'Aspect-preserving resize and WebP encoding of real source pixels')

for case in cases:
    slug = case['slug']
    source = selected[slug + '-desktop']
    # Reader layouts keep their existing flat screenshot presentation. Only
    # homepage tile fronts and the hero consume the physical frame composites.
    desktop = raw(slug + '-desktop')
    desktop['alt'] = visuals.get(slug, {}).get('desktop', {}).get('alt') or case.get('imageAlt') or case['name'] + ' design concept'
    screen = desktop.copy()
    phone = raw(slug + '-phone') if slug + '-phone' in selected else None
    if phone:
        phone['alt'] = visuals.get(slug, {}).get('mobile', {}).get('alt') or case['name'] + ' on a phone'
    # The same physical display on an opaque charcoal social canvas.
    framed = Image.open(PUBLIC / 'assets/sculpture' / ('browser-' + slug + '.webp')).convert('RGBA')
    framed.thumbnail((1110, 600), Image.Resampling.LANCZOS)
    share = Image.new('RGBA', (1200, 630), (7, 9, 12, 255))
    share.alpha_composite(framed, ((1200 - framed.width)//2, (630 - framed.height)//2))
    target = OUT / ('share-' + slug + '.jpg')
    share.convert('RGB').save(target, 'JPEG', quality=91, optimize=True)
    social = record(target, source, 'The verified physical display, scaled onto an opaque charcoal social canvas')
    social['alt'] = desktop['alt']
    media[slug] = {'desktop': desktop, 'mobile': phone, 'social': social, 'screen': screen}
    old = visuals.get(slug, {})
    for kind in ('desktop', 'mobile', 'social'):
        if old.get(kind) and media[slug].get(kind): replacements[old[kind]['src']] = media[slug][kind]['src']
    if case.get('image'): replacements['/' + case['image'].lstrip('/')] = desktop['src']
    if case.get('sourceImage'): replacements[urlsplit(case['sourceImage']).path] = desktop['src']

legacy = {'pool-room':'pool-room','walkup-3d':'brownstone-walkup','terminal-3d':'cinematic-3d','pill-scroll':'scroll-motion','micro-animations':'micro-animations','aha-laser':'aha-laser','studio-engine':'studio-engine','growth-street':'growth-street','goliath':'goliath'}
for lab in labs:
    slug = lab['slug']
    media['lab-' + slug] = raw('lab-' + slug)
    if lab.get('tileImage'): replacements[urlsplit(lab['tileImage']).path] = media['lab-' + slug]['src']
    for width in (480, 800, 1200):
        replacements[f'/images/lab-showcase/{legacy.get(slug,slug)}-{width}.webp'] = media['lab-' + slug]['src']

media['rachel-services'] = raw('rachel-services-desktop')
for source in list((APP/'preview-ui/assets/proof').rglob('*')) + list((PUBLIC/'assets').glob('case-*')):
    if not source.is_file() or source.suffix.lower() not in ('.webp', '.jpg', '.png'): continue
    url = '/' + source.relative_to(APP/'preview-ui' if source.is_relative_to(APP/'preview-ui') else PUBLIC).as_posix()
    if 'website-rachel-services-' in source.name:
        replacements[url] = media['rachel-services']['src']
    for case in cases:
        slug = case['slug']
        if source.name.startswith(('case-'+slug+'.', 'case-'+slug+'-', 'tile-'+slug+'-')):
            mobile = 'mobile' in source.name
            replacements[url] = media[slug]['mobile' if mobile and media[slug]['mobile'] else 'desktop']['src']
            break

source = selected['little-fight-nyc-reference-hero']
home = Image.open(source['path']).convert('RGBA')
home.thumbnail((1176, 606), Image.Resampling.LANCZOS)
canvas = Image.new('RGBA', (1200, 630), (5, 5, 6, 255))
canvas.alpha_composite(home, ((1200-home.width)//2, (630-home.height)//2))
target = OUT/'share-little-fight-nyc.jpg'
canvas.convert('RGB').save(target, 'JPEG', quality=92, optimize=True)
media['agency-home'] = record(target, source, 'Aspect-preserving real browser capture of the completed sculpture hero on an opaque social canvas')
replacements['/assets/social/og-tiles.jpg'] = media['agency-home']['src']

payload = {'schema': 1, 'library': str(LIBRARY), 'libraryManifestSha256': sha256(LIBRARY/'_gallery/manifest.json'),
           'kind': 'owner-authorized-replacement-library', 'media': media, 'replacements': replacements, 'outputs': outputs}
(APP.parent/'.lifi/design-source/sculpture/portfolio-delivery.json').write_text(json.dumps(payload, indent=2)+'\n')
print(f'Prepared {len(cases)} cases, {len(labs)} Labs, {len(outputs)} verified derivatives, {len(replacements)} replaced legacy paths.')
