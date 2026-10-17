"""Compile the approved mosaic into a static, independently reviewable website.

No framework boot, external data, form submissions, or analytics transport.
Every tile opens the same HTML that a direct visitor and crawler receive.
"""
from pathlib import Path
import os
from html import escape, unescape
from html.parser import HTMLParser
from urllib.parse import quote, urlsplit
import hashlib
import json
import re
import shutil
import subprocess
import sys
from tile_content import render_legacy_sections
from case_studies import render_case, render_work
from construction_showcase import construction_tile, render_construction
from topic_mosaic import build_topic_mosaic, plus_navigation, REVIEW_PLACEMENT
from editorial_tiles import enrich_editorial_tiles
from reader_visuals import reader_visual, reader_family
from sculpture_tiles import sculptural_mosaic, sculptural_hero
from clay_icons import ROUTES as CLAY_ROUTES, clay_figure
from portfolio_media import apply_portfolio_media, rewrite_portfolio_media
from consolidated_tiles import load_groups, home_contexts, source_routes, apply_readers, apply_homepage_groups, render_group_sections, group_hero
from retained_answers import render_retained_answers
from tile_rewrite import GUIDE_UPDATED, load_rewrite, apply_catalog_hooks, prepare_groups, apply_page_rewrite, render_category_answers, category_schema
from editorial_workbench import header as workbench_header
from review_readers import review_reader_pages, render_review_reader
from clay_library import ENABLED as CLAY_LIBRARY, copy_assets as copy_clay_library
from social_cards import register as social_card, tags as social_tags, write_plan as write_social_plan

APP = Path(__file__).resolve().parents[1]
CONTENT = APP / 'preview-content'
UI = APP / 'preview-ui'
PRODUCTION = '--production' in sys.argv
OUT = APP / ('dist' if PRODUCTION else 'preview-dist')
ORIGIN = 'https://littlefightnyc.com'
E = lambda value: escape(str(value or ''), quote=True)
load = lambda name: json.loads((CONTENT / name).read_text())
OUT.mkdir(exist_ok=True)
BRIDGE = ''
if PRODUCTION:
    manifest = json.loads((OUT/'.vite/manifest.json').read_text())
    BRIDGE = '<script type="module" src="/'+manifest['src/tile-bridge/bridge.ts']['file']+'"></script>'
OLD_META = {p['path']:p for p in json.loads((APP/'src/data/route-meta.json').read_text())['pages']}
STANDALONE = ('/vera/', '/examples/audit/', '/examples/lab/', '/ads/', '/myspace-demo/')
ISLANDS = {'/tech-audit/':'tech-audit', '/contact/':'contact', '/thanks/':'thanks', '/website-check/':'website-check'}
RETIRED_PUBLISHED_ASSETS = (
    'media/cabinetry-process-film-720-3d0d35f6.mp4',
    'media/cabinetry-process-poster-c6d59dbc.webp',
    'media/cabinetry-process-film-540-1a0bac73.mp4',
    'media/cabinetry-process-share-0a7876df.webp',
    'assets/proof/case-public-house-creative.webp',
    'assets/proof/optimized/tile-public-house-creative-480.webp',
)
RETIRED_PUBLISHED_DIRECTORIES = ('brand-kit',)

INDEXED_HELP_ANSWERS = frozenset(json.loads((APP/'preview-content/search-policy.json').read_text())['indexedHelpAnswers'])

def indexable(path):
    if path in INDEXED_HELP_ANSWERS:return True
    if path in ['/thanks/','/404/'] or path.startswith(('/markets/','/photos/','/answers/help/','/_readers/')):return False
    old = OLD_META.get(path)
    if old:return not old.get('noindex',False) and old.get('canonical',path) in [path,ORIGIN+path]
    return path=='/' or path in ['/reviews/','/websites-for-your-business/','/how-we-help/','/construction/'] or path.startswith(('/industries/','/labs/'))

def preserved(path):
    return PRODUCTION and path.startswith(STANDALONE) and (APP/'public'/path.lstrip('/')/'index.html').is_file()

def reader_companion(path):
    """Return the generated reader route for a protected public experience.

    The public document remains the no-script fallback and is copied unchanged
    by Vite.  The companion only supplies the Little Fight reader shell.
    """
    if path.startswith(STANDALONE) and (APP/'public'/path.lstrip('/')/'index.html').is_file():
        return '/_readers' + path
    return ''

def display(value):
    return str(value or '').replace('Hair By Rachel Charles', 'Hair By Rachel').replace('Hair by Rachel Charles', 'Hair By Rachel')

def local_link(href):
    if not href: return ''
    parts = urlsplit(href)
    if parts.scheme in ('http', 'https') and parts.hostname in ('littlefightnyc.com','www.littlefightnyc.com'):
        return (parts.path or '/') + ('?'+parts.query if parts.query else '') + ('#'+parts.fragment if parts.fragment else '')
    if href.startswith(('https://','http://','mailto:','tel:','sms:','#','/')): return href
    return '/' + href.lstrip('./')

def link(label, href, cls=''):
    href = local_link(href)
    return f'<a class="{E(cls)}" href="{E(href)}"'+(' data-reader-link' if href.startswith('/') else '')+f'>{E(display(label))}</a>'

def write(path, value):
    target = OUT / path.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(plus_navigation(rewrite_portfolio_media(value)) if path.endswith('.html') else value)

cases = {c['slug']:c for c in load('cases.json')}
case_visuals = load('case-visuals.json')['cases']
case_headlines = load('case-headlines.json')
albums = load('albums.json')
labs = load('labs.json')
apply_portfolio_media(cases, case_visuals, labs)
# A Lab has two stable addresses.  Its embedded engine keeps the protected
# original path, while its public story lives at a short, shareable route.
# Keep the defaults here while the catalog is being migrated so old records
# cannot accidentally become unshareable.
for lab in labs:
    slug = lab['slug']
    lab.setdefault('embedPath', f'/examples/lab/concepts/{slug}/')
    lab.setdefault('sharePath', f'/labs/{slug}/')
rewrite = load_rewrite(CONTENT)
anchor_bodies = load('anchor-bodies.json')
anchor_paths = {'/services/it-support/':'it', '/services/tech-consulting/':'consulting',
                '/services/business-systems/':'software', '/how-we-help/':'brand'}
anchor_icons = {'it':'/assets/mineral/wifi-high-bold.svg',
                'consulting':'/assets/mineral/chats-circle-duotone.svg',
                'software':'/assets/mineral/app-window-duotone.svg', 'brand':'/assets/boat-orange.svg'}
anchor_labels = {'it':'Tech support', 'consulting':'Consulting', 'software':'Custom software', 'brand':'Little Fight NYC'}
apply_catalog_hooks(rewrite, cases, labs, albums)
lab_by_embed_path = {x['embedPath']: x for x in labs}
lab_by_share_path = {x['sharePath']: x for x in labs}
lab_by_path = {**lab_by_embed_path, **lab_by_share_path}
LAB_IMAGES={'pool-room':'pool-room','walkup-3d':'brownstone-walkup','terminal-3d':'cinematic-3d','pill-scroll':'scroll-motion','micro-animations':'micro-animations','aha-laser':'aha-laser','studio-engine':'studio-engine','growth-street':'growth-street','goliath':'goliath'}

def lab_tile_image(lab, width=800):
    """Return an authored Lab cover, with the legacy resized cover as fallback."""
    if lab.get('tileImage'):
        return lab['tileImage']
    stem = LAB_IMAGES.get(lab['slug'], lab['slug'])
    return f'/images/lab-showcase/{stem}-{width}.webp'

def lab_mosaic_tile(lab):
    """Create a new Lab card without changing the protected source mosaic."""
    image = lab_tile_image(lab)
    return f'''<a class="tile has-real-proof" href="{E(lab['sharePath'])}" data-answer="lab-{E(lab['slug'])}" data-family="software" data-kind="lab" data-material="mineral" data-material-family="software" data-cell-face="mixed" data-cell-title="{E(lab['name'])}" data-columns="3" data-rows="3" data-mobile-columns="3" data-mobile-rows="4" aria-label="{E(lab['name'])}: {E(lab['summary'])}"><span class="lab-tile-face" data-lab-scene="{E(lab['slug'])}"><span class="lab-tile-media"><img src="{E(image)}" width="{E(lab.get('tileImageWidth') or 800)}" height="{E(lab.get('tileImageHeight') or 500)}" alt="{E(lab.get('tileImageAlt') or lab['name'])}" loading="lazy" decoding="async"></span><span class="lab-tile-copy"><strong class="lab-tile-title">{E(display(lab['name']))}</strong><span class="lab-tile-hook">{E(lab.get('tileDescription') or lab['summary'])}</span><span class="lab-tile-action">{E(lab.get('tileAction') or 'Open the working demo')}</span></span><span class="lab-tile-plus" aria-hidden="true">+</span></span></a>'''
for name in LAB_IMAGES.values():
    for width in [480,800]:
        source=APP/'public/images/lab-showcase'/f'{name}-{width}.webp'
        if source.is_file():
            target=OUT/'images/lab-showcase'/source.name
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(source,target)

def copy_lab_tile_asset(url):
    """Keep record-selected local Lab art available in the no-Vite preview."""
    parts=urlsplit(str(url or ''))
    if parts.scheme or parts.netloc or not parts.path.startswith('/'):
        return
    source=APP/'public'/parts.path.lstrip('/')
    if source.is_file():
        target=OUT/parts.path.lstrip('/')
        target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,target)

for lab in labs:
    copy_lab_tile_asset(lab.get('tileImage'))
reviews = load('reviews.json')
review_families = {review_id: family for review_id, (family, _) in REVIEW_PLACEMENT.items()}
summaries = load('reader-summaries.json')
authored = {p['path']:p for p in load('pages.json')}
pages = {}
pages.update(review_reader_pages(reviews, review_families))
for filename in ['live-pages.json','answer-pages.json','market-pages.json','qr-pages.json']:
    for p in load(filename): pages[p['path']] = p
for p in load('pages.json'): pages[p['path']] = p
topic_tiles = load('topic-tiles.json')
for tile in topic_tiles:
    path = '/answers/help/'+tile['id']+'/'
    description = tile['summary'] if len(tile['summary']) <= 157 else tile['summary'][:157].rsplit(' ', 1)[0]+'…'
    pages[path] = {'path': path, 'id': tile['id'], 'category': tile['family'], 'family': tile['family'], 'icon': tile['icon'], 'title': tile['title']+' | Little Fight NYC', 'heading': tile['title'], 'summary': tile['summary'], 'description': description, 'eyebrow': {'consulting': 'Consulting', 'software': 'Custom software'}[tile['family']], 'sections': tile['sections'] + [{'heading': 'What to bring', 'bullets': tile['steps']}]}

home_groups, hidden_home_ids = load_groups(CONTENT)
prepare_groups(home_groups, rewrite)
home_context = home_contexts(CONTENT, home_groups, hidden_home_ids)

proof_slugs = ['easy-tiger','hair-by-rachel-charles','grand-funding-llc']
# These examples are intentionally category-adjacent, never claimed as work in
# a trade we have not served. Each card links to the actual public case story.
INDUSTRY_PROOF = {
    '/industries/galleries-creative-studios/': [('cc-films', 'A creative-industry website example: CC Films.')],
    '/industries/law-firms/': [('grand-funding-llc', 'A professional-services website example: Grand Funding LLC.')],
    '/industries/medical-wellness-practices/': [('hair-by-rachel-charles', 'An appointment-based salon website example: Hair By Rachel.')],
    '/industries/plumbers/': [('chromatic-painting-design', 'A home-services website example: Chromatic Painting & Design.')],
    '/industries/professional-services/': [('logan-loans', 'A professional-services website example: Logan Loans.')],
    '/industries/restaurants-bars/': [('easy-tiger', 'A bar website example: Easy Tiger Bar.')],
    '/industries/retail-ecommerce/': [('after-hours-agenda', 'A Little Fight storefront example: After Hours Agenda.')],
    '/industries/roofing/': [('chromatic-painting-design', 'A home-services website example: Chromatic Painting & Design.')],
    '/industries/luxury-home-services/': [('chromatic-painting-design', 'A home-services website example: Chromatic Painting & Design.')],
    '/industries/salons-wellness/': [('hair-by-rachel-charles', 'A salon website example: Hair By Rachel.')],
}
_industry_routes = {path for path in pages if path.startswith('/industries/') and path != '/industries/'}
_missing_industry_proof = _industry_routes - set(INDUSTRY_PROOF)
if _missing_industry_proof:
    raise RuntimeError(f'Every industry reader needs an honest linked proof example: {sorted(_missing_industry_proof)}')
def picture(slug, eager=False):
    c = cases[slug]
    visual = case_visuals.get(slug, {}).get('desktop', {})
    img = visual.get('src') or '/' + c['image'].lstrip('/')
    width, height = visual.get('width',c.get('imageWidth',1440)), visual.get('height',c.get('imageHeight',1000))
    if slug=='hair-by-rachel-charles':
        img='/assets/proof/optimized/website-rachel-services-960.webp'
        width,height=960,453
    return f'<img src="{img}" width="{width}" height="{height}" alt="{E(display(c.get("imageAlt",c["name"])))}" loading="{"eager" if eager else "lazy"}" decoding="async"'+(' fetchpriority="high"' if eager else '')+'>'

def proof_grid(slugs=proof_slugs, captions=None):
    captions = captions or {}
    return '<div class="proof-grid">'+''.join(f'<a class="proof-card" data-reader-link href="/case-studies/{s}/">{picture(s)}<span>{E(captions.get(s, display(cases[s]["name"])))}</span></a>' for s in slugs if s in cases)+'</div>'

def review_cards(limit=None):
    rows=[]
    selected=reviews['reviews'] if limit is None else [reviews['reviews'][i] for i in (0,3,1)][:limit]
    for r in selected:
        quote = f'<blockquote>“{E(r["excerpt"])}”</blockquote>' if r['excerpt'] else ''
        rows.append(f'<a class="review-card rw-review-tile" href="{E(r["sourceUrl"])}" target="_blank" rel="noopener noreferrer"><span class="review-stars" aria-label="5 out of 5 stars">★★★★★</span>{quote}<span class="rw-review-credit"><cite>{E(r["displayName"])}</cite><span aria-hidden="true">+</span></span><span class="sr-only">Google review</span></a>')
    return '<div class="review-grid">'+''.join(rows)+'</div>'

def contact_intent(path):
    family=reader_family(pages.get(path,{'path':path}))
    return {'web':'website','it':'support','consulting':'consulting','software':'systems'}.get(family,'general')

def contact(path, prompt='Tell us what you need help with.'):
    intent=contact_intent(path)
    heading='Let’s make it yours.' if path=='/services/custom-local-websites/' else 'Talk to Little Fight.'
    introduction=prompt
    hours = '' if path in ('/start/', '/trivia/1979/') else '<p class="contact-hours">9am–9pm Eastern. After hours, leave a message.</p>'
    return f'''<section class="story-contact" id="contact"><div><h2>{E(heading)}</h2><p>{E(introduction)}</p></div><div><nav class="contact-actions" aria-label="Contact Little Fight NYC">{channels(intent, path)}</nav>{hours}</div></section>'''

def channels(intent='general', source=''):
    query = '?intent='+quote(intent, safe='')
    if source:
        query += '&source='+quote(source, safe='')
    write='' if source in ('/tech-audit/','/contact/','/thanks/') else '<a class="contact-plan" data-reader-link href="/tech-audit/'+query+'">Write</a>'
    return '<a href="tel:+16463600318">Call</a><a href="sms:+16463600318">Text</a><a href="mailto:hello@littlefightnyc.com">Email</a>'+write

def sections_html(sections):
    html=[]
    for i,s in enumerate(sections):
        body=''.join(f'<p>{E(display(p))}</p>' for p in s.get('paragraphs',[]))
        if s.get('steps'): body+='<ol>'+''.join(f'<li>{E(display(b))}</li>' for b in s['steps'])+'</ol>'
        if s.get('bullets'): body+='<ul>'+''.join(f'<li>{E(display(b))}</li>' for b in s['bullets'])+'</ul>'
        if s.get('qa'): body+=''.join(f'<h3>{E(display(x["question"]))}</h3><p>{E(display(x["answer"]))}</p>' for x in s['qa'])
        if s.get('links'):body+='<nav class="story-related">'+''.join(link(l.get('label',l.get('text','Learn more')),l['href']) for l in s['links'])+'</nav>'
        heading=display(s.get('heading',''))
        plain=heading in ('','The details','Start here','A useful starting point')
        heading_html='' if plain else f'<h2>{E(heading)}</h2>'
        html.append(f'<section class="story-section{" story-section--plain" if plain else ""}" id="{E(s.get("id",f"section-{i}"))}">{heading_html}<div>{body}</div></section>')
    return ''.join(html)

def legacy_sections(p):
    sections=[];current={'heading':'The details','paragraphs':[],'bullets':[],'links':[]}
    seen=set()
    for b in p.get('contentBlocks',[]):
        text=display(b.get('text','')).strip();typ=b.get('type')
        if not text or text in seen or typ=='h1':continue
        seen.add(text)
        if typ in ('h2','h3','h4'):
            if current['paragraphs'] or current['bullets']:sections.append(current)
            current={'heading':text,'paragraphs':[],'bullets':[],'links':[]}
        elif typ=='li':current['bullets'].append(text)
        elif typ in ('p','blockquote','figcaption'):current['paragraphs'].append(text)
        for a in b.get('links',[]):
            if a.get('href') and a.get('text') and a['href'] not in [x['href'] for x in current['links']]:current['links'].append({'label':a['text'],'href':a['href']})
    if current['paragraphs'] or current['bullets']:sections.append(current)
    return sections

def embedded_demo(path, q):
    """Render a protected working experience inside its reader companion.

    ``src`` is deliberately left off the iframe.  The reader runtime mounts
    the same-origin source only after the reader opens, and removes it again
    when the visitor leaves.  This avoids booting nine demos plus VERA while
    someone is simply browsing the mosaic.
    """
    if path == '/vera/':
        source = '/vera/?embed=1'
        label = 'Working VERA workspace'
        modifier = ' reader-demo--immersive'
        demo_id = 'vera'
    elif path in lab_by_path:
        lab = lab_by_path[path]
        # Never point a public reader back to itself.  The Lab engine always
        # mounts from its fixed, protected document; the share route is the
        # crawlable story and card shell around it.
        source = lab['embedPath'] + '?embed=1'
        label = q['heading'] + ' working demo'
        modifier = ''
        demo_id = lab['slug']
    else:
        return ''
    fallback = path
    return f'''<section class="reader-demo{modifier}" id="working-demo" data-reader-demo data-demo="{E(demo_id)}" data-demo-state="unmounted"><h2 class="sr-only">{E(q['heading'])} working demo</h2><div class="reader-demo-stage"><iframe class="reader-demo-frame" title="{E(label)}" data-demo-src="{E(source)}" loading="lazy" referrerpolicy="same-origin"></iframe><p class="reader-demo-status" aria-live="polite">Loading working demo…</p></div><noscript><p class="reader-demo-fallback">JavaScript is needed to show this embedded experience. <a href="{E(fallback)}">Open {E(q['heading'])}</a>.</p></noscript></section>'''

def first_sentence(value):
    text = str(value or '').strip()
    found = re.search(r'^.*?[.!?](?:\s|$)', text)
    return found.group(0).strip() if found else text

def lab_controls_section(lab):
    notes = [note for note in lab.get('interactionNotes', []) if 'direct html' not in note.lower()]
    return f'<section class="story-section story-section--plain reader-demo-notes"><div><p>{E(first_sentence(notes[0]))}</p></div></section>' if notes else ''

def page_share_controls(page, lab=False):
    path = page.get('canonicalPath') or page.get('sharePath') or page['path']
    title = page.get('title') or page.get('name') or 'Little Fight NYC'
    legacy = f' data-copy-lab-link="{E(path)}"' if lab else ''
    return f'''<div class="lab-share reader-share" data-share-url="{E(ORIGIN+path)}" data-share-title="{E(title)}"><button type="button" data-native-share>Share this page</button><button type="button" data-copy-page-link{legacy}>Copy link</button><a href="{E(ORIGIN+path)}" data-share-fallback hidden>Open page link</a><span role="status" aria-live="polite" data-copy-status></span></div>'''

def lab_share_controls(lab):
    return page_share_controls(lab, lab=True)

def normalize(p):
    q=dict(p);q['title']=display(p.get('title','Little Fight NYC'));q['heading']=display(p.get('heading') or q['title'].split(' | ')[0]);q['description']=display(p.get('description') or p.get('metaDescription') or 'Practical help for your business from Little Fight NYC.')
    q['summary']=display(p.get('summary') or q['description']);q['eyebrow']=p.get('eyebrow') or {'answers':'A useful answer','markets':'Website help, wherever you work','case-studies':'Real work','services':'Little Fight NYC'}.get(p.get('category'),'Little Fight NYC')
    q['sections']=p.get('sections') or legacy_sections(p);q['faqs']=p.get('faqs',[])
    a=p.get('answerContent')
    if a:
        q.update(heading=a['question'],summary=a['answer'],sections=[{'heading':'Start here','bullets':a.get('steps',[]),'paragraphs':[a['capabilityNote']] if a.get('capabilityNote') else []}])
        source=pages.get(urlsplit(a.get('sourcePath','')).path)
        if source and source!=p:q['sourceDepth']=source
    m=p.get('marketContent')
    if m:
        q['summary']=m.get('introduction') or m.get('answer') or m.get('deck') or q['summary']
        guide_links=([{'label':'Plan the next step','href':'/services/tech-consulting/'}]
                     if reader_family(p)=='consulting' else [{'label':'Website design','href':'/services/custom-local-websites/'}])
        if p.get('marketType') == 'place':
            for topic_id in m.get('topicIds', []):
                topic_path = '/markets/'+p['marketId']+'/answers/'+topic_id+'/'
                if topic_path in pages:
                    guide_links.append({'label':pages[topic_path]['heading'], 'href':topic_path})
        q['sections']=[{'heading':'A useful starting point','paragraphs':[x for x in [m.get('introductionDetail'),m.get('availability')] if x],'links':guide_links}]
        topics=m.get('topics',[])
        if topics:
            q['sections'] += [{'heading':t.get('question') or t.get('outcome','Your next step'),'paragraphs':[t.get('answer','')],'bullets':t.get('checklist',[]),'links':[{'label':t.get('question') or 'Read the full answer','href':'/markets/'+m.get('id',p.get('marketId',''))+'/answers/'+t['id']+'/'}] if '/markets/'+m.get('id',p.get('marketId',''))+'/answers/'+t['id']+'/' in pages else []} for t in topics]
        elif m.get('steps'):
            q['sections'] += [{'heading':s['title'],'paragraphs':[s['body']]} for s in m['steps']]
        q['faqs']=m.get('faqs',[])
    slug=p['path'].strip('/').split('/')[-1]
    if p['path'].startswith('/case-studies/') and slug in cases:
        c=cases[slug];q.update(heading=display(c['name']),eyebrow=c.get('publicType', 'Selected work'),summary=c['summary'],heroSlugs=[] if 'pending' in c['type'].lower() else [slug])
        q['sections']=[{'heading':heading,'paragraphs':c.get(key,[])} for heading,key in [('The question','challenge'),('What we built','approach'),('Delivered','delivered'),('What changed','outcome')]]
    if p['path'] in lab_by_path:
        lab=lab_by_path[p['path']]
        q.update(heading=lab['name'],summary=lab['summary'],eyebrow=lab['type'],sections=lab['sections'])
    if p.get('id') in summaries and p['path'] not in authored and p['path']!='/services/it-support/':
        chosen=summaries[p['id']]
        q.update(heading=display(chosen['title']),summary=display(chosen['summary']))
    return q

def article(p):
    q=normalize(p);path=q['path']
    record = p.get('_reviewReader')
    if record:
        q.update(
            title=f'Google review from {record["displayName"]} | Little Fight NYC',
            heading=f'Google review from {record["displayName"]}',
            description=f'Google review from {record["displayName"]} with a direct link to the original source.',
        )
        body = (
            '<div class="workbench-reader-layout review-reader-layout">'
            '<div class="workbench-reading-column">'
            + render_review_reader(record)
            + '</div></div>'
        )
        return q, body
    if path == '/construction/':
        q.update(
            title='Websites & Interactive Tools for Builders | Little Fight NYC',
            heading='Websites & Interactive Tools for Builders',
            summary='Explore a real contractor website and hands-on design studies for cabinets, buildings and interiors.',
            description='Explore a real contractor website and hands-on design studies for cabinets, buildings and interiors.',
            family='software',
        )
        return q, render_construction(labs, cases, link) + contact(path, 'Tell us about the work your customers need to see or choose.')
    if path=='/reviews/':
        body='<div class="review-collection"><h1 class="sr-only" id="detail-title" tabindex="-1">Google reviews for Little Fight NYC</h1><section class="story-reviews" aria-label="Google reviews">'+review_cards()+'</section></div>'+contact(path)
        return q,body
    case_slug=path.strip('/').split('/')[-1]
    if (path.startswith('/case-studies/') and case_slug in cases) or path=='/examples/':
        if path=='/examples/':
            q.update(heading='Made for their world.', title='Website Work, Products & Labs | Little Fight NYC', description='Explore real websites for independent businesses, Little Fight products and working Labs. See the project story and try the live work.')
            body=render_work(p,cases,case_visuals,labs,LAB_IMAGES,link)
        else:
            q.update(heading=display(cases[case_slug]['name']))
            body=render_case(cases[case_slug],p,cases,case_visuals,link,case_headlines.get(case_slug,{}))
        body+=contact(path,'Your business has its own story. Let’s build a website that feels like it.')
        return q,body
    industry_examples = INDUSTRY_PROOF.get(path, [])
    if industry_examples:
        slugs = [slug for slug, _ in industry_examples if slug in cases and cases[slug].get('image')]
        captions = dict(industry_examples)
    else:
        slugs = [s for s in q.get('heroSlugs', proof_slugs if path.startswith('/industries/') or path in ['/services/custom-local-websites/','/nationwide/'] else []) if s in cases and cases[s].get('image')]
        captions = {}
    art=''.join(f'<figure><a data-reader-link href="/case-studies/{s}/">{picture(s,i==0)}</a><figcaption><a data-reader-link href="/case-studies/{s}/">{E(captions.get(s, display(cases[s]["name"])))}</a></figcaption></figure>' for i,s in enumerate(slugs) if s in cases)
    if path.startswith('/photos/'):
        album=next((a for a in albums if path=='/photos/'+a['id'].removeprefix('album-')+'/'),None)
        if album:
            photo=album['photos'][0]
            art=f'<figure><img src="{E(photo["localUrl"])}" width="{photo["width"]}" height="{photo["height"]}" alt="{E(photo["title"])}" fetchpriority="high"><figcaption>{E(photo["photographer"])}</figcaption></figure>'
    if path in lab_by_path:
        lab=lab_by_path[path]
        candidate=lab_tile_image(lab)
        image_alt=lab.get('tileImageAlt') or f'{lab["name"]} — original Lab artwork'
        image_width=lab.get('tileImageWidth') or 1440
        image_height=lab.get('tileImageHeight') or 900
        if candidate:art=f'<figure><img src="{E(candidate)}" width="{E(image_width)}" height="{E(image_height)}" alt="{E(image_alt)}" loading="eager"><figcaption>{E(lab["disclaimer"])}</figcaption></figure>'
    if path=='/vera/':
        # This visual belongs only to VERA's agency reader. The working app,
        # its records and its existing brand assets remain untouched.
        art='<div class="reader-context-visual" data-reader-family="brand"><img class="reader-context-icon" src="/assets/mineral/book-open-text-duotone.svg" width="64" height="64" alt=""><figure class="reader-context-figure"><img class="reader-context-image" src="/vera/assets/icons/vera-icon-512.png" width="512" height="512" alt="VERA’s original cream and green geometric mark" loading="eager"><figcaption><a href="#working-demo">VERA: explore NYC rentals and inspect the linked public records.</a></figcaption></figure></div>'
    if not art: art=reader_visual(p,q,cases,albums)
    # The support tiles need their printer/router visible in the opening rail.
    # Group artwork is useful for the other condensed answers, but would
    # otherwise replace those approved physical cues with a generic story art.
    if p.get('_homeGroup') and path not in {'/answers/help/printer/', '/answers/help/wifi/'}:
        art=group_hero(p['_homeGroup']) or art
    if path == '/industries/': art = clay_figure(CLAY_ROUTES[path])
    answer_first = path.startswith('/answers/')
    demo = embedded_demo(path, q)
    primary_action='<a href="#contact">Tell us what you need +</a>'
    if demo:
        primary_action='<a href="#working-demo">Try the working demo +</a>'
    elif preserved(path):
        # Generic protected records remain useful reader pages. They no longer
        # link to themselves as though they were a separate destination.
        primary_action='<a href="#contact">Talk to Little Fight +</a>'
    elif path.startswith('/case-studies/') and 'live' in q['eyebrow'].lower():
        external=[a['href'] for b in p.get('contentBlocks',[]) for a in b.get('links',[]) if a.get('href','').startswith('https://') and urlsplit(a['href']).hostname not in ('littlefightnyc.com','www.littlefightnyc.com')]
        if external:primary_action='<a href="'+E(external[0])+'" target="_blank" rel="noopener noreferrer">Visit the live website +</a>'
    quiet_labels={'A useful answer','Website help, wherever you work','Real work','Selected work','Little Fight NYC'}
    kicker=f'<p class="story-kicker">{E(q["eyebrow"])}</p>' if q['eyebrow'] not in quiet_labels else ''
    hero_action=f'<nav class="contact-actions" aria-label="Your next step">{primary_action}</nav>' if demo else ''
    support_opening_art = art if path in {'/answers/help/printer/', '/answers/help/wifi/'} else ''
    hero=f'<header class="story-hero"><div>{kicker}<h1 class="story-title" id="detail-title" tabindex="-1">{E(q["heading"])}</h1><p class="story-summary">{E(q["summary"])}</p>{hero_action}</div><div class="story-art">{art}</div></header>'
    if path in lab_by_path:
        hero += lab_share_controls(lab_by_path[path])
    if p.get('_answerGuide') or path.startswith('/answers/') or path=='/library/':
        # These are an answer and a map, not a second service pitch. Get the
        # visitor to the substance before any project evidence further down.
        hero=f'<header class="story-hero answer-guide-hero"><h1 class="story-title" id="detail-title" tabindex="-1">{E(q["heading"])}</h1><p class="story-summary">{E(q["summary"])}</p>{("<div class=\"story-art reader-support-opening\">" + support_opening_art + "</div>") if support_opening_art else ""}</header>'
    if path=='/services/custom-local-websites/':
        headline=E(q['heading']).replace('feels like', 'feels<br> like')
        benefits=''.join(f'<li><a href="{href}"><span class="reference-benefit-icon" aria-hidden="true" style="--benefit-asset:url(/assets/mineral/{icon}-duotone.svg)"></span><strong>{label}</strong></a></li>' for href,icon,label in [('#reader-compare','browser','Designed around your business.'),('#reader-ownership','database','Your site. Your domain. Your code.'),('#reader-plan','tag','No monthly hosting fee.')])
        hero=f'<header class="story-hero rw-scene rw-scene--hero" data-rw-scene="opening"><div class="rw-hero-intro"><p class="story-kicker">Websites</p><h1 class="story-title" id="detail-title" tabindex="-1">{headline}</h1></div><div class="rw-hero-promise"><p class="story-summary">Show people what you do.<br> Make it easy to choose you.</p><ul class="rw-benefits" aria-label="Why choose a custom Little Fight website">{benefits}</ul></div></header>'
    elif path in anchor_paths:
        family = anchor_paths[path]
        anchor = anchor_bodies[family]
        benefits = ''.join(f'<li><a href="{E(item["href"])}">{E(item["label"])}</a></li>' for item in anchor['benefits'])
        hero = f'<header class="story-hero rw-scene anchor-service-hero" data-rw-scene="opening"><div class="rw-hero-intro"><p class="story-kicker"><img src="{anchor_icons[family]}" width="32" height="32" alt="">{anchor_labels[family]}</p><h1 class="story-title" id="detail-title" tabindex="-1">{E(q["heading"])}</h1></div><div class="rw-hero-promise"><p class="story-summary">{E(q["summary"])}</p><ul class="rw-benefits" aria-label="In this story">{benefits}</ul></div></header>'
    if path in CLAY_ROUTES and path != '/industries/':
        hero = hero.replace('</header>', clay_figure(CLAY_ROUTES[path]) + '</header>')
    immersive = path == '/vera/'
    if immersive:
        # VERA opens as the working workspace. The complete agency context is
        # immediately below it in a calm disclosure, never discarded.
        body = demo + '<details class="reader-demo-context"><summary>About VERA +</summary><div class="reader-demo-context-body">' + hero
    else:
        # Editorial readers share one reading geometry: a durable orientation
        # rail at left and the actual answer, evidence, and decisions at right.
        # The same semantic structure is used by direct routes and the card
        # dialog, so the physical tile still opens a complete reader.
        body = '<div class="workbench-reader-layout"><aside class="workbench-reader-sidebar">' + hero + '</aside><div class="workbench-reading-column">' + demo
    if answer_first and p.get('_homeGroup'):
        questions=[section for section in p['_homeGroup']['sections'] if section.get('id') and section.get('heading')]
        if len(questions)>1:
            body+='<nav class="answer-jumps" aria-label="In this answer">'+''.join('<a href="#'+E(section['id'])+'">'+E(section['heading'])+'</a>' for section in questions)+'</nav>'
    if path=='/library/':
        body+=render_retained_answers(home_groups,source_routes(CONTENT,home_groups),pages,link,hidden_home_ids)
    if demo and not immersive:
        # The working experience follows the answer immediately. Its notes and
        # source-backed explanation remain below, in the same reader.
        if path in lab_by_path:
            body += lab_controls_section(lab_by_path[path])
    simple_answer = False
    if path=='/services/custom-local-websites/':
        body+=(CONTENT/'website-reference.html').read_text()
        body+=(CONTENT/'website-body.html').read_text()
    elif path in anchor_paths:
        body+=anchor_bodies[anchor_paths[path]]['body']
    elif p.get('_homeGroup'):
        body+=render_group_sections(p['_homeGroup'],link)
    elif p.get('_answerGuide'):
        # Authored guide HTML is rendered into both the direct route and the
        # in-hub reader. Older abbreviated source blocks were removed when the
        # guide record was installed, so this is the only long-form body.
        body+=p['_answerGuide']['bodyHtml']
    elif p.get('contentBlocks') and path not in authored and path not in lab_by_path:
        body+=render_legacy_sections(p,display,link)
    else:
        section_body = sections_html(q['sections'])
        # A short answer and its illustration share one composition. Keep the
        # text first in document order; long guides and grouped stories retain
        # their existing section flow.
        simple_answer = bool(answer_first and art and len(q['sections']) == 1
            and section_body.startswith('<section class="story-section story-section--plain"')
            and not q.get('sourceDepth') and not q.get('faqs') and not q.get('_rewriteCategory'))
        body+=('<div class="answer-composition">' if simple_answer else '')+section_body
    if q.get('sourceDepth'):
        body+=render_legacy_sections(q['sourceDepth'],display,link)
    if path in ['/nationwide/','/websites-for-your-business/']:
        body+='<section class="story-section story-section--plain"><nav class="industry-links" aria-label="Websites by business type">'+''.join(link(label,url) for label,url in INDUSTRIES)+'</nav></section>'
    if path.startswith('/industries/') and path != '/industries/' and not slugs:
        examples = INDUSTRY_PROOF.get(path, [])
        body += '<section class="story-proof" aria-label="Website examples">' + proof_grid([slug for slug, _ in examples], dict(examples)) + '</section>'
    if q['faqs']:
        body+='<section class="story-faq"><h2>Before we begin.</h2>'+''.join(f'<details><summary>{E(x["question"])}</summary><p>{E(display(x["answer"]))}</p>'+('<nav class="group-references" aria-label="Website service areas">'+''.join(link(item['label'],item['href']) for item in x['links'])+'</nav>' if x.get('links') else '')+'</details>' for x in q['faqs'])+'</section>'
    if q.get('_rewriteCategory'):
        body+=render_category_answers(rewrite,q['_rewriteCategory'])
    if answer_first and art and not p.get('_answerGuide') and not support_opening_art:
        body+='<aside class="answer-visual" aria-label="Illustration">'+art+'</aside>'
    if simple_answer:
        body+='</div>'
    service_path=q.get('_servicePath') or p.get('_homeGroup',{}).get('servicePath')
    if service_path:
        body+='<nav class="answer-service-link" aria-label="Related service">'+link({'web':'Website design','it':'Tech support','consulting':'Tech consulting','software':'Custom software'}[reader_family(p)]+' +',service_path)+'</nav>'
    if path in ['/services/custom-local-websites/','/reviews/']:
        body+='<section class="story-reviews" aria-label="Google reviews">'+review_cards(3 if path=='/services/custom-local-websites/' else None)+'</section>'
    body+=q.get('extraHtml','')
    if path=='/legal/' and PRODUCTION:
        body+='<p><button type="button" data-production-open-consent>Review analytics choices</button></p>'
    body+=contact(path,q.get('contactPrompt') or 'Send a website link, an error message, or a few lines about the work. We’ll take a free first look and explain what we can help with.')
    if immersive:
        body += '</div></details>'
    else:
        body += '</div></div>'
    if PRODUCTION and path in ISLANDS:
        # The full existing journey replaces only this island. The fallback
        # remains useful if scripts are unavailable and never claims delivery.
        fallback=f'<section class="story-hero"><div><h1 id="detail-title" class="story-title">{E(q["heading"])}</h1><p>{E(q["summary"])}</p><nav class="contact-actions">{channels(contact_intent(path),path)}</nav></div></section>'
        if path=='/contact/':
            fallback=body
        if path=='/tech-audit/':
            inquiry_copy=json.loads((CONTENT/'inquiry-copy.json').read_text())
            general=inquiry_copy['general']
            fallback=f'<section class="story-hero"><div><p class="story-kicker" data-inquiry-eyebrow>{E(general["eyebrow"])}</p><h1 id="detail-title" class="story-title" data-inquiry-title>{E(general["title"])}</h1><p data-inquiry-summary>{E(general["summary"])}</p><nav class="contact-actions">{channels(contact_intent(path),path)}</nav></div></section>'
            fallback+='<script type="application/json" data-inquiry-copy>'+json.dumps(inquiry_copy,ensure_ascii=False).replace('<','\\u003c')+'</script>'
            fallback+='''<form class="static-inquiry" name="tech-audit-scratch" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="tech-audit-scratch"><input type="hidden" name="source" value="/tech-audit/"><p hidden><label>Leave this empty<input name="bot-field"></label></p><label>Your name<input name="name" autocomplete="name" required maxlength="150"></label><label>Business name (optional)<input name="business" autocomplete="organization" maxlength="150"></label><label>Website or business profile link <span>(optional)</span><input name="website_url" type="text" inputmode="url" autocomplete="url" autocapitalize="none" spellcheck="false" maxlength="2048" placeholder="yourbusiness.com" aria-describedby="static-website-url-hint"><small id="static-website-url-hint">A website, Google profile, or social link. Leave blank if you’re starting fresh.</small></label><label>Phone or email<input name="contact" type="text" inputmode="text" autocomplete="off" required maxlength="250" aria-describedby="static-contact-hint"><small id="static-contact-hint">Use a phone number for a call or text, or an email address for an email reply.</small></label><label>What do you need help with?<select name="intent" required><option value="" selected disabled>Choose a service</option><option value="general">General question</option><option value="website">Website</option><option value="support">Tech support</option><option value="consulting">Tech consulting</option><option value="systems">Custom software</option></select></label><label>How should we reply?<select name="follow_up"><option value="fastest" selected>Whatever is fastest</option><option value="text">Text me</option><option value="phone">Call me</option><option value="email">Email me</option></select></label><label><span data-inquiry-message-label>What would you like to change?</span><textarea name="message" required maxlength="4000"></textarea></label><button type="submit" data-inquiry-submit>Send your inquiry +</button><p>Your message goes to Little Fight. <a href="/legal/">Privacy and terms</a>.</p></form>'''
        body=f'<div data-production-island="{ISLANDS[path]}" data-production-path="{path}">{fallback}</div>'
    return q,body

INDUSTRIES=[('Plumbers','/industries/plumbers/'),('Roofers','/industries/roofing/'),('Builders & home services','/industries/luxury-home-services/'),('Law firms','/industries/law-firms/'),('Salons & wellness','/industries/salons-wellness/')]
for album in albums:
    path='/photos/'+album['id'].removeprefix('album-')+'/'
    gallery='<section class="story-proof"><p class="story-kicker">Places, people and the work they do</p><div class="photo-grid">'
    for photo in album['photos']:
        gallery+=f'<figure><img src="{E(photo["localUrl"])}" width="{photo["width"]}" height="{photo["height"]}" loading="lazy" decoding="async" alt="{E(photo["title"])}"><figcaption>{E(photo["title"])} · {E(photo["photographer"])}<br>{link(photo["licenseName"],photo["licenseUrl"])} · {link("Original source",photo["sourcePage"])}<br>{E(photo.get("adaptation",""))}</figcaption></figure>'
    gallery+='</div></section>'
    pages[path]={'path':path,'id':album['id'],'heading':album['title'],'title':album['title']+' | Little Fight NYC','summary':album['caption'],'description':album['question'],'sections':[{'heading':album['question'],'paragraphs':[album['answer']]}],'extraHtml':gallery}
pages['/reviews/']={'path':'/reviews/','title':'Google Reviews | Little Fight NYC','heading':'Good people. Kind words.','summary':'Read what clients have shared about working with Little Fight NYC. Every excerpt links to its Google source.','description':'Seven Google reviews of Little Fight NYC, with direct links and first-name-only attribution.','sections':[]}
pages['/websites-for-your-business/']={'path':'/websites-for-your-business/','title':'Websites for Your Business | Little Fight NYC','heading':'Your business has its own story.','summary':'A roofing company, a salon and a law firm need different things from a website. Start with the customers you want to reach.','description':'Explore website design for trades, home services, law firms and salons across the United States.','sections':[]}
pages['/tech-audit/']={'path':'/tech-audit/','title':'Tell Us What You Need | Little Fight NYC','heading':'What needs to work better?','summary':'Bring the old website, the rough idea or the problem you cannot quite name. We’ll help you work out the next step.','description':'Call, text or email Little Fight NYC about a new website or a business technology problem.','sections':[]}
pages['/thanks/']={'path':'/thanks/','title':'Your Next Step | Little Fight NYC','heading':'Thanks for the note.','summary':'If you just sent an inquiry, we’ll use the contact details you provided to reply. You can also call, text or email us.','description':'What happens after you contact Little Fight NYC.','sections':[]}
pages['/services/it-support/']={'path':'/services/it-support/','title':'New York Tech Support | Little Fight NYC','heading':'A little help with the everyday tech.','summary':'Computers, Wi-Fi, email and the tools you rely on. Tell us what stopped working so we can discuss the right kind of help.','description':'Practical technology help for New York residents and small businesses. Ask about future on-site availability.','sections':[{'heading':'New York visits, planned with you.','paragraphs':['We are currently prioritizing website projects nationwide. Ask about future New York on-site availability before planning a visit.','Share the issue and your neighborhood. We’ll confirm the scope, timing and available options directly. No appointment is implied by this page.']},{'heading':'Start with the interruption.','bullets':['A computer that will not cooperate.','Wi-Fi that does not reach the rooms you use.','An email account or device that needs attention.','A change of equipment without losing your files.']}]}
pages['/construction/']={'path':'/construction/','id':'construction-showcase','title':'Websites & Interactive Tools for Builders | Little Fight NYC','heading':'Websites & Interactive Tools for Builders','summary':'Explore a real contractor website and hands-on design studies for cabinets, buildings and interiors.','description':'Explore a real contractor website and hands-on design studies for cabinets, buildings and interiors.','family':'software','sections':[]}
for lab in labs:
    share_path = lab['sharePath']
    pages[share_path] = {
        'id': 'lab-'+lab['slug']+'-share',
        'path': share_path,
        'title': lab['name']+' | Little Fight NYC',
        'heading': lab['name'],
        'summary': lab['summary'],
        'description': lab['summary'],
        'eyebrow': lab['type'],
        'category': 'labs',
        'family': 'software',
        'sections': lab['sections'],
    }

apply_readers(pages, authored, home_groups)
apply_page_rewrite(pages, authored, rewrite)

# Eight existing, indexable routes receive deeper decision guides. The source
# route stays stable; its earlier abbreviated blocks are intentionally replaced
# so a reader never receives a new guide followed by the same old answer.
guide_records = load('answer-guides.json').get('guides', [])
guide_paths = set()
for guide in guide_records:
    path = guide.get('path')
    body = guide.get('bodyHtml')
    if not isinstance(path, str) or not path.startswith(('/answers/', '/journal/')) or not isinstance(body, str):
        raise RuntimeError('Answer guide needs a retained answer or journal path and bodyHtml')
    if re.search(r'<(?:script|style|iframe|form)\b', body, re.I):
        raise RuntimeError('Answer guide bodyHtml may not introduce executable or embedded markup')
    if path in guide_paths or path not in pages:
        raise RuntimeError('Answer guide path is missing or duplicated: '+str(path))
    guide_paths.add(path)
    page = dict(pages[path])
    for key in ('answerContent', 'marketContent', 'contentBlocks', 'sourceDepth', 'extraHtml', 'faqs'):
        page.pop(key, None)
    body = re.sub(r'<a href=(["\'])/', r'<a data-reader-link href=\1/', body)
    body = body.replace(
        "<div class='guide-table-wrap'>",
        "<div class='guide-table-wrap' tabindex='0' role='region' aria-label='Guide comparison table'>",
    )
    page.update(
        title=guide['title'], heading=guide['heading'], summary=guide['summary'],
        description=guide['description'], family={'/journal/how-to-own-your-domain-name-not-your-web-guy/':'consulting', '/journal/how-to-stop-double-bookings-small-business/':'software'}.get(path,'web'), sections=[], _answerGuide={**guide, 'bodyHtml': body},
    )
    pages[path] = page
    authored[path] = page
if len(guide_paths) != 8:
    raise RuntimeError('Expected eight retained answer guides, found '+str(len(guide_paths)))

for path, family in anchor_paths.items():
    anchor = anchor_bodies[family]
    pages[path].update(heading=anchor['title'], summary=anchor['summary'], description=anchor['description'],
                       family=family, sections=[], faqs=[{'question':item['q'], 'answer':item['a']} for item in anchor.get('faq',[])])
    authored[path] = pages[path]

# Service-area business: city-level identity only, no street address. Hours
# match the public contact line ("9am–9pm Eastern"), every day.
# The verified Google Business Profile recorded with the review excerpts.
REVIEWS_PROFILE = json.loads((CONTENT/'reviews.json').read_text())['profileUrl']
LOCAL_BUSINESS = {'@type':'ProfessionalService','@id':ORIGIN+'/#localbusiness','name':'Little Fight NYC','url':ORIGIN+'/',
    'telephone':'+16463600318','email':'hello@littlefightnyc.com','image':ORIGIN+'/icon-512.png','logo':ORIGIN+'/icon-512.png',
    'description':'Websites, tech support, consulting and custom software for independent businesses.',
    'address':{'@type':'PostalAddress','addressLocality':'New York','addressRegion':'NY','addressCountry':'US'},
    'areaServed':[{'@type':'City','name':'New York','containedInPlace':{'@type':'State','name':'New York'}},{'@type':'Country','name':'United States'}],
    'openingHoursSpecification':{'@type':'OpeningHoursSpecification','dayOfWeek':['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],'opens':'09:00','closes':'21:00'},
    'knowsAbout':['small business websites','small business IT support','Mac and Windows computers','Microsoft 365','business email','Wi-Fi networks','printers','data backup','tech consulting','custom business software','Google Business Profile'],
    'hasMap':REVIEWS_PROFILE,
    'parentOrganization':{'@id':ORIGIN+'/#organization'},
    'sameAs':[REVIEWS_PROFILE,'https://www.instagram.com/littlefightnyc/','https://www.facebook.com/1311467162048309','https://www.pinterest.com/littlefightn/','https://www.yelp.com/biz/little-fight-nyc-new-york']}

def hero_preload():
    """Preload the diorama in the format and size the hero <picture> will choose."""
    from clay_hero import srcset, has_avif
    kind, extension = ('image/avif', 'avif') if has_avif('hero-diorama-clean') else ('image/webp', 'webp')
    return (f'<link rel="preload" as="image" type="{kind}" imagesrcset="{srcset("hero-diorama-clean", 1448, extension)}" '
            'imagesizes="(max-width:600px) 90vw, (max-width:1000px) 70vw, 720px" fetchpriority="high">')

def head(q, home=False):
    title=E(q.get('title','Little Fight NYC')); desc=E(q.get('description','Custom websites for independent businesses nationwide.'));path=q['path']
    visual=case_visuals.get(path.strip('/').split('/')[-1],{}) if path.startswith('/case-studies/') else {}
    lab = lab_by_path.get(q.get('canonicalPath', path))
    card = social_card(q, reader_family(q), visual.get('desktop'),
                       {'src':lab_tile_image(lab), 'alt':lab.get('tileImageAlt') or lab['name']} if lab else None)
    share_meta = social_tags(q, card)
    graph=[{'@type':'Organization','@id':ORIGIN+'/#organization','name':'Little Fight NYC','url':ORIGIN+'/', 'telephone':'+16463600318','email':'hello@littlefightnyc.com','logo':ORIGIN+'/icon-512.png','sameAs':[REVIEWS_PROFILE,'https://www.instagram.com/littlefightnyc/', 'https://www.facebook.com/1311467162048309', 'https://www.pinterest.com/littlefightn/', 'https://www.yelp.com/biz/little-fight-nyc-new-york']}, {'@type':'WebSite','@id':ORIGIN+'/#website','name':'Little Fight NYC','url':ORIGIN+'/'},{'@type':'WebPage','@id':ORIGIN+path+'#webpage','url':ORIGIN+path,'name':q.get('title'),'description':q.get('description'),'isPartOf':{'@id':ORIGIN+'/#website'},'publisher':{'@id':ORIGIN+'/#organization'}}]
    if path=='/':graph.append(LOCAL_BUSINESS)
    if path.startswith('/industries/') or path=='/services/custom-local-websites/':graph.append({'@type':'Service','name':'Custom small business website design' if path=='/services/custom-local-websites/' else q.get('heading'),'description':q.get('description'),'serviceType':'Custom website design','url':ORIGIN+path,'areaServed':{'@type':'Country','name':'United States'},'provider':{'@id':ORIGIN+'/#organization'}})
    if q.get('_rewriteCategory'):
        family=q['_rewriteCategory']
        graph.append(category_schema(rewrite,family,ORIGIN,path))
        if family!='web':
            graph.append({'@type':'Service','@id':ORIGIN+path+'#service','name':q['heading'],'description':q['description'],
                          'serviceType':{'it':'IT support','consulting':'Technology consulting','software':'Custom business software'}[family],
                          'url':ORIGIN+path,'provider':{'@id':ORIGIN+'/#organization'}})
    elif q.get('_rewriteGuide'):
        # The page's own question and its related questions, exactly as shown.
        item = rewrite['answers'][q['_rewriteAnswer']]
        graph[2]['about'] = {'@id': ORIGIN + q['_servicePath'] + '#service'}
        graph[2]['dateModified'] = GUIDE_UPDATED
        graph.append({'@type':'FAQPage', '@id':ORIGIN+path+'#questions', 'isPartOf':{'@id':ORIGIN+path+'#webpage'},
                      'mainEntity':[{'@type':'Question', 'name':row['question'], 'acceptedAnswer':{'@type':'Answer','text':row['answer']}}
                                    for row in [{'question':item['question'], 'answer':item['answer']+' '+item['detail']}, *q['_rewriteGuide']['faqs']]]})
    elif q.get('faqs'):
        graph.append({'@type':'FAQPage', '@id':ORIGIN+path+'#questions',
                      'mainEntity':[{'@type':'Question', 'name':item['question'],
                                     'acceptedAnswer':{'@type':'Answer','text':item['answer']}} for item in q['faqs']]})
    graph[2]['inLanguage'] = q.get('language', 'en')
    graph[2]['primaryImageOfPage'] = {'@type':'ImageObject', 'url':ORIGIN+card['image'], 'width':card['width'], 'height':card['height'], 'caption':card['alt']}
    if path.startswith('/journal/') and path != '/journal/':
        graph.append({'@type':'Article', '@id':ORIGIN+path+'#article',
                      'headline':q.get('heading') or q.get('title'), 'description':q.get('description'),
                      'image':ORIGIN+card['image'],
                      'mainEntityOfPage':{'@id':ORIGIN+path+'#webpage'},
                      'author':{'@id':ORIGIN+'/#organization'},
                      'publisher':{'@id':ORIGIN+'/#organization'},
                      'inLanguage':q.get('language','en')})
    ld=json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')
    robots = ('index, follow, max-image-preview:large' if indexable(path) else 'noindex, follow') if PRODUCTION else 'noindex, nofollow, noarchive'
    return f'''<!doctype html><html lang="{E(q.get('language','en'))}"{' data-home-boot' if home else ''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>{title}</title><meta name="description" content="{desc}"><meta name="robots" content="{robots}"><meta name="theme-color" content="#ff7839"><link rel="canonical" href="{ORIGIN}{E(q.get("canonicalPath",path))}">{share_meta}<link rel="icon" href="/assets/boat-orange.svg" type="image/svg+xml"><link rel="preload" href="/assets/mineral/atkinson-hyperlegible-next-latin.woff2" as="font" type="font/woff2" crossorigin>{'<script src="/site-boot.js"></script>' if home else ''}<link rel="stylesheet" href="/{'home' if home else 'site'}.css">{hero_preload() if home and os.environ.get("LFNYC_CLAY_HERO_PREVIEW", "1") == "1" else ""}{'<noscript><link rel="stylesheet" href="/sculpture-static.css"></noscript>' if home else ''}<script type="application/ld+json">{ld}</script>{'<script defer src="/mosaic-layout.js"></script>' if home else ''}<script defer src="/tile-motion.js"></script>{'<script defer src="/tile-effects.js"></script>' if home else ''}<script defer src="/website-story.js"></script><script defer src="/clay-icons.js"></script>{'<script defer src="/clay-cutouts.js"></script>' if CLAY_LIBRARY else ''}{'<script defer src="/clay-hero.js"></script>' if home and os.environ.get('LFNYC_CLAY_HERO_PREVIEW', '1') == '1' else ''}<script defer src="/search-relevance.js"></script><script defer src="/site.js"></script>{BRIDGE}</head>'''

def topbar(home=False):
    question_link='<a class="start-button" href="/tech-audit/" data-reader-link><span>Get help</span><span class="help-button__plus" aria-hidden="true">+</span></a>'
    services=''  # The current master has Websites and Our work in the header.
    return '<header class="topbar"><a class="wordmark pill" href="/" aria-label="Little Fight NYC homepage"><img class="boat" src="/assets/boat-orange.svg" width="44" height="38" alt=""><span>little fight <span class="nyc">NYC</span></span></a><nav class="primary-nav" aria-label="Main navigation">'+link('Websites','/services/custom-local-websites/')+services+link('Our work','/examples/')+question_link+'</nav><button class="explore-toggle pill" id="explore-toggle" aria-controls="explore-menu" aria-haspopup="dialog" aria-expanded="false" aria-label="Search answers and services"><span class="explore-label">Search answers</span><span class="nav-symbol" aria-hidden="true" style="--nav-asset:url(/assets/mineral/magnifying-glass-duotone.svg)"></span></button><button class="mobile-menu-toggle" id="menu-toggle" aria-controls="explore-menu" aria-haspopup="dialog" aria-expanded="false" aria-label="Explore services and work"><span class="nav-symbol" aria-hidden="true" style="--nav-asset:url(/assets/mineral/list-duotone.svg)"></span></button></header>'

def contact_dock():
    """Call, Text and Get help stay within reach once the hero's buttons scroll away (site.js)."""
    return ('<nav class="contact-dock" aria-label="Contact Little Fight NYC" data-contact-dock data-visible="false">'
            '<span class="contact-dock__status"><span class="contact-dock__dot" aria-hidden="true"></span>'
            '<span data-hours-short>9am–9pm ET</span></span>'
            '<a class="contact-dock__link" href="tel:+16463600318">Call</a>'
            '<a class="contact-dock__link" href="sms:+16463600318">Text</a>'
            '<a class="contact-dock__help" href="/tech-audit/" data-get-help><span>Get help</span><span aria-hidden="true">+</span></a>'
            '</nav>')


HELP_CHOICES = (
    ('website', 'A website', 'New, better, or easier to find', 'browser-duotone'),
    ('support', 'Something broke', 'Email, Wi-Fi, printer, accounts', 'wrench-duotone'),
    ('general', 'A second opinion', 'Quotes, tools, what to do next', 'chat-text-duotone'),
    ('systems', 'Software that fits', 'Bookings, approvals, busywork', 'shapes-duotone'),
)


def help_panel():
    """Get help opens a one-tap chooser; each choice starts the matching inquiry (site.js)."""
    choices = ''.join(
        f'<a class="help-choice" data-help-choice="{intent}" data-reader-link href="/tech-audit/?intent={intent}&amp;source=%2F">'
        f'<span class="help-choice__icon" aria-hidden="true" style="--help-icon:url(/assets/mineral/{icon}.svg)"></span>'
        f'<span class="help-choice__text"><strong>{E(title)}</strong><small>{E(detail)}</small></span></a>'
        for intent, title, detail, icon in HELP_CHOICES)
    return ('<dialog id="get-help-panel" class="help-panel" aria-labelledby="help-panel-title">'
            '<div class="help-panel__card"><button class="help-panel__close" type="button" data-help-close aria-label="Close">×</button>'
            '<p class="help-panel__hours"><span class="contact-dock__dot" aria-hidden="true"></span><span data-hours-status>A person answers 9am–9pm ET</span></p>'
            '<h2 id="help-panel-title">What’s going on?</h2>'
            f'<div class="help-panel__choices">{choices}</div>'
            '<p class="help-panel__next">Free first look. A written scope before any work.</p>'
            '<p class="help-panel__talk">Rather talk? <a href="tel:+16463600318">Call</a> · <a href="sms:+16463600318">Text</a> · '
            '<a href="mailto:hello@littlefightnyc.com">Email</a></p></div></dialog>')


def site_footer():
    return '<footer class="site-footer"><nav class="utility-nav" aria-label="More Little Fight">'+''.join(link(label,url) for label,url in [('Answers','/library/'),('Your business','/websites-for-your-business/'),('Reviews','/reviews/'),('About','/about/')])+'<a href="https://www.yelp.com/biz/little-fight-nyc-new-york" target="_blank" rel="noopener noreferrer">Yelp</a>'+('<button class="privacy-control" type="button" data-production-open-consent>Privacy choices</button>' if PRODUCTION else link('Privacy choices','/legal/'))+'</nav></footer>'

def shell_end(home=False):
    privacy = site_footer()
    menu = '''<dialog id="explore-menu" aria-labelledby="explore-title"><div class="menu-panel"><button type="button" class="menu-close" aria-label="Close services and search">×</button><h2 id="explore-title">What brings you here?</h2><label class="sr-only" for="preview-search">Search questions, services and work</label><input id="preview-search" type="search" autocomplete="off" placeholder="Websites, booking, email, tech support…"><div id="search-results" aria-live="polite"></div><button class="motion pill" id="motion-toggle" aria-pressed="false" aria-label="Pause animations and image rotation"><span class="motion-label">Pause motion &amp; slideshows</span> <span aria-hidden="true">◌</span></button><nav class="preview-filters" aria-label="Explore by service"><button data-filter="web">Websites</button><button data-filter="it">Tech support</button><button data-filter="software">Software</button><button data-filter="consulting">Consulting</button><button data-filter="all" aria-pressed="true">All tiles</button></nav><nav class="menu-links">'''+''.join(link(label,url) for label,url in [('Website design','/services/custom-local-websites/'),('For your business','/websites-for-your-business/'),('See our work','/examples/'),('Read our reviews','/reviews/'),('Ask us a question','/tech-audit/')])+'''</nav></div></dialog>'''
    reader = '<dialog id="detail" aria-labelledby="detail-title"><section class="detail-window lf-reader reader-longform">'+workbench_header(family=None, contacts=channels(), dialog=True)+'<div id="detail-body" class="detail-body"></div><nav class="reader-navigation" aria-label="Reader navigation"><button type="button" id="reader-previous">Previous</button><button type="button" id="reader-hub">Back to home +</button><button type="button" id="reader-next">Next +</button></nav></section></dialog></body></html>'
    return ('' if home else privacy) + menu + reader

for path,p in pages.items():
    if path=='/':continue
    q,body=article(p)
    output_path='/_readers'+path if preserved(path) else path
    if preserved(path):q=dict(q,path=output_path,canonicalPath=path)
    if path not in lab_by_path and path not in ISLANDS and path != '/construction/':
        body += page_share_controls(q)
    layout = ' data-reader-layout="immersive"' if path == '/vera/' else ''
    family = reader_family(p)
    page_class = 'page-home answer-page' if path.startswith('/answers/') or p.get('_answerGuide') or path in ('/library/','/tech-audit/') else 'page-home'
    template = ' data-reader-template="website-service"' if path == '/services/custom-local-websites/' else (' data-reader-template="anchor-service"' if path in anchor_paths else (' data-reader-template="combined-story"' if p.get('_homeGroup') else ''))
    template += ' data-home-path="'+E(home_context.get(path,path))+'"'
    write(output_path+'index.html',head(q)+f'<body class="{page_class}"><a class="skip-to-finder" href="#detail-title">Skip to content</a><div class="workbench-page" data-reader-family="{E(family)}">'+workbench_header(family=family, contacts=channels(contact_intent(path),path))+f'<main class="lf-reader reader-longform" data-page-content data-reader-family="{E(family)}" data-content-id="{E(p.get("id") or path.strip("/"))}"{layout}{template}>{body}</main></div>'+shell_end())

class Links(HTMLParser):
    def __init__(self):super().__init__();self.tiles=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='a' and 'tile' in a.get('class','').split():self.tiles.append(a)

mosaic=(CONTENT/'mosaic.html').read_text()
mosaic=re.sub(r'((?:src|href|poster)=")((?:assets|source-media)/[^"#]+)',r'\1/\2',mosaic)
mosaic=display(mosaic)
for album in albums:
    mosaic=mosaic.replace('/#'+album['id'],'/photos/'+album['id'].removeprefix('album-')+'/')
original=Links();original.feed(mosaic);assert len(original.tiles)==106
# The tile positions and identities remain intact. Public work now previews
# the actual project image, with labels beside it instead of over its text.
for tile in original.tiles:
    route=urlsplit(tile.get('href','')).path
    slug=route.strip('/').split('/')[-1]
    record=cases.get(slug) if route.startswith('/case-studies/') else lab_by_embed_path.get(route)
    if not record or 'pending' in record.get('type','').lower():continue
    photo=('/assets/proof/optimized/tile-'+slug+'-480.webp') if record.get('image') else (lab_tile_image(record, 480) if route in lab_by_embed_path else '')
    if slug=='hair-by-rachel-charles':photo='/assets/proof/optimized/website-rachel-services-640.webp'
    if not photo:continue
    pattern=r'<a\b[^>]*href="'+re.escape(tile['href'])+r'"[^>]*>.*?</a>'
    found=re.search(pattern,mosaic,re.S)
    if not found:continue
    old=found.group(0);start=old[:old.index('>')+1].replace('class="','class="has-real-proof ',1)
    if route in lab_by_embed_path:
        # The source engine keeps its original URL. The public card points to
        # the useful, indexable Lab story that embeds that engine.
        start=start.replace('href="'+tile['href']+'"', 'href="'+record['sharePath']+'"', 1)
        # A Lab front is an invitation into the real working experience.  The
        # optional tile fields let each Lab keep an authored image, plain hook,
        # and action without ever covering lettering inside the capture.
        photo=record.get('tileImage') or photo
        image_alt=record.get('tileImageAlt') or ''
        hook=record.get('tileDescription') or record.get('lead') or record.get('tagline') or record['summary']
        action=record.get('tileAction') or 'Open the working demo'
        image_width=record.get('tileImageWidth') or 480
        image_height=record.get('tileImageHeight') or 330
        front=f'''<span class="lab-tile-face" data-lab-scene="{E(record['slug'])}">
<span class="lab-tile-media"><img src="{E(photo)}" width="{E(image_width)}" height="{E(image_height)}" alt="{E(image_alt)}" loading="lazy" decoding="async"></span>
<span class="lab-tile-copy"><strong class="lab-tile-title">{E(display(record['name']))}</strong><span class="lab-tile-hook">{E(hook)}</span><span class="lab-tile-action">{E(action)}</span></span>
<span class="lab-tile-plus" aria-hidden="true">+</span></span>'''
    else:
        label=record.get('publicType','OUR WORK')
        label_html=f'<span class="proof-tile-label">{E(label)}</span>' if label!='Website design' else ''
        front=f'<span class="proof-tile-face">{label_html}<strong>{E(display(record["name"]))}</strong><img src="{E(photo)}" width="480" height="330" alt="" loading="lazy" decoding="async"><span class="proof-tile-plus" aria-hidden="true">+</span></span>'
    mosaic=mosaic.replace(old,start+front+'</a>',1)
if PRODUCTION:
    for tile in original.tiles:
        target=urlsplit(tile.get('href','')).path
        if preserved(target):mosaic=mosaic.replace('href="'+tile['href']+'"','href="'+tile['href']+'" data-reader-src="/_readers'+target+'"')
additions=[]
for identity,title,path,family,kicker in [('buyer-plumbers','Make plumbing easier to book.','/industries/plumbers/','web','WEBSITES FOR PLUMBERS'),('buyer-roofing','Show your roofing expertise.','/industries/roofing/','web','WEBSITES FOR ROOFERS'),('buyer-homes','Work worth showing.','/industries/luxury-home-services/','web','BUILDERS + HOME SERVICES'),('buyer-law','A clearer first impression.','/industries/law-firms/','web','WEBSITES FOR LAW FIRMS'),('google-reviews','Google reviews','/reviews/','brand','★★★★★')]:
    additions.append(f'<a class="tile buyer-tile" href="{path}" data-answer="{identity}" data-family="{family}" data-material="soft-mineral" data-material-family="{family}" data-cell-face="mixed" data-cell-title="{E(title)}"><span class="cell-face"><span class="cell-kicker">{kicker}</span><span class="cell-title">{E(title)}</span><span class="buyer-plus" aria-hidden="true">+</span></span></a>')
new_lab_tiles = [lab_mosaic_tile(lab) for lab in labs if lab['embedPath'] not in {urlsplit(tile.get('href', '')).path for tile in original.tiles}]
mosaic=build_topic_mosaic(''.join(additions)+mosaic,reviews,topic_tiles,albums,[construction_tile(), *new_lab_tiles])
mosaic=enrich_editorial_tiles(mosaic)
mosaic,homepage_inventory=apply_homepage_groups(mosaic,home_groups,hidden_home_ids)
mosaic,sculpture_inventory=sculptural_mosaic(mosaic)
write('sculpture-inventory.json',json.dumps(sculpture_inventory,ensure_ascii=False,indent=2)+'\n')
write('homepage-inventory.json',json.dumps(homepage_inventory,ensure_ascii=False,indent=2)+'\n')
q={'path':'/','title':'Little Fight NYC | Websites, Tech Support & Software','description':'Websites, tech support, and custom software for independent businesses. Based in New York, building websites nationwide. Start with a free first look.'}
# The homepage paints immediately; only the tile canvas waits for its layout (site-boot.css).
boot=''
home=head(q,True)+'<body class="mosaic-home">'+boot+'<a class="skip-to-finder" href="#canvas">Skip to the tiles</a><div class="app-shell">'+topbar(True)+sculptural_hero()+'<main class="topic-canvas" id="canvas" aria-label="Explore Little Fight NYC by topic">'+mosaic+'</main>'+site_footer()+contact_dock()+'</div>'+shell_end(True)+help_panel()
write('index.html',home)
rows=[{'path':p,'title':normalize(x)['heading'],'description':normalize(x)['description'],'questions':[section['heading'] for section in x.get('_homeGroup',{}).get('sections',x.get('sections',[])) if section.get('heading')], 'homePath':home_context.get(p,p), 'family':{'web':'Websites','it':'Tech support','consulting':'Consulting','software':'Custom software','brand':'Little Fight NYC'}[reader_family(x)]} for p,x in pages.items() if p!='/' and p not in lab_by_embed_path]
write('search-index.json',json.dumps(rows,ensure_ascii=False,separators=(',',':')))
# The browser shell reads this map before it fetches an internal reader. It
# lets links from search, the work collection, and direct pages retain their
# canonical href while the enhanced experience always opens the companion.
reader_routes = {path: reader_companion(path) or path for path in sorted(pages) if path != '/'}
write('reader-routes.json', json.dumps(reader_routes, ensure_ascii=False, separators=(',', ':')))
if PRODUCTION:
    write('robots.txt','User-agent: *\nAllow: /\nDisallow: /.netlify/\nDisallow: /vera/data/\nSitemap: '+ORIGIN+'/sitemap-index.xml\n')
    urls=sorted(path for path in pages if indexable(path) and not path.startswith(STANDALONE))
    write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+ORIGIN+E(p)+'</loc></url>' for p in urls)+'</urlset>')
    write('image-sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'+''.join('<url><loc>'+ORIGIN+'/case-studies/'+slug+'/</loc><image:image><image:loc>'+ORIGIN+'/'+E(c['image'].lstrip('/'))+'</image:loc></image:image></url>' for slug,c in cases.items() if c.get('image') and indexable('/case-studies/'+slug+'/'))+'</urlset>')
    write('sitemap-index.xml','<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<sitemap><loc>'+ORIGIN+'/'+name+'</loc></sitemap>' for name in ['sitemap.xml','image-sitemap.xml'])+'</sitemapindex>')
else:
    write('robots.txt','User-agent: *\nDisallow: /\n')
    write('_headers',"/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  Cache-Control: no-store\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self' mailto:; frame-ancestors 'none'; base-uri 'self'\n")
def llms_text():
    """A plain map of the indexable site for AI readers, built from approved page titles and descriptions."""
    def line(p):
        q=pages[p]; name=re.sub(r'\s*\|\s*Little Fight NYC$','',q.get('title') or p)
        return '- ['+name+']('+ORIGIN+p+')'+(': '+q['description'] if q.get('description') else '')
    def group(title, prefix, keep=lambda p: True):
        found=sorted(p for p in pages if p.startswith(prefix) and p!=prefix and p.count('/')==prefix.count('/')+1 and indexable(p) and keep(p))
        return ('## '+title+'\n\n'+'\n'.join(line(p) for p in found)+'\n\n') if found else ''
    support=lambda p: reader_family(pages[p])=='it'
    intro=('# Little Fight NYC\n\n> Websites, tech support, consulting and custom software for independent businesses. '
           'Based in New York City; website work is available across the United States. New York on-site help is subject to confirmed availability. '
           'Tech support for small businesses covers Mac and Windows computers, iPhone and iPad, Microsoft 365 and business email, Wi-Fi, printers, account ownership and backups. '
           'A free first look comes before any paid work, with a written scope before anything starts. '
           'A person answers 9am–9pm Eastern at +1 646-360-0318 or hello@littlefightnyc.com.\n\n')
    start=('## Start here\n\n'+'\n'.join(line(p) for p in ['/','/how-we-help/','/reviews/','/contact/'] if p in pages)+'\n\n')
    sections=group('Services','/services/')+group('Industries','/industries/')+group('Work','/case-studies/')+group('Tech support answers','/answers/help/',support)+group('Website, consulting and software answers','/answers/help/',lambda p: not support(p))+group('New York neighborhoods','/areas/')
    tail=('## Policies\n\n- [Privacy and written scope]('+ORIGIN+'/legal/)\n\n'
          +('Information is page-specific. Search rankings, AI recommendations and business outcomes are not guaranteed.\n' if PRODUCTION else 'This host is a noindex review preview. The canonical business website is '+ORIGIN+'.\n'))
    return intro+start+sections+tail
write('llms.txt', llms_text())
write('404.html',head({'path':'/404/','title':'Page Not Found | Little Fight NYC','description':'Find your way back to Little Fight NYC.'})+'<body class="page-home"><div class="workbench-page" data-reader-family="brand">'+workbench_header(family='brand', contacts=channels())+'<main class="lf-reader"><section class="story-hero"><div><p class="story-kicker">This page isn’t here.</p><h1 class="story-title">Let’s get you to the right place.</h1>'+link('Explore Little Fight','/','button')+'</div></section></main></div>'+shell_end())

# One design system. Retired prototype themes never enter the release cascade.
css_files = load('import-provenance.json')['activeCssOrder']
from tile_stylesheets import write_stylesheets
write_stylesheets(APP, UI, css_files, ['site-boot.css'] + (['clay-library.css'] if CLAY_LIBRARY else []), write)
shutil.copy2(UI/'vendor/sculpture-static.css', OUT/'sculpture-static.css')
# Ship the hand-written browser scripts minified; the readable sources stay in preview-ui.
script_sources = {name: UI/'vendor'/name for name in ['tile-motion.js', 'mosaic-layout.js']}
script_sources.update({name: UI/name for name in ['site.js', 'site-boot.js', 'search-relevance.js', 'tile-effects.js', 'website-story.js', 'clay-icons.js']})
for name, source in script_sources.items():
    write(name, subprocess.run([str(APP/'node_modules/.bin/esbuild'), '--loader=js', '--minify', '--target=es2020'],
                               input=source.read_text(), text=True, capture_output=True, check=True).stdout)
shutil.copy2(CONTENT/'search-aliases.json',OUT/'search-aliases.json')
if (UI/'assets').exists():shutil.copytree(UI/'assets',OUT/'assets',dirs_exist_ok=True)
copy_clay_library(OUT)
if 'data-hero="clay-neighborhood"' in home:
    from clay_hero import copy_assets
    copy_assets(APP/'public', OUT)
for relative in RETIRED_PUBLISHED_ASSETS:
    target = OUT / relative
    if target.is_file():
        target.unlink()
for relative in RETIRED_PUBLISHED_DIRECTORIES:
    target = OUT / relative
    if target.is_dir():
        shutil.rmtree(target)
# Vite copies public/_redirects before this compiler runs. Keep the protected
# source record locally, but do not publish a redirect to an omitted directory.
redirects = OUT / '_redirects'
if redirects.is_file():
    lines = redirects.read_text().splitlines()
    redirects.write_text('\n'.join(line for line in lines if not line.lstrip().startswith('/brand-kit')) + '\n')
total_tiles=Links();total_tiles.feed(home)
missing=[t['href'] for t in total_tiles.tiles if t.get('href','').startswith('/') and urlsplit(t['href']).path not in pages]
if missing:raise RuntimeError('Missing tile routes: '+str(missing))
def embed_mosaic_layouts():
    """Embed the prebuilt homepage layouts while they still describe this page.

    scripts/generate-mosaic-layouts.cjs records the mosaic engine's output for
    every width. If the canvas markup, home.css or the engine changed since,
    the signature differs and the live engine lays out the page instead.
    """
    source = CONTENT/'mosaic-layouts.json'
    if not source.is_file():
        return 'absent'
    data = json.loads(source.read_text())
    page = OUT/'index.html'
    html = page.read_text()
    start = html.index('<main class="topic-canvas"'); end = html.index('</main>', start)
    signature = hashlib.sha256(html[start:end].encode() + b'\0' + (OUT/'home.css').read_bytes() + b'\0'
                               + (UI/'vendor/mosaic-layout.js').read_text().split("  let layoutKey = '';")[0].encode()).hexdigest()
    if data.get('signature') != signature:
        print('NOTE: prebuilt mosaic layouts are out of date; the live engine will lay out the homepage. '
              'Regenerate after the build with: node scripts/generate-mosaic-layouts.cjs', file=sys.stderr)
        return 'stale'
    # One small file per engine, fetched in parallel with the page; only the
    # tile canvas (below the hero) waits for it. The signature in the name
    # makes each file immutable.
    version = signature[:12]
    shared = {key: data[key] for key in ('schema', 'selector', 'keys', 'elements', 'rootFontSize', 'scrollbar', 'touched', 'values')}
    for engine, table in data['engines'].items():
        used = sorted({state for _, _, state in table['ranges']})
        index = {state: position for position, state in enumerate(used)}
        payload = {**shared, 'engine': engine, 'states': [data['states'][state] for state in used],
                   'spill': [data['spill'][state] for state in used],
                   'ranges': [[low, high, index[state]] for low, high, state in table['ranges']]}
        write(f'mosaic/{engine}.{version}.json', json.dumps(payload, separators=(',', ':')))
    page.write_text(html.replace('</head>', f'<meta name="lf-mosaic-layouts" content="/mosaic/{{engine}}.{version}.json"></head>', 1))
    return 'published'
mosaic_layouts = embed_mosaic_layouts()
print('Prebuilt mosaic layouts: ' + mosaic_layouts)
digest=hashlib.sha256()
files=sorted(p for p in OUT.rglob('*') if p.is_file() and p.name not in ('preview-release.json','tile-release.json','release.json'))
for p in files:digest.update(str(p.relative_to(OUT)).encode()+b'\0'+p.read_bytes())
release={'kind':'static-production-candidate' if PRODUCTION else 'design-review-preview','artifactSha256':digest.hexdigest(),'routes':len(pages),'tiles':len(total_tiles.tiles),'totalTileInventory':homepage_inventory['totalTileInventory'],'consolidatedGroups':len(home_groups),'originalTilesPreserved':106,'reviews':7,'analyticsDelivery':PRODUCTION,'formDelivery':'native Netlify Forms' if PRODUCTION else 'editable email draft or explicit link to existing secure contact form','sourceBase':'05d6f5a425bffb548213545131a89f9c53e5a297','productionChanged':False}
write('tile-release.json' if PRODUCTION else 'preview-release.json',json.dumps(release,indent=2)+'\n')
write_social_plan()
print(json.dumps(release,indent=2))
