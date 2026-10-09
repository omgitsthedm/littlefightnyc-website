"""One reviewed screenshot source for every portfolio surface in the compiler."""
from pathlib import Path
from urllib.parse import urlsplit
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[2]
DELIVERY = json.loads((ROOT / '.lifi/design-source/sculpture/portfolio-delivery.json').read_text())
ARTWORK = json.loads((ROOT / '.lifi/design-source/sculpture/delivery.json').read_text())
MEDIA = DELIVERY['media']
REPLACEMENTS = DELIVERY['replacements']
DIMENSIONS = {asset['src']: asset for group in MEDIA.values() for asset in ([group] if 'src' in group else group.values()) if asset}

def apply_portfolio_media(cases, visuals, labs):
    """Override presentation only; original content catalogs stay unchanged."""
    for slug, case in cases.items():
        current = MEDIA[slug]
        case.update(image=current['desktop']['src'].lstrip('/'), imageWidth=current['desktop']['width'], imageHeight=current['desktop']['height'])
        original = visuals.setdefault(slug, {})
        original['desktop'] = current['desktop']
        original['social'] = current['social']
        # Existing paired case stories keep their phone view. An independent
        # design concept does not acquire a new live-product claim.
        if original.get('mobile'): original['mobile'] = current['mobile']
    for lab in labs:
        current = MEDIA['lab-' + lab['slug']]
        lab.update(tileImage=current['src'], tileImageWidth=current['width'], tileImageHeight=current['height'])

def rewrite_portfolio_media(markup):
    """Catch authored secondary proofs and image links without altering copy."""
    reader = 'data-page-content' in markup
    def mapped(value):
        parts = urlsplit(value)
        target = REPLACEMENTS.get(parts.path, value)
        # Physical devices belong to the tile fronts. Inside the Workbench,
        # actual screenshots are evidence: one crisp, square-on reading plane.
        if reader:
            match = re.fullmatch(r'/assets/sculpture/browser-(.+?)(?:-(?:480|800))?\.webp', urlsplit(target).path)
            if match and match[1] in MEDIA:
                return MEDIA[match[1]]['desktop']['src']
        return target
    def img(match):
        tag = match[0]
        source = re.search(r'\bsrc="([^"]+)"', tag)
        if not source: return tag
        target = mapped(source[1])
        if target == source[1] and not target.startswith(('/assets/sculpture/browser-', '/assets/sculpture/lab-', '/assets/portfolio-20261007/')): return tag
        tag = tag.replace(source[0], 'src="'+escape(target, quote=True)+'"', 1)
        tag = re.sub(r'\s(?:srcset|sizes|width|height)="[^"]*"', '', tag)
        dims = DIMENSIONS.get(target)
        if dims: tag = tag[:-1]+f' width="{dims["width"]}" height="{dims["height"]}">'
        if target.startswith('/assets/sculpture/'):
            if 'data-sculpture-screen=' not in tag: tag = tag.replace('<img ', '<img data-sculpture-screen="true" ', 1)
            variants = ARTWORK.get(Path(target).stem, [])
            if variants:
                srcset = ', '.join('/assets/sculpture/'+v['file']+' '+str(v['width'])+'w' for v in variants)
                # Preserve the authored responsive request size when available.
                sizes = re.search(r'\bsizes="([^"]+)"', match[0])
                sizes = sizes[1] if sizes else '(max-width:760px) calc(100vw - 48px), 1080px'
                tag = tag[:-1]+f' srcset="{srcset}" sizes="{sizes}">'
        return tag
    markup = re.sub(r'<img\b[^>]*>', img, markup)
    # Keep each authored responsive picture, but resolve its candidates to the
    # same reviewed library as the fallback image. Reader composition is intact.
    def source(match):
        tag = match[0]
        def candidates(value):
            return ', '.join(mapped(part.strip().split()[0]) +
                (' ' + ' '.join(part.strip().split()[1:]) if len(part.strip().split()) > 1 else '')
                for part in value.split(',') if part.strip())
        return re.sub(r'srcset="([^"]+)"', lambda m: 'srcset="' + escape(candidates(m[1]), quote=True) + '"', tag)
    markup = re.sub(r'<source\b[^>]*>', source, markup)
    markup = re.sub(r'\b(href|content|poster)="([^"]+)"', lambda m: m[0] if mapped(m[2]) == m[2] else m[1]+'="'+escape(mapped(m[2]), quote=True)+'"', markup)
    return markup
