"""Deliver the homepage cascade first; keep the full authored order for readers.

site.css is the complete cascade every page has always used. home.css is the
same cascade with the reader-only files left out, so the homepage paints with
roughly 40% of the CSS. When a visitor opens a card, site.js loads site.css
before the reader appears; because site.css repeats the shared rules in their
original order, loading it on top of home.css cannot reorder the homepage.
"""
import subprocess


READER_ONLY = {
    'vendor/reader-website.css', 'cases.css', 'reader-app.css',
    'review-readers.css', 'anchor-stories.css', 'answer-hub.css',
    'construction.css', 'master-reader.css', 'workbench.css',
    # Earlier vector/collage tile fronts no longer occur on the sculptural
    # homepage. Readers and standalone pages still receive them in site.css.
    'tile-art.css', 'editorial-tiles.css', 'consolidated.css',
}


def write_stylesheets(app, ui, files, extras, write):
    """Write site.css (complete) and home.css (homepage only).

    `extras` are appended to both, after the authored order, exactly as the
    single-sheet build did (boot screen and clay library styles).
    """
    for name, selected in [
        ('site.css', files),
        ('home.css', [name for name in files if name not in READER_ONLY]),
    ]:
        css = '\n'.join((ui / name).read_text() for name in selected)
        css += ''.join('\n' + (ui / extra).read_text() for extra in extras)
        result = subprocess.run(
            [str(app / 'node_modules/.bin/esbuild'), '--loader=css', '--minify'],
            input=css, text=True, capture_output=True, check=True,
        )
        write(name, result.stdout)
