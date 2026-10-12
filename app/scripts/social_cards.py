"""Page-specific share cards, derived from the same copy and art as the reader."""
from pathlib import Path
from html import escape
import json
import re
from sculpture_tiles import TOPIC_ART
from clay_library import art_asset

APP = Path(__file__).resolve().parents[1]
ORIGIN = 'https://littlefightnyc.com'
MANIFEST = APP / 'preview-content/social-cards.json'
CARDS = json.loads(MANIFEST.read_text()).get('cards', {}) if MANIFEST.exists() else {}
PLAN = {}
FAMILIES = {
    'web': ('Websites', '#92bfff', 'symbol-browser', 'A handmade clay browser window.'),
    'it': ('Tech support', '#f5d95b', 'object-router', 'A clay Wi-Fi router with a small desk plant.'),
    'consulting': ('Tech consulting', '#a0df85', 'object-notebook', 'A handmade clay notebook and pencil.'),
    'software': ('Custom software', '#f09bdd', 'object-software', 'A handmade clay model of connected software tools.'),
    'brand': ('Little Fight NYC', '#ff7839', 'object-storefront', 'A handmade clay neighborhood storefront.'),
}
# Specific subjects keep the same object vocabulary as the approved tile library.
SUBJECTS = [
    (('printer',), 'object-printer', 'A clay office printer with paper in its tray.'),
    (('wifi', 'wi-fi', 'internet', 'network'), 'object-router', 'A clay Wi-Fi router with a small desk plant.'),
    (('backup', 'back-up'), 'object-backup-drive', 'A handmade clay backup drive.'),
    (('password', 'security', 'phishing', 'scam'), 'object-password-safe', 'A clay safe representing account security.'),
    (('email', 'mail', 'form'), 'object-mail', 'A handmade clay envelope and messages.'),
    (('booking', 'calendar', 'appointment', 'scheduling'), 'object-booking-calendar', 'A handmade clay booking calendar.'),
    (('ownership', 'own-your', 'domain-name', 'who-owns'), 'object-ownership-keys', 'Handmade clay keys representing website ownership.'),
    (('redesign', 'replace-your-website'), 'object-redesign-paint', 'Clay painting tools representing a website redesign.'),
    (('photo', 'content', 'camera'), 'object-content-camera', 'A handmade clay camera and content-making tools.'),
    (('mobile', 'phone'), 'object-phone-dock', 'A clay phone resting in a desk dock.'),
    (('payment', 'pos', 'checkout', 'ecommerce'), 'object-payment-terminal', 'A handmade clay payment terminal.'),
    (('automation', 'repeat', 'double-entry'), 'object-repeat-work-machine', 'A playful clay machine for repeated office tasks.'),
    (('approval',), 'object-approval-stamp', 'A handmade clay approval stamp.'),
    (('file', 'storage'), 'object-shared-file-cabinet', 'A handmade clay filing cabinet.'),
    (('windows', 'mac', 'computer', 'operating-system'), 'object-operating-system', 'A handmade clay desktop computer.'),
    (('construction', 'builder', 'roof', 'plumb', 'home-services'), 'object-construction-plans', 'Handmade clay building plans and tools.'),
    (('consult', 'priority', 'decision', 'roadmap'), 'object-priority-notes', 'Handmade clay notes arranged for planning.'),
    (('software', 'system', 'integration'), 'object-software', 'A handmade clay model of connected software tools.'),
    (('location', 'local-search', 'google-business', 'maps', 'neighborhood'), 'object-map-red-pin', 'A handmade clay map with a red location pin.'),
]


def register(page, family='brand', visual=None, lab=None):
    route = page.get('canonicalPath', page['path'])
    matches = lambda word: re.search(r'(?:^|[-/])'+re.escape(word)+r's?(?=[-/]|$)', route.lower())
    if family == 'brand':
        for candidate, words in [('it', ('it-support','it','wifi','computer','email')), ('software', ('software','system','crm','airtable','notion','automation')), ('web', ('website','web','webflow','wordpress','wix','squarespace','shopify','seo','local-search')), ('consulting', ('consulting','audit','vendor','quote','tool'))]:
            if any(matches(word) for word in words):
                family = candidate
                break
    label, color, asset, alt = FAMILIES.get(family, FAMILIES['brand'])
    headline = page.get('heading') or page.get('h1') or page.get('title', 'Little Fight NYC').split(' | ')[0]
    for needles, candidate, candidate_alt in SUBJECTS:
        if any(matches(needle) for needle in needles):
            asset, alt = candidate, candidate_alt
            break
    topic_asset = art_asset(TOPIC_ART.get(route.strip('/').split('/')[-1])) if route.startswith('/answers/help/') else None
    if topic_asset:
        asset = topic_asset
        alt = 'A handmade clay '+asset.removeprefix('object-').removeprefix('symbol-').replace('-', ' ')+'.'
    card = dict(path=route, title=page.get('title', headline), description=page.get('description', ''),
                headline=headline, label=label, color=color, mode='clay',
                image='/assets/clay-png/'+asset+'.png', artAlt=alt)
    if asset == 'symbol-browser':
        card.update(mode='browser', artAlt='A handmade clay browser frame displaying the Chromatic Painting and Design website.')
    if route == '/':
        card.update(headline='A little fight.\nA big difference.', label='In your corner.', color='#ff7839', mode='hero',
                    note='Websites. Tech support.\nSoftware for independent businesses.',
                    artAlt='The Little Fight clay neighborhood, with a storefront, offices, website previews, clouds and a rooftop pigeon.')
    elif route.startswith('/case-studies/') and visual:
        card.update(mode='screen', image=visual['src'], artAlt=visual.get('alt', headline), label='Our work', color='#92bfff')
    elif lab:
        card.update(mode='screen', image=lab['src'], artAlt=lab.get('alt', headline), label='Little Fight Lab', color='#f09bdd')
    elif route.startswith('/journal/'):
        card['label'] = 'Field notes'
    elif route.startswith('/answers/'):
        card['label'] = label+' · Answers'
    elif route in ('/tech-audit/', '/contact/'):
        card.update(image='/assets/clay-png/object-notebook.png', artAlt=FAMILIES['consulting'][3], label='Start a conversation')
    elif route == '/reviews/' or route.startswith('/reviews/'):
        card.update(headline='Good people.\nKind words.', label='Client reviews')
    elif route in ('/examples/', '/how-we-help/', '/about/', '/nationwide/', '/services/'):
        card.update(mode='hero', artAlt='The handmade Little Fight NYC neighborhood diorama.')
    card['headline'] = card['headline'].replace('Hair By Rachel Charles', 'Hair By Rachel')
    # Multiple reader companions can describe the same canonical destination.
    PLAN.setdefault(route, card)
    return CARDS.get(route) or CARDS.get('/') or {
        'image': '/assets/portfolio-20261007/share-little-fight-nyc-master-reference-20261008.jpg',
        'width': 1200, 'height': 630, 'alt': card['artAlt'], 'type': 'image/jpeg',
    }


def tags(page, card):
    e = lambda value: escape(str(value), quote=True)
    canonical = ORIGIN + page.get('canonicalPath', page['path'])
    title, description = page.get('title', 'Little Fight NYC'), page.get('description', '')
    image = ORIGIN + card['image']
    values = {
        'og:type': 'article' if page['path'].startswith('/journal/') and page['path'] != '/journal/' else 'website',
        'og:title': title, 'og:description': description, 'og:url': canonical,
        'og:site_name': 'Little Fight NYC', 'og:locale': {'es':'es_US', 'zh':'zh_CN'}.get(page.get('language'), 'en_US'),
        'og:image': image, 'og:image:secure_url': image, 'og:image:type': card['type'],
        'og:image:width': card['width'], 'og:image:height': card['height'], 'og:image:alt': card['alt'],
        'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description,
        'twitter:image': image, 'twitter:image:alt': card['alt'],
    }
    return ''.join(f'<meta {"property" if key.startswith("og:") else "name"}="{key}" content="{e(value)}">' for key, value in values.items())


def write_plan():
    target = APP.parent / '.lifi/evidence/social-cards/plan.json'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps({'cards': PLAN}, ensure_ascii=False, indent=2)+'\n')
