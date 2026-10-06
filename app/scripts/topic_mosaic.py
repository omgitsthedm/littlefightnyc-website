"""Arrange the authored tiles without discarding their identities or readers."""
from html import escape, unescape
from html.parser import HTMLParser
import re

from service_taxonomy import override_family

E = lambda value: escape(str(value or ''), quote=True)
TOPICS = {
    'web': ('Websites', 'blue', 'browser-duotone.svg'),
    'it': ('Tech support', 'yellow', 'wifi-high-bold.svg'),
    'consulting': ('Consulting', 'green', 'chats-circle-duotone.svg'),
    'software': ('Custom software', 'magenta', 'app-window-duotone.svg'),
}
REVIEW_PLACEMENT = {
    'google-review-1': ('web', 'case-hair-by-rachel-charles'),
    'google-review-4': ('web', 'web-homepage-priority'),
    'google-review-3': ('it', 'email'),
    'google-review-2': ('it', 'it-video-call-room'),
    'google-review-5': ('consulting', 'album-shops'),
    'google-review-7': ('consulting', 'consulting-second-opinion'),
    'google-review-6': ('software', 'software-repeat-work'),
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


def inline_mosaic_symbols(markup):
    """Keep source icons visible after the old hidden SVG sprite is retired."""
    key = '<g class="key-turn"><circle cx="8" cy="8" r="4.5"></circle><path d="m11.5 11.5 9 9M16 16l2.5-2.5M18.5 18.5l2.5-2.5"></path><circle cx="7" cy="7" r=".5"></circle></g>'
    return re.sub(r'<use\s+href="#i-key"\s*/?>\s*</use>', key, markup)

def icon(filename, cls=''):
    return f'<span class="mineral-icon {cls}" data-icon="{E(filename.removesuffix(".svg"))}" aria-hidden="true" style="--mineral-asset:url(/assets/mineral/{E(filename)})"></span>'


def question_tile(record):
    family = override_family(record.get('id', ''), '/answers/help/'+record['id']+'/') or record['family']
    title = record['title']
    words = len(title.split())
    # Question cards are concise enough to read as horizontal prompts on a
    # desktop.  A three-unit strip buys a whole-word line length for longer
    # questions; handsets retain the second or third row needed for the same
    # 16px-or-larger type and its familiar icon.
    columns = 3 if words > 3 or len(title) > 18 else 2
    mobile_columns = 3 if words > 2 or len(title) > 18 else 2
    mobile_rows = 3 if mobile_columns == 3 else 2
    return f'''<a class="tile topic-question" href="/answers/help/{E(record['id'])}/" data-answer="{E(record['id'])}" data-family="{family}" data-accent="{TOPICS[family][1]}" data-material="mineral" data-material-family="{family}" data-cell-face="mixed" data-cell-title="{E(title)}" data-columns="{columns}" data-rows="1" data-mobile-columns="{mobile_columns}" data-mobile-rows="{mobile_rows}" aria-label="{E(record['question'])}"><span class="cell-face"><span class="cell-title">{E(title)}</span><span class="cell-art">{icon(record['icon'])}</span><span class="cell-go" aria-hidden="true">+</span></span><span class="answer-preview">{E(record['summary'])}</span></a>'''


def review_tile(review):
    quote = f'<blockquote class="review-quote">“{E(review["excerpt"])}”</blockquote>' if review['excerpt'] else ''
    style = 'standard'
    star = '<path d="m12 2 2.9 6.1 6.7 1-4.8 4.7 1.1 6.7-5.9-3.2-5.9 3.2 1.1-6.7-4.8-4.7 6.7-1Z"/>'
    stars = ''.join(f'<svg class="review-star" viewBox="0 0 24 24" aria-hidden="true" style="--star-index:{index}">{star}</svg>' for index in range(5))
    flourish = ''
    columns = 3
    mobile_rows = 4 if len(review.get('excerpt') or '') > 40 else 3
    return f'''<a class="tile review-tile{' review-rating-only' if not quote else ''}" href="{E(review['sourceUrl'])}" target="_blank" rel="noopener noreferrer" data-answer="{E(review['id'])}" data-review-tile="true" data-review-id="{E(review['id'])}" data-review-style="{style}" data-family="brand" data-accent="orange" data-material="mineral" data-material-family="brand" data-kind="review" data-columns="{columns}" data-rows="2" data-mobile-columns="3" data-mobile-rows="{mobile_rows}" data-cell-title="{E(review['displayName'])}’s Google review" aria-label="Read {E(review['displayName'])}’s five-star Google review (opens in a new tab)">{flourish}<span class="review-stars" role="img" aria-label="5 out of 5 stars">{stars}</span>{quote}<span class="review-credit"><span class="review-attribution">{E(review['displayName'])}</span><span class="review-source"><span class="sr-only">Google review</span><span aria-hidden="true">+</span></span></span></a>'''


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


def business_art(identity):
    drawings = {
        'buyer-plumbers': '<path d="M20 22h18v25h34V22h18v35c0 6-5 10-10 10H30c-6 0-10-4-10-10Z"/><path d="M15 22h28M67 22h28M29 48h0M48 47v20M61 47v20"/>',
        'buyer-roofing': '<path d="m12 48 43-33 43 33M22 48l33-25 33 25M30 42v31h50V42M68 25V14h12v20"/><path d="M44 73V54h22v19"/>',
        'buyer-homes': '<path d="m14 41 24-20 24 20M22 37v38h68V37H58M36 75V55h14v20M68 48h11v12H68z"/><path d="M66 25h19M75 16v18"/>',
        'buyer-law': '<path d="M55 18v53M34 75h42M29 32h52M26 33 13 55h26L26 33ZM84 33 71 55h26L84 33Z"/><circle cx="55" cy="24" r="6"/><path d="M13 55c0 15 26 15 26 0M71 55c0 15 26 15 26 0"/>',
    }
    drawing = drawings.get(identity)
    return ('<span class="cell-art"><svg class="cell-sketch" viewBox="0 0 110 90" aria-hidden="true">'+drawing+'</svg></span>') if drawing else ''


def compact_strip_dimensions(title):
    """Return a legible horizontal desktop shape and its phone counterpart."""
    words = len(title.split())
    columns = 2 if words <= 3 and len(title) <= 18 else 3
    mobile_columns = 2 if words <= 2 and len(title) <= 18 else 3
    mobile_rows = 2 if mobile_columns == 2 else 3
    return columns, 1, mobile_columns, mobile_rows


COMPACT_LABELS = {
    'website': (3, 2),
    'maps': (3, 2),
    'speed': (2, 2),
    'move': (2, 2),
    'human': (2, 2),
}


def build_topic_mosaic(mosaic, reviews, topic_tiles, albums):
    originals = TILE.findall(mosaic)
    assert len(originals) == 111, f'Expected 106 originals and five existing additions, found {len(originals)}'
    tiles = originals+[question_tile(record) for record in topic_tiles]+[review_tile(record) for record in reviews['reviews']]
    groups = {family: [] for family in TOPICS}
    album_by_id = {album['id']: album for album in albums}
    buyer_titles = {'buyer-plumbers': 'Websites for plumbers', 'buyer-roofing': 'Websites for roofers', 'buyer-homes': 'Websites for home services', 'buyer-law': 'Websites for law firms', 'google-reviews': 'Google reviews'}

    for order, markup in enumerate(tiles):
        attrs = attributes(markup)
        identity = attrs.get('data-answer') or 'brand-brief'
        source_family = attrs.get('data-family', 'brand')
        kind = attrs.get('data-kind', '')
        explicit_family = override_family(identity, attrs.get('href', ''))
        topic = explicit_family or (source_family if source_family in TOPICS else 'web')
        if kind == 'review':
            topic = REVIEW_PLACEMENT[identity][0]
        brand = not explicit_family and (kind in ('case-study', 'lab', 'photo-album', 'review') or source_family == 'brand' or identity == 'page-vera')
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
            if identity.startswith('buyer-'):
                markup = markup.replace('<span class="buyer-plus"', business_art(identity)+'<span class="buyer-plus"')
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
                responsive = ' srcset="/assets/albums/optimized/food-extra-01-320.webp 320w, /assets/albums/optimized/food-extra-01-640.webp 640w, '+E(image['localUrl'])+' 1000w" sizes="(max-width:1000px) 66vw, (max-width:1560px) 33vw, 480px"'
            photos = [f'<img class="is-active" src="{src}"{responsive} width="{image["width"]}" height="{image["height"]}" alt="" {priority} decoding="async">']
            for following in album['photos'][1:3]:
                photos.append(f'<img data-src="{E(following["localUrl"])}" width="{following["width"]}" height="{following["height"]}" alt="" decoding="async">')
            photo = '<span class="photo-album-tile__images" aria-hidden="true">'+''.join(photos)+'</span>'
            markup = re.sub(r'<span class="photo-album-tile__images".*?</span>', photo, markup, flags=re.S)
            markup = re.sub(r'<span class="photo-album-tile__kicker">.*?</span>', '', markup)
        width, height = int(attrs.get('data-columns', 3)), int(attrs.get('data-rows', 2))
        mobile_width = int(attrs.get('data-mobile-columns', width))
        mobile_height = int(attrs.get('data-mobile-rows', height))
        face = attrs.get('data-cell-face', '')
        title = attrs.get('data-cell-title', '')
        visible_title = re.search(r'<span class="cell-title">(.*?)</span>', markup, re.S)
        if visible_title:
            title = ' '.join(unescape(re.sub(r'<[^>]+>', ' ', visible_title.group(1))).split())
            markup = set_attr(markup, 'data-cell-title', title)
        long_mobile_word = max((len(word.strip(".,?!'’—-")) for word in title.split()), default=0) >= 10
        if kind == 'service-anchor':
            # The artwork pass owns the service anchors and will set their
            # final featured geometry after this ordinary-card pass.
            width, height = mobile_width, mobile_height = 4, 2
        if identity == 'brand-brief':
            width, height = 4, 1
            mobile_width, mobile_height = 6, 2
        if identity == 'google-reviews':
            # This is an introduction to the sourced quote cards, not a
            # second story card.  Preserve phone breathing room only.
            width, height = 3, 1
            mobile_width, mobile_height = 3, 2
        if kind == 'case-study':
            width, height = mobile_width, mobile_height = 3, 2
        if kind == 'photo-album':
            width, height = mobile_width, mobile_height = 4, 4
        if kind == 'lab':
            # A Lab has enough room to make its actual captured experience the
            # composition.  Phone keeps a three-column bento tile and earns
            # its fourth row with the readable invitation below the picture.
            width, height = 3, 3
            mobile_width, mobile_height = 3, 4
        if kind == 'review':
            width, height = int(attrs.get('data-columns', 3)), 2
            mobile_width, mobile_height = 3, max(3, mobile_height)
        if identity.startswith('buyer-'):
            # Industry routes carry only a title and one original drawing.
            # They read cleanly beside each other in one desktop row.
            width, height, mobile_width, mobile_height = 3, 1, 3, 2
        if identity in COMPACT_LABELS:
            # These are the shortest original prompts. At a full desktop unit
            # the words themselves become the composition, rather than a
            # small label stranded beside an icon. Phone geometry remains
            # deliberately roomy and keeps the authored illustration visible.
            mobile_width, mobile_height = COMPACT_LABELS[identity]
            width, height = 1, 1
            markup = set_attr(markup, 'data-compact-label', 'true')
        # Original icon cards are deliberately all signal: one square, one
        # recognizable object, and a complete accessible name. Every other
        # ordinary front is a short message plus its diagram or symbol, so it
        # earns a compact horizontal strip instead of a mostly empty square.
        if kind not in ('service-anchor', 'case-study', 'photo-album', 'review', 'lab'):
            if face == 'icon':
                width, height = mobile_width, mobile_height = 1, 1
            elif identity not in ('brand-brief', 'google-reviews', 'page-vera', 'booking', 'it-payment-device-check', *COMPACT_LABELS):
                width, height, mobile_width, mobile_height = compact_strip_dimensions(title)
        # Visible words are the accessible name. Keep the original question as
        # a description, while icon-only cards retain their explicit name.
        if (width > 1 or identity in ('website', 'maps', 'speed', 'move', 'human')) and attrs.get('data-cell-face') != 'icon' and attrs.get('aria-label'):
            markup = set_attr(markup, 'aria-description', attrs['aria-label'])
            end = markup.index('>')
            markup = re.sub(r'\saria-label="[^"]*"', '', markup[:end])+markup[end:]
        style = attrs.get('style', '')
        style = re.sub(r'grid-area:[^;]+;?', '', style)
        style += f';--preferred-columns:{width};--preferred-rows:{height};--mobile-columns:{mobile_width};--mobile-rows:{mobile_height}'
        markup = set_attr(markup, 'style', style)
        # These are also the no-script geometry hooks used by the compact
        # front compositions. The packer rewrites them only when a viewport
        # needs a different, still integer, mobile shape.
        markup = set_attr(markup, 'data-columns', width)
        markup = set_attr(markup, 'data-rows', height)
        if long_mobile_word and mobile_width < 3 and face != 'icon' and kind not in ('service-anchor', 'case-study', 'photo-album', 'review'):
            markup = set_attr(markup, 'data-mobile-long-word', 'true')
        for key, value in [('preferred-columns', width), ('preferred-rows', height), ('mobile-columns', mobile_width), ('mobile-rows', mobile_height)]:
            markup = set_attr(markup, 'data-'+key, value)
        groups[topic].append((identity, kind, order, plus_navigation(inline_mosaic_symbols(markup))))

    # Put real photography into the opening composition. Everything else stays
    # in its authored order within its topic, including every question and URL.
    leads = {'web': ['brand-brief', 'page-services-custom-local-websites', 'case-chromatic-painting-design', 'case-hair-by-rachel-charles', 'website'],
             'it': ['page-services-it-support'],
             'consulting': ['page-services-tech-consulting', 'album-nyc', 'album-marthas-vineyard', 'album-arizona'],
             'software': ['page-services-business-systems', 'case-venuecircuit', 'page-vera']}
    sections = []
    for family, (label, _, symbol) in TOPICS.items():
        preferred = leads[family]
        entries = sorted(groups[family], key=lambda item: (preferred.index(item[0]) if item[0] in preferred else len(preferred), item[2]))
        review_entries = {entry[0]: entry for entry in entries if entry[1] == 'review'}
        ordered = []
        for entry in entries:
            if entry[1] == 'review':
                continue
            ordered.append(entry)
            for identity, (topic, after) in REVIEW_PLACEMENT.items():
                if topic == family and after == entry[0]:
                    ordered.append(review_entries.pop(identity))
        assert not review_entries, f'Reviews need an explicit position among the {family} cards'
        entries = ordered
        contents = ''.join(entry[3] for entry in entries)
        sections.append(f'<section class="topic-section" id="topic-{family}" data-topic="{family}" aria-labelledby="heading-{family}"><header class="topic-heading">{icon(symbol)}<h2 id="heading-{family}" tabindex="-1">{label}</h2></header><div class="mosaic" data-topic-grid="{family}" data-topic="{family}">{contents}</div></section>')
    return ''.join(sections)
