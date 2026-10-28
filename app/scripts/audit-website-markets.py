"""Check the built website offer, service graph and inquiry paths together."""
import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from urllib.robotparser import RobotFileParser
import xml.etree.ElementTree as ET

APP = Path(__file__).resolve().parents[1]
DIST = APP / (sys.argv[1] if len(sys.argv) > 1 else 'dist')
ORIGIN = 'https://littlefightnyc.com'
SERVICE_PATH = '/services/custom-local-websites/'
MARKETS = {
    '/markets/arizona/phoenix/': ('Phoenix', 'City'),
    '/markets/marthas-vineyard/': ('Martha’s Vineyard', 'Place'),
    '/markets/nyc/': ('New York City', 'City'),
}


class Page(HTMLParser):
    def __init__(self, route):
        super().__init__()
        self.links, self.scripts, self.text, self.canonicals = [], [], [], []
        self.robots = ''
        self.script = None
        self.feed((DIST / route.strip('/') / 'index.html').read_text())
        self.nodes = [node for script in self.scripts
                      for node in json.loads(script).get('@graph', [])]

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a':
            self.links.append(attrs.get('href', ''))
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonicals.append(attrs.get('href'))
        if tag == 'meta' and attrs.get('name') == 'robots':
            self.robots = attrs.get('content', '')
        if tag == 'script':
            self.script = '' if attrs.get('type') == 'application/ld+json' else False

    def handle_data(self, data):
        if isinstance(self.script, str):
            self.script += data
        elif self.script is None:
            self.text.append(data)

    def handle_endtag(self, tag):
        if tag == 'script':
            if isinstance(self.script, str):
                self.scripts.append(self.script)
            self.script = None


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def connected_service(route):
    page = Page(route)
    require(page.canonicals == [ORIGIN + route], f'{route}: canonical URL')
    nodes = {n.get('@id'): n for n in page.nodes}
    require(len(nodes) == len(page.nodes), f'{route}: schema identities must be unique')
    service_id, webpage_id = ORIGIN + route + '#service', ORIGIN + route + '#webpage'
    service, webpage = nodes.get(service_id, {}), nodes.get(webpage_id, {})
    require(service.get('@type') == 'Service', f'{route}: stable Service identity is missing')
    require(webpage.get('mainEntity') == {'@id': service_id}, f'{route}: page must identify its service')
    require(service.get('mainEntityOfPage') == {'@id': webpage_id}, f'{route}: service must identify its page')
    require(service.get('url') == ORIGIN + route, f'{route}: service URL')
    require(service.get('provider') == {'@id': ORIGIN + '/#organization'}, f'{route}: provider')
    channel = service.get('availableChannel', {})
    inquiry = urlsplit(channel.get('serviceUrl', ''))
    require(channel.get('@type') == 'ServiceChannel' and inquiry.netloc == 'littlefightnyc.com' and
            inquiry.path == '/tech-audit/' and parse_qs(inquiry.query).get('intent') == ['website'] and
            parse_qs(inquiry.query).get('source') == [route], f'{route}: service channel must match the visible website inquiry')
    require(nodes.get(ORIGIN + '/#organization', {}).get('name') == 'Little Fight NYC', f'{route}: provider resolves')
    require(not any(n.get('@type') == 'LocalBusiness' for n in page.nodes), f'{route}: no invented market office')
    require(not any(key in json.dumps(page.nodes) for key in ('"streetAddress"', '"postalCode"', '"latitude"', '"longitude"')), f'{route}: no precise location data')
    return page, service


canonical, primary_service = connected_service(SERVICE_PATH)
robots = RobotFileParser()
robots.parse((DIST / 'robots.txt').read_text().splitlines())
sitemap_urls = {node.text for node in ET.parse(DIST / 'sitemap.xml').iter() if node.tag.endswith('}loc')}
home = Page('/')
require(primary_service.get('areaServed') == {'@type': 'Country', 'name': 'United States'}, 'Preserve nationwide remote website service')
require({n['@id'] for n in primary_service.get('subjectOf', [])} ==
        {ORIGIN + p + '#webpage' for p in MARKETS}, 'Website service must link to the three market pages')
for route, (city, area_type) in MARKETS.items():
    page, service = connected_service(route)
    require('noindex' not in page.robots and 'index' in page.robots, f'{route}: offer must be indexable')
    require(ORIGIN + route in sitemap_urls, f'{route}: sitemap entry')
    require(ORIGIN + route in (DIST / 'llms.txt').read_text(), f'{route}: readable site map entry')
    require(route in home.links, f'{route}: reachable from homepage')
    for bot in ('Googlebot', 'bingbot', 'OAI-SearchBot', 'ChatGPT-User'):
        require(robots.can_fetch(bot, ORIGIN + route), f'{route}: {bot} must be able to reach the offer')
    require(service.get('areaServed', {}).get('name') == city and
            service['areaServed'].get('@type') == area_type, f'{route}: truthful service area')
    require(service.get('isRelatedTo') == {'@id': ORIGIN + SERVICE_PATH + '#service'}, f'{route}: canonical service relationship')
    require(SERVICE_PATH in page.links, f'{route}: visible website service link')
    inquiries = [parse_qs(urlsplit(href).query) for href in page.links
                 if urlsplit(href).path == '/tech-audit/']
    require(any(q.get('intent') == ['website'] and q.get('source') == [route] for q in inquiries), f'{route}: website inquiry retains source page')
    require(sum(href.startswith('/case-studies/') for href in set(page.links)) >= 2, f'{route}: real work is reachable')
    require('budget range' in ' '.join(page.text).lower(), f'{route}: optional project context is visible')
    visible = ' '.join(' '.join(page.text).split())
    faq_nodes = [node for node in page.nodes if node.get('@type') == 'FAQPage']
    require(len(faq_nodes) == 1 and len(faq_nodes[0].get('mainEntity', [])) == 4, f'{route}: four supported buyer questions')
    for question in faq_nodes[0]['mainEntity']:
        require(question['name'] in visible and question['acceptedAnswer']['text'] in visible,
                f'{route}: FAQ schema must match visible question and answer')
    for href in page.links:
        path = urlsplit(href).path
        if path.startswith(('/case-studies/', '/markets/')):
            require((DIST / path.strip('/') / 'index.html').is_file(), f'{route}: broken proof or guide link {path}')
industry_routes = ['/' + file.parent.relative_to(DIST).as_posix() + '/'
                   for file in (DIST / 'industries').rglob('index.html')]
for route in industry_routes:
    connected_service(route)
print(f'PASS website markets: 3 crawlable/indexable offers, homepage and sitemap discovery, {4 + len(industry_routes)} reciprocal Service graphs, truthful areas, real proof and website-intent inquiry routes.')
