"""The five reviewed clay illustrations, shared by tile fronts and readers."""
from html import escape
from clay_library import ENABLED, art_asset, png_scene

NAMES = {'browser', 'storefront', 'router', 'notebook', 'software'}
ROUTES = {
    '/services/custom-local-websites/': 'browser',
    '/services/it-support/': 'router',
    '/services/tech-consulting/': 'notebook',
    '/services/business-systems/': 'software',
    '/industries/': 'storefront',
}
LABELS = {
    'browser': 'browser window', 'storefront': 'New York storefront',
    'router': 'router', 'notebook': 'notebook and pencil', 'software': 'software blocks',
}

def clay_scene(name, eager=False):
    name = name.removeprefix('clay-').removesuffix('-v1')
    assert name in NAMES, f'Unreviewed clay illustration: {name}'
    src = '/assets/sculpture/clay-' + name + '-v1'
    return (
        f'<span class="clay-scene" data-clay-icon="{name}" aria-hidden="true">'
        f'<img class="sculpture-object clay-rest" src="{src}.webp" '
        f'srcset="{src}-480.webp 480w, {src}.webp 960w" '
        'sizes="(max-width:600px) 48vw, 480px" width="960" height="640" '
        f'loading="{"eager" if eager else "lazy"}" decoding="async" alt="">'
        '</span>'
    )

def clay_figure(name):
    label = escape(LABELS[name], quote=True)
    if ENABLED:
        return (
            '<figure class="reader-clay-figure reader-clay-cutout">'
            f'<button class="clay-illustration" data-clay-trigger type="button" '
            f'aria-label="Play the clay {label} illustration">'
            + png_scene(art_asset('clay-' + name + '-v1'), eager=True)
            + '<span class="clay-play-mark" aria-hidden="true">▶</span></button>'
            '<figcaption>Clay illustration</figcaption></figure>'
        )
    return (
        '<figure class="reader-clay-figure">'
        f'<button class="clay-illustration" data-clay-trigger type="button" '
        f'aria-label="Play the clay {label} illustration">'
        + clay_scene(name, eager=True)
        + '<span class="clay-play-mark" aria-hidden="true">▶</span></button>'
        '<figcaption>Clay illustration</figcaption></figure>'
    )
