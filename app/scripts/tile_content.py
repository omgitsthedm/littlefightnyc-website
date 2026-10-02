"""Small, dependency-free content helpers for the tile reader.

The preview compiler imports public source-page blocks that were already
rendered in the approved reader.  This module keeps that material as prose:
headings establish chapters, paragraphs stay paragraphs, and source links stay
in the sentence or list item that introduced them.  It intentionally does not
deduplicate body copy, apart from an exact opening sentence already used as the
reader hero.
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


def render_legacy_sections(
    page: Mapping[str, Any],
    display: Display = _identity,
    link: Link = _default_link,
) -> str:
    """Render all imported source blocks as grouped semantic reader sections.

    ``h1`` is deliberately omitted because the reader has already rendered one
    page title.  The only body omission is one paragraph whose full text is an
    exact hero summary/description before the source reaches its first section
    heading.  Repeated facts, headings, and later paragraphs remain intact.
    """
    intro_values = _intro_values(page)
    intro_available = True
    before_first_heading = True
    sections: list[tuple[str, list[str]]] = []
    current_heading = "The details"
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

    for block in page.get("contentBlocks") or []:
        if not isinstance(block, Mapping):
            continue
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
        '<section class="story-section story-section--imported">'
        f"<h2>{escape(display(heading))}</h2><div>{''.join(parts)}</div></section>"
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
