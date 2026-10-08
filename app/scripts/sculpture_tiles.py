"""The October sculpture direction: real media, physical objects, live HTML copy.

This presentation pass runs after the content inventory has been consolidated.
It retains every tile identity, destination, source attribution and reader.
"""
from html import escape, unescape
from html.parser import HTMLParser
import re
import json
from pathlib import Path

E = lambda value: escape(str(value or ''), quote=True)
ASSET = '/assets/sculpture/'
DELIVERY_PATH=Path(__file__).resolve().parents[2]/'.lifi/design-source/sculpture/delivery.json'
DELIVERY=json.loads(DELIVERY_PATH.read_text()) if DELIVERY_PATH.is_file() else {}
TILES = re.compile(r'<a\b[^>]*class="[^"]*\btile\b[^>]*>.*?</a>', re.S)
SERVICES = {
    'web': ('Websites', 'Help customers choose you.', 'browser-chromatic-painting-design', 'browser-duotone'),
    'it': ('Tech support', 'Get back to work.', 'router', 'laptop-duotone'),
    'consulting': ('Consulting', 'Make the next move clear.', 'notebook', 'chats-circle-duotone'),
    'software': ('Custom software', 'Turn repeat work into a tool.', 'software', 'cube-duotone'),
}
# Deliberate, topic-specific symbols. A missing topic is a build error rather
# than a generic icon silently standing in for an unfinished tile.
TOPIC_ICONS = {
    'brand-brief':'tugboat', 'speed':'device-mobile', 'booking':'calendar-check',
    'web-homepage-priority':'layout', 'web-content-collection':'images',
    'page-industries':'storefront', 'wifi':'wifi-high', 'email':'envelope-simple',
    'ownership':'key', 'computer':'desktop-tower', 'printer':'printer',
    'backup':'cloud-arrow-up', 'it-security-basics':'shield-check',
    'it-password-ownership':'password', 'it-license-renewal':'receipt',
    'it-video-call-room':'video-camera', 'it-storage-full':'hard-drives',
    'it-shared-files':'folders', 'it-phone-setup':'phone-incoming',
    'it-software-updates':'arrows-clockwise', 'it-payment-device-check':'credit-card',
    'it-vendor-handoff':'handshake', 'page-areas':'map-pin', 'maps':'map-trifold',
    'web-redesign-decision':'wrench', 'consulting-first-priority':'list-numbers',
    'consulting-tool-choice':'sliders-horizontal', 'consulting-second-opinion':'chat-circle-dots',
    'page-vera':'blueprint', 'software-repeat-work':'repeat',
    'software-approval-path':'check-square', 'construction-showcase':'hard-hat',
    'software-connect-existing-tools':'plugs-connected',
    'software-business-ownership':'fingerprint', 'software-smallest-useful-change':'puzzle-piece',
}
# Every ordinary topic has an intentional, distinct silhouette. No family
# fallback may silently repeat a printer, locked folder or software box.
TOPIC_ART = {
    'brand-brief':'boat', 'speed':'phone-chromatic', 'email':'mail',
    'computer':'desk-workstation', 'wifi':'network-switch', 'backup':'backup-drive',
    'booking':'booking-calendar', 'ownership':'ownership-keys',
    'web-homepage-priority':'homepage-sketchbook', 'web-content-collection':'content-camera',
    'it-password-ownership':'password-safe', 'it-license-renewal':'renewal-hourglass',
    'it-video-call-room':'video-meeting', 'it-storage-full':'storage-drives',
    'it-shared-files':'shared-file-cabinet', 'it-phone-setup':'phone-dock',
    'it-software-updates':'software-maintenance', 'it-payment-device-check':'payment-terminal',
    'it-vendor-handoff':'vendor-handoff', 'web-redesign-decision':'redesign-paint',
    'consulting-tool-choice':'consulting-toolbox',
    'software-repeat-work':'repeat-work-machine',
    'construction-showcase':'construction-plans',
    'software-connect-existing-tools':'connected-cables',
    'printer':'printer', 'it-security-basics':'security',
    'page-industries':'storefront',
    'page-areas':'yellow-taxi-v1', 'maps':'map-red-pin',
    'page-vera':'vera-brownstone',
    'consulting-second-opinion':'rubber-duck',
    'consulting-first-priority':'priority-notes',
    'software-approval-path':'approval-stamp',
    'software-business-ownership':'custom-os-spheres',
    'software-smallest-useful-change':'scissors-red-tape',
}
assert set(TOPIC_ART) == set(TOPIC_ICONS), 'Every topic needs its own physical object.'
assert len(set(TOPIC_ART.values())) == len(TOPIC_ART), 'Topic illustrations must be unique.'
PHOTO_ICONS = {
    'nyc':'camera', 'marthas-vineyard':'sailboat', 'arizona':'cactus',
    'hospitality':'coffee', 'roofing':'hammer', 'shops':'shopping-bag',
    'trades':'pipe-wrench', 'makers':'needle',
}
CASE_ICONS = {
    'chromatic-painting-design':'images', 'hair-by-rachel-charles':'scissors',
    'cc-films':'film-slate', 'easy-tiger':'fork-knife', 'the-break-room':'martini',
    'clearhelp':'lifebuoy', 'army-navy-bags':'backpack', 'brothers-pizzeria':'pizza',
    'grand-funding-llc':'bank', 'legacy-music-group':'music-notes',
    'logan-loans':'house-line', 'the-tarot-hotline':'phone',
    'venuecircuit':'calendar-check', 'deckspace':'calendar-dots',
    'after-hours-agenda':'coat-hanger',
}
LAB_ICONS = {
    'pool-room':'film-reel', 'pill-scroll':'mouse-scroll', 'walkup-3d':'buildings',
    'terminal-3d':'city', 'micro-animations':'sparkle', 'aha-laser':'waveform',
    'goliath':'planet', 'studio-engine':'shapes', 'growth-street':'plant',
    'cabinet-concept':'armchair', 'house-explorer':'house-line',
}

def icon_for(identity, kind, family):
    if kind == 'service-anchor' and family in SERVICES:
        return SERVICES[family][3]
    if kind == 'case-study': return CASE_ICONS[identity.removeprefix('case-')]+'-duotone'
    if kind == 'lab': return LAB_ICONS[identity.removeprefix('lab-')]+'-duotone'
    if kind == 'photo-album': return PHOTO_ICONS[identity.removeprefix('album-')]+'-duotone'
    if kind == 'review': return 'quotes-duotone'
    icon = TOPIC_ICONS[identity]
    return icon if icon == 'tugboat' else icon+'-duotone'

def motion_for(art):
    if art is None: return 'stamp'
    if art.startswith('cast-'): return 'cast'
    if art.startswith(('browser-', 'phone-', 'lab-', 'photo-')): return 'frame'
    return {'boat':'cast', 'storefront':'cast', 'security':'cast',
            'router':'clay', 'printer':'clay', 'mail':'paper', 'notebook':'paper',
            'software':'stack', 'review':'stamp', 'yellow-taxi-v1':'clay',
            'map-red-pin':'paper', 'vera-brownstone':'cast', 'rubber-duck':'clay',
            'priority-notes':'paper', 'approval-stamp':'stamp',
            'custom-os-spheres':'stack', 'scissors-red-tape':'cast',
            'desk-workstation':'cast', 'network-switch':'clay', 'backup-drive':'cast'}.get(art,'cast')

class Attributes(HTMLParser):
    def __init__(self, tag):
        super().__init__(); self.attrs = {}; self.feed(tag)
    def handle_starttag(self, tag, attrs):
        if not self.attrs: self.attrs = dict(attrs)

def image(name, cls='', eager=False, alt=''):
    variants=DELIVERY.get(name,[])
    sizes='(max-width: 600px) 48vw, 380px'
    if cls.startswith('hero-image-'):
        sizes={'hero-image-main':'(max-width: 600px) 73vw, 790px', 'hero-image-secondary':'(max-width: 600px) 45vw, 490px', 'hero-image-stage':'(max-width: 600px) 100vw, 1320px', 'hero-image-boat':'(max-width: 600px) 30vw, 330px'}[cls]
    elif eager:sizes='(max-width: 600px) 80vw, (max-width: 1000px) 71vw, 770px'
    responsive=' srcset="'+', '.join(ASSET+E(v['file'])+' '+str(v['width'])+'w' for v in variants)+'" sizes="'+sizes+'"' if variants else ''
    return f'<img class="sculpture-object {E(cls)}" src="{ASSET}{E(name)}.webp"{responsive} width="1200" height="960" alt="{E(alt)}" loading="{"eager" if eager else "lazy"}" decoding="async"'+(' fetchpriority="high"' if eager and cls=='hero-image-main' else '')+'>'

def _text(markup):
    return unescape(re.sub(r'<[^>]+>', ' ', markup)).strip()

def _span(markup, cls):
    found = re.search(r'<(?:span|strong|blockquote)[^>]*class="'+cls+r'"[^>]*>(.*?)</(?:span|strong|blockquote)>',markup,re.S)
    return _text(found[1]) if found else ''

def sculptural_mosaic(markup):
    services=[]; records=[]; featured={}
    def tile(match):
        original=match[0]; end=original.index('>')+1
        attrs=Attributes(original[:end]).attrs
        identity=attrs.get('data-answer',''); family=attrs.get('data-family','brand'); kind=attrs.get('data-kind','question')
        title=attrs.get('data-cell-title') or 'Little Fight NYC'
        inner=original[end:-4]
        is_service=kind=='service-anchor' and family in SERVICES
        for key in ('data-editorial-front','data-editorial-stack','data-compact-label','style'):
            attrs.pop(key,None)
        # Keep semantics and interaction hooks; old art and layout classes no longer
        # choose a front. The physical flip remains owned by the existing runtime.
        attrs['class']='tile sculpture-tile'+(' service-anchor' if is_service else '')+(' review-tile' if kind=='review' else '')+(' construction-hub-tile' if kind=='construction-hub' else '')
        attrs['data-sculpture']='true'
        if is_service or identity=='brand-brief': attrs['data-reader-anchor']=family
        cols,rows,mcols,mrows=3,3,3,4
        art=TOPIC_ART.get(identity)
        copy=''; extra=''; modifier='question'
        if is_service:
            title,copy,art,icon=SERVICES[family]
            modifier='service'; cols,rows,mrows=6,2,3
        elif identity=='brand-brief':
            title='Little Fight NYC'; copy='Real people in your corner.'; art='boat'; cols,rows,mcols,mrows=6,2,6,2; modifier='brand'
        elif kind=='case-study':
            slug=attrs.get('href','').strip('/').split('/')[-1]
            art='browser-'+slug
            modifier='proof'; cols,rows,mrows=4,3,4
            copy=_span(inner,'proof-tile-label')
            if identity=='case-chromatic-painting-design':
                title='Our work'; copy=''; art='work-chromatic'; attrs['data-featured']='work'
        elif kind=='lab':
            art='lab-'+attrs.get('href','').strip('/').split('/')[-1]
            modifier='lab'; cols,rows,mrows=3,4,5
            copy=_span(inner,'lab-tile-hook')
            extra='<span class="sculpture-lab-action">'+E(_span(inner,'lab-tile-action'))+'</span>'
        elif kind=='photo-album':
            art='photo-'+identity.removeprefix('album-'); modifier='photo'; cols,rows,mrows=4,3,4
            caption=re.search(r'photo-album-tile__copy.*?<strong>.*?</strong><span>(.*?)</span>',inner,re.S)
            copy=_text(caption[1]) if caption else ''
        elif kind=='review':
            modifier='review'; art=None; cols,rows,mrows=3,3,4
            title=_span(inner,'review-quote'); copy=_span(inner,'review-attribution')
            if len(title)>60:mrows=5
        elif kind=='construction-hub':
            modifier='question'; cols=6
        assert art or kind=='review', f'Missing unique artwork: {identity}'
        attrs['data-sculpture-kind']=modifier
        if identity=='google-review-1': attrs['data-featured']='review'
        if identity=='speed': attrs['data-featured']='phone'
        if art: attrs['data-sculpture-art']=art
        icon=icon_for(identity,kind,family)
        motion=motion_for(art)
        assert (Path(__file__).resolve().parents[1]/'preview-ui/assets/mineral'/(icon+'.svg')).is_file(), icon
        attrs['data-sculpture-icon']=icon
        attrs['data-sculpture-motion']=motion
        if not is_service and max((len(word.strip('.,?!\"“”')) for word in re.split(r'[\s/—–-]+', title+' '+copy)), default=0)>=10:
            attrs['data-fallback-wide']='true'
        attrs['data-preferred-columns']=str(cols);attrs['data-preferred-rows']=str(rows)
        attrs['data-mobile-columns']=str(mcols);attrs['data-mobile-rows']=str(mrows)
        attrs['data-columns']=str(cols);attrs['data-rows']=str(rows)
        attrs['style']=f'--preferred-columns:{cols};--preferred-rows:{rows};--mobile-columns:{mcols};--mobile-rows:{mrows}'
        if not attrs.get('aria-label'):
            attrs['aria-label']=_text(title)+(('. '+copy) if copy else '')
        heading='blockquote' if modifier=='review' else 'strong'
        symbol=f'<span class="mineral-icon sculpture-symbol'+(' sculpture-service-icon' if is_service else '')+f'" aria-hidden="true" style="--mineral-asset:url(/assets/mineral/{E(icon)}.svg)"></span>'
        copy_html=f'<span class="sculpture-copy">{symbol}<{heading} class="sculpture-title">{E(title)}</{heading}>'+(f'<span class="sculpture-description">{E(copy)}</span>' if copy else '')+(extra if modifier=='lab' else '')+'</span>'
        if modifier=='review':
            retained=inner.replace('class="review-quote"','class="review-quote sculpture-title"').replace('class="review-credit"','class="review-credit sculpture-description"')
            if 'sculpture-title' not in retained:
                retained=retained.replace('<span class="review-credit','<strong class="sculpture-title">Five stars.</strong><span class="review-credit',1)
                attrs['aria-label']=attrs.get('data-cell-title','Google review')+'. Five out of five stars.'
            copy_html='<span class="sculpture-copy">'+symbol+retained+'</span>'
        art_html='<span class="sculpture-art" aria-hidden="true">'+image(art)+'</span>' if art else ''
        front=copy_html+art_html+'<span class="sculpture-plus" aria-hidden="true">+</span>'
        if kind=='construction-hub':
            front=front.replace('class="sculpture-copy"','class="sculpture-copy construction-tile-copy"')
        if modifier=='lab':
            front=front.replace('class="sculpture-copy"','class="sculpture-copy lab-tile-copy"').replace('class="sculpture-title"','class="sculpture-title lab-tile-title"').replace('class="sculpture-description"','class="sculpture-description lab-tile-hook"').replace('class="sculpture-lab-action"','class="sculpture-lab-action lab-tile-action"').replace('class="sculpture-art"','class="sculpture-art lab-tile-media"')
            front='<span class="lab-tile-face">'+front+'</span>'
        result='<a '+ ' '.join(f'{key}="{E(value)}"' if value is not None else key for key,value in attrs.items())+'>'+front+'</a>'
        records.append({'id':identity,'href':attrs.get('href'),'art':art,'icon':icon,'motion':motion,'kind':modifier,'family':family})
        if is_service: services.append(result); return ''
        if attrs.get('data-featured'):
            featured[attrs['data-featured']]=result
            return ''
        return result
    markup=TILES.sub(tile,markup)
    intro='<section id="sculpture-services" class="topic-section sculpture-services" aria-labelledby="sculpture-services-heading"><header class="topic-heading"><h2 id="sculpture-services-heading">Problems? Solved.</h2></header><div data-topic-grid="services" data-sculpture-layout="compact">'+''.join(services)+'</div><div class="sculpture-featured" data-topic-grid="featured" data-sculpture-layout="compact" aria-label="Our work and what clients say">'+''.join(featured[key] for key in ('work','review','phone'))+'</div></section>'
    assert len(services)==4, 'All four service anchors must remain visible'
    assert len(records)==80, 'All 80 tiles remain in the design system'
    art_names=[record['art'] for record in records if record['art']]
    assert len(art_names)==len(set(art_names)), 'Each illustrated tile must use unique artwork'
    return intro+markup,records

def sculptural_hero():
    return '''<section class="sculpture-hero" data-hero="reference" aria-labelledby="home-title">
<div class="sculpture-hero-copy"><h1 id="home-title">A little fight.<br>A big difference.</h1><p>You get thoughtful websites and dependable tech,<br class="hero-desktop-break"> with real people in your corner.</p><div class="sculpture-hero-actions"><a class="sculpture-help" href="/tech-audit/" data-reader-link>Get help <span aria-hidden="true">+</span></a><a class="sculpture-work" href="/examples/" data-reader-link>Explore our work <span aria-hidden="true">+</span></a></div></div>
<div class="sculpture-hero-stage">
<div class="hero-ground" aria-hidden="true">'''+image('hero-stage','hero-image-stage',True)+'''</div>
<a class="hero-project hero-main" href="/case-studies/chromatic-painting-design/" data-reader-link aria-label="Explore the Chromatic Painting and Design website">'''+image('browser-chromatic-painting-design','hero-image-main',True)+'''</a>
<a class="hero-project hero-secondary" href="/case-studies/hair-by-rachel-charles/" data-reader-link aria-label="Explore the Hair By Rachel website">'''+image('browser-hair-by-rachel-charles','hero-image-secondary',True)+'''</a>
<div class="hero-boat" aria-hidden="true">'''+image('boat','hero-image-boat',True)+'''</div>
</div></section>'''
