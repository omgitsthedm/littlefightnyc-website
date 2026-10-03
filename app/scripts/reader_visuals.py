"""Small, source-backed visuals for reader pages without a page-specific hero.

The builder keeps case-study, Lab, photo, and standalone visual treatment where it
already exists.  This module only gives ordinary reader pages a compact visual
context instead of the generic boat fallback.
"""

from html import escape
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json

from service_taxonomy import override_family


APP = Path(__file__).resolve().parents[1]
CONTENT = APP / "preview-content"
ASSETS = APP / "preview-ui" / "assets"
FAMILIES = {"web", "it", "consulting", "software", "brand"}
STANDALONE_PREFIXES = ("/vera/", "/examples/lab/")

# Match the selected illustrated mosaic fronts one-for-one.  The alt and
# caption describe the business idea, rather than an asset pipeline or an
# internal project note.  The source is intentionally a title-free original
# illustration, so text remains selectable and accessible in the reader.
STORY_ART = {
    "platform": ("Constructivist geometry of three bold red, blue, and yellow structures supporting a small shop.", "Choose the foundation that fits the work."),
    "ownership": ("Hand-carved black-and-orange linocut of two hands exchanging an oversized old-fashioned key.", "Keep the website and its accounts in your control."),
    "cost": ("Fluorescent risograph print of a giant zigzag receipt with colored scope marks and a small person below.", "A useful quote starts with the work the site needs to do."),
    "mobile": ("16-bit pixel-art night street where a giant smartphone forms a shop doorway.", "Make the customer’s next step just as clear on a phone."),
    "forms": ("Spare black-ink cartoon of an oversized envelope delivered through a shop mail slot to a waiting shopkeeper.", "An inquiry should have a clear place to go."),
    "web-redesign-decision": ("Analog collage of storefront facades peeled open to a vivid new doorway and turquoise sky.", "Start by deciding what needs care and what needs replacing."),
    "web-accessibility-basics": ("Swiss-style poster of a black doorway, chartreuse ramp, and two people approaching side by side, including a wheelchair user.", "Make the first path easier for more people to use."),
    "web-content-collection": ("Embroidered plum textile collage of a camera, shopfront, price tag, flower, and folded brochure.", "Gather the real details customers need before the build begins."),
    "web-service-page": ("Art Nouveau illustration of three tool-filled workshop doorways beneath a flowing floral arch.", "Give each service a clear way to explain itself."),
    "web-photos-with-purpose": ("Cyanotype photogram of a camera, fern, and cup, with an orange crop corner framing the cup.", "Choose photographs that help someone understand the work."),
    "web-menu-and-hours": ("Neon noir oil painting of a warm diner doorway and a large glowing clock at night.", "Make the details of a visit easy to find at the right moment."),
    "web-ecommerce-inventory": ("Ben-Day Pop Art grocery shelf packed with tins and bottles, with a conspicuously empty center bay.", "A shop should show what customers can actually buy."),
    "wifi": ("Woodblock-inspired indigo wind sweeping across city roofs into three lit workrooms.", "Place the connection where the work actually happens."),
    "email": ("A single bright red wire line becomes an open envelope, loops across the page, and resolves in an outstretched hand.", "Help important messages reach the people waiting for them."),
    "backup": ("Soft pastel drawing of two open vaults filled with matching folders on opposite sides of a desert canyon.", "A second copy is most useful when it is kept somewhere separate."),
    "it-shared-files": ("Stop-motion plasticine scene of two office workers reaching for one yellow folder in a giant coral filing cabinet.", "Put the needed file where the next person can find it."),
    "consulting-first-priority": ("Gestural charcoal of hands isolating one knot from a tangle of cord, with a short green strand.", "Start with the work that needs attention first."),
    "consulting-tool-choice": ("White blueprint drawing of an adjustable wrench above a bolt on navy, with faint unused wrench outlines.", "Keep the tools that help and question the duplicates."),
    "software-repeat-work": ("Magenta Op Art of a hand pressing a circular lever as repeated paper sheets fan across the page.", "Let one clear action replace work that gets repeated."),
    "software-approval-path": ("Luminous stained glass of three hands passing a glowing golden seal through connected colored panes.", "Make the next decision and its owner easy to see."),
}


def _text(value):
    """Escape visible text and apply the public first-name-only display rule."""
    value = str(value or "")
    value = value.replace("Hair By Rachel Charles", "Hair By Rachel")
    value = value.replace("Hair by Rachel Charles", "Hair By Rachel")
    return escape(value, quote=True)


def _path(value):
    return urlsplit(str(value or "")).path.rstrip("/") + "/"


class _TileFamilies(HTMLParser):
    def __init__(self):
        super().__init__()
        self.by_path = {}
        self.by_id = {}
        self.illustration_by_path = {}
        self.illustration_by_id = {}

    def handle_starttag(self, tag, attrs):
        if tag != "a":
            return
        attrs = dict(attrs)
        if "tile" not in attrs.get("class", "").split():
            return
        family = attrs.get("data-family")
        if family not in FAMILIES:
            return
        href = attrs.get("href")
        if href:
            self.by_path.setdefault(_path(href), family)
            if attrs.get("data-illustration"):
                self.illustration_by_path.setdefault(_path(href), attrs["data-illustration"])
        for key in ("data-answer", "data-view"):
            if attrs.get(key):
                self.by_id.setdefault(attrs[key], family)
                if attrs.get("data-illustration"):
                    self.illustration_by_id.setdefault(attrs[key], attrs["data-illustration"])


def _load_tile_families():
    parser = _TileFamilies()
    parser.feed((CONTENT / "mosaic.html").read_text())
    return parser


def _load_topics():
    records = json.loads((CONTENT / "topic-tiles.json").read_text())
    return {"/answers/help/" + item["id"] + "/": item for item in records}


_TILES = _load_tile_families()
_TOPICS = _load_topics()


def reader_family(p, q=None):
    """Return the existing tile/topic family for a canonical reader record.

    An explicit shared taxonomy override wins first. Otherwise an authored page
    family wins over the original mosaic, which remains the fallback for older
    records without an explicit public service meaning.
    """
    p = p or {}
    q = q or {}
    answer = p.get("answerContent") or {}
    path = _path(q.get("path") or p.get("path"))
    identities = (p.get("id"), answer.get("id"), q.get("id"), p.get("view"), p.get("answerId"))
    for identity in identities:
        family = override_family(str(identity or ""), path)
        if family:
            return family
    family = override_family(path=path)
    if family:
        return family
    for source in (p, q, answer):
        if source.get("family") in FAMILIES:
            return source["family"]
    if path.startswith("/industries/") or path in ("/nationwide/", "/websites-for-your-business/"):
        return "web"
    if path in _TOPICS:
        return _TOPICS[path]["family"]
    if path in _TILES.by_path:
        return _TILES.by_path[path]
    for key in ("id", "view", "answerId"):
        if p.get(key) in _TILES.by_id:
            return _TILES.by_id[p[key]]
    return "brand"


def _tile_id(p, q):
    answer = (p or {}).get("answerContent") or {}
    return str((p or {}).get("id") or answer.get("id") or (q or {}).get("id") or "")


def _story_id(p, q):
    """Resolve a selected illustration from canonical page/answer data."""
    path = _path((q or {}).get("path") or (p or {}).get("path"))
    candidates = [
        (p or {}).get("id"),
        ((p or {}).get("answerContent") or {}).get("id"),
        (q or {}).get("id"),
        _tile_id(p, q),
        path.removeprefix("/answers/help/").rstrip("/"),
    ]
    return next((str(candidate) for candidate in candidates if str(candidate) in STORY_ART), "")


def _icon(p, q, family):
    """Use the original tile's illustrated intent before a family default."""
    path = _path((q or {}).get("path") or (p or {}).get("path"))
    topic = _TOPICS.get(path)
    if topic:
        return topic["icon"]
    tile_id = _tile_id(p, q)
    illustration = _TILES.illustration_by_path.get(path) or _TILES.illustration_by_id.get(tile_id)
    illustration_icons = {
        "browser": "browser-duotone.svg",
        "network": "wifi-high-bold.svg",
        "message": "chats-circle-duotone.svg",
        "screens": "desktop-tower-duotone.svg",
        "flow": "app-window-duotone.svg",
        "pulse": "sliders-horizontal-bold.svg",
        "place": "browser-duotone.svg",
    }
    if illustration in illustration_icons:
        return illustration_icons[illustration]
    question = " ".join(
        str(v or "")
        for v in ((q or {}).get("heading"), (p or {}).get("heading"), tile_id, path)
    ).lower()
    if any(term in question for term in ("wifi", "wi-fi", "internet", "network", "guest")):
        return "wifi-high-bold.svg"
    if any(term in question for term in ("email", "inbox", "message", "domain")):
        return "chats-circle-duotone.svg"
    if any(term in question for term in ("computer", "printer", "phone", "device", "video", "storage", "update")):
        return "desktop-tower-duotone.svg"
    if family == "consulting":
        return "sliders-horizontal-duotone.svg"
    if family == "software":
        return "app-window-duotone.svg"
    if family == "it":
        return "desktop-tower-duotone.svg"
    if family == "web":
        return "browser-duotone.svg"
    if path == "/reviews/" or path == "/contact/" or path == "/tech-audit/":
        return "chats-circle-duotone.svg"
    if path == "/library/" or path == "/legal/":
        return "book-open-text-duotone.svg"
    if path.startswith("/about/"):
        return "tugboat.svg"
    return "sliders-horizontal-duotone.svg"


def _icon_img(icon, extra=""):
    return f'<img class="reader-context-icon {extra}" src="/assets/mineral/{_text(icon)}" width="64" height="64" alt="">'


def _case_map(cases):
    if isinstance(cases, dict):
        return cases
    return {item.get("slug"): item for item in cases or [] if item.get("slug")}


def _case_figure(cases, slug, image, alt):
    case = _case_map(cases).get(slug)
    if not case:
        return ""
    label = _text(case.get("name", slug))
    return (
        '<figure class="reader-context-figure">'
        f'<img class="reader-context-image" src="{_text(image)}" width="640" height="444" loading="lazy" decoding="async" alt="{_text(alt)}">'
        f'<figcaption><a href="/case-studies/{_text(slug)}/" data-reader-link>{label} +</a></figcaption>'
        '</figure>'
    )


def _album_photo(albums, album_id, photo_id):
    for album in albums or []:
        if album.get("id") != album_id:
            continue
        for photo in album.get("photos", []):
            if photo.get("id") == photo_id:
                return album, photo
    return None, None


def _photo_figure(albums, album_id, photo_id):
    album, photo = _album_photo(albums, album_id, photo_id)
    if not photo:
        return ""
    title = _text(photo.get("title"))
    gallery = "/photos/" + _text(album_id.removeprefix("album-")) + "/"
    return (
        '<figure class="reader-context-figure">'
        f'<img class="reader-context-image" src="{_text(photo["localUrl"])}" width="{int(photo.get("width", 640))}" height="{int(photo.get("height", 427))}" loading="lazy" decoding="async" alt="{title}">'
        f'<figcaption><a href="{gallery}" data-reader-link>{title} · Photo credits +</a></figcaption>'
        '</figure>'
    )


def _illustration(family, icon):
    """A compact second visual for subjects without honest project/photo proof."""
    secondary = {
        "web": "sliders-horizontal-bold.svg",
        "it": "wifi-high-bold.svg",
        "consulting": "browser-duotone.svg",
        "software": "book-open-text-duotone.svg",
        "brand": "chats-circle-duotone.svg",
    }[family]
    if secondary == icon:
        secondary = "app-window-duotone.svg" if family != "software" else "sliders-horizontal-bold.svg"
    return (
        '<span class="reader-context-illustration" aria-hidden="true">'
        f'{_icon_img(secondary, "reader-context-illustration-icon")}'
        '</span>'
    )


def _web_figure(p, q, cases):
    text = " ".join(str(v or "") for v in (_tile_id(p, q), (q or {}).get("heading"), (p or {}).get("path"))).lower()
    if any(term in text for term in ("booking", "salon")):
        return _case_figure(cases, "hair-by-rachel-charles", "/assets/proof/optimized/case-hair-by-rachel-charles-640.webp", "Hair By Rachel website")
    if any(term in text for term in ("event", "film", "press", "calendar")):
        return _case_figure(cases, "cc-films", "/assets/proof/optimized/case-cc-films-640.webp", "CC Films website")
    return _case_figure(cases, "chromatic-painting-design", "/assets/proof/optimized/case-chromatic-painting-design-640.webp", "Chromatic Painting & Design website")


def _software_figure(cases):
    return _case_figure(cases, "venuecircuit", "/assets/proof/optimized/tile-venuecircuit-480.webp", "VenueCircuit product interface")


def _story_figure(story_id):
    alt, caption = STORY_ART[story_id]
    image = f"/assets/illustrations/story-{story_id}-640.webp"
    return (
        '<figure class="reader-context-figure reader-story-figure">'
        f'<img class="reader-context-image reader-story-image" src="{_text(image)}" '
        f'srcset="/assets/illustrations/story-{_text(story_id)}-320.webp 320w, '
        f'{_text(image)} 640w, /assets/illustrations/story-{_text(story_id)}-960.webp 960w" '
        'sizes="(max-width:760px) calc(100vw - 48px), min(960px, 60vw)" '
        f'width="960" height="960" loading="lazy" decoding="async" alt="{_text(alt)}">'
        f'<figcaption>{_text(caption)}</figcaption>'
        '</figure>'
    )


def _it_photo_is_relevant(p, q):
    text = " ".join(str(v or "") for v in (_tile_id(p, q), (q or {}).get("heading"), (p or {}).get("path"))).lower()
    return any(term in text for term in ("on-site", "onsite", "computer", "printer", "device", "payment", "home office", "care"))


def reader_visual(p, q, cases, albums):
    """Return a small reader hero visual for generic marketing/answer pages.

    The surrounding builder owns the page order and preserves standalone pages.
    Returning an empty string for them keeps VERA and Labs out of this shared
    marketing treatment.
    """
    p = p or {}
    q = q or {}
    path = _path(q.get("path") or p.get("path"))
    if path.startswith(STANDALONE_PREFIXES):
        return ""

    family = reader_family(p, q)
    icon = _icon(p, q, family)
    story_id = _story_id(p, q)
    if story_id:
        return (
            f'<div class="reader-context-visual reader-story-visual" data-reader-family="{_text(family)}">'
            f'{_icon_img(icon)}{_story_figure(story_id)}'
            '</div>'
        )
    figure = ""
    if family == "web":
        figure = _web_figure(p, q, cases)
    elif family == "software":
        figure = _software_figure(cases)
    elif family == "it" and _it_photo_is_relevant(p, q):
        figure = _photo_figure(albums, "album-trades", "trades-15")
    elif family == "brand" and path in {"/about/", "/about/how-we-work/"}:
        figure = _photo_figure(albums, "album-nyc", "nyc-01")

    return (
        f'<div class="reader-context-visual" data-reader-family="{_text(family)}">'
        f'{_icon_img(icon)}'
        f'{figure or _illustration(family, icon)}'
        '</div>'
    )
