"""Approved Steam Assembly mark: inline complete-logo first paint, optional enhancement."""
import json
from pathlib import Path
from html import escape
DATA = json.loads((Path(__file__).resolve().parents[1] / 'preview-content/steam-mark.json').read_text())

def steam_mark(mode='header', extra_class=''):
    paths = ''.join('<path d="'+escape(p, quote=True)+'"/>' for p in DATA['paths'])
    return ('<span class="steam-mark '+escape(extra_class, quote=True)+'" data-steam-mark="'+escape(mode, quote=True)+'" aria-hidden="true">'
            '<svg viewBox="'+DATA['viewBox']+'" focusable="false"><g fill="#f97316" transform="'+DATA['transform']+'">'+paths+'</g></svg></span>')
