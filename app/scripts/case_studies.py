"""Image-led project stories built only from the approved public case catalog."""

from html import escape
from urllib.parse import quote, urlsplit, urlunsplit

def display(value):
    return str(value or '').replace('Hair By Rachel Charles', 'Hair By Rachel').replace('Hair by Rachel Charles', 'Hair By Rachel')


def text(value):
    return escape(display(value), quote=True)


def canonical_external_url(value):
    """Accept only a direct HTTPS website root, never a social or deep-link guess."""
    parsed = urlsplit(value or '')
    if parsed.scheme != 'https' or not parsed.hostname or parsed.hostname in ('littlefightnyc.com', 'www.littlefightnyc.com'):
        return ''
    return urlunsplit((parsed.scheme, parsed.netloc, '/', '', ''))


def public_url(case, page):
    """Only public catalog entries receive a direct, verified destination."""
    if case.get('publicType') not in ('Website design', 'Little Fight product'):
        return ''
    configured = canonical_external_url(case.get('publicUrl'))
    if configured:
        return configured
    name = str(case.get('name', '')).strip().casefold()
    for block in page.get('contentBlocks', []):
        for item in block.get('links', []):
            if str(item.get('text', '')).strip().casefold() == name:
                linked = canonical_external_url(item.get('href'))
                if linked:
                    return linked
    return ''


def paragraphs(values):
    return ''.join(f'<p>{text(value)}</p>' for value in values if value)


def asset_image(asset, *, eager=False, sizes='(max-width:760px) calc(100vw - 48px), 1080px'):
    srcset = ''
    if asset.get('srcset'):
        srcset = f' srcset="{text(asset["srcset"])}" sizes="{sizes}"'
    priority = ' fetchpriority="high"' if eager else ''
    return f'<img src="{text(asset["src"])}"{srcset} width="{asset["width"]}" height="{asset["height"]}" alt="{text(asset["alt"])}" loading="{"eager" if eager else "lazy"}" decoding="async"{priority}>'


def fallback_visual(case):
    if not case.get('image') or 'pending' in case['type'].lower():
        return None
    return {'src': '/' + case['image'].lstrip('/'), 'width': case.get('imageWidth', 1440),
            'height': case.get('imageHeight', 1000), 'alt': case.get('imageAlt', case['name'])}


def project_card(case, visuals, *, featured=False):
    visual = visuals.get(case['slug'], {}).get('desktop') or fallback_visual(case)
    media = asset_image(visual, sizes='(max-width:760px) calc(100vw - 48px), 600px') if visual else ''
    label=f'<p class="case-label">{text(case.get("publicType", "Selected work"))}</p>' if case.get("publicType") != "Website design" else ""
    return f'''<a class="work-project{' work-project--featured' if featured else ''}" href="/case-studies/{case['slug']}/" data-reader-link>
      <div class="work-project-image">{media}</div>
      <div class="work-project-copy">{label}<h3>{text(case['name'])}</h3><p>{text(case['summary'])}</p></div></a>'''


CLIENT_ORDER = ['easy-tiger', 'hair-by-rachel-charles', 'the-tarot-hotline', 'grand-funding-llc', 'the-break-room',
                'stephenie-powers', 'clearhelp', 'logan-loans', 'cc-films', 'chromatic-painting-design', 'hiraya-group']
MARKET_LABELS = {'/markets/arizona/phoenix/': 'More Phoenix-area work'}
PROOF_ICON = '/assets/mineral/{}.svg'


def proof_item(icon, label, body):
    return (f'<li><img class="case-proof-icon" src="{PROOF_ICON.format(icon)}" width="32" height="32" alt="" loading="lazy" decoding="async">'
            f'<div><h3>{text(label)}</h3>{body}</div></li>')


def render_proof(case, headline):
    """Dated, checkable evidence from the live client site; no client sales numbers."""
    proof = case.get('proof')
    if not proof:
        return ''
    shots = proof['captures']
    date = 'October 27, 2026' if proof['captureDate'] == '2026-10-27' else proof['captureDate']
    url = canonical_external_url(case.get('publicUrl'))
    figures = (f'<div class="case-proof-shots"><figure class="case-proof-desktop">{asset_image(shots["desktop"], sizes="(max-width:760px) calc(100vw - 48px), 760px")}'
               f'<figcaption>The site we shipped, on a desktop. Captured {text(date)}.</figcaption></figure>'
               f'<figure class="case-proof-phone">{asset_image(shots["phone"], sizes="(max-width:760px) 60vw, 240px")}'
               f'<figcaption>The same site on a phone.</figcaption></figure></div>')
    action = proof['action']
    items = [proof_item('calendar-check-duotone', 'The customer’s next step',
                        f'<p>{text(action["detail"])}</p><p><a class="case-text-link" href="{text(action["href"])}" target="_blank" rel="noopener noreferrer">{text(action["label"])} on the live site +</a></p>')]
    items.append(proof_item('check-square-duotone', 'Readable by Google and AI assistants',
                            f'<p>Each page carries structured data, the labels search engines and AI assistants read to learn what the business is and how to reach it. The homepage has {text(proof["schema"])}. It parsed without errors when we checked it on {text(date)}.</p>'))
    lh = proof.get('lighthouse')
    if lh:
        check = 'https://pagespeed.web.dev/analysis?url=' + quote(lh['url'], safe='') + '&form_factor=mobile'
        scores = ''.join(f'<div><dt>{label}</dt><dd>{lh[key]}</dd></div>' for label, key in
                         [('Speed', 'performance'), ('Accessibility', 'accessibility'), ('Best practices', 'bestPractices'), ('Search basics', 'seo')])
        items.append(proof_item('device-mobile-duotone', 'Fast and usable on a phone',
                                f'<p>Google Lighthouse checks how quickly a page loads on a phone and whether everyone can use it. Our mobile run of the homepage on {text(date)}, out of 100:</p>'
                                f'<dl class="case-proof-scores">{scores}</dl>'
                                f'<p class="case-proof-note">A one-day lab test of page quality, not a sales result. Scores move a few points between runs. '
                                f'<a href="{text(check)}" target="_blank" rel="noopener noreferrer">Run it yourself on PageSpeed Insights</a>.</p>'))
    for extra in proof.get('extra', []):
        items.append(proof_item(extra['icon'], extra['label'], f'<p>{text(extra["text"])}</p>'))
    visit = f'<p><a class="case-text-link" href="{text(url)}" target="_blank" rel="noopener noreferrer">Visit the live website +</a></p>' if url else ''
    market = case.get('marketPath')
    market_link = f'<p><a class="case-text-link" href="{text(market)}" data-reader-link>{text(MARKET_LABELS.get(market, "More work near you"))} +</a></p>' if market else ''
    return (f'<section class="case-chapter case-proof" id="case-proof" aria-labelledby="case-proof-title"><div class="case-chapter-heading"><h2 id="case-proof-title">{headline("proof", "Check it yourself.")}</h2></div>'
            f'<div class="case-chapter-copy"><p>Everything here comes from the live website, as customers see it today.</p>{figures}<ul class="case-proof-list">{"".join(items)}</ul>{visit}{market_link}</div></section>')


def render_case(case, page, cases, visuals, link, headlines=None):
    headlines = headlines or {}
    def headline(key, fallback):
        return text(headlines.get(key, fallback)).replace('\n', '<br>')
    visual = visuals.get(case['slug'], {})
    desktop = visual.get('desktop') or fallback_visual(case)
    mobile = visual.get('mobile')
    url = public_url(case, page)
    action = f'<a class="case-primary" href="{text(url)}" target="_blank" rel="noopener noreferrer">Visit the live {"product" if case.get("publicType") == "Little Fight product" else "website"} +</a>' if url else ''
    scope = ''.join(f'<span>{text(item)}</span>' for item in case.get('scope', []))
    location = case.get('location', '')
    location_html = f'<div><dt>Based in</dt><dd>{text(location)}</dd></div>' if location and location != 'Not published' else ''
    result = f'''<div class="case-story" data-case="{text(case['slug'])}"><div class="case-workbench-layout">
      <header class="case-opening"><a class="case-back" href="/examples/" data-reader-link>All work</a><p class="case-label">{text(case.get('publicType', 'Selected work'))}</p>
      <h1 id="detail-title" tabindex="-1">{text(case['name'])}</h1><div class="case-opening-bottom"><div><p class="case-deck">{text(case['summary'])}</p><nav class="case-actions" aria-label="Explore this project">{action}</nav></div>
      <dl class="case-facts">{location_html}<div><dt>Our part</dt><dd class="case-scope">{scope}</dd></div></dl></div></header><div class="case-reading-column">'''
    stage = ''
    if desktop:
        mobile_html = f'<figure class="case-stage-phone">{asset_image(mobile)}<figcaption>Phone view</figcaption></figure>' if mobile else ''
        caption = visual.get('caption') or ('Published project artwork.' if not url else 'The actual website, designed and built by Little Fight NYC.')
        stage = f'<section class="case-stage{" case-stage--paired" if mobile else ""}" aria-label="Project screens"><figure class="case-stage-desktop">{asset_image(desktop, eager=True)}<figcaption>{text(caption)}</figcaption></figure>{mobile_html}</section>'
    result += f'''<section class="case-chapter" id="case-brief"><div class="case-chapter-heading"><h2>{headline('question','What needed to work better.')}</h2></div><div class="case-chapter-copy">{paragraphs(case.get('challenge', []))}</div></section>
      {stage}<section class="case-chapter case-chapter--approach"><div class="case-chapter-heading"><h2>{headline('approach','Built around the real task.')}</h2></div><div class="case-chapter-copy">{paragraphs(case.get('narrative') or case.get('approach', []))}<ul class="case-decisions">{''.join(f'<li>{text(item)}</li>' for item in case.get('approach', []))}</ul></div></section>'''
    if mobile:
        result += f'''<section class="case-mobile-story"><div><h2>{headline('mobile','The details come with you.')}</h2><p>{text(case.get('delivered', [case['summary']])[0])}</p><a class="case-text-link" href="{text(url)}" target="_blank" rel="noopener noreferrer">Explore it yourself +</a></div><figure><a class="case-mobile-capture" href="{text(mobile['src'])}" target="_blank" rel="noopener noreferrer" aria-label="View the full phone capture of {text(case['name'])}">{asset_image(mobile)}</a><figcaption>Actual mobile view · {text(case['name'])}</figcaption></figure></section>'''
    result += f'''<section class="case-chapter case-chapter--result"><div class="case-chapter-heading"><h2>{headline('handoff','What’s there today.')}</h2></div><div class="case-chapter-copy">{paragraphs(case.get('outcome', []))}<ul class="case-delivered">{''.join(f'<li>{text(item)}</li>' for item in case.get('delivered', []))}</ul></div></section>'''
    result += render_proof(case, headline)
    client_order=CLIENT_ORDER
    offset=(client_order.index(case['slug'])+1) if case['slug'] in client_order else 0
    ordered=client_order[offset:]+client_order[:offset]
    recommended=[slug for slug in ordered if slug!=case['slug'] and slug in cases][:2]
    result += '<section class="case-next" aria-label="More client work"><div class="work-grid">' + ''.join(project_card(cases[slug], visuals) for slug in recommended) + '</div></section></div></div></div>'
    return result


def render_work(page, cases, visuals, labs, lab_images, link):
    selected = CLIENT_ORDER
    products = [case for case in cases.values() if case.get('publicType') == 'Little Fight product']
    concepts = [case for case in cases.values() if case['slug'] not in selected and case not in products and case.get('publicType') == 'Design concept']
    result = '''<div class="work-collection"><header class="case-opening work-opening"><h1 id="detail-title" tabindex="-1">Our work.</h1><div class="case-opening-bottom"><nav class="work-jump" aria-label="Explore our work"><a href="#client-work">Client websites +</a><a href="#our-products">Our products +</a><a href="#design-concepts">Design concepts +</a><a href="#working-labs">Working Labs +</a></nav></div></header>
      <section class="work-section" id="client-work"><div class="case-section-heading"><div><h2>Client<br>websites.</h2></div></div><div class="work-grid">'''
    result += ''.join(project_card(cases[slug], visuals, featured=False) for index, slug in enumerate(selected) if slug in cases)
    result += '</div></section><section class="work-section" id="our-products"><div class="case-section-heading"><div><h2>Our<br>products.</h2></div></div><div class="work-grid">'
    result += ''.join(project_card(case, visuals) for case in products)
    result += '</div><a class="work-vera" href="/vera/" data-reader-link><div><h3>VERA</h3><p>Explore NYC rentals, compare listings, and inspect the public records behind them.</p></div><span aria-hidden="true">+</span></a></section>'
    result += '<section class="work-section" id="working-labs"><div class="case-section-heading"><div><h2>Working<br>Labs.</h2></div></div><div class="work-labs">'
    for lab in labs:
        slug = lab['slug']
        image = lab.get('tileImage') or f'/images/lab-showcase/{lab_images.get(slug, slug)}-480.webp'
        width = int(lab.get('tileImageWidth') or 480)
        height = int(lab.get('tileImageHeight') or 300)
        alt = lab.get('tileImageAlt') or f'{lab["name"]} — Lab artwork'
        share_path = lab.get('sharePath') or f'/labs/{slug}/'
        result += f'<a class="work-lab" href="{text(share_path)}" data-reader-link><img src="{text(image)}" width="{width}" height="{height}" alt="{text(alt)}" loading="lazy" decoding="async"><div><h3>{text(lab["name"])}</h3><span aria-hidden="true">+</span></div></a>'
    result += '</div></section><section class="work-section work-other" id="design-concepts"><div class="case-section-heading"><div><h2>Design<br>concepts.</h2></div><p>Independent design studies, not client launches.</p></div><div class="work-records">'
    for case in concepts:
        result += f'<a href="/case-studies/{case["slug"]}/" data-reader-link><span><strong>{text(case["name"])}</strong><small>{text(case.get("publicType", "Design concept"))}</small></span><span aria-hidden="true">+</span></a>'
    return result + '</div></section></div>'
