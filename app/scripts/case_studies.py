"""Image-led project stories built only from the approved public case catalog."""

from html import escape
from urllib.parse import urlsplit

from tile_content import render_legacy_sections


def display(value):
    return str(value or '').replace('Hair By Rachel Charles', 'Hair By Rachel').replace('Hair by Rachel Charles', 'Hair By Rachel')


def text(value):
    return escape(display(value), quote=True)


def public_url(case, page):
    """Private concepts never inherit an external launch button."""
    status = case['type'].lower()
    if 'public work, live' not in status and 'live storefront' not in status and 'public open beta' not in status:
        return ''
    for block in page.get('contentBlocks', []):
        for item in block.get('links', []):
            href = item.get('href', '')
            parsed = urlsplit(href)
            if parsed.scheme == 'https' and parsed.hostname not in ('littlefightnyc.com', 'www.littlefightnyc.com'):
                return href
    # The approved catalog names this public beta; its imported page has no anchor.
    if case['slug'] == 'venuecircuit' and 'venuecircuit.app' in ' '.join(case.get('outcome', [])):
        return 'https://venuecircuit.app/'
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
    return f'''<a class="work-project{' work-project--featured' if featured else ''}" href="/case-studies/{case['slug']}/" data-reader-link>
      <div class="work-project-image">{media}<span class="work-project-open" aria-hidden="true">↗</span></div>
      <div class="work-project-copy"><p class="case-label">{text(case.get('scope', ['Selected work'])[0])}</p><h3>{text(case['name'])}</h3><p>{text(case['summary'])}</p><span class="case-inline-link">Explore the project <span aria-hidden="true">↗</span></span></div></a>'''


def project_notes(page, link, label='Project notes and walkthrough'):
    if not page.get('contentBlocks'):
        return ''
    # Retain the complete approved source, including deep walkthrough links,
    # without making a visitor read the prior site's navigation as the story.
    return f'<details class="case-notes"><summary>{text(label)}<span aria-hidden="true">+</span></summary><div class="case-notes-body">{render_legacy_sections(page, display, link)}</div></details>'


def render_case(case, page, cases, visuals, link, headlines=None):
    headlines = headlines or {}
    def headline(key, fallback):
        return text(headlines.get(key, fallback)).replace('\n', '<br>')
    visual = visuals.get(case['slug'], {})
    desktop = visual.get('desktop') or fallback_visual(case)
    mobile = visual.get('mobile')
    url = public_url(case, page)
    action = f'<a class="case-primary" href="{text(url)}" target="_blank" rel="noopener noreferrer">Visit the live {"product" if "product" in case["type"].lower() else "website"} <span aria-hidden="true">↗</span></a>' if url else ''
    scope = ''.join(f'<span>{text(item)}</span>' for item in case.get('scope', []))
    location = case.get('location', '')
    location_html = f'<div><dt>Based in</dt><dd>{text(location)}</dd></div>' if location and location != 'Not published' else ''
    result = f'''<div class="case-story" data-case="{text(case['slug'])}">
      <header class="case-opening"><a class="case-back" href="/examples/" data-reader-link><span aria-hidden="true">←</span> All work</a><p class="case-label">{text(case['type'])}</p>
      <h1 id="detail-title" tabindex="-1">{text(case['name'])}</h1><div class="case-opening-bottom"><div><p class="case-deck">{text(case['summary'])}</p><nav class="case-actions" aria-label="Explore this project">{action}<a class="case-text-link" href="#case-brief">The story <span aria-hidden="true">↓</span></a></nav></div>
      <dl class="case-facts">{location_html}<div><dt>Our part</dt><dd class="case-scope">{scope}</dd></div></dl></div></header>'''
    if desktop:
        mobile_html = f'<figure class="case-stage-phone">{asset_image(mobile)}<figcaption>Phone view</figcaption></figure>' if mobile else ''
        caption = visual.get('caption') or ('Published project artwork.' if not url else 'The actual website, designed and built by Little Fight NYC.')
        result += f'<section class="case-stage{" case-stage--paired" if mobile else ""}" aria-label="Project screens"><figure class="case-stage-desktop">{asset_image(desktop, eager=True)}<figcaption>{text(caption)}</figcaption></figure>{mobile_html}</section>'
    result += f'''<section class="case-chapter" id="case-brief"><div class="case-chapter-heading"><p class="case-label">01 / The question</p><h2>{headline('question','What needed to work better.')}</h2></div><div class="case-chapter-copy">{paragraphs(case.get('challenge', []))}</div></section>
      <section class="case-chapter case-chapter--approach"><div class="case-chapter-heading"><p class="case-label">02 / Our approach</p><h2>{headline('approach','Built around the real task.')}</h2></div><div class="case-chapter-copy">{paragraphs(case.get('narrative') or case.get('approach', []))}<ul class="case-decisions">{''.join(f'<li>{text(item)}</li>' for item in case.get('approach', []))}</ul></div></section>'''
    if mobile:
        result += f'''<section class="case-mobile-story"><div><p class="case-label">One project. Every screen.</p><h2>{headline('mobile','The details come with you.')}</h2><p>{text(case.get('delivered', [case['summary']])[0])}</p><a class="case-text-link" href="{text(url)}" target="_blank" rel="noopener noreferrer">Explore it yourself <span aria-hidden="true">↗</span></a></div><figure><a class="case-mobile-capture" href="{text(mobile['src'])}" target="_blank" rel="noopener noreferrer" aria-label="View the full phone capture of {text(case['name'])}">{asset_image(mobile)}<span>View full capture <span aria-hidden="true">↗</span></span></a><figcaption>Actual mobile view · {text(case['name'])}</figcaption></figure></section>'''
    result += f'''<section class="case-chapter case-chapter--result"><div class="case-chapter-heading"><p class="case-label">03 / The handoff</p><h2>{headline('handoff','What’s there today.')}</h2></div><div class="case-chapter-copy">{paragraphs(case.get('outcome', []))}<ul class="case-delivered">{''.join(f'<li>{text(item)}</li>' for item in case.get('delivered', []))}</ul>{f'<nav class="case-actions" aria-label="Try the finished project">{action}</nav>' if action else ''}</div></section>'''
    result += project_notes(page, link)
    recommended = [slug for slug in ['chromatic-painting-design', 'hair-by-rachel-charles', 'cc-films', 'the-tarot-hotline'] if slug != case['slug'] and slug in cases][:2]
    result += '<section class="case-next"><div class="case-section-heading"><div><p class="case-label">Keep exploring</p><h2>Different worlds.<br>Same care.</h2></div><a class="case-text-link" href="/examples/" data-reader-link>All our work <span aria-hidden="true">↗</span></a></div><div class="work-grid">' + ''.join(project_card(cases[slug], visuals) for slug in recommended) + '</div></section></div>'
    return result


def render_work(page, cases, visuals, labs, lab_images, link):
    selected = ['chromatic-painting-design', 'hair-by-rachel-charles', 'cc-films', 'the-tarot-hotline', 'easy-tiger', 'the-break-room', 'clearhelp', 'logan-loans', 'grand-funding-llc']
    products = [case for case in cases.values() if case['type'].startswith('Little Fight product')]
    remaining = [case for case in cases.values() if case['slug'] not in selected and case not in products]
    result = '''<div class="work-collection"><header class="case-opening work-opening"><p class="case-label">Selected work / Little Fight NYC</p><h1 id="detail-title" tabindex="-1">Made for<br>their world.</h1><div class="case-opening-bottom"><p class="case-deck">A painter’s eye. A stylist’s chair. A filmmaker’s story. The business sets the direction. We build the way in.</p><nav class="work-jump" aria-label="Explore our work"><a href="#client-work">Client websites <span aria-hidden="true">↓</span></a><a href="#our-products">Our products <span aria-hidden="true">↓</span></a><a href="#working-labs">Working Labs <span aria-hidden="true">↓</span></a></nav></div></header>
      <section class="work-section" id="client-work"><div class="case-section-heading"><div><p class="case-label">Out in the world</p><h2>Real businesses.<br>Their own identity.</h2></div><p>Public websites you can open, explore and use.</p></div><div class="work-grid">'''
    result += ''.join(project_card(cases[slug], visuals, featured=index == 0) for index, slug in enumerate(selected) if slug in cases)
    result += '</div></section><section class="work-section" id="our-products"><div class="case-section-heading"><div><p class="case-label">Built from the inside</p><h2>We use what<br>we make.</h2></div><p>Little Fight’s own products, with their current status shown in each project.</p></div><div class="work-grid">'
    result += ''.join(project_card(case, visuals) for case in products)
    result += '</div><a class="work-vera" href="/vera/" data-reader-link><div><p class="case-label">A Little Fight product</p><h3>VERA</h3><p>Explore NYC rentals, compare listings, and inspect the public records behind them.</p></div><span aria-hidden="true">+</span></a></section>'
    result += '<section class="work-section" id="working-labs"><div class="case-section-heading"><div><p class="case-label">Go on. Try it.</p><h2>Experiments<br>with a pulse.</h2></div><p>Working interactions, playful worlds and small ideas worth opening.</p></div><div class="work-labs">'
    for lab in labs:
        slug = lab['slug']
        result += f'<a class="work-lab" href="/examples/lab/concepts/{slug}/" data-reader-link><img src="/images/lab-showcase/{lab_images[slug]}-480.webp" width="480" height="300" alt="{text(lab["name"])} — Lab artwork" loading="lazy" decoding="async"><div><h3>{text(lab["name"])}</h3><span>Open the experience <span aria-hidden="true">+</span></span></div></a>'
    result += '</div></section><section class="work-section work-other"><div class="case-section-heading"><div><p class="case-label">More of the practice</p><h2>Behind the scenes.</h2></div><p>Private work, concepts and project records. Each page makes its status clear.</p></div><div class="work-records">'
    for case in remaining:
        result += f'<a href="/case-studies/{case["slug"]}/" data-reader-link><span><strong>{text(case["name"])}</strong><small>{text(case["type"])}</small></span><span aria-hidden="true">↗</span></a>'
    return result + '</div></section>' + project_notes(page, link, 'More project context') + '</div>'
