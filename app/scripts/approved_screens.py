"""Verify the owner's authorized screenshot source library and its derivatives.

The missing 224-image gallery was not recovered. On October 7 the owner
authorized the best verifiable fallback. This separate library records fresh
public captures and explicitly identified historical originals, never fake UI.
"""
from pathlib import Path
import hashlib
import json
import os
import re

APP = Path(__file__).resolve().parents[1]

def approved_library_path():
    """Resolve the active owner-authorized capture package, with an explicit override for recovery work."""
    override = os.environ.get('LFNYC_APPROVED_SCREENSHOTS')
    candidates = [
        Path(override).expanduser() if override else None,
        Path('/Users/davidmarsh/Desktop/LiFi NYC/Business/LiFi Tile Website/Little Fight NYC Verified Screenshots 2026-10-07'),
        Path('/Users/davidmarsh/Desktop/Little Fight NYC Verified Screenshots 2026-10-07'),
    ]
    for candidate in candidates:
        if candidate and (candidate / '_gallery/manifest.json').is_file():
            return candidate.resolve()
    return next(candidate for candidate in candidates if candidate).resolve()

LIBRARY = approved_library_path()
UPGRADE_CAPTURE_MANIFEST = APP / 'public/assets/portfolio-upgrade-20261009/provenance.json'

def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def approved_originals():
    manifest = LIBRARY / '_gallery/manifest.json'
    if not manifest.is_file():
        raise FileNotFoundError(f'Authorized screenshot library is unavailable: {manifest}.')
    gallery = json.loads(manifest.read_text())
    if gallery.get('kind') != 'owner-authorized-replacement-library' or not gallery.get('authorization'):
        raise ValueError('Screenshot library must retain its owner authorization and provenance.')
    records = gallery['records']
    if gallery.get('originalCount') != len(records) or not records:
        raise ValueError('Screenshot manifest original count does not match its records.')
    approved = {}
    keys = set()
    for record in records:
        file = record.get('file')
        expected = record.get('sha256')
        if not isinstance(file, str) or not isinstance(expected, str) or not re.fullmatch(r'[0-9a-fA-F]{64}', expected):
            raise ValueError('Invalid original screenshot record')
        if record.get('key') in keys: raise ValueError('Duplicate screenshot key')
        keys.add(record.get('key'))
        path = (LIBRARY / file).resolve()
        relative = path.relative_to(LIBRARY)
        if any(part.startswith('_') for part in relative.parts):
            raise ValueError(f'Final manifest includes a rejected or gallery derivative: {relative}')
        if path.suffix.lower() not in ('.png', '.webp') or sha256(path) != expected.lower():
            raise ValueError(f'Approved original failed integrity: {relative}')
        if record.get('review') != 'passed':
            raise ValueError(f'Screenshot has not passed visual review: {relative}')
        if record.get('kind') not in ('fresh-public-capture', 'local-public-lab-capture', 'historical-concept-capture', 'local-agency-capture'):
            raise ValueError(f'Unknown screenshot provenance: {relative}')
        approved[expected.lower()] = path
    return approved

def approved_upgrade_captures():
    """Validate the current-production capture set without weakening the 2026-10-07 library gate."""
    if not UPGRADE_CAPTURE_MANIFEST.is_file():
        return {}
    payload = json.loads(UPGRADE_CAPTURE_MANIFEST.read_text())
    if payload.get('schema') != 1 or not isinstance(payload.get('captures'), list):
        raise ValueError('Upgrade capture manifest is malformed')
    root = UPGRADE_CAPTURE_MANIFEST.parent.resolve()
    approved = {}
    for record in payload['captures']:
        file = record.get('file')
        digest = record.get('sha256', '').lower()
        url = record.get('publicUrl')
        if not isinstance(file, str) or Path(file).name != file or not file.endswith('.png'):
            raise ValueError('Upgrade capture must name one local PNG without a path')
        if not re.fullmatch(r'[0-9a-f]{64}', digest):
            raise ValueError('Upgrade capture is missing a SHA-256 digest')
        if not isinstance(url, str) or not url.startswith('https://'):
            raise ValueError('Upgrade capture must record its public HTTPS URL')
        if not isinstance(record.get('captureDate'), str) or not isinstance(record.get('status'), str):
            raise ValueError('Upgrade capture must record date and status')
        path = (root / file).resolve()
        if path.parent != root or not path.is_file() or sha256(path) != digest:
            raise ValueError(f'Upgrade capture failed integrity: {file}')
        if digest in approved:
            raise ValueError(f'Duplicate upgrade capture hash: {file}')
        approved[digest] = path
    return approved

def approved_upgrade_derivatives():
    """Verify compact reader and social outputs retain a declared capture chain."""
    if not UPGRADE_CAPTURE_MANIFEST.is_file():
        return []
    payload = json.loads(UPGRADE_CAPTURE_MANIFEST.read_text())
    root = UPGRADE_CAPTURE_MANIFEST.parent.resolve()
    captures = {record.get('key'): record for record in payload.get('captures', [])}
    derivatives = payload.get('derivatives', [])
    if not isinstance(derivatives, list):
        raise ValueError('Upgrade derivatives must be a list')
    seen = set()
    for record in derivatives:
        file = record.get('file')
        digest = record.get('sha256', '').lower()
        source_key = record.get('sourceKey')
        if not isinstance(file, str) or Path(file).name != file or Path(file).suffix.lower() not in ('.webp', '.jpg'):
            raise ValueError('Upgrade derivative must name one local WebP or JPEG without a path')
        if file in seen or not re.fullmatch(r'[0-9a-f]{64}', digest):
            raise ValueError('Upgrade derivative has a duplicate file or invalid SHA-256 digest')
        seen.add(file)
        source = captures.get(source_key)
        if not source or record.get('sourceSha256') != source.get('sha256'):
            raise ValueError(f'Upgrade derivative lacks a verified source chain: {file}')
        path = (root / file).resolve()
        if path.parent != root or not path.is_file() or sha256(path) != digest:
            raise ValueError(f'Upgrade derivative failed integrity: {file}')
        composition = record.get('composition')
        if composition:
            candidate = (APP / 'public' / composition).resolve()
            if not candidate.is_relative_to(APP / 'public') or not candidate.is_file() or record.get('compositionSha256') != sha256(candidate):
                raise ValueError(f'Upgrade social composition failed integrity: {file}')
    return derivatives

def selected_originals():
    approved = approved_originals()
    gallery = json.loads((LIBRARY / '_gallery/manifest.json').read_text())
    return {record['key']: {**record, 'path': approved[record['sha256']]} for record in gallery['records']}

def require_approved(source, approved):
    digest = sha256(source)
    if digest not in approved:
        raise ValueError(f'Screenshot is not a byte-exact approved original: {source}')
    return approved[digest]

def receipt_source_path(value):
    """Resolve a historic receipt after its authorized library moved to Business."""
    source = Path(value)
    if source.is_file():
        return source.resolve()
    marker = 'Little Fight NYC Verified Screenshots 2026-10-07/'
    text = str(value)
    if marker in text:
        candidate = LIBRARY / text.split(marker, 1)[1]
        if candidate.is_file():
            return candidate.resolve()
    return (APP / source).resolve()

def audit():
    approved = approved_originals()
    upgrade_captures = approved_upgrade_captures()
    approved_upgrade_derivatives()
    composite_sources = {**approved, **upgrade_captures}
    receipts = json.loads((APP.parent / '.lifi/design-source/sculpture/screen-composites.json').read_text())
    for receipt in receipts:
        # Authored photography is separate from website screenshots in the brief.
        if receipt['frame'] == 'photo': continue
        source = receipt_source_path(receipt['source'])
        require_approved(source, composite_sources)
        if receipt['sourceSha256'] != sha256(source):
            raise ValueError(f'Composite source receipt changed: {receipt["name"]}')
        if receipt.get('outputSha256') != sha256(APP / 'public/assets/sculpture' / (receipt['name']+'.webp')):
            raise ValueError(f'Composite output changed: {receipt["name"]}')
    delivery = json.loads((APP.parent / '.lifi/design-source/sculpture/portfolio-delivery.json').read_text())
    if delivery['libraryManifestSha256'] != sha256(LIBRARY/'_gallery/manifest.json'):
        raise ValueError('Screenshot source selection changed after the delivery build.')
    for output in delivery['outputs']:
        if output['sourceSha256'] not in composite_sources:
            raise ValueError(f'Unregistered delivery source: {output["file"]}')
        if sha256(APP / 'public' / output['file']) != output['sha256']:
            raise ValueError(f'Delivery derivative changed: {output["file"]}')
    art = json.loads((APP.parent / '.lifi/design-source/sculpture/delivery.json').read_text())
    for receipt in receipts:
        for variant in art[receipt['name']]:
            if sha256(APP / 'public/assets/sculpture' / variant['file']) != variant['sha256']:
                raise ValueError(f'Sculpture rendition changed: {variant["file"]}')
    # Direct screenshot paths would bypass the approved composition receipt.
    legacy = re.compile(r'(?:src|srcset|data-src|data-srcset|content)="[^"]*(?:/assets/proof/|/assets/social/og-case-|/assets/social/og-tiles\.jpg|/images/lab-covers/|/images/lab-showcase/)')
    remaining = []
    for page in (APP / 'dist').rglob('*.html'):
        relative = page.relative_to(APP / 'dist').as_posix()
        # These are independent live experiences, not portfolio screenshots.
        if relative.startswith(('vera/', 'examples/lab/', 'ads/', 'myspace-demo/')): continue
        if legacy.search(page.read_text()): remaining.append(relative)
    sitemap = APP / 'dist/image-sitemap.xml'
    if sitemap.is_file() and '/assets/proof/' in sitemap.read_text():
        remaining.append('image-sitemap.xml')
    if remaining:
        raise ValueError('Unregistered screenshot delivery remains in: '+', '.join(remaining))
    print(f'Authorized screenshot gate passed: {len(approved)} original hashes, {len(delivery["outputs"])} derivatives and all active portfolio composites verified. Owner-authorized replacement library; original 224-image set not recovered.')

if __name__ == '__main__':
    audit()
