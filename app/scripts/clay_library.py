"""Approved transparent artwork, delivered as quality-checked responsive WebP (see prepare-clay-webp.py)."""
from functools import lru_cache
from html import escape
from pathlib import Path
import json
import os
import shutil

APP = Path(__file__).resolve().parents[1]
ENABLED = os.environ.get('LFNYC_CLAY_LIBRARY_PREVIEW', '1') == '1'
URL = '/assets/clay-webp/'
ART_ALIASES = {
    'boat': 'symbol-tugboat', 'clay-browser-v1': 'symbol-browser',
    'clay-storefront-v1': 'object-storefront', 'clay-router-v1': 'object-router',
    'clay-notebook-v1': 'object-notebook', 'clay-software-v1': 'object-software',
    'custom-os-spheres': 'object-operating-system',
}
@lru_cache(maxsize=1)
def assets():
    return json.loads((APP / 'preview-content/clay-library.json').read_text())['assets']

def art_asset(name):
    if not ENABLED or not name:
        return None
    candidate = ART_ALIASES.get(name, 'object-' + name)
    return candidate if candidate in assets() else None

def dimensions(name):
    entry = assets()[name]['variants'][-1]
    return entry['width'], entry['height']

def attributes(values):
    return ' '.join(escape(k, quote=True) if v is None else
                    f'{escape(k, quote=True)}="{escape(str(v), quote=True)}"'
                    for k, v in values.items())

def png_image(name, cls='', eager=False, alt='', sizes='(max-width:600px) 50vw, 420px', extra=None):
    variants = assets()[name]['webpVariants']
    width, height = dimensions(name)
    values = dict(extra or {})
    values.update({'class': (cls + ' clay-png').strip(), 'data-clay-asset': name,
                   'src': URL + variants[-1]['file'],
                   'srcset': ', '.join(URL + v['file'] + ' ' + str(v['width']) + 'w' for v in variants),
                   'sizes': sizes, 'width': width, 'height': height,
                   'alt': alt, 'loading': 'eager' if eager else 'lazy', 'decoding': 'async'})
    return '<img ' + attributes(values) + '>'

def png_scene(name, cls='', eager=False, alt=''):
    return (f'<span class="clay-cutout" data-clay-cutout="{escape(name, quote=True)}" aria-hidden="true">'
            + png_image(name, cls + ' clay-cutout-rest', eager=eager, alt=alt) + '</span>')

def copy_assets(destination):
    if ENABLED:
        shutil.copytree(APP / 'public/assets/clay-png', destination / 'assets/clay-png', dirs_exist_ok=True)
        shutil.copytree(APP / 'public/assets/clay-webp', destination / 'assets/clay-webp', dirs_exist_ok=True)
        shutil.copy2(APP / 'preview-ui/clay-cutouts.js', destination / 'clay-cutouts.js')
