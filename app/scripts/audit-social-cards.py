"""Verify the deployed HTML a share crawler receives, without JavaScript."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
from collections import Counter
import hashlib
import json
import sys

APP = Path(__file__).resolve().parents[1]
ROOT = APP / (sys.argv[1] if len(sys.argv) > 1 else 'dist')
ORIGIN = 'https://littlefightnyc.com'
CARDS = json.loads((APP / 'preview-content/social-cards.json').read_text())['cards']
# Non-shareable utility responses deliberately remain outside the card catalog.
EXCLUDED = {'__forms.html', 'offline.html', 'product-retired.html', 'examples/audit/404.html'}


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.counts = Counter()
        self.canonical = ''
        self.title = ''
        self.in_title = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'meta':
            key = attrs.get('property', attrs.get('name', ''))
            self.meta[key] = attrs.get('content', '')
            self.counts[key] += 1
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href', '')
            self.counts['canonical'] += 1
        if tag == 'title':
            self.in_title = True

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, text):
        if self.in_title:
            self.title += text


failures = []
checked = 0
images = {}
required = ['og:title', 'og:description', 'og:type', 'og:url', 'og:site_name', 'og:locale',
            'og:image', 'og:image:secure_url', 'og:image:type', 'og:image:width', 'og:image:height',
            'og:image:alt', 'twitter:card', 'twitter:title', 'twitter:description',
            'twitter:image', 'twitter:image:alt']
for file in sorted(ROOT.rglob('*.html')):
    relative = file.relative_to(ROOT).as_posix()
    if relative in EXCLUDED:
        continue
    checked += 1
    head = Head()
    head.feed(file.read_text().split('</head>')[0])
    m = head.meta
    errors = []
    for key in [*required, 'canonical']:
        if head.counts[key] != 1:
            errors.append(f'{key}: expected one tag, found {head.counts[key]}')
        if key != 'canonical' and not m.get(key):
            errors.append(f'{key}: empty')
    if not head.canonical.startswith(ORIGIN+'/') or m.get('og:url') != head.canonical:
        errors.append('canonical and og:url must agree on the public URL')
    for suffix in ['title', 'description', 'image', 'image:alt']:
        if m.get('og:'+suffix) != m.get('twitter:'+suffix):
            errors.append('Open Graph / Twitter mismatch: '+suffix)
    if m.get('og:title') != head.title:
        errors.append('share title differs from page title')
    if m.get('twitter:card') != 'summary_large_image':
        errors.append('not a large image card')
    image_url = m.get('og:image', '')
    if not image_url.startswith(ORIGIN+'/assets/social/clay/') or '?' in image_url:
        errors.append('card must use a versioned public clay JPEG')
    if m.get('og:image:secure_url') != image_url:
        errors.append('secure image URL differs')
    if image_url:
        image = ROOT / unquote(urlsplit(image_url).path.lstrip('/'))
        try:
            if image_url not in images:
                data = image.read_bytes()
                if data[:2] != b'\xff\xd8':
                    raise ValueError('not a JPEG')
                offset = 2
                while offset + 9 < len(data):
                    marker = data[offset+1]
                    if marker in (0xc0, 0xc1, 0xc2):
                        images[image_url] = ((int.from_bytes(data[offset+7:offset+9], 'big'), int.from_bytes(data[offset+5:offset+7], 'big')), 'JPEG')
                        break
                    offset += 2 + int.from_bytes(data[offset+2:offset+4], 'big')
                if image_url not in images:
                    raise ValueError('no JPEG frame header')
            size, fmt = images[image_url]
            if size != (int(m.get('og:image:width', 0)), int(m.get('og:image:height', 0))):
                errors.append('declared image dimensions differ from real pixels')
            if size != (2400, 1260) or fmt != 'JPEG' or m.get('og:image:type') != 'image/jpeg':
                errors.append('expected a 2400 × 1260 JPEG')
            if image.stat().st_size > 1_000_000:
                errors.append('share card exceeds the 1 MB delivery budget')
        except (OSError, ValueError) as error:
            errors.append('unreadable card: '+str(error))
    route = '/'+relative.removesuffix('index.html') if relative.endswith('index.html') else '/'+relative
    card = CARDS.get(route) or CARDS.get(urlsplit(head.canonical).path)
    if not card:
        errors.append('missing catalog entry')
    elif not route.startswith('/_readers/') and (card['title'] != head.title or card['description'] != m.get('og:description')):
        errors.append('card copy is stale; regenerate social cards')
    if errors:
        failures.extend(relative+': '+message for message in errors)

for route, card in CARDS.items():
    file = ROOT / card['image'].lstrip('/')
    if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest() != card['sha256']:
        failures.append(route+': card bytes do not match the reviewed catalog')
    if route.startswith('/case-studies/'):
        portfolio = json.loads((APP.parent / '.lifi/design-source/sculpture/portfolio-delivery.json').read_text())['media']
        slug = route.strip('/').split('/')[-1]
        if card['artSource'] != portfolio[slug]['desktop']['src']:
            failures.append(route+': card lost the real client screenshot')

report = {'pages': checked, 'cards': len(CARDS), 'referencedImages': len(images),
          'excludedUtilityResponses': sorted(EXCLUDED), 'failures': failures}
evidence = APP.parent / '.lifi/evidence/social-cards'
evidence.mkdir(parents=True, exist_ok=True)
(evidence / 'audit.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
sys.exit(1 if failures else 0)
