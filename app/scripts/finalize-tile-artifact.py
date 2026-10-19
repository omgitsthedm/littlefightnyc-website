"""Finalize crawl discovery and hash the complete deploy artifact after VERA renders."""
from pathlib import Path
from html.parser import HTMLParser
from html import escape
import hashlib
import json
from urllib.parse import urlsplit
from tile_rewrite import CONTENT_UPDATED, GUIDE_UPDATED, article_updates, guided_paths, load_rewrite, rewritten_paths

ROOT = Path(__file__).resolve().parents[1] / 'dist'
ORIGIN = 'https://littlefightnyc.com'
rewrite = load_rewrite(ROOT.parent / 'preview-content')
updated = rewritten_paths(rewrite)
articles = article_updates(ROOT.parent / 'preview-content')
# The expanded answers and the category page that now links to each of them.
guided = guided_paths(rewrite) | {path for path, category in rewrite['categories'].items()
                                  if any(item.get('guide') and item['category'] == category['id'] for item in rewrite['answers'].values())}


def lastmod(path):
    """Only pages whose copy changed on a recorded date carry one."""
    if path in guided:
        return '<lastmod>' + GUIDE_UPDATED + '</lastmod>'
    if path in articles:
        return '<lastmod>' + articles[path] + '</lastmod>'
    return '<lastmod>' + CONTENT_UPDATED + '</lastmod>' if path in updated else ''


class Head(HTMLParser):
    def __init__(self):
        super().__init__()
        self.canonical = ''
        self.robots = ''

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'link' and a.get('rel') == 'canonical':
            self.canonical = a.get('href', '')
        if tag == 'meta' and a.get('name', '').lower() == 'robots':
            self.robots = a.get('content', '').lower()


urls = set()
for file in ROOT.rglob('*.html'):
    h = Head()
    h.feed(file.read_text(errors='replace').split('</head>')[0])
    if 'noindex' in h.robots or not h.canonical.startswith(ORIGIN + '/'):
        continue
    relative = file.relative_to(ROOT).as_posix()
    route = '/' + relative.removesuffix('index.html') if relative.endswith('index.html') else '/' + relative
    if urlsplit(h.canonical).path == route:
        urls.add(h.canonical)

(ROOT / 'sitemap.xml').write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    '\n'.join('<url><loc>' + escape(url) + '</loc>' + lastmod(urlsplit(url).path) + '</url>' for url in sorted(urls)) +
    '\n</urlset>\n'
)
digest = hashlib.sha256()
files = sorted(file for file in ROOT.rglob('*') if file.is_file()
               and file.name not in ('tile-release.json', 'preview-release.json', 'release.json'))
for file in files:
    digest.update(file.relative_to(ROOT).as_posix().encode() + b'\0' + file.read_bytes())
marker = ROOT / 'tile-release.json'
data = json.loads(marker.read_text())
data.update(artifactSha256=digest.hexdigest(), artifactFiles=len(files), sitemapUrls=len(urls),
            hashScope='All final artifact files except release markers')
marker.write_text(json.dumps(data, indent=2) + '\n')
print(f'Final tile artifact: {len(files)} files, {len(urls)} canonical indexable URLs, SHA256 {digest.hexdigest()}')
