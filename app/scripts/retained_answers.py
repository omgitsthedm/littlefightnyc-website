"""Render home-hidden answer routes inside the existing question library."""

from __future__ import annotations

from collections.abc import Callable, Iterable, Mapping
from html import escape
from typing import Any


Link = Callable[[str, str], str]


_EXCLUDED_IDS = frozenset({"page-library", "google-reviews"})


def _text(value: Any) -> str:
    return " ".join(str(value or "").split())


def _path(value: Any) -> str:
    path = _text(value)
    return path if path.startswith("/") else ""


def _display_title(page: Mapping[str, Any]) -> str:
    """Choose the reader's public question before its metadata title."""
    answer = page.get("answerContent")
    if isinstance(answer, Mapping):
        question = _text(answer.get("question"))
        if question:
            return question
    for key in ("heading", "title", "description"):
        value = _text(page.get(key))
        if value:
            return _text(value.split("|", 1)[0])
    raise ValueError("retained answer is missing a public question or title")


def _page_for_path(pages: Mapping[str, Any], path: str) -> Mapping[str, Any]:
    page = pages.get(path) or pages.get(path.rstrip("/") + "/")
    if not isinstance(page, Mapping):
        raise ValueError(f"retained answer route has no source page: {path}")
    return page


def _answer_item(identity: str, routes: Mapping[str, Any], pages: Mapping[str, Any], link: Link) -> str:
    path = _path(routes.get(identity))
    if not path:
        raise ValueError(f"retained answer has no local route: {identity}")
    return "<li>" + link(_display_title(_page_for_path(pages, path)), path) + "</li>"


def _group_details(group: Mapping[str, Any], routes: Mapping[str, Any], pages: Mapping[str, Any], link: Link) -> str:
    title = _text(group.get("title"))
    if not title:
        raise ValueError("retained answer group is missing a public title")
    members = group.get("absorb") or []
    if not isinstance(members, Iterable) or isinstance(members, (str, bytes)):
        raise ValueError(f"retained answer group {title!r} has invalid members")
    items = [_answer_item(_text(identity), routes, pages, link) for identity in members if _text(identity)]
    if not items:
        return ""
    return (
        '<details class="retained-question-group">'
        f"<summary>{escape(title)} +</summary>"
        "<ul>" + "".join(items) + "</ul>"
        "</details>"
    )


def _hidden_details(hidden_ids: Iterable[Any], routes: Mapping[str, Any], pages: Mapping[str, Any], link: Link) -> str:
    items = []
    for raw_identity in sorted(hidden_ids, key=str):
        identity = _text(raw_identity)
        if not identity or identity in _EXCLUDED_IDS or identity.startswith("market-"):
            continue
        items.append(_answer_item(identity, routes, pages, link))
    if not items:
        return ""
    return (
        '<details class="retained-question-group">'
        "<summary>More website questions +</summary>"
        "<ul>" + "".join(items) + "</ul>"
        "</details>"
    )


def render_retained_answers(
    groups: Iterable[Mapping[str, Any]],
    routes: Mapping[str, Any],
    pages: Mapping[str, Any],
    link: Link,
    hidden_ids: Iterable[Any] = (),
) -> str:
    """Return native disclosure groups for absorbed and home-hidden answers.

    The homepage stays focused on the consolidated cards.  The original answer
    routes remain discoverable from the established library, with a direct
    reader link for each item.  Market hubs and directory/review cards are not
    treated as answer entries here.
    """
    details = [_group_details(group, routes, pages, link) for group in groups]
    details.append(_hidden_details(hidden_ids, routes, pages, link))
    rendered = "".join(item for item in details if item)
    if not rendered:
        return ""
    return '<section class="retained-question-library" aria-label="Questions by topic">' + rendered + "</section>"
