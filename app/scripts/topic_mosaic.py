"""Arrange the authored tiles without discarding their identities or readers."""
from html import escape, unescape
from html.parser import HTMLParser
import re

E = lambda value: escape(str(value or ''), quote=True)
TOPICS = {
    'web': ('Websites', 'blue', 'browser-duotone.svg'),
    'it': ('Tech support', 'yellow', 'wifi-high-bold.svg'),
    'consulting': ('Consulting', 'green', 'chats-circle-duotone.svg'),
    'software': ('Custom software', 'magenta', 'app-window-duotone.svg'),
    'reviews': ('Google reviews', 'orange', 'chats-circle-duotone.svg'),
}
TILE = re.compile(r'<a\b[^>]*\bclass="[^"]*\btile\b[^"]*"[^>]*>.*?</a>', re.S)


class Attributes(HTMLParser):
    def handle_starttag(self, tag, attrs):
        if not hasattr(self, 'attrs'):
            self.attrs = dict(attrs)


def attributes(markup):
    parsed = Attributes()
    parsed.feed(markup[:markup.index('>')+1])
    return parsed.attrs


def set_attr(markup, name, value):
    end = markup.index('>')
    opening, content = markup[:end], markup[end:]
    pattern = r'\s'+re.escape(name)+r'(?:="[^"]*")?(?=\s|$)'
    replacement = ' '+name+'="'+E(value)+'"'
    opening = re.sub(pattern, lambda _: replacement, opening) if re.search(pattern, opening) else opening+replacement
    return opening+content


def plus_navigation(markup):
    """Change navigation affordances, preserving diagrams and authored prose."""
    def replace(match):
        return re.sub('[↗↘↙↖→←↑↓➜➔⤴]', '+', match.group(0))
    return re.sub(r'<(?:a|button|summary)\b[^>]*>.*?</(?:a|button|summary)>', replace, markup, flags=re.S)


def icon(filename, cls=''):
    return f'<span class="mineral-icon {cls}" aria-hidden="true" style="--mineral-asset:url(/assets/mineral/{E(filename)})"></span>'


def question_tile(record):
    family = record['family']
    return f'''<a class="tile topic-question" href="/answers/help/{E(record['id'])}/" data-answer="{E(record['id'])}" data-family="{family}" data-accent="{TOPICS[family][1]}" data-material="mineral" data-material-family="{family}" data-cell-face="mixed" data-cell-title="{E(record['title'])}" data-columns="2" data-rows="2" aria-label="{E(record['question'])}"><span class="cell-face"><span class="cell-title">{E(record['title'])}</span><span class="cell-art">{icon(record['icon'])}</span><span class="cell-go" aria-hidden="true">+</span></span><span class="answer-preview">{E(record['summary'])}</span></a>'''


def review_tile(review):
    quote = f'<blockquote class="review-quote">“{E(review["excerpt"])}”</blockquote>' if review['excerpt'] else '<p class="review-rating-only">Five-star rating</p>'
    return f'''<a class="tile review-tile" href="{E(review['sourceUrl'])}" target="_blank" rel="noopener noreferrer" data-answer="{E(review['id'])}" data-review-tile="true" data-review-id="{E(review['id'])}" data-family="brand" data-accent="orange" data-material="mineral" data-material-family="brand" data-kind="review" data-columns="3" data-rows="3" data-cell-title="{E(review['displayName'])}’s Google review"><span class="review-stars" role="img" aria-label="5 out of 5 stars">★★★★★</span>{quote}<span class="review-attribution">{E(review['displayName'])}</span><span class="review-source">Google <span aria-hidden="true">+</span></span></a>'''


def anchor_front(markup, family):
    label, _, symbol = TOPICS[family]
    headings = {'web': 'Help customers choose you.', 'it': 'Computers, Wi-Fi & email.', 'consulting': 'Not sure where to start?', 'software': 'Less copying. Fewer steps.'}
    art = icon(symbol, 'topic-anchor-icon')
    if family == 'web':
        art += '<span class="topic-anchor-photo"><img src="/assets/proof/optimized/case-chromatic-painting-design-640.webp" width="640" height="444" alt="Chromatic Painting &amp; Design website"><span>Chromatic</span></span>'
    front = f'<span class="topic-anchor-face"><span class="topic-anchor-copy"><span class="topic-anchor-label">{label}</span><strong>{headings[family]}</strong></span><span class="topic-anchor-art">{art}</span><span class="anchor-go" aria-hidden="true">+</span></span>'
    opening = markup[:markup.index('>')+1]
    trace = re.search(r'<svg class="anchor-trace".*?</svg>', markup, re.S)
    return opening+front+(trace.group(0) if trace else '')+'</a>'


def build_topic_mosaic(mosaic, reviews, topic_tiles, albums):
    originals = TILE.findall(mosaic)
    assert len(originals) == 115, f'Expected 110 originals and five existing additions, found {len(originals)}'
    tiles = originals+[question_tile(record) for record in topic_tiles]+[review_tile(record) for record in reviews['reviews']]
    groups = {family: [] for family in TOPICS}
    album_by_id = {album['id']: album for album in albums}
    special_topics = {'case-public-house-creative': 'software', 'lab-studio-engine': 'software', 'lab-growth-street': 'consulting'}
    buyer_titles = {'buyer-plumbers': 'Websites for plumbers', 'buyer-roofing': 'Websites for roofers', 'buyer-homes': 'Websites for home services', 'buyer-law': 'Websites for law firms', 'google-reviews': 'Read our Google reviews'}

    for order, markup in enumerate(tiles):
        attrs = attributes(markup)
        identity = attrs.get('data-answer') or 'brand-brief'
        family = attrs.get('data-family', 'brand')
        kind = attrs.get('data-kind', '')
        topic = special_topics.get(identity, family if family in TOPICS else 'web')
        if identity == 'google-reviews' or kind == 'review':
            topic = 'reviews'
        brand = kind in ('case-study', 'lab', 'photo-album', 'review') or family == 'brand'
        family = 'brand' if brand else topic
        markup = set_attr(markup, 'data-answer', identity)
        markup = set_attr(markup, 'data-topic', topic)
        markup = set_attr(markup, 'data-topic-rich', 'true')
        markup = set_attr(markup, 'data-family', family)
        markup = set_attr(markup, 'data-material-family', family)
        markup = set_attr(markup, 'data-material', 'mineral')
        markup = set_attr(markup, 'data-accent', 'orange' if family == 'brand' else TOPICS[family][1])

        if kind == 'service-anchor':
            markup = anchor_front(markup, topic)
        if identity in buyer_titles:
            title = buyer_titles[identity]
            markup = set_attr(markup, 'data-cell-title', title)
            markup = re.sub(r'<span class="cell-kicker">.*?</span>', '', markup)
            markup = re.sub(r'<span class="cell-title">.*?</span>', '<span class="cell-title">'+E(title)+'</span>', markup)
        if identity == 'brand-brief':
            markup = re.sub(r'<[^>]+class="(?:brand-note|mosaic-brand-eyebrow)"[^>]*>.*?</[^>]+>', '', markup, flags=re.S)
        if kind == 'photo-album':
            album = album_by_id[identity]
            image = album['photos'][0]
            priority = 'loading="eager" fetchpriority="high"' if identity=='album-hospitality' else 'loading="lazy"'
            src = E(image['localUrl'])
            responsive = ''
            if identity=='album-hospitality':
                src = '/assets/albums/optimized/food-extra-01-640.webp'
                responsive = ' srcset="/assets/albums/optimized/food-extra-01-320.webp 320w, /assets/albums/optimized/food-extra-01-640.webp 640w, '+E(image['localUrl'])+' 1000w" sizes="(max-width:760px) 66vw, (max-width:1560px) 33vw, 480px"'
            photo = f'<span class="photo-album-tile__images" aria-hidden="true"><img src="{src}"{responsive} width="{image["width"]}" height="{image["height"]}" alt="" {priority} decoding="async"></span>'
            markup = re.sub(r'<span class="photo-album-tile__images".*?</span>', photo, markup, flags=re.S)
            markup = re.sub(r'<span class="photo-album-tile__kicker">.*?</span>', '', markup)
        width, height = int(attrs.get('data-columns', 3)), int(attrs.get('data-rows', 2))
        if kind == 'service-anchor' or identity in ('brand-brief', 'google-reviews'):
            width, height = 4, 2
        if kind == 'photo-album':
            width, height = 4, 4
        if kind == 'review':
            width, height = 3, 3
        # Visible words are the accessible name. Keep the original question as
        # a description, while icon-only cards retain their explicit name.
        if width > 1 and attrs.get('data-cell-face') != 'icon' and attrs.get('aria-label'):
            markup = set_attr(markup, 'aria-description', attrs['aria-label'])
            end = markup.index('>')
            markup = re.sub(r'\saria-label="[^"]*"', '', markup[:end])+markup[end:]
        style = attrs.get('style', '')
        style = re.sub(r'grid-area:[^;]+;?', '', style)
        style += f';--preferred-columns:{width};--preferred-rows:{height};--mobile-columns:{width};--mobile-rows:{height}'
        markup = set_attr(markup, 'style', style)
        for key, value in [('preferred-columns', width), ('preferred-rows', height), ('mobile-columns', width), ('mobile-rows', height)]:
            markup = set_attr(markup, 'data-'+key, value)
        groups[topic].append((identity, kind, order, plus_navigation(markup)))

    # Put real photography into the opening composition. Everything else stays
    # in its authored order within its topic, including every question and URL.
    leads = {'web': ['page-services-custom-local-websites', 'brand-brief', 'album-hospitality', 'case-chromatic-painting-design', 'case-hair-by-rachel-charles', 'website'],
             'it': ['page-services-it-support', 'album-nyc'],
             'consulting': ['page-services-tech-consulting'],
             'software': ['page-services-business-systems', 'case-venuecircuit', 'page-vera'],
             'reviews': [record['id'] for record in reviews['reviews']]+['google-reviews']}
    sections = []
    for family, (label, _, symbol) in TOPICS.items():
        preferred = leads[family]
        entries = sorted(groups[family], key=lambda item: (preferred.index(item[0]) if item[0] in preferred else len(preferred), item[2]))
        contents = ''.join(entry[3] for entry in entries)
        sections.append(f'<section class="topic-section" id="topic-{family}" data-topic="{family}" aria-labelledby="heading-{family}"><header class="topic-heading">{icon(symbol)}<h2 id="heading-{family}" tabindex="-1">{label}</h2></header><div class="mosaic" data-topic-grid="{family}" data-topic="{family}">{contents}</div></section>')
    return ''.join(sections)
