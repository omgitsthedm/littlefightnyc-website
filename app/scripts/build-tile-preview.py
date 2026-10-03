"""Compile the approved mosaic into a static, independently reviewable website.

No framework boot, external data, form submissions, or analytics transport.
Every tile opens the same HTML that a direct visitor and crawler receive.
"""
from pathlib import Path
from html import escape, unescape
from html.parser import HTMLParser
from urllib.parse import urlsplit
import hashlib
import json
import re
import shutil
import subprocess
import sys
from tile_content import render_legacy_sections
from case_studies import render_case, render_work
from topic_mosaic import build_topic_mosaic, plus_navigation
from reader_visuals import reader_visual, reader_family

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
STANDALONE = ('/vera/', '/examples/audit/', '/examples/lab/', '/brand-kit/', '/ads/', '/myspace-demo/')
ISLANDS = {'/tech-audit/':'tech-audit', '/contact/':'contact', '/thanks/':'thanks', '/website-check/':'website-check'}

def indexable(path):
    if path in ['/thanks/','/404/'] or path.startswith(('/markets/','/photos/','/areas/','/answers/help/','/_readers/')):return False
    old = OLD_META.get(path)
    if old:return not old.get('noindex',False) and old.get('canonical',path) in [path,ORIGIN+path]
    return path=='/' or path in ['/reviews/','/websites-for-your-business/'] or path.startswith('/industries/')

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
    target.write_text(plus_navigation(value) if path.endswith('.html') else value)

cases = {c['slug']:c for c in load('cases.json')}
case_visuals = load('case-visuals.json')['cases']
case_headlines = load('case-headlines.json')
albums = load('albums.json')
labs = load('labs.json')
lab_by_path = {'/examples/lab/concepts/'+x['slug']+'/':x for x in labs}
LAB_IMAGES={'pool-room':'pool-room','walkup-3d':'brownstone-walkup','terminal-3d':'cinematic-3d','pill-scroll':'scroll-motion','micro-animations':'micro-animations','aha-laser':'aha-laser','studio-engine':'studio-engine','growth-street':'growth-street','goliath':'goliath'}
for name in LAB_IMAGES.values():
    for width in [480,800]:
        source=APP/'public/images/lab-showcase'/f'{name}-{width}.webp'
        if source.is_file():
            target=OUT/'images/lab-showcase'/source.name
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copy2(source,target)
reviews = load('reviews.json')
summaries = load('reader-summaries.json')
authored = {p['path']:p for p in load('pages.json')}
pages = {}
for filename in ['live-pages.json','answer-pages.json','market-pages.json']:
    for p in load(filename): pages[p['path']] = p
for p in load('pages.json'): pages[p['path']] = p
topic_tiles = load('topic-tiles.json')
for tile in topic_tiles:
    path = '/answers/help/'+tile['id']+'/'
    description = tile['summary'] if len(tile['summary']) <= 157 else tile['summary'][:157].rsplit(' ', 1)[0]+'…'
    pages[path] = {'path': path, 'id': tile['id'], 'category': tile['family'], 'family': tile['family'], 'icon': tile['icon'], 'title': tile['title']+' | Little Fight NYC', 'heading': tile['title'], 'summary': tile['summary'], 'description': description, 'eyebrow': {'consulting': 'Consulting', 'software': 'Custom software'}[tile['family']], 'sections': tile['sections'] + [{'heading': 'What to bring', 'bullets': tile['steps']}]}

proof_slugs = ['chromatic-painting-design','hair-by-rachel-charles','cc-films']
def picture(slug, eager=False):
    c = cases[slug]
    img = '/' + c['image'].lstrip('/')
    srcset = ''
    if slug in proof_slugs:
        img = f'/assets/proof/optimized/case-{slug}-640.webp'
        srcset = f' srcset="{img} 640w, /assets/proof/optimized/case-{slug}-960.webp 960w" sizes="(max-width:760px) calc(100vw - 48px), 460px"'
    return f'<img src="{img}"{srcset} width="{c.get("imageWidth",1440)}" height="{c.get("imageHeight",1000)}" alt="{E(display(c.get("imageAlt",c["name"])))}" loading="{"eager" if eager else "lazy"}" decoding="async"'+(' fetchpriority="high"' if eager else '')+'>'

def proof_grid(slugs=proof_slugs):
    return '<div class="proof-grid">'+''.join(f'<a class="proof-card" data-reader-link href="/case-studies/{s}/">{picture(s)}<span>{E(display(cases[s]["name"]))}<small>{E(cases[s].get("statusLabel","Work"))}</small></span></a>' for s in slugs if s in cases)+'</div>'

def review_cards():
    rows=[]
    for r in reviews['reviews']:
        quote = f'<blockquote>“{E(r["excerpt"])}”</blockquote>' if r['excerpt'] else '<p>Five-star rating</p>'
        rows.append(f'<article class="review-card"><span class="review-stars" aria-label="5 out of 5 stars">★★★★★</span>{quote}<div><cite>{E(r["displayName"])}</cite><br>{link("Read on Google ↗",r["sourceUrl"])}</div></article>')
    return '<div class="review-grid">'+''.join(rows)+'</div>'

def contact(path, prompt='Tell us what you need help with.'):
    family=reader_family(pages.get(path,{'path':path}))
    intent={'web':'website','it':'support','consulting':'consulting','software':'systems'}.get(family,'general')
    if path.startswith(('/industries/','/markets/')) or path in ('/nationwide/','/websites-for-your-business/'):intent='website'
    return f'''<section class="story-contact" id="contact"><div><h2>Talk to Little Fight.</h2><p>Tell us what you need help with.</p><nav class="contact-actions" aria-label="Contact Little Fight NYC">{channels()}</nav><p class="contact-hours">9am–9pm Eastern.<br>After hours, leave a message.</p></div><div class="story-contact-start"><h3>Prefer to write it down?</h3><p>Share a little about your business and what you want to change.</p>{link('Send us a message +', f'/tech-audit/?intent={intent}', 'contact-plan')}</div></section>'''

def channels():
    return '<a href="tel:+16463600318">Call</a><a href="sms:+16463600318">Text</a><a href="mailto:hello@littlefightnyc.com">Email</a>'

def sections_html(sections):
    html=[]
    for i,s in enumerate(sections):
        body=''.join(f'<p>{E(display(p))}</p>' for p in s.get('paragraphs',[]))
        if s.get('bullets'): body+='<ul>'+''.join(f'<li>{E(display(b))}</li>' for b in s['bullets'])+'</ul>'
        if s.get('links'):body+='<nav class="story-related">'+''.join(link(l.get('label',l.get('text','Learn more')),l['href']) for l in s['links'])+'</nav>'
        html.append(f'<section class="story-section" id="{E(s.get("id",f"section-{i}"))}"><h2>{E(display(s.get("heading","The details")))}</h2><div>{body}</div></section>')
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
        source = path + '?embed=1'
        label = q['heading'] + ' working demo'
        modifier = ''
        demo_id = lab_by_path[path]['slug']
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
    instruction = first_sentence(notes[0]) if notes else 'Use the controls inside the working Lab above.'
    features = ', '.join(lab.get('features', []))
    return f'''<section class="story-section reader-demo-notes"><h2>Try the controls.</h2><div><p>{E(instruction)}</p><p>The working version is above, so you can test the interaction before reading the project notes. Its built-in controls are the intended way to move through the study.</p>{f'<p>Inside this Lab: {E(features)}.</p>' if features else ''}<p><a href="#working-demo">Back to the demo +</a></p></div></section>'''

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
        q['sections']=[{'heading':'A useful starting point','paragraphs':[x for x in [m.get('introductionDetail'),m.get('availability')] if x],'links':[{'label':'Websites, built nationwide','href':'/services/custom-local-websites/'}]}]
        topics=m.get('topics',[])
        if topics:
            q['sections'] += [{'heading':t.get('question') or t.get('outcome','Your next step'),'paragraphs':[t.get('answer','')],'bullets':t.get('checklist',[]),'links':[{'label':'Read the full answer','href':'/markets/'+m.get('id',p.get('marketId',''))+'/'+t['id']+'/'}] if '/markets/'+m.get('id',p.get('marketId',''))+'/'+t['id']+'/' in pages else []} for t in topics]
        elif m.get('steps'):
            q['sections'] += [{'heading':s['title'],'paragraphs':[s['body']]} for s in m['steps']]
        q['faqs']=m.get('faqs',[])
    slug=p['path'].strip('/').split('/')[-1]
    if p['path'].startswith('/case-studies/') and slug in cases:
        c=cases[slug];q.update(heading=display(c['name']),eyebrow=c['type'],summary=c['summary'],heroSlugs=[] if 'pending' in c['type'].lower() else [slug])
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
    case_slug=path.strip('/').split('/')[-1]
    if (path.startswith('/case-studies/') and case_slug in cases) or path=='/examples/':
        if path=='/examples/':
            q.update(heading='Made for their world.', title='Website Work, Products & Labs | Little Fight NYC', description='Explore real websites for independent businesses, Little Fight products and working Labs. See the project story and try the live work.')
            body=render_work(p,cases,case_visuals,labs,LAB_IMAGES,link)
        else:
            q.update(heading=display(cases[case_slug]['name']))
            body=render_case(cases[case_slug],p,cases,case_visuals,link,case_headlines.get(case_slug,{}))
        body+=contact(path,'Your business has its own story. Let’s build a website that feels like it.')
        body+='<nav class="story-bottom" aria-label="Keep exploring">'+link('Explore all the tiles','/')+link('Websites','/services/custom-local-websites/')+link('Our work','/examples/')+link('Google reviews','/reviews/')+link('Privacy','/legal/')+'</nav>'
        return q,body
    slugs=[s for s in q.get('heroSlugs',proof_slugs if path.startswith('/industries/') or path in ['/services/custom-local-websites/','/nationwide/'] else []) if s in cases and cases[s].get('image')]
    art=''.join(f'<figure>{picture(s,i==0)}<figcaption>{E(display(cases[s]["name"]))}</figcaption></figure>' for i,s in enumerate(slugs) if s in cases)
    if path.startswith('/photos/'):
        album=next((a for a in albums if path=='/photos/'+a['id'].removeprefix('album-')+'/'),None)
        if album:
            photo=album['photos'][0]
            art=f'<figure><img src="{E(photo["localUrl"])}" width="{photo["width"]}" height="{photo["height"]}" alt="{E(photo["title"])}" fetchpriority="high"><figcaption>{E(photo["photographer"])}</figcaption></figure>'
    if path in lab_by_path:
        lab=lab_by_path[path]
        candidate='/images/lab-showcase/'+LAB_IMAGES[lab['slug']]+'-800.webp'
        if candidate:art=f'<figure><img src="{E(candidate)}" width="1440" height="900" alt="{E(lab["name"])} — original Lab artwork" loading="eager"><figcaption>{E(lab["disclaimer"])}</figcaption></figure>'
    if path=='/vera/':
        # This visual belongs only to VERA's agency reader. The working app,
        # its records and its existing brand assets remain untouched.
        art='<div class="reader-context-visual" data-reader-family="brand"><img class="reader-context-icon" src="/assets/mineral/book-open-text-duotone.svg" width="64" height="64" alt=""><figure class="reader-context-figure"><img class="reader-context-image" src="/vera/assets/icons/vera-icon-512.png" width="512" height="512" alt="VERA’s original cream and green geometric mark" loading="eager"><figcaption><a href="#working-demo">VERA: explore NYC rentals and inspect the linked public records.</a></figcaption></figure></div>'
    if not art: art=reader_visual(p,q,cases,albums)
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
        if external:primary_action='<a href="'+E(external[0])+'" target="_blank" rel="noopener noreferrer">Visit the live website ↗</a>'
    hero=f'<header class="story-hero"><div><p class="story-kicker">{E(q["eyebrow"])}</p><h1 class="story-title" id="detail-title" tabindex="-1">{E(q["heading"])}</h1><p class="story-summary">{E(q["summary"])}</p><nav class="contact-actions" aria-label="Your next step">{primary_action}</nav></div><div class="story-art">{art}</div></header>'
    immersive = path == '/vera/'
    if immersive:
        # VERA opens as the working workspace. The complete agency context is
        # immediately below it in a calm disclosure, never discarded.
        body = demo + '<details class="reader-demo-context"><summary>About VERA +</summary><div class="reader-demo-context-body">' + hero
    else:
        body = hero + demo
    if demo and not immersive:
        # The working experience follows the answer immediately. Its notes and
        # source-backed explanation remain below, in the same reader.
        if path in lab_by_path:
            body += lab_controls_section(lab_by_path[path])
    if path=='/services/custom-local-websites/':
        body+=(CONTENT/'website-body.html').read_text()
    elif p.get('contentBlocks') and path not in authored and path not in lab_by_path:
        body+=render_legacy_sections(p,display,link)
    else:
        body+=sections_html(q['sections'])
    if q.get('sourceDepth'):
        body+=render_legacy_sections(q['sourceDepth'],display,link)
    if path=='/industries/':
        body+=sections_html([{'heading': 'Start with your customer’s next question.', 'paragraphs': ['Someone choosing a roofer needs to see the work, the area served, and how to ask about a repair. Someone choosing a salon needs to understand the services, see the stylist’s work, and find the booking step. A law firm needs to explain its practice clearly and make an inquiry straightforward.', 'We plan the pages around those decisions. That includes your own photography and work, the questions people ask before contacting you, and a clear way to reach your business.']}, {'heading': 'Build around the work you want.', 'paragraphs': ['Tell us which services you want more inquiries for, where you work, and what a good customer fit looks like. We use that to choose the content and contact path, then check that visitors can use them on a phone.', 'You do not need a complete brief to start. Bring your current website or a few examples of your work, and we can talk through the right scope.']}])
    if path in ['/services/custom-local-websites/','/nationwide/','/examples/','/industries/','/websites-for-your-business/']:
        body+='<section class="story-section"><h2>Built for your kind of business.</h2><div><p>Start with the work you do. Find the questions your customers need answered.</p><nav class="industry-links">'+''.join(link(label,url) for label,url in INDUSTRIES)+'</nav></div></section>'
    if path.startswith('/industries/') or path=='/examples/':
        body+='<section class="story-proof"><p class="story-kicker">See the work</p><h2>Real businesses.<br>Distinct websites.</h2>'+proof_grid()+'</section>'
    if q['faqs']:
        body+='<section class="story-faq"><h2>Before we begin.</h2>'+''.join(f'<details><summary>{E(x["question"])}</summary><p>{E(display(x["answer"]))}</p></details>' for x in q['faqs'])+'</section>'
    if path in ['/services/custom-local-websites/','/reviews/']:
        body+='<section class="story-reviews"><p class="story-kicker">From our clients</p><h2>Good people.<br>Kind words.</h2><p>5.0 on Google · 7 reviews · checked October 2, 2026</p>'+review_cards()+'</section>'
    body+=q.get('extraHtml','')
    if path=='/legal/' and PRODUCTION:
        body+='<p><button type="button" data-production-open-consent>Review analytics choices</button></p>'
    body+=contact(path,q.get('contactPrompt') or 'Tell us what is getting in the way. We’ll give you a clear next step.')
    body+='<nav class="story-bottom" aria-label="Keep exploring">'+link('Explore all the tiles','/')+link('Websites','/services/custom-local-websites/')+link('Our work','/examples/')+link('Google reviews','/reviews/')+link('Privacy','/legal/')+'</nav>'
    if immersive:
        body += '</div></details>'
    if PRODUCTION and path in ISLANDS:
        # The full existing journey replaces only this island. The fallback
        # remains useful if scripts are unavailable and never claims delivery.
        fallback=f'<section class="story-hero"><div><h1 id="detail-title" class="story-title">{E(q["heading"])}</h1><p>{E(q["summary"])}</p><nav class="contact-actions">{channels()}</nav></div></section>'
        if path=='/contact/':
            fallback=body
        if path=='/tech-audit/':
            fallback+='''<form class="static-inquiry" name="tech-audit-scratch" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="tech-audit-scratch"><input type="hidden" name="intent" value="website"><input type="hidden" name="source" value="littlefightnyc.com/tech-audit"><p hidden><label>Leave this empty<input name="bot-field"></label></p><label>Your name<input name="name" autocomplete="name" required maxlength="150"></label><label>Business name<input name="business" autocomplete="organization" required maxlength="150"></label><label>Your email<input name="contact" type="email" autocomplete="email" required maxlength="250"></label><input type="hidden" name="follow_up" value="email"><label>What would you like to change?<textarea name="message" required maxlength="4000"></textarea></label><button type="submit">Send your inquiry ↗</button><p>Your message goes to Little Fight. <a href="/legal/">Privacy and terms</a>.</p></form>'''
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
pages['/thanks/']={'path':'/thanks/','title':'Your Next Step | Little Fight NYC','heading':'Thanks for reaching out.','summary':'If you just sent an inquiry, we’ll use the contact details you provided to reply. You can also call, text or email us.','description':'What happens after you contact Little Fight NYC.','sections':[]}
pages['/services/it-support/']={'path':'/services/it-support/','title':'New York Tech Support | Little Fight NYC','heading':'A little help with the everyday tech.','summary':'Computers, Wi-Fi, email and the tools you rely on. Tell us what stopped working so we can discuss the right kind of help.','description':'Practical technology help for New York residents and small businesses. Ask about future on-site availability.','sections':[{'heading':'New York visits, planned with you.','paragraphs':['We are currently prioritizing website projects nationwide. Ask about future New York on-site availability before planning a visit.','Share the issue and your neighborhood. We’ll confirm the scope, timing and available options directly. No appointment is implied by this page.']},{'heading':'Start with the interruption.','bullets':['A computer that will not cooperate.','Wi-Fi that does not reach the rooms you use.','An email account or device that needs attention.','A change of equipment without losing your files.']}]}

def head(q, home=False):
    title=E(q.get('title','Little Fight NYC')); desc=E(q.get('description','Custom websites for independent businesses nationwide.'));path=q['path']
    visual=case_visuals.get(path.strip('/').split('/')[-1],{}) if path.startswith('/case-studies/') else {}
    share=visual.get('social') or visual.get('desktop') or {}
    share_image=E(ORIGIN+share.get('src','/assets/social/og-tiles.jpg'))
    share_alt=E(share.get('alt','Little Fight NYC — custom websites for independent businesses'))
    graph=[{'@type':'Organization','@id':ORIGIN+'/#organization','name':'Little Fight NYC','url':ORIGIN+'/', 'telephone':'+16463600318','email':'hello@littlefightnyc.com','logo':ORIGIN+'/icon-512.png'}, {'@type':'WebSite','@id':ORIGIN+'/#website','name':'Little Fight NYC','url':ORIGIN+'/'},{'@type':'WebPage','@id':ORIGIN+path+'#webpage','url':ORIGIN+path,'name':q.get('title'),'description':q.get('description'),'isPartOf':{'@id':ORIGIN+'/#website'},'publisher':{'@id':ORIGIN+'/#organization'}}]
    if path.startswith('/industries/') or path=='/services/custom-local-websites/':graph.append({'@type':'Service','name':q.get('heading'),'serviceType':'Custom website design','url':ORIGIN+path,'areaServed':{'@type':'Country','name':'United States'},'provider':{'@id':ORIGIN+'/#organization'}})
    ld=json.dumps({'@context':'https://schema.org','@graph':graph},ensure_ascii=False).replace('<','\\u003c')
    robots = ('index, follow, max-image-preview:large' if indexable(path) else 'noindex, follow') if PRODUCTION else 'noindex, nofollow, noarchive'
    return f'''<!doctype html><html lang="{E(q.get('language','en'))}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>{title}</title><meta name="description" content="{desc}"><meta name="robots" content="{robots}"><meta name="theme-color" content="#030305"><link rel="canonical" href="{ORIGIN}{E(q.get("canonicalPath",path))}"><meta property="og:type" content="website"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{ORIGIN}{E(path)}"><meta property="og:site_name" content="Little Fight NYC"><meta property="og:image" content="{share_image}"><meta property="og:image:alt" content="{share_alt}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{share_image}"><meta name="twitter:image:alt" content="{share_alt}"><link rel="icon" href="/assets/boat-orange.svg" type="image/svg+xml"><link rel="preload" href="/assets/mineral/atkinson-hyperlegible-next-latin.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/site.css"><script type="application/ld+json">{ld}</script>{'<script defer src="/mosaic-layout.js"></script>' if home else ''}<script defer src="/tile-motion.js"></script>{'<script defer src="/tile-effects.js"></script>' if home else ''}<script defer src="/site.js"></script>{BRIDGE}</head>'''

def topbar(home=False):
    return '<header class="topbar"><a class="wordmark pill" href="/" aria-label="Little Fight NYC homepage"><img class="boat" src="/assets/boat-orange.svg" width="44" height="38" alt=""><span>little fight <span class="nyc">NYC</span></span></a><nav class="primary-nav" aria-label="Main navigation">'+link('Websites','/services/custom-local-websites/')+link('Our work','/examples/')+link('Let’s build +','/tech-audit/','start-button')+'</nav><button class="explore-toggle pill" id="explore-toggle" aria-controls="explore-menu" aria-haspopup="dialog" aria-expanded="false" aria-label="Explore the site"><span class="explore-label">Explore</span> <span aria-hidden="true">☰</span></button><button class="motion pill" id="motion-toggle" aria-pressed="false" aria-label="Turn motion off"><span class="motion-label">Motion</span> <span aria-hidden="true">◌</span></button></header>'

def site_footer():
    return '<footer class="site-footer"><nav class="utility-nav" aria-label="More Little Fight">'+''.join(link(label,url) for label,url in [('Answers','/library/'),('Your business','/websites-for-your-business/'),('Reviews','/reviews/'),('About','/about/')])+('<button class="privacy-control" type="button" data-production-open-consent>Privacy choices</button>' if PRODUCTION else link('Privacy choices','/legal/'))+'</nav></footer>'

def shell_end(home=False):
    privacy = site_footer()
    return ('' if home else privacy)+ '''<dialog id="explore-menu" aria-labelledby="explore-title"><div class="menu-panel"><button type="button" class="menu-close" aria-label="Close explore menu">×</button><h2 id="explore-title">What brings you here?</h2><label class="sr-only" for="preview-search">Search questions, services and work</label><input id="preview-search" type="search" autocomplete="off" placeholder="A website, Google, booking, a plumber…"><div id="search-results" aria-live="polite"></div><nav class="preview-filters" aria-label="Explore by service"><button data-filter="web">Websites</button><button data-filter="it">Tech support</button><button data-filter="software">Software</button><button data-filter="consulting">Consulting</button><button data-filter="all" aria-pressed="true">All tiles</button></nav><nav class="menu-links">'''+''.join(link(label,url) for label,url in [('Website design','/services/custom-local-websites/'),('For your business','/websites-for-your-business/'),('See our work','/examples/'),('Read our reviews','/reviews/'),('Ask us a question','/tech-audit/')])+'''</nav></div></dialog><dialog id="detail" aria-labelledby="detail-title"><button type="button" id="close-detail" aria-label="Return to homepage hub">×</button><section class="detail-window lf-reader reader-longform"><header class="detail-top"><button type="button" id="reader-back" aria-label="Back to previous card" hidden>Back</button><a class="reader-brand" href="/"><img src="/assets/boat-orange.svg" width="38" height="38" alt=""><span>little fight <small>NYC</small></span></a><nav class="contact-actions reader-rail" aria-label="Reader quick contact">'''+channels()+'''</nav></header><div id="detail-body" class="detail-body"></div><nav class="reader-navigation" aria-label="Reader navigation"><button type="button" id="reader-previous">Previous</button><button type="button" id="reader-hub">All tiles +</button><button type="button" id="reader-next">Next +</button></nav></section></dialog></body></html>'''

for path,p in pages.items():
    if path=='/':continue
    q,body=article(p)
    output_path='/_readers'+path if preserved(path) else path
    if preserved(path):q=dict(q,path=output_path,canonicalPath=path)
    rail='<nav class="direct-contact-rail contact-actions" aria-label="Quick contact">'+channels()+'</nav>'
    layout = ' data-reader-layout="immersive"' if path == '/vera/' else ''
    write(output_path+'index.html',head(q)+'<body class="page-home"><a class="skip-to-finder" href="#detail-title">Skip to content</a><nav class="reader-hub-return-nav" aria-label="Return to homepage hub"><a class="reader-hub-return" href="/" aria-label="Return to homepage hub">×</a></nav><div class="page-shell">'+topbar()+rail+f'<main class="lf-reader reader-longform" data-page-content data-content-id="{E(p.get("id") or path.strip("/"))}"{layout}>{body}</main></div>'+shell_end())

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
original=Links();original.feed(mosaic);assert len(original.tiles)==110
# The tile positions and identities remain intact. Public work now previews
# the actual project image, with labels beside it instead of over its text.
for tile in original.tiles:
    route=urlsplit(tile.get('href','')).path
    slug=route.strip('/').split('/')[-1]
    record=cases.get(slug) if route.startswith('/case-studies/') else lab_by_path.get(route)
    if not record or 'pending' in record.get('type','').lower():continue
    photo=('/assets/proof/optimized/tile-'+slug+'-480.webp') if record.get('image') else ('/images/lab-showcase/'+LAB_IMAGES[slug]+'-480.webp' if route in lab_by_path else '')
    if not photo:continue
    pattern=r'<a\b[^>]*href="'+re.escape(tile['href'])+r'"[^>]*>.*?</a>'
    found=re.search(pattern,mosaic,re.S)
    if not found:continue
    old=found.group(0);start=old[:old.index('>')+1].replace('class="','class="has-real-proof ',1)
    label='LABS' if route in lab_by_path else record.get('statusLabel','OUR WORK')
    front=f'<span class="proof-tile-face"><span class="proof-tile-label">{E(label)}</span><strong>{E(display(record["name"]))}</strong><img src="{E(photo)}" width="480" height="330" alt="" loading="lazy" decoding="async"><span class="proof-tile-plus" aria-hidden="true">+</span></span>'
    mosaic=mosaic.replace(old,start+front+'</a>',1)
if PRODUCTION:
    for tile in original.tiles:
        target=urlsplit(tile.get('href','')).path
        if preserved(target):mosaic=mosaic.replace('href="'+tile['href']+'"','href="'+tile['href']+'" data-reader-src="/_readers'+target+'"')
additions=[]
for identity,title,path,family,kicker in [('buyer-plumbers','Make plumbing easier to book.','/industries/plumbers/','web','WEBSITES FOR PLUMBERS'),('buyer-roofing','Show your roofing expertise.','/industries/roofing/','web','WEBSITES FOR ROOFERS'),('buyer-homes','Work worth showing.','/industries/luxury-home-services/','web','BUILDERS + HOME SERVICES'),('buyer-law','A clearer first impression.','/industries/law-firms/','web','WEBSITES FOR LAW FIRMS'),('google-reviews','Good people. Kind words.','/reviews/','brand','5.0 ON GOOGLE · 7 REVIEWS')]:
    additions.append(f'<a class="tile buyer-tile" href="{path}" data-answer="{identity}" data-family="{family}" data-material="soft-mineral" data-material-family="{family}" data-cell-face="mixed" data-cell-title="{E(title)}"><span class="cell-face"><span class="cell-kicker">{kicker}</span><span class="cell-title">{E(title)}</span><span class="buyer-plus" aria-hidden="true">+</span></span></a>')
mosaic=build_topic_mosaic(''.join(additions)+mosaic,reviews,topic_tiles,albums)
q={'path':'/','title':'Custom Websites for Independent Businesses | Little Fight NYC','description':'Custom websites for independent businesses nationwide. Explore the work, find a useful answer, and talk with a real person.'}
home=head(q,True)+'<body class="mosaic-home"><a class="skip-to-finder" href="#canvas">Skip to the tiles</a><div class="app-shell">'+topbar(True)+'<main class="topic-canvas" id="canvas" aria-label="Explore Little Fight NYC by topic">'+mosaic+'</main>'+site_footer()+'</div>'+shell_end(True)
write('index.html',home)
rows=[{'path':p,'title':normalize(x)['heading'],'description':normalize(x)['description'],'family':x.get('category','Websites' if p.startswith('/industries/') else 'Little Fight NYC')} for p,x in pages.items() if p!='/']
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
write('llms.txt','# Little Fight NYC\n\nCustom website design for independent businesses across the United States. New York on-site help is subject to confirmed availability.\n\n- [Websites]('+ORIGIN+'/services/custom-local-websites/)\n- [Work]('+ORIGIN+'/examples/)\n- [Reviews]('+ORIGIN+'/reviews/)\n- [Contact]('+ORIGIN+'/tech-audit/)\n- [Privacy and written scope]('+ORIGIN+'/legal/)\n\n'+('Information is page-specific. Search rankings, AI recommendations and business outcomes are not guaranteed.\n' if PRODUCTION else 'This host is a noindex review preview. The canonical business website is '+ORIGIN+'.\n'))
write('404.html',head({'path':'/404/','title':'Page Not Found | Little Fight NYC','description':'Find your way back to Little Fight NYC.'})+'<body class="page-home"><main class="lf-reader"><section class="story-hero"><div><p class="story-kicker">This page isn’t here.</p><h1 class="story-title">Let’s get you to the right place.</h1>'+link('Explore Little Fight','/','button')+'</div></section></main></body></html>')

# One design system. Retired prototype themes never enter the release cascade.
css_files = load('import-provenance.json')['activeCssOrder']
css='\n'.join((UI/name).read_text() for name in css_files)
minified_css=subprocess.run([str(APP/'node_modules/.bin/esbuild'), '--loader=css', '--minify'], input=css, text=True, capture_output=True, check=True).stdout
write('site.css',minified_css)
for name in ['tile-motion.js','mosaic-layout.js']:shutil.copy2(UI/'vendor'/name,OUT/name)
for name in ['site.js', 'tile-effects.js']:shutil.copy2(UI/name,OUT/name)
if (UI/'assets').exists():shutil.copytree(UI/'assets',OUT/'assets',dirs_exist_ok=True)
total_tiles=Links();total_tiles.feed(home)
missing=[t['href'] for t in total_tiles.tiles if t.get('href','').startswith('/') and urlsplit(t['href']).path not in pages]
if missing:raise RuntimeError('Missing tile routes: '+str(missing))
digest=hashlib.sha256()
files=sorted(p for p in OUT.rglob('*') if p.is_file() and p.name not in ('preview-release.json','tile-release.json','release.json'))
for p in files:digest.update(str(p.relative_to(OUT)).encode()+b'\0'+p.read_bytes())
release={'kind':'static-production-candidate' if PRODUCTION else 'design-review-preview','artifactSha256':digest.hexdigest(),'routes':len(pages),'tiles':len(total_tiles.tiles),'originalTilesPreserved':110,'reviews':7,'analyticsDelivery':PRODUCTION,'formDelivery':'native Netlify Forms' if PRODUCTION else 'editable email draft or explicit link to existing secure contact form','sourceBase':'05d6f5a425bffb548213545131a89f9c53e5a297','productionChanged':False}
write('tile-release.json' if PRODUCTION else 'preview-release.json',json.dumps(release,indent=2)+'\n')
print(json.dumps(release,indent=2))
