"""Deliver the homepage cascade first; retain the full authored reader order."""
import subprocess


READER_ONLY = {
    'vendor/reader-website.css', 'cases.css', 'reader-app.css',
    'review-readers.css', 'anchor-stories.css', 'answer-hub.css',
    'construction.css', 'master-reader.css', 'workbench.css',
}


def write_stylesheets(app, ui, files, write):
    # The complete sheet repeats shared rules in their original authored order.
    # Loading it on first reader intent cannot reorder the homepage cascade.
    for name, selected in [
        ('site.css', files),
        ('home.css', [name for name in files if name not in READER_ONLY]),
    ]:
        css = '\n'.join((ui / name).read_text() for name in selected)
        result = subprocess.run(
            [str(app / 'node_modules/.bin/esbuild'), '--loader=css', '--minify'],
            input=css, text=True, capture_output=True, check=True,
        )
        write(name, result.stdout)
