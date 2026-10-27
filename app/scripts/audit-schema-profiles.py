"""Check crawler-visible identity, service relationships and public profile links.

This checks the local artifact, not indexing, rich-result eligibility or traffic.
External profile ownership is verified separately in the provider's public UI.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, parse_qs
import json
import re
import sys
import xml.etree.ElementTree as ET

APP = Path(__file__).resolve().parents[1]
ROOT = APP / (sys.argv[1] if len(sys.argv) > 1 else 'dist')
ORIGIN = 'https://littlefightnyc.com'
ORG = ORIGIN + '/#organization'
PROFILES = json.loads((APP / 'preview-content/business-profiles.json').read_text())
PROFILE_URLS = {item['url'] for item in PROFILES}


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.blocks, self.visible, self.links = [], [], []
        self.canonical = ''
        self.script = None
        self.hidden = 0
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('head', 'style', 'script'):
            self.hidden += 1
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.script = ''
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href', '')
        if tag == 'a':
            self.links.append(attrs)

    def handle_endtag(self, tag):
        if tag == 'script' and self.script is not None:
            self.blocks.append(json.loads(self.script))
            self.script = None
        if tag in ('head', 'style', 'script'):
            self.hidden -= 1

    def handle_data(self, data):
        if self.script is not None:
            self.script += data
        if not self.hidden:
            self.visible.append(data)


def nodes(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from nodes(child)
    elif isinstance(value, list):
        for child in value:
            yield from nodes(child)


def compact(value):
    return ' '.join(value.split())


failures, records, definitions, references = [], [], set(), []
counts = Counter()
service_count = faq_count = footer_count = 0
for entry in ET.parse(ROOT / 'sitemap.xml').getroot():
    url = entry.find('{*}loc').text
    route = urlsplit(url).path
    file = ROOT / route.lstrip('/') / 'index.html'
    try:
        doc = Document(file.read_text())
    except (OSError, ValueError) as error:
        failures.append(f'{route}: cannot parse HTML/JSON-LD: {error}')
        continue
    flat = [node for block in doc.blocks for node in nodes(block)]
    records.append((route, doc, flat))
    if doc.canonical != url:
        failures.append(f'{route}: sitemap/canonical mismatch')
    page_nodes = [n for n in flat if n.get('@type') in ('WebPage', 'AboutPage', 'ContactPage') and n.get('url') == url]
    if not page_nodes:
        failures.append(f'{route}: missing canonical WebPage identity')
    for node in flat:
        kind = node.get('@type')
        counts.update([kind] if isinstance(kind, str) else kind or [])
        identity = node.get('@id')
        if identity and len(node) > 1:
            definitions.add(identity)
        if identity and identity.startswith(ORIGIN + '/'):
            references.append((route, identity))
        if kind == 'ProfessionalService':
            failures.append(f'{route}: deprecated ProfessionalService type')
        if 'streetAddress' in node or kind == 'GeoCoordinates':
            failures.append(f'{route}: precise location must not be published')
        if identity == ORG and kind:
            if node.get('name') != 'Little Fight NYC' or node.get('url') != ORIGIN + '/':
                failures.append(f'{route}: organization identity mismatch')
            if set(node.get('sameAs', [])) != PROFILE_URLS:
                failures.append(f'{route}: organization profile list has drifted')
        if kind == 'LocalBusiness' and set(node.get('sameAs', [])) != PROFILE_URLS:
            failures.append(f'{route}: business profile list has drifted')
        if kind == 'Service' and identity:
            service_count += 1
            page_id = url + '#webpage'
            if node.get('url') != url or node.get('mainEntityOfPage', {}).get('@id') != page_id:
                failures.append(f'{route}: service does not refer to its canonical page')
            if not any(p.get('mainEntity', {}).get('@id') == identity for p in page_nodes):
                failures.append(f'{route}: page does not refer back to its service')
            if node.get('provider', {}).get('@id') != ORG:
                failures.append(f'{route}: service provider mismatch')
            channel = node.get('availableChannel', {}).get('serviceUrl', '')
            parts = urlsplit(channel)
            query = parse_qs(parts.query)
            if parts.netloc != 'littlefightnyc.com' or parts.path != '/tech-audit/' or query.get('source') != [route] or query.get('intent', [''])[0] not in ('website', 'support', 'consulting', 'systems'):
                failures.append(f'{route}: service inquiry route is missing or inconsistent')
            if not any(urlsplit(a.get('href', '')).path == '/tech-audit/' and parse_qs(urlsplit(a.get('href', '')).query) == query for a in doc.links):
                failures.append(f'{route}: service inquiry URL is not a visible page link')
        if kind == 'Question' and node.get('acceptedAnswer'):
            faq_count += 1
            visible = compact(' '.join(doc.visible))
            answer = compact(node['acceptedAnswer']['text'])
            # A visible byline may separate the short answer and its detail.
            # Check each complete sentence, not a fictitious contiguous block.
            sentences = re.split(r'(?<=[.!?])\s+', answer)
            if compact(node.get('name', '')) not in visible or any(sentence not in visible for sentence in sentences):
                failures.append(f'{route}: FAQ question/answer is not supported by visible text')

# Public profile navigation must remain real links without JavaScript, across
# every shared-footer route, including non-indexed intake and reader pages.
for file in ROOT.rglob('*.html'):
    source = file.read_text()
    # Preserved standalone apps have their own footer and navigation contract.
    if '<nav class="utility-nav" aria-label="More Little Fight">' not in source:
        continue
    footer_count += 1
    footer = Document(source.split('<footer class="site-footer">', 1)[1].split('</footer>', 1)[0])
    links = {a.get('href'): a for a in footer.links}
    for profile in PROFILES:
        link = links.get(profile['url'], {})
        if not link or link.get('target') != '_blank' or 'noopener' not in link.get('rel', '') or profile['platform'] not in link.get('aria-label', ''):
            failures.append(f'{file.relative_to(ROOT)}: missing accessible {profile["platform"]} footer link')

for route, identity in references:
    if identity not in definitions:
        failures.append(f'{route}: unresolved schema identity {identity}')
if not records or not service_count or not footer_count:
    failures.append('Missing sitemap, service or footer coverage')
report = {'passed': not failures, 'indexablePages': len(records), 'services': service_count,
          'faqQuestions': faq_count, 'sharedFooters': footer_count, 'verifiedProfiles': len(PROFILES),
          'types': dict(counts), 'failures': sorted(set(failures))}
print(json.dumps(report, indent=2))
sys.exit(1 if failures else 0)
