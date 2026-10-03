"""Original editorial artwork and substantial real-work fronts for the mosaic."""
from html import escape
import re
from topic_mosaic import TILE, TOPICS, attributes, icon, set_attr


# These are deliberately limited to the twenty illustrated answer cards.  Their
# compact neighbours retain their short, word-led shapes; a story image earns a
# medium tile and always has a matching image in the opened reader.
STORY_ART = {
    'platform': ('Choose a website platform', 'web'),
    'ownership': ('Own your website', 'web'),
    'cost': ('Know what your website costs', 'web'),
    'mobile': ('Make a website work on a phone', 'web'),
    'forms': ('Make it easy to send an inquiry', 'web'),
    'web-redesign-decision': ('Refresh or rebuild a website', 'web'),
    'web-accessibility-basics': ('Make a website easier to use', 'web'),
    'web-content-collection': ('Gather what a website needs', 'web'),
    'web-service-page': ('Explain the services clearly', 'web'),
    'web-photos-with-purpose': ('Choose useful business photos', 'web'),
    'web-menu-and-hours': ('Keep hours easy to find', 'web'),
    'web-ecommerce-inventory': ('Sell what is actually in stock', 'web'),
    'wifi': ('Reach the rooms where work happens', 'it'),
    'email': ('Help business email reach people', 'it'),
    'backup': ('Keep a second safe copy', 'it'),
    'it-shared-files': ('Find the right shared file', 'it'),
    'consulting-first-priority': ('Choose what to fix first', 'consulting'),
    'consulting-tool-choice': ('Keep the tools that help', 'consulting'),
    'software-repeat-work': ('Stop entering things twice', 'software'),
    'software-approval-path': ('Make approvals clear', 'software'),
}


def geometry(markup, columns, rows, mobile_columns, mobile_rows):
    for key, value in [('preferred-columns', columns), ('preferred-rows', rows),
                       ('columns', columns), ('rows', rows),
                       ('mobile-columns', mobile_columns), ('mobile-rows', mobile_rows)]:
        markup = set_attr(markup, 'data-' + key, value)
    style = attributes(markup).get('style', '')
    style = re.sub(r'--(?:preferred|mobile)-(?:columns|rows):[^;]+;?', '', style)
    style += f';--preferred-columns:{columns};--preferred-rows:{rows};--mobile-columns:{mobile_columns};--mobile-rows:{mobile_rows}'
    return set_attr(markup, 'style', style)


def illustration(name):
    return f'<img class="editorial-illustration" src="/assets/illustrations/{name}-640.webp" srcset="/assets/illustrations/{name}-320.webp 320w, /assets/illustrations/{name}-640.webp 640w" sizes="(max-width:600px) 50vw, 260px" width="640" height="640" alt="" loading="lazy" decoding="async">'


def story_illustration(identity):
    """A responsive, decorative tile image; the reader carries its full alt."""
    return (
        f'<img class="editorial-story-image" '
        f'src="/assets/illustrations/story-{escape(identity)}-640.webp" '
        f'srcset="/assets/illustrations/story-{escape(identity)}-320.webp 320w, '
        f'/assets/illustrations/story-{escape(identity)}-640.webp 640w, '
        f'/assets/illustrations/story-{escape(identity)}-960.webp 960w" '
        f'sizes="(max-width:600px) calc(50vw - 18px), (max-width:1000px) 210px, 220px" '
        f'width="960" height="960" alt="" loading="lazy" decoding="async">'
    )


def enrich_editorial_tiles(mosaic):
    headings = {'web': 'Help customers choose you.', 'it': 'Computers, Wi-Fi & email.',
                'consulting': 'Not sure where to start?', 'software': 'Less copying. Fewer steps.'}

    def enrich(match):
        markup = match.group(0)
        attrs = attributes(markup)
        identity = attrs.get('data-answer')
        if attrs.get('data-kind') == 'service-anchor':
            # The generated mosaic has data-topic; accepting the authored
            # data-family as well keeps this transformation independently
            # inspectable before the packer runs.
            family = attrs.get('data-topic') or attrs.get('data-family')
            if family not in TOPICS:
                return markup
            label, _, symbol = TOPICS[family]
            # Websites is the business's primary entry point. Its service
            # explanation must lead the examples, not look like another case.
            markup = geometry(markup, 8, 4, 6, 5) if family == 'web' else geometry(markup, 4, 2, 6, 3)
            markup = set_attr(markup, 'data-editorial-front', family)
            if family == 'web':
                art = '<span class="topic-anchor-photo"><img src="/assets/proof/editorial/case-easy-tiger-desktop-960.webp" width="640" height="444" alt="Example of a neighborhood bar website built by Little Fight NYC" decoding="async"></span>'
            else:
                art = illustration(family)
            action = '<span class="website-anchor-action">See what’s included <span aria-hidden="true">+</span></span>' if family == 'web' else ''
            front = f'<span class="topic-anchor-face"><span class="topic-anchor-copy">{icon(symbol, "topic-anchor-icon")}<span class="topic-anchor-label">{label}</span><strong>{headings[family]}</strong>{action}</span><span class="topic-anchor-art">{art}</span><span class="anchor-go" aria-hidden="true">+</span></span>'
            trace = re.search(r'<svg class="anchor-trace".*?</svg>', markup, re.S)
            # The same perimeter must follow wide and tall phone frames.
            # Default SVG "meet" would draw a second, inset card outline.
            trace_markup = trace.group(0).replace('<svg ', '<svg preserveAspectRatio="none" ', 1) if trace else ''
            if family == 'web':
                # Its responsive rim uses the live CSS pixel frame. Stretching
                # the old 456px SVG made a second outline inside the card.
                trace_markup = re.sub(r' viewBox="[^"]+"', '', trace_markup)
                trace_markup = re.sub(r'<rect class="trace-rail"[^>]*></rect>', '', trace_markup)
            return markup[:markup.index('>')+1] + front + trace_markup + '</a>'
        if identity in STORY_ART:
            title, family = STORY_ART[identity]
            # A substantial illustration is a 3×2 desktop card.  On a
            # six-column phone mosaic it earns one extra row: that keeps the
            # complete square drawing legible above its native text caption.
            markup = geometry(markup, 3, 2, 3, 4)
            markup = set_attr(markup, 'data-editorial-story', identity)
            markup = set_attr(markup, 'data-editorial-story-family', family)
            markup = set_attr(markup, 'data-cell-face', 'mixed')
            markup = set_attr(markup, 'data-cell-title', title)
            # The illustrated front uses a short visible title.  Preserve the
            # longer owner question as a description instead of letting an
            # aria-label conceal the words that are actually on the tile.
            if attrs.get('aria-label'):
                markup = set_attr(markup, 'aria-description', attrs['aria-label'])
                end = markup.index('>')
                markup = re.sub(r'\saria-label="[^"]*"', '', markup[:end]) + markup[end:]
            alignment = 'art-end' if list(STORY_ART).index(identity) % 2 else 'art-start'
            markup = set_attr(markup, 'data-editorial-story-alignment', alignment)
            front = (
                '<span class="editorial-story-card">'
                f'<span class="editorial-story-art">{story_illustration(identity)}</span>'
                f'<span class="editorial-story-copy"><span class="cell-title">{escape(title)}</span>'
                '<span class="editorial-story-plus" aria-hidden="true">+</span></span>'
                '</span>'
            )
            return markup[:markup.index('>')+1] + front + '</a>'
        if identity == 'booking':
            markup = geometry(markup, 3, 2, 3, 3)
            markup = set_attr(markup, 'data-editorial-front', 'booking')
            return markup[:markup.index('>')+1] + '<span class="editorial-story-face">' + illustration('booking') + '<span class="editorial-story-caption"><span class="cell-title">Make booking easier</span><span aria-hidden="true">+</span></span></span></a>'
        if identity in ('case-chromatic-painting-design', 'case-hair-by-rachel-charles'):
            # Opening proof needs enough image height to show the actual site,
            # rather than a postage stamp in a wide letterboxed slot.
            return geometry(markup, 4, 3, 3, 3)
        return markup

    return TILE.sub(enrich, mosaic)
