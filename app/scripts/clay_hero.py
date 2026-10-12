"""Approved living-clay hero, shared by local and production builds."""
from html import escape
import shutil

ASSETS = '/assets/clay-library/'
SCENE_WIDTH, SCENE_HEIGHT = 1448, 1086


def copy_assets(public, destination):
    """Include the native-resolution artwork used by this candidate."""
    paths = [str(file.relative_to(public)) for file in (public / 'assets/clay-library').glob('*.webp')]
    paths.append('assets/portfolio-20261007/chromatic-painting-design-desktop.webp')
    for path in paths:
        target = destination / path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(public / path, target)
    shutil.copy2(public.parent / 'preview-ui' / 'clay-hero.js', destination / 'clay-hero.js')


def prop(name, css):
    return (f'<img class="clay-hero-prop {css}" src="{ASSETS}{name}.webp" '
            f'srcset="{ASSETS}{name}-384.webp 384w, {ASSETS}{name}-768.webp 768w, {ASSETS}{name}.webp 1536w" '
            'sizes="(max-width:600px) 30vw, 250px" fetchpriority="low" '
            'width="1536" height="1024" alt="" decoding="async" data-native-width="1536">')


def responsive_image(name, width, height, x=0, y=0, extra=''):
    """Responsive HTML images retain native artwork inside the SVG coordinate system."""
    sizes = {
        'hero-diorama-clean': '(max-width:600px) 90vw, (max-width:1000px) 70vw, 720px',
        'hero-browser-wide': '(max-width:600px) 65vw, (max-width:1000px) 52vw, 580px',
        'rachel-clay-portrait-yellow': '(max-width:600px) 40vw, 450px',
        'hero-chromatic-screen': '(max-width:600px) 60vw, 560px',
        'hero-cat-poses': '(max-width:600px) 30vw, 250px',
        'hero-pigeon-poses': '(max-width:600px) 42vw, 330px',
        'hero-small-props': '(max-width:600px) 40vw, 350px',
    }.get(name, '(max-width:600px) 30vw, 280px')
    native_width = {'rachel-clay-portrait-yellow': 1942}.get(name, width)
    full = ('/assets/portfolio-20261007/chromatic-painting-design-desktop.webp'
            if name == 'hero-chromatic-screen' else f'{ASSETS}{name}.webp')
    priority = 'high' if name == 'hero-diorama-clean' else 'low'
    return (f'<foreignObject x="{x}" y="{y}" width="{width}" height="{height}" {extra}>'
            '<picture xmlns="http://www.w3.org/1999/xhtml">'
            f'<source srcset="{ASSETS}{name}-384.webp 384w, '
            f'{ASSETS}{name}-768.webp 768w, {full} {native_width}w" sizes="{sizes}">'
            f'<img src="{full}" '
            f'alt="" width="{width}" height="{height}" fetchpriority="{priority}" '
            'style="display:block;width:100%;height:100%;object-fit:cover"/></picture></foreignObject>')


def fragment(name, source, destination, css='', atlas=(1254, 1254)):
    """Show one unmodified region of a transparent native sprite atlas."""
    sx, sy, sw, sh = source
    x, y, width, height = destination
    return (f'<svg class="{css}" x="{x}" y="{y}" width="{width}" height="{height}" '
            f'viewBox="{sx} {sy} {sw} {sh}" preserveAspectRatio="xMidYMax meet" overflow="hidden">'
            + responsive_image(name, atlas[0], atlas[1]) + '</svg>')


def poses(name, prefix, destination):
    return ''.join(fragment(name, (724 * i, 0, 724, 724), destination,
                            f'clay-pose {prefix}-{i}', (2172, 724)) for i in range(3))


def browser(slug, label, css, clip, portrait=False):
    if portrait:
        screen_art = (
            responsive_image('rachel-clay-portrait-yellow', 1307, 542, 151, 272))
        accessible = 'Explore Hair By Rachel Charles, illustrated with a clay version of her original portrait'
    else:
        screen_art = (
            '<svg x="151" y="272" width="1307" height="542" viewBox="0 350 1600 664" '
            'preserveAspectRatio="xMidYMid slice">'
            + responsive_image('hero-chromatic-screen', 1600, 1111) + '</svg>')
        accessible = 'Explore the Chromatic Painting and Design client website'
    return (
        f'<a class="clay-hero-project {css}" href="/case-studies/{slug}/" data-reader-link '
        f'aria-label="{accessible}" data-native-width="1610">'
        '<svg viewBox="0 0 1610 977" aria-hidden="true" focusable="false">'
        + responsive_image('hero-browser-wide', 1610, 977) +
        f'<defs><clipPath id="{clip}"><rect x="151" y="272" width="1307" height="542" rx="28"/></clipPath></defs>'
        f'<g clip-path="url(#{clip})">{screen_art}</g>'
        f'<text x="919" y="224" text-anchor="middle" fill="#263b3c" font-size="38" font-weight="600">{escape(label)}</text>'
        '</svg></a>')


def room_activity():
    return (
        # Screen content is UI drawn over the miniature's existing monitor.
        '<g class="clay-studio-screen" transform="translate(414 437)">'
        '<path fill="#efe1c7" d="M0 0H91V55H0Z"/>'
        '<g class="clay-web-layout">'
        '<path fill="#588077" d="M7 7H84V13H7Z"/><path fill="#c38764" d="M7 20H37V45H7Z"/>'
        '<path fill="#9d927c" d="M43 20H81V24H43ZM43 30H75V33H43ZM43 39H69V42H43Z"/>'
        '</g></g>'
        '<g class="clay-booking"><rect x="463" y="779" width="12" height="10" rx="2" fill="#6a8a61"/>'
        '<path d="m465 784 3 3 5-6" fill="none" stroke="#fff1d8" stroke-width="2" stroke-linecap="round"/></g>'
        '<g class="clay-planning-note"><path d="M975 472l17 1-1 15-17-1z" fill="#d5a357"/></g>'
        + poses('hero-cat-poses', 'clay-cat', (548, 221, 135, 135))
        + '<g transform="translate(309 785)"><g class="clay-steam">'
        + fragment('hero-small-props', (810, 742, 330, 426), (0, 0, 34, 39))
        + '</g></g>'
        + '<g transform="translate(505 667)"><g class="clay-open-sign">'
        + fragment('hero-small-props', (62, 55, 608, 620), (0, 0, 87, 89))
        + '</g></g>')


def pigeon():
    return (
        '<button class="clay-pigeon" type="button" aria-label="Say hello to the rooftop pigeon">'
        '<svg viewBox="0 0 724 724" aria-hidden="true" focusable="false">'
        '<g class="clay-crust">'
        + fragment('hero-small-props', (90, 830, 552, 346), (180, 563, 205, 130))
        + '</g><g class="clay-bird">'
        + poses('hero-pigeon-poses', 'clay-pigeon-pose', (0, 0, 724, 724))
        + '</g></svg></button>')


def neighborhood():
    rooms = (
        ('home', '/services/it-support/', 'Work without the interruptions', 'Get dependable tech support for your home office',
         '289 174 420 185'),
        ('studio', '/services/custom-local-websites/', 'A website that brings people in', 'Explore websites for your studio or business',
         '289 413 405 141'),
        ('meeting', '/services/tech-consulting/', 'Make the next move clear', 'Get practical technology consulting for your office',
         '825 369 261 185'),
        ('shop', '/services/business-systems/', 'A little less busywork', 'Explore custom software for your shop or business',
         '289 684 318 185'),
    )
    links = ''.join(
        f'<a class="clay-room-link clay-room-{room}" href="{path}" data-reader-link '
        f'aria-label="{label}"><svg class="clay-room-closeup" viewBox="{box}" aria-hidden="true" focusable="false">'
        f'{responsive_image("hero-diorama-clean", 1448, 1086)}{room_activity()}</svg><span>{title}</span></a>'
        for room, path, title, label, box in rooms)
    return (
        '<div class="clay-diorama" data-native-width="1448">'
        '<svg class="clay-building" viewBox="0 0 1448 1086" role="img" aria-labelledby="clay-scene-title">'
        '<title id="clay-scene-title">Handmade clay New York block with an independent shop, creative studio, '
        'home office and meeting room. A cat rests upstairs and a pigeon lives on the roof. '
        'Plants, coffee, a bicycle and working equipment fill the little neighborhood.</title>'
        '<g id="clay-building-art">'
        + responsive_image('hero-diorama-clean', 1448, 1086)
        + room_activity()
        + '</g></svg>'
        + links + pigeon() + '</div>')


def equipment(name, css, path, label):
    source = responsive_image(name, 1536, 1024)
    if name == 'hero-printer-front':
        contents = (source
                    + '<defs><clipPath id="clay-paper-slot"><path d="M474 735H986L1002 912H448Z"/></clipPath></defs>'
                    '<g clip-path="url(#clay-paper-slot)"><g class="clay-printer-paper">'
                    '<svg x="466" y="725" width="528" height="190" viewBox="780 162 395 480" '
                    'preserveAspectRatio="none" overflow="hidden">'
                    + responsive_image('hero-small-props', 1254, 1254) + '</svg>'
                    + '</g></g>')
    else:
        plant_path = 'M0 320H548L572 613 520 653 518 982H0Z'
        contents = (
            f'<defs><clipPath id="clay-plant-cut"><path d="{plant_path}"/></clipPath>'
            '<mask id="clay-router-cut"><rect width="1536" height="1024" fill="white"/>'
            f'<path d="{plant_path}" fill="black"/></mask></defs>'
            f'<g mask="url(#clay-router-cut)">{source}</g>'
            f'<g class="clay-plant-leaves"><g clip-path="url(#clay-plant-cut)">{source}</g></g>'
            '<circle class="clay-router-status" cx="1292" cy="809" r="11" fill="#afc88c"/>')
    return (
        f'<a class="clay-equipment {css}" href="{path}" data-reader-link aria-label="{label}" data-native-width="1536">'
        f'<svg viewBox="0 0 1536 1024" aria-hidden="true" focusable="false">{contents}</svg></a>')


def clay_hero():
    return (
        '<section class="sculpture-hero" data-hero="clay-neighborhood" data-clay-version="5" aria-labelledby="home-title">'
        '<div class="sculpture-hero-copy"><h1 id="home-title">A little fight.<br>A big difference.</h1>'
        '<p>Websites, tech support, and custom software for the independent businesses '
        'that make <span class="hero-ending">New York, New York.</span></p>'
        '<div class="sculpture-hero-actions"><a class="sculpture-help" href="/tech-audit/" data-reader-link>'
        '<span>Get help</span><span class="help-button__plus" aria-hidden="true">+</span></a><a class="sculpture-work" href="/examples/" data-reader-link>'
        '<span>Explore our work <span aria-hidden="true">+</span></span></a></div></div>'
        '<div class="sculpture-hero-stage clay-neighborhood">'
        + prop('environment-cloud-cumulus', 'clay-cloud clay-cloud-one')
        + prop('environment-cloud-wisp', 'clay-cloud clay-cloud-two')
        + prop('environment-cloud-cumulus', 'clay-cloud clay-cloud-three')
        + prop('environment-cloud-wisp', 'clay-cloud clay-cloud-four')
        + browser('chromatic-painting-design', 'Chromatic Painting & Design', 'hero-main', 'clay-screen-chromatic')
        + browser('hair-by-rachel-charles', 'Hair By Rachel Charles', 'hero-secondary', 'clay-screen-rachel', portrait=True)
        + equipment('hero-printer-front', 'clay-printer', '/answers/help/printer/', 'Get help with your office printer')
        + equipment('hero-router-front', 'clay-router', '/answers/help/wifi/', 'Get help with your Wi-Fi')
        + neighborhood()
        + '</div><div class="clay-hero-footer"><p>In your corner, wherever you work.</p>'
        '<button class="clay-motion-toggle" type="button" aria-pressed="false" hidden>Pause animation</button>'
        '</div><p class="clay-surprise-status" role="status" aria-live="polite"></p></section>')
