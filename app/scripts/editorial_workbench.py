"""Shared, semantic chrome for Little Fight's editorial tile readers.

The renderer owns content and routes.  This module deliberately owns only the
stable reading shell: orange global contact, category context, and an honest
return path.  It produces ordinary links first so direct reader documents stay
useful without the flip enhancement.
"""

from html import escape


CATEGORIES = (
    ("web", "Websites", "/services/custom-local-websites/", "desktop-tower-duotone.svg"),
    ("it", "Tech support", "/services/it-support/", "desktop-tower-duotone.svg"),
    ("consulting", "Consulting", "/services/tech-consulting/", "chat-text-duotone.svg"),
    ("software", "Custom software", "/services/business-systems/", "shapes-duotone.svg"),
)


def category_context(family: str) -> tuple[str, str]:
    """Return the human category name and its stable service route."""
    for key, label, href, _ in CATEGORIES:
        if key == family:
            return label, href
    return "Little Fight NYC", "/"


def _tabs(active: str | None, *, intercept: bool) -> str:
    links = []
    for key, label, href, icon in CATEGORIES:
        current = ' aria-current="page"' if active == key else ''
        reader = " data-reader-link" if intercept else ""
        links.append(
            '<a class="workbench-tab" data-family="{key}" href="{href}"{current}{reader}>'
            '<span class="workbench-tab-icon" aria-hidden="true" '
            'style="--workbench-icon:url(/assets/mineral/{icon})"></span>{label}</a>'.format(
                key=escape(key, quote=True),
                href=escape(href, quote=True),
                current=current,
                reader=reader,
                icon=escape(icon, quote=True),
                label=escape(label),
            )
        )
    return '<nav class="workbench-tabs" aria-label="Service categories">' + ''.join(links) + '</nav>'


def _backlinks(active: str | None, *, intercept: bool) -> str:
    keys = [active] if active else [key for key, _, _, _ in CATEGORIES]
    links = []
    for key, label, href, _ in CATEGORIES:
        if key not in keys:
            continue
        reader = " data-reader-link" if intercept else ""
        links.append(
            '<a class="workbench-backlink" data-family="{key}" href="{href}"{reader}>'
            '<span aria-hidden="true">←</span> {label}</a>'.format(
                key=escape(key, quote=True), href=escape(href, quote=True),
                reader=reader, label=escape(label)
            )
        )
    return '<nav class="workbench-backlinks" aria-label="Back to service">' + ''.join(links) + '</nav>'


def header(*, family: str | None, contacts: str, dialog: bool = False) -> str:
    """Render the selected Editorial Workbench header.

    Dialog readers begin without a category.  The already-existing reader
    runtime assigns ``data-reader-family`` when it injects the route content;
    CSS then exposes the matching tab/backlink without changing the runtime.
    """
    return (
        '<header class="workbench-chrome">'
        '<div class="workbench-chrome-top">'
        '<a class="workbench-brand" href="/" aria-label="Little Fight NYC homepage">'
        '<img src="/assets/boat-orange.svg" width="43" height="38" alt="">'
        '<span>Little Fight NYC</span></a>'
        f'<nav class="workbench-contacts direct-contact-rail contact-actions reader-rail" data-lf-contact-rail="true" aria-label="Quick contact">{contacts}</nav>'
        '</div>'
        # Direct documents retain ordinary hrefs without JavaScript, while the
        # enhanced reader can keep the card history and focus journey intact.
        + _tabs(None if dialog else family, intercept=True)
        + _backlinks(None if dialog else family, intercept=True)
        + '</header>'
    )
