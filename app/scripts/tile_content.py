"""Small, dependency-free content helpers for the tile reader.

The preview compiler imports public source-page blocks that were already
rendered in the approved reader.  This module keeps that material as prose:
headings establish chapters, paragraphs stay paragraphs, and source links stay
in the sentence or list item that introduced them.  It omits only exact shared
reader boilerplate and an exact opening sentence already used as the reader
hero.
"""

from __future__ import annotations

from collections.abc import Callable, Iterable, Mapping
from html import escape
import json
from pathlib import Path
import subprocess
import sys
from typing import Any


Display = Callable[[str], str]
Link = Callable[[str, str], str]


def _text(value: Any) -> str:
    """Return a compact string without inventing or changing source words."""
    return " ".join(str(value or "").split())


def _identity(value: str) -> str:
    return value


def _default_link(label: str, href: str) -> str:
    return f'<a href="{escape(href, quote=True)}">{escape(label)}</a>'


def _canonical(value: Any) -> str:
    return _text(value).casefold()


def _source_links(block: Mapping[str, Any]) -> list[tuple[str, str]]:
    """Read a block's authored links once, preserving source order."""
    links: list[tuple[str, str]] = []
    for item in block.get("links") or []:
        if not isinstance(item, Mapping):
            continue
        label, href = _text(item.get("text")), _text(item.get("href"))
        if label and href and (label, href) not in links:
            links.append((label, href))
    href = _text(block.get("href"))
    text = _text(block.get("text"))
    if href and text and not links:
        links.append((text, href))
    return links


def render_inline_anchors(
    text: Any,
    links: Iterable[tuple[str, str]],
    display: Display = _identity,
    link: Link = _default_link,
) -> str:
    """Escape source prose and place each source link inline exactly once.

    The imported record contains plain text plus link metadata, rather than
    source HTML.  Most link labels occur verbatim inside that text.  When an
    old record has a standalone link label, append it to the same sentence or
    list item; never create a second navigation block that repeats the copy.
    """
    source = _text(text)
    if not source:
        return ""

    rendered: list[str] = []
    cursor = 0
    unmatched: list[tuple[str, str]] = []
    for raw_label, href in links:
        label = _text(raw_label)
        if not label or not href:
            continue
        index = source.find(label, cursor)
        if index < 0:
            unmatched.append((label, href))
            continue
        rendered.append(escape(display(source[cursor:index])))
        rendered.append(link(display(label), href))
        cursor = index + len(label)
    rendered.append(escape(display(source[cursor:])))
    for label, href in unmatched:
        rendered.append(" · ")
        rendered.append(link(display(label), href))
    return "".join(rendered)


def _intro_values(page: Mapping[str, Any]) -> set[str]:
    """Values that may already appear in the reader hero for this page."""
    values = {
        _canonical(page.get("summary")),
        _canonical(page.get("description")),
        _canonical(page.get("metaDescription")),
    }
    values.discard("")
    return values


_GENERIC_CONTACT_HEADING = "what you can count on"
_GENERIC_CONTACT_TEXT = _canonical(
    "The first look is free. A website can be ready in six weeks or less when the scope "
    "and materials are agreed. The written plan names the scope, launch timing, what "
    "each side provides, and the care included. Urgent on-site help is a New York "
    "service; call so we can assess the issue and location, then confirm any on-site "
    "timing. A real person answers 9am–9pm Eastern. After hours, leave a message."
)
_GENERIC_REFERENCE_HEADING = "useful outside references"
_GENERIC_REFERENCE_HREFS = frozenset(
    {
        "https://support.google.com/business",
        "https://developers.google.com/search/docs",
        "https://www.sba.gov/business-guide/manage-your-business",
        "https://littlefightnyc.com/tech-audit",
    }
)


def _heading(block: Mapping[str, Any]) -> bool:
    return _text(block.get("type")).lower() in {"h2", "h3", "h4"}


def _section_end(blocks: list[Mapping[str, Any]], start: int) -> int:
    """Return the first block after the heading-led section at ``start``."""
    index = start + 1
    while index < len(blocks) and not _heading(blocks[index]):
        index += 1
    return index


def _is_generic_reference_section(blocks: list[Mapping[str, Any]], start: int) -> bool:
    """Recognize only the repeated four-link reference block.

    A heading named ``Useful outside references`` can still carry useful,
    topic-specific citations.  The shared legacy block is safe to omit only
    when every authored link is one of its exact Google, SBA, and Tech Audit
    destinations.
    """
    if _canonical(blocks[start].get("text")) != _GENERIC_REFERENCE_HEADING:
        return False
    hrefs = {
        _canonical(href).rstrip("/")
        for block in blocks[start + 1 : _section_end(blocks, start)]
        for _, href in _source_links(block)
    }
    return hrefs == _GENERIC_REFERENCE_HREFS


def _is_generic_contact_section(blocks: list[Mapping[str, Any]], start: int) -> bool:
    """Recognize the one repeated contact-pitch paragraph, not its heading alone."""
    if _canonical(blocks[start].get("text")) != _GENERIC_CONTACT_HEADING:
        return False
    body = blocks[start + 1 : _section_end(blocks, start)]
    return len(body) == 1 and _canonical(body[0].get("text")) == _GENERIC_CONTACT_TEXT


def filtered_legacy_blocks(page: Mapping[str, Any]) -> list[Mapping[str, Any]]:
    """Return imported blocks after removing exact shared reader boilerplate.

    The repeated ``What you can count on`` section is a single identical
    marketing/contact paragraph across unrelated readers.  It includes an
    retired delivery-time promise and repeated hours.  The common reader
    contact controls already supply the current contact path, so this helper
    removes that exact section and the exact four-link generic reference block.
    All other headings, prose, and topic-specific citations remain intact.
    """
    blocks = [block for block in page.get("contentBlocks") or [] if isinstance(block, Mapping)]
    kept: list[Mapping[str, Any]] = []
    index = 0
    while index < len(blocks):
        block = blocks[index]
        if _heading(block):
            if _is_generic_contact_section(blocks, index) or _is_generic_reference_section(blocks, index):
                index = _section_end(blocks, index)
                continue
        kept.append(block)
        index += 1
    return kept


def render_legacy_sections(
    page: Mapping[str, Any],
    display: Display = _identity,
    link: Link = _default_link,
) -> str:
    """Render all imported source blocks as grouped semantic reader sections.

    ``h1`` is deliberately omitted because the reader has already rendered one
    page title.  Shared legacy boilerplate is removed by
    :func:`filtered_legacy_blocks`.  One paragraph whose full text is an exact
    hero summary/description is also omitted before the source reaches its
    first section heading.  Other facts, headings, and later paragraphs remain
    intact.
    """
    intro_values = _intro_values(page)
    intro_available = True
    before_first_heading = True
    sections: list[tuple[str, list[str]]] = []
    current_heading = ""
    current_parts: list[str] = []
    pending_items: list[str] = []

    def flush_items() -> None:
        nonlocal pending_items
        if pending_items:
            current_parts.append('<ul class="story-list">' + "".join(pending_items) + "</ul>")
            pending_items = []

    def flush_section() -> None:
        flush_items()
        if current_parts:
            sections.append((current_heading, current_parts.copy()))
            current_parts.clear()

    for block in filtered_legacy_blocks(page):
        kind = _text(block.get("type")).lower()
        text = _text(block.get("text"))
        if not text:
            continue
        if kind == "h1":
            continue
        if kind in {"h2", "h3", "h4"}:
            flush_section()
            current_heading = text
            before_first_heading = False
            continue
        if (
            intro_available
            and before_first_heading
            and kind == "p"
            and _canonical(text) in intro_values
        ):
            intro_available = False
            continue
        inline = render_inline_anchors(text, _source_links(block), display, link)
        if kind == "li":
            pending_items.append(f"<li>{inline}</li>")
            continue
        flush_items()
        if kind == "blockquote":
            current_parts.append(f"<blockquote>{inline}</blockquote>")
        elif kind == "figcaption":
            current_parts.append(f'<p class="story-caption">{inline}</p>')
        else:
            current_parts.append(f"<p>{inline}</p>")
    flush_section()

    return "".join(
        '<section class="story-section story-section--imported' + (' story-section--plain' if not heading else '') + '">'
        + (f"<h2>{escape(display(heading))}</h2>" if heading else "")
        + f"<div>{''.join(parts)}</div></section>"
        for heading, parts in sections
    )


def render_case_source(
    page: Mapping[str, Any],
    catalog: Mapping[str, Any],
    display: Display = _identity,
    link: Link = _default_link,
    proof_html: str = "",
) -> str:
    """Prepend vetted catalog context, then retain the complete source case.

    ``proof_html`` is supplied by the caller only when it has a locally copied,
    catalog-approved image.  The helper never creates an outcome or client
    claim on its own.
    """
    status = _text(catalog.get("statusLabel") or catalog.get("type"))
    summary = _text(catalog.get("summary"))
    location = _text(catalog.get("location"))
    context: list[str] = ['<section class="story-case-context">']
    if status:
        context.append(f'<p class="story-kicker">{escape(display(status))}</p>')
    if summary:
        context.append(f"<p>{escape(display(summary))}</p>")
    if location:
        context.append(f'<p class="story-case-location">{escape(display(location))}</p>')
    if proof_html:
        context.append(proof_html)
    context.append("</section>")
    return "".join(context) + render_legacy_sections(page, display, link)


_NODE_EXTRACTOR = r"""
const fs = require('fs');
const vm = require('vm');
const source = fs.readFileSync(process.argv[1], 'utf8');
const sandbox = Object.create(null);
sandbox.window = Object.create(null);
vm.createContext(sandbox, { codeGeneration: { strings: false, wasm: false } });
new vm.Script(source, { filename: process.argv[1] }).runInContext(sandbox, { timeout: 1000 });
process.stdout.write(JSON.stringify(sandbox.window.LF_READER_SUMMARIES));
"""


def extract_reader_summaries(source: Path) -> dict[str, dict[str, str]]:
    """Extract the approved summaries via a bounded Node VM data context."""
    result = subprocess.run(
        ["node", "-e", _NODE_EXTRACTOR, str(source)],
        check=True,
        capture_output=True,
        text=True,
        timeout=5,
    )
    raw = json.loads(result.stdout)
    if not isinstance(raw, Mapping) or not raw:
        raise ValueError("reader summaries source did not expose a summary map")
    cleaned: dict[str, dict[str, str]] = {}
    for key, value in raw.items():
        if not isinstance(key, str) or not isinstance(value, Mapping):
            raise ValueError("reader summaries contain an invalid entry")
        title, summary = value.get("title"), value.get("summary")
        if not isinstance(title, str) or not isinstance(summary, str):
            raise ValueError(f"reader summary {key!r} is missing title or summary")
        cleaned[key] = {"title": title, "summary": summary}
    return cleaned


def write_reader_summaries(source: Path, output: Path) -> int:
    """Write the immutable imported map and return the verified entry count."""
    summaries = extract_reader_summaries(source)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(summaries, ensure_ascii=False, indent=2) + "\n")
    return len(summaries)


def _main(argv: list[str]) -> int:
    if len(argv) != 3 or argv[0] != "--write-reader-summaries":
        raise SystemExit("usage: tile_content.py --write-reader-summaries SOURCE OUTPUT")
    count = write_reader_summaries(Path(argv[1]), Path(argv[2]))
    if count != 110:
        raise SystemExit(f"expected 110 reader summaries, got {count}")
    print(f"wrote {count} reader summaries")
    return 0


if __name__ == "__main__":
    raise SystemExit(_main(sys.argv[1:]))
