"""A curated public introduction to the construction-related working Labs."""
from html import escape

E = lambda value: escape(str(value), quote=True)

CONSTRUCTION_LABS = {
    'cabinet-concept': ('A kitchen, before the commitment.', 'Try cabinet styles, finishes and hardware. Compare a few directions while the decision is still easy to change.'),
    'house-explorer': ('Walk around the idea.', 'Explore a house in three dimensions and see how light changes its shape. A visual study, not a measured building plan.'),
    'walkup-3d': ('See the whole building.', 'Turn a six-story building, move closer and look from another angle. An imagined place you can explore in your browser.'),
    'pool-room': ('Give an interior a feeling.', 'Explore the film and stills of an invented pool room. A set-design study in materials, lighting and atmosphere.'),
    'terminal-3d': ('Pull back to the neighborhood.', 'Explore an imagined district as daylight turns to neon. A playful example of presenting a place at a larger scale.'),
    'project-desk': ('Keep the next decision in sight.', 'Try a sample project workspace with fictional selections and documents. A workflow demonstration, separate from a live client portal.'),
}


def construction_tile():
    return '''<a class="tile construction-hub-tile" href="/construction/" data-answer="construction-showcase" data-family="software" data-material-family="software" data-kind="construction-hub" data-cell-title="For builders &amp; remodelers" data-columns="3" data-rows="2" data-mobile-columns="3" data-mobile-rows="3"><span class="construction-tile-copy"><span class="construction-tile-label">Websites + interactive tools</span><strong>For builders<br>&amp; remodelers.</strong><span>See the work. Try the ideas.</span></span><span class="construction-tile-plus" aria-hidden="true">+</span></a>'''


def render_construction(labs, cases, link):
    available = {lab['slug']: lab for lab in labs}
    lead = available['cabinet-concept']
    cards = []
    for slug, (heading, description) in CONSTRUCTION_LABS.items():
        if slug not in available:
            continue
        lab = available[slug]
        cards.append(f'''<a class="construction-study" href="{E(lab['sharePath'])}" data-reader-link>
          <figure><img src="{E(lab['tileImage'])}" alt="{E(lab.get('tileImageAlt') or lab['name'])}" width="{E(lab.get('tileImageWidth',800))}" height="{E(lab.get('tileImageHeight',500))}" loading="lazy" decoding="async"></figure>
          <div class="construction-study-copy"><span class="construction-label">{E(lab['name'])}{'' if lab['name'].endswith('Lab') else ' · Lab'}</span><h3>{E(heading)}</h3><p>{E(description)}</p><span class="construction-open">Explore this Lab <span aria-hidden="true">+</span></span></div></a>''')
    return f'''<div class="construction-showcase">
      <header class="construction-opening"><div><p class="construction-label">For builders &amp; remodelers</p><h1 id="detail-title" tabindex="-1">Help them see<br>what’s possible.</h1><p class="construction-lead">Your work is easier to choose when people can picture it. Explore a real contractor website, then try our interactive studies for cabinets, buildings and interiors.</p><a class="construction-primary" href="{E(lead['sharePath'])}" data-reader-link>Try the Cabinet Lab +</a></div>
      <a class="construction-hero-image" href="{E(lead['sharePath'])}" data-reader-link aria-label="Explore the Cabinet Lab"><img src="{E(lead['tileImage'])}" width="{E(lead.get('tileImageWidth',800))}" height="{E(lead.get('tileImageHeight',500))}" alt="{E(lead.get('tileImageAlt') or 'Interactive cabinet design study')}" fetchpriority="high"><span>Change the finish. See the difference. <b aria-hidden="true">+</b></span></a></header>
      <nav class="construction-jumps" aria-label="Explore construction work"><a href="#contractor-work">A real contractor website</a><a href="#construction-labs">Try the Labs</a><a href="#your-business">For your business</a></nav>
      <section class="construction-proof" id="contractor-work"><div><p class="construction-label">Client work</p><h2>The work deserves<br>a good first impression.</h2><p>Chromatic Painting &amp; Design’s website brings its painting services and project work together, with a clear route to contact the business.</p><a class="construction-text-link" href="/case-studies/chromatic-painting-design/" data-reader-link>Explore the website story +</a></div><a class="construction-client-image" href="/case-studies/chromatic-painting-design/" data-reader-link><img src="/assets/proof/optimized/case-chromatic-painting-design-640.webp" width="640" height="444" alt="Chromatic Painting &amp; Design website" loading="lazy"><span>Chromatic Painting &amp; Design <b aria-hidden="true">+</b></span></a></section>
      <section class="construction-labs" id="construction-labs"><div class="construction-section-intro"><div><p class="construction-label">Little Fight Labs</p><h2>Less imagining.<br>More exploring.</h2></div><p>These are working experiments, with their own links to share. They show what an interactive experience can feel like; they are not client builds, estimates or construction drawings.</p></div><div class="construction-study-grid">{''.join(cards)}</div></section>
      <section class="construction-next" id="your-business"><p class="construction-label">For your business</p><h2>Start with the part<br>your customers need.</h2><div class="construction-needs"><div><h3>A website that shows the work.</h3><p>Bring your projects, services and service area together. Make it easy to call or ask about an estimate.</p>{link('Explore website design +','/services/custom-local-websites/')}</div><div><h3>A short path from the QR code.</h3><p>A neighborhood flyer can lead to a focused page about that service, with a simple way to get in touch.</p>{link('Plan your customer’s next step +','/services/tech-consulting/')}</div><div><h3>A tool built around your process.</h3><p>Let customers explore choices or help your team organize a decision. We agree on the rules and connections before building it.</p>{link('Explore custom software +','/services/business-systems/')}</div></div></section>
      <div class="lab-share"><button type="button" data-copy-lab-link="/construction/">Copy showcase link</button><a href="/construction/" data-share-fallback hidden>Link to this showcase</a><span role="status" data-copy-status></span></div>
    </div>'''
