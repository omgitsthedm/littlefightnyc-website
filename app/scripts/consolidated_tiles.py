"""Consolidate homepage choices while retaining every useful reader URL."""
from copy import deepcopy
from html import escape
import json
import re
from pathlib import Path
from urllib.parse import urlsplit

from editorial_tiles import geometry, story_illustration
from reader_visuals import STORY_ART, _story_figure
from topic_mosaic import TILE, attributes, icon, set_attr


FRONT_ART = {
    'ownership': 'ownership', 'speed': 'mobile', 'booking': 'forms',
    'web-homepage-priority': 'web-service-page',
    'web-content-collection': 'web-content-collection',
    'web-redesign-decision': 'web-redesign-decision',
    'wifi': 'wifi', 'email': 'email',
    'consulting-tool-choice': 'consulting-tool-choice',
    'software-repeat-work': 'software-repeat-work',
}
CHAPTER_ART = {
    'ownership': {1: 'platform'},
    'speed': {1: 'web-accessibility-basics'},
    'booking': {1: 'forms'},
    'web-homepage-priority': {1: 'web-service-page'},
    'web-content-collection': {1: 'web-photos-with-purpose', 2: 'web-menu-and-hours'},
    'web-redesign-decision': {1: 'web-redesign-decision'},
    'page-services-it-support': {1: 'wifi'},
    'computer': {1: 'it-shared-files'},
    'software-business-ownership': {1: 'ownership'},
}


def load_groups(content):
    groups, hidden = [], {'page-library', 'google-reviews'}
    for name in ('consolidated-web.json', 'consolidated-support.json'):
        data = json.loads((content / name).read_text())
        groups.extend(data['groups'])
        hidden.update(data.get('hiddenHomeIds', []))
    ids = [group['id'] for group in groups]
    absorbed = [identity for group in groups for identity in group['absorb']]
    assert len(groups) == 19 and len(set(ids)) == len(ids), 'Expected 19 distinct combined cards'
    assert len(set(absorbed)) == len(absorbed), 'A question belongs to more than one combined card'
    assert not set(ids).intersection(absorbed + list(hidden)), 'A combined card cannot be hidden'
    assert not set(absorbed).intersection(hidden), 'Absorbed questions already have their own home context'
    return groups, hidden


def source_routes(content, groups):
    routes = {}
    for match in TILE.finditer((content / 'mosaic.html').read_text()):
        attrs = attributes(match.group())
        if attrs.get('data-answer'):
            routes[attrs['data-answer']] = attrs.get('href', '')
    for item in json.loads((content / 'topic-tiles.json').read_text()):
        routes[item['id']] = '/answers/help/' + item['id'] + '/'
    routes.update({
        'buyer-plumbers': '/industries/plumbers/', 'buyer-roofing': '/industries/roofing/',
        'buyer-homes': '/industries/luxury-home-services/', 'buyer-law': '/industries/law-firms/',
        'google-reviews': '/reviews/',
    })
    routes.update({group['id']: group['path'] for group in groups})
    return routes


def home_contexts(content, groups, hidden):
    routes = source_routes(content, groups)
    contexts = {}
    for group in groups:
        for identity in [group['id'], *group['absorb']]:
            assert identity in routes, f'Unknown consolidated source: {identity}'
            contexts[urlsplit(routes[identity]).path] = group['path']
    specific = {
        'web-events-calendar': '/answers/help/web-content-collection/',
        'web-menu-and-hours': '/answers/help/web-content-collection/',
        'web-ecommerce-inventory': '/industries/',
        'web-multilingual-start': '/answers/help/consulting-tool-choice/',
        'web-reviews-response': '/answers/help/maps/',
        'web-newsletter-choice': '/answers/help/consulting-tool-choice/',
        'page-library': '/services/custom-local-websites/',
    }
    for identity in hidden:
        assert identity in routes, f'Unknown hidden homepage source: {identity}'
        contexts[urlsplit(routes[identity]).path] = specific.get(identity, '/services/custom-local-websites/')
    return contexts


def apply_readers(pages, authored, groups):
    for group in groups:
        path = group['path']
        assert path in pages, f'Combined reader must retain an existing route: {path}'
        if group.get('preserveReader'):
            page = deepcopy(pages[path])
            page['faqs'] = page.get('faqs', []) + deepcopy(group.get('faqs', []))
            for faq in page['faqs']:
                if 'outside New York' in faq['question']:
                    faq['links'] = [{'label': label, 'href': route} for label, route in [
                        ('New York City', '/markets/nyc/'), ('Martha’s Vineyard', '/markets/marthas-vineyard/'),
                        ('Arizona', '/markets/arizona/'), ('Louisiana', '/markets/louisiana-starbase-area/'),
                        ('South Texas', '/markets/texas-starbase-area/'), ('Space Coast', '/markets/florida-space-coast/'),
                    ]]
            pages[path] = page
            authored[path] = page
            continue
        page = deepcopy(pages[path])
        for old in ('answerContent', 'marketContent', 'contentBlocks', 'sourceDepth', 'extraHtml'):
            page.pop(old, None)
        page.update({key: deepcopy(group[key]) for key in ('heading', 'summary', 'sections', 'faqs', 'icon') if key in group})
        page.update(id=group['id'], title=group['title'] + ' | Little Fight NYC',
                    description=group.get('description') or group['summary'][:157].rsplit(' ', 1)[0],
                    family=group['family'], _homeGroup=group,
                    eyebrow={'web': 'Websites', 'it': 'Tech support', 'consulting': 'Consulting', 'software': 'Custom software'}[group['family']])
        pages[path] = page
        authored[path] = page


def render_group_sections(group, link):
    chapters = []
    for index, section in enumerate(group['sections']):
        body = ''.join('<p>' + escape(text) + '</p>' for text in section.get('paragraphs', []))
        if section.get('bullets'):
            body += '<ul>' + ''.join('<li>' + escape(text) + '</li>' for text in section['bullets']) + '</ul>'
        if section.get('links'):
            body += '<nav class="group-references" aria-label="Related details">' + ''.join(link(item['label'], item['href']) for item in section['links']) + '</nav>'
        art_id = CHAPTER_ART.get(group['id'], {}).get(index)
        # Avoid repeating the hero artwork inside the same reader.
        if art_id == FRONT_ART.get(group['id']):
            art_id = None
        art = re.sub(r'<figcaption>.*?</figcaption>', '', _story_figure(art_id)) if art_id in STORY_ART else ''
        heading = '<h2>' + escape(section['heading']) + '</h2>' if section.get('heading') else ''
        identity=' id="'+escape(section['id'])+'"' if section.get('id') else ''
        chapters.append('<section'+identity+' class="group-chapter' + (' group-chapter--illustrated' if art else '') + '"><div class="group-chapter-heading">' + heading + '</div><div class="group-chapter-copy">' + body + art + '</div></section>')
    return '<div class="group-story">' + ''.join(chapters) + '</div>'


def group_hero(group):
    art_id = FRONT_ART.get(group['id'])
    if art_id:
        return re.sub(r'<figcaption>.*?</figcaption>', '', _story_figure(art_id))
    return ''


def apply_homepage_groups(mosaic, groups, hidden):
    by_id = {group['id']: group for group in groups}
    fallback_titles = {'brand-brief': 'Problems? Solved.', 'page-services-tech-consulting': 'Consulting'}
    removed = set(hidden) | {identity for group in groups for identity in group['absorb']}
    before = [attributes(match.group()) for match in TILE.finditer(mosaic)]
    labs = json.loads((Path(__file__).resolve().parents[1] / 'preview-content/labs.json').read_text())
    expected = 129 + len(labs) - 9 + 1  # new Labs and the construction collection
    assert len(before) == expected, 'The source tile inventory changed unexpectedly'
    all_ids = {item['data-answer'] for item in before}
    assert set(by_id) | removed <= all_ids, 'Consolidation names a missing homepage tile'

    def combine(match):
        markup = match.group()
        attrs = attributes(markup)
        identity = attrs['data-answer']
        if identity in removed:
            return ''
        group = by_id.get(identity)
        if not group:
            return markup
        markup = set_attr(markup, 'data-home-group', identity)
        markup = set_attr(markup, 'data-cell-title', group['title'])
        if attrs.get('data-kind') == 'service-anchor':
            return markup
        markup = re.sub(r'\sdata-(?:compact-label|narrow-compact|mobile-long-word)="[^"]*"', '', markup)
        markup = set_attr(markup, 'aria-label', group['title'])
        art_id = FRONT_ART.get(identity)
        # Reuse the established illustrated composition, with its new clear promise.
        if art_id:
            markup = geometry(markup, 3, 2, 3, 4)
            markup = set_attr(markup, 'data-editorial-story', art_id)
            markup = set_attr(markup, 'data-editorial-story-family', group['family'])
            markup = set_attr(markup, 'data-cell-face', 'mixed')
            markup = set_attr(markup, 'data-editorial-story-alignment', 'art-start')
            front = '<span class="editorial-story-card"><span class="editorial-story-art">' + story_illustration(art_id) + '</span><span class="editorial-story-copy"><span class="cell-title">' + escape(group['title']) + '</span><span class="editorial-story-plus" aria-hidden="true">+</span></span></span>'
        else:
            markup = geometry(markup, 3, 2, 3, 3)
            markup = set_attr(markup, 'class', 'tile topic-question home-group-tile')
            markup = set_attr(markup, 'data-cell-face', 'mixed')
            front = '<span class="cell-face"><span class="cell-title">' + escape(group['title']) + '</span><span class="cell-art">' + icon(group['icon']) + '</span><span class="cell-go" aria-hidden="true">+</span></span>'
        return markup[:markup.index('>') + 1] + front + '</a>'

    combined = TILE.sub(combine, mosaic)
    visible = [attributes(match.group()) for match in TILE.finditer(combined)]
    leads = {member: group['path'] for group in groups for member in group['absorb']}
    routes = []
    for item in before:
        identity, path = item['data-answer'], item['href']
        routes.append({'id': identity, 'path': path, 'title': by_id.get(identity, {}).get('title') or item.get('data-cell-title') or fallback_titles.get(identity, identity),
                       'visible': identity not in removed, 'homePath': leads.get(identity, path if identity not in hidden else '/services/custom-local-websites/')})
    manifest = {
        'sourceTileCount': 106, 'totalTileInventory': len(before),
        'visibleTiles': [{'id': item['data-answer'], 'path': item['href'], 'title': item.get('data-cell-title') or fallback_titles.get(item['data-answer'], item['data-answer']), 'family': item.get('data-family', 'brand')} for item in visible],
        'retainedRoutes': routes,
        'groups': [{'id': group['id'], 'path': group['path'], 'members': group['absorb']} for group in groups],
        'hiddenHomeIds': sorted(hidden),
    }
    assert len(visible) == len(before) - len(removed)
    return combined, manifest
