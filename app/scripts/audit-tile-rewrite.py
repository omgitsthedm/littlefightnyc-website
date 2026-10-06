#!/usr/bin/env python3
"""Audit the rendered Little Fight rewrite catalog before a release.

The source JSON is intentionally only the authoring boundary. This audit reads
that source and the generated ``dist`` artifact, proving that the answers,
semantic Q&A, schema, links, catalog copy, and protected Lab pages survive the
compiler. It performs no browser, network, or hosted-environment work.
"""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from typing import Any
from urllib.parse import urlsplit
from service_taxonomy import override_family


APP = Path(__file__).resolve().parents[1]
CONTENT = APP / "preview-content"
PUBLIC = APP / "public"
ORIGIN = "https://littlefightnyc.com"
CATEGORY_ROUTES = {
    "web": "/services/custom-local-websites/",
    "it": "/services/it-support/",
    "consulting": "/services/tech-consulting/",
    "software": "/services/business-systems/",
}
EXPECTED_ANSWER_COUNTS = {"web": 18, "it": 32, "consulting": 11, "software": 8}
EXPECTED_HOOK_COUNTS = {"cases": 15, "albums": 8, "markets": 6}
FORBIDDEN_COPY = (
    "solutions",
    "streamline",
    "leverage",
    "seamless",
    "elevate",
    "passionate",
)
FABRICATED_LITERAL_CLAIMS = (
    "zero downtime",
    "under two minutes",
    "three seconds",
    "roughly half",
    "one in four",
    "1 in 4",
    "one visit fix",
    "under an hour",
    "half a day",
    "nine times out of ten",
    "filled her saturdays",
    "books estimates",
    "got quieter",
    "hours that are never wrong",
)
FAQ_RICH_RESULT_CLAIMS = (
    "faq rich result",
    "faq rich results",
    "google faq rich",
    "eligible for faq",
    "earn faq rich",
)
WORD = re.compile(r"\b[\w’'-]+\b", re.UNICODE)


class Node:
    def __init__(self, tag: str, attrs: dict[str, str], parent: "Node | None") -> None:
        self.tag = tag
        self.attrs = attrs
        self.parent = parent
        self.children: list[Node] = []
        self.text: list[str] = []

    @property
    def classes(self) -> set[str]:
        return set(self.attrs.get("class", "").split())


class StaticHTML(HTMLParser):
    """Minimal HTML tree and JSON-LD reader; scripts/styles never enter body text."""

    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.root = Node("#document", {}, None)
        self.stack = [self.root]
        self.jsonld: list[str] = []
        self._script_type: str | None = None
        self._script_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key: value or "" for key, value in attrs}
        node = Node(tag.lower(), values, self.stack[-1])
        self.stack[-1].children.append(node)
        if node.tag == "script":
            self._script_type = values.get("type", "").lower()
            self._script_text = []
        if node.tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if tag.lower() not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "script" and self._script_type == "application/ld+json":
            self.jsonld.append("".join(self._script_text))
        if tag == "script":
            self._script_type = None
            self._script_text = []
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data: str) -> None:
        if self._script_type == "application/ld+json":
            self._script_text.append(data)
        self.stack[-1].text.append(data)

    def visible_text(self) -> str:
        parts: list[str] = []

        def walk(node: Node, hidden: bool = False) -> None:
            is_hidden = hidden or node.tag in {"script", "style", "template", "noscript"}
            if not is_hidden:
                parts.extend(node.text)
            for child in node.children:
                walk(child, is_hidden)

        walk(self.root)
        return compact(" ".join(parts))

    def nodes(self, tag: str | None = None) -> list[Node]:
        found: list[Node] = []

        def walk(node: Node) -> None:
            if tag is None or node.tag == tag:
                found.append(node)
            for child in node.children:
                walk(child)

        walk(self.root)
        return found

    def anchors(self) -> list[str]:
        return [node.attrs["href"] for node in self.nodes("a") if node.attrs.get("href")]


def compact(value: object) -> str:
    return " ".join(str(value or "").split())


def normalized(value: object) -> str:
    return compact(value).casefold()


def output_file(dist: Path, route: str) -> Path:
    clean = urlsplit(route).path.lstrip("/")
    if not clean:
        return dist / "index.html"
    if clean.endswith("/") or "." not in Path(clean).name:
        return dist / clean / "index.html"
    return dist / clean


def read_json(path: Path, failures: list[str]) -> dict[str, Any]:
    try:
        value = json.loads(path.read_text())
    except FileNotFoundError:
        failures.append(f"missing source JSON: {path.relative_to(APP)}")
        return {}
    except json.JSONDecodeError as error:
        failures.append(f"invalid JSON in {path.relative_to(APP)}: {error}")
        return {}
    if not isinstance(value, dict):
        failures.append(f"source JSON must be an object: {path.relative_to(APP)}")
        return {}
    return value


def parse_html(path: Path, failures: list[str]) -> StaticHTML | None:
    if not path.is_file():
        failures.append(f"missing static route: {path}")
        return None
    parser = StaticHTML()
    try:
        parser.feed(path.read_text())
        parser.close()
    except Exception as error:  # HTMLParser should not take a release down silently.
        failures.append(f"cannot parse {path}: {error}")
        return None
    return parser


def schema_objects(parser: StaticHTML, route: str, failures: list[str]) -> list[dict[str, Any]]:
    objects: list[dict[str, Any]] = []
    for raw in parser.jsonld:
        try:
            value = json.loads(raw)
        except json.JSONDecodeError as error:
            failures.append(f"{route}: invalid JSON-LD: {error}")
            continue
        if isinstance(value, dict):
            objects.append(value)
        elif isinstance(value, list):
            objects.extend(item for item in value if isinstance(item, dict))
    return objects


def flatten_schema(value: Any) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    if isinstance(value, dict):
        records.append(value)
        for child in value.values():
            records.extend(flatten_schema(child))
    elif isinstance(value, list):
        for child in value:
            records.extend(flatten_schema(child))
    return records


def has_type(value: dict[str, Any], wanted: str) -> bool:
    kind = value.get("@type")
    return kind == wanted or (isinstance(kind, list) and wanted in kind)


def first_sentence(text: str) -> str:
    return re.split(r"(?<=[.!?])\s+", compact(text), maxsplit=1)[0]


def schema_answer_text(item: dict[str, Any]) -> str:
    return compact(" ".join(item[key] for key in ("answer", "detail", "nextStep")))


def next_element(node: Node) -> Node | None:
    if node.parent is None:
        return None
    siblings = node.parent.children
    try:
        index = siblings.index(node)
    except ValueError:
        return None
    return siblings[index + 1] if index + 1 < len(siblings) else None


def matches_text(haystack: str, needle: str) -> bool:
    return normalized(needle) in normalized(haystack)


def audit_source_catalog(failures: list[str]) -> tuple[dict[str, dict[str, Any]], dict[str, Any], dict[str, Any]]:
    web = read_json(CONTENT / "rewrite-web.json", failures)
    support = read_json(CONTENT / "rewrite-support.json", failures)
    hooks = read_json(CONTENT / "rewrite-hooks.json", failures)
    if not web or not support or not hooks:
        return {}, {}, {}

    raw_answers = [dict(item, category="web") for item in web.get("answers", [])]
    raw_answers.extend(support.get("answers", []))
    answers: dict[str, dict[str, Any]] = {}
    for item in raw_answers:
        identity = item.get("id")
        if not isinstance(identity, str) or not identity:
            failures.append("rewrite answer has no id")
            continue
        if identity in answers:
            failures.append(f"duplicate rewrite answer id: {identity}")
            continue
        item['category'] = override_family(identity=identity) or item['category']
        answers[identity] = item

    if len(answers) != sum(EXPECTED_ANSWER_COUNTS.values()):
        failures.append(f"rewrite requires 69 unique answers, found {len(answers)}")
    for family, expected in EXPECTED_ANSWER_COUNTS.items():
        actual = sum(item.get("category") == family for item in answers.values())
        if actual != expected:
            failures.append(f"rewrite requires {expected} {family} answers, found {actual}")

    categories = [web.get("category"), *support.get("categories", [])]
    category_by_id: dict[str, dict[str, Any]] = {}
    for category in categories:
        if not isinstance(category, dict):
            failures.append("rewrite category is not an object")
            continue
        identity = category.get("id")
        if identity in category_by_id:
            failures.append(f"duplicate rewrite category: {identity}")
            continue
        category_by_id[identity] = category
        for key in ("id", "path", "title", "summary", "metaTitle", "metaDescription"):
            if not compact(category.get(key)):
                failures.append(f"rewrite category {identity or '?'} missing {key}")
    if set(category_by_id) != set(CATEGORY_ROUTES):
        failures.append(f"rewrite categories must be {sorted(CATEGORY_ROUTES)}, found {sorted(category_by_id)}")
    for family, route in CATEGORY_ROUTES.items():
        if category_by_id.get(family, {}).get("path") != route:
            failures.append(f"rewrite {family} category route must be {route}")

    for identity, item in answers.items():
        for key in ("question", "answer", "detail", "nextStep"):
            if not compact(item.get(key)):
                failures.append(f"rewrite answer {identity} missing {key}")
        count = len(WORD.findall(first_sentence(str(item.get("answer", "")))))
        if not 15 <= count <= 25:
            failures.append(f"rewrite answer {identity} first sentence has {count} words, expected 15–25")
        total = len(WORD.findall(schema_answer_text(item)))
        if not 50 <= total <= 80:
            failures.append(f"rewrite answer {identity} has {total} words, expected 50–80")
        copy = normalized(schema_answer_text(item))
        for phrase in FORBIDDEN_COPY + FABRICATED_LITERAL_CLAIMS + FAQ_RICH_RESULT_CLAIMS:
            if phrase in copy:
                failures.append(f"rewrite answer {identity} contains prohibited copy: {phrase!r}")

    catalog_labs = json.loads((CONTENT / "labs.json").read_text())
    hook_counts = {**EXPECTED_HOOK_COUNTS, "labs": len(catalog_labs) if isinstance(catalog_labs, list) else 0}
    for family, expected in hook_counts.items():
        values = hooks.get(family)
        if not isinstance(values, dict) or len(values) != expected:
            failures.append(f"rewrite hooks must have exactly {expected} {family}, found {len(values) if isinstance(values, dict) else 0}")
    return answers, category_by_id, hooks


def audit_category_page(
    dist: Path,
    family: str,
    category: dict[str, Any],
    answers: dict[str, dict[str, Any]],
    failures: list[str],
) -> None:
    route = str(category["path"])
    parser = parse_html(output_file(dist, route), failures)
    if parser is None:
        return
    body = parser.visible_text()
    title_node = next(iter(parser.nodes("title")), None)
    if title_node is None or compact(" ".join(title_node.text)) != compact(category["metaTitle"]):
        failures.append(f"{route}: document title must match rewritten metaTitle")
    description = next((node.attrs.get("content", "") for node in parser.nodes("meta")
                        if node.attrs.get("name", "").casefold() == "description"), "")
    if compact(description) != compact(category["metaDescription"]):
        failures.append(f"{route}: meta description must match rewritten metaDescription")
    if not matches_text(body, category["title"]):
        failures.append(f"{route}: generated body omits rewritten category title")
    if not matches_text(body, category["summary"]):
        failures.append(f"{route}: generated body omits rewritten category summary")

    html_answers = [item for item in answers.values() if item["category"] == family]
    for item in html_answers:
        for key in ("question", "answer", "detail", "nextStep"):
            if not matches_text(body, item[key]):
                failures.append(f"{route}: initial static body omits {item['id']} {key}")
        h3 = next((node for node in parser.nodes("h3") if compact(" ".join(node.text)) == compact(item["question"])), None)
        if h3 is None:
            failures.append(f"{route}: {item['id']} question must be an H3")
        else:
            paragraph = next_element(h3)
            if paragraph is None or paragraph.tag != "p" or not matches_text(" ".join(paragraph.text), item["answer"]):
                failures.append(f"{route}: {item['id']} H3 must be followed immediately by its direct-answer paragraph")

    nodes = [node for root in schema_objects(parser, route, failures) for node in flatten_schema(root)]
    faq_pages = [node for node in nodes if has_type(node, "FAQPage")]
    if len(faq_pages) != 1:
        failures.append(f"{route}: needs exactly one FAQPage schema object, found {len(faq_pages)}")
    else:
        entities = faq_pages[0].get("mainEntity")
        if not isinstance(entities, list):
            failures.append(f"{route}: FAQPage mainEntity must be a list")
        else:
            schema_map: dict[str, str] = {}
            for entity in entities:
                if not isinstance(entity, dict) or not has_type(entity, "Question"):
                    failures.append(f"{route}: FAQPage contains a non-Question entity")
                    continue
                question = compact(entity.get("name"))
                accepted = entity.get("acceptedAnswer")
                text = compact(accepted.get("text")) if isinstance(accepted, dict) and has_type(accepted, "Answer") else ""
                if not question or not text:
                    failures.append(f"{route}: FAQPage Question requires name and acceptedAnswer.text")
                    continue
                if question in schema_map:
                    failures.append(f"{route}: duplicate FAQPage Question: {question}")
                schema_map[question] = text
            expected_map = {compact(item["question"]): schema_answer_text(item) for item in html_answers}
            if set(schema_map) != set(expected_map):
                failures.append(f"{route}: FAQPage questions do not exactly match the {family} static Q&A")
            for question, answer in expected_map.items():
                if compact(schema_map.get(question)) != compact(answer):
                    failures.append(f"{route}: FAQPage answer differs from visible Q&A for {question!r}")

    lower_body = normalized(body)
    for phrase in FAQ_RICH_RESULT_CLAIMS:
        if phrase in lower_body:
            failures.append(f"{route}: published copy makes a retired FAQ rich-result claim: {phrase!r}")
    robots = next((node.attrs.get("content", "") for node in parser.nodes("meta")
                   if node.attrs.get("name", "").casefold() == "robots"), "")
    if "index" not in robots.casefold() or "follow" not in robots.casefold():
        failures.append(f"{route}: category must be indexable and followable")
    canonical = next((node.attrs.get("href", "") for node in parser.nodes("link")
                      if "canonical" in node.attrs.get("rel", "").casefold().split()), "")
    if canonical != ORIGIN + route:
        failures.append(f"{route}: canonical must be {ORIGIN + route}")
    if not any(has_type(node, "Service") for node in nodes):
        failures.append(f"{route}: category JSON-LD must include a Service object")


def audit_answer_routes(
    dist: Path,
    answers: dict[str, dict[str, Any]],
    category_by_id: dict[str, dict[str, Any]],
    failures: list[str],
) -> None:
    for identity, item in answers.items():
        route = f"/answers/help/{identity}/"
        parser = parse_html(output_file(dist, route), failures)
        if parser is None:
            continue
        body = parser.visible_text()
        for key in ("question", "answer", "detail", "nextStep"):
            if not matches_text(body, item[key]):
                failures.append(f"{route}: retained answer route omits rewritten {key} for {identity}")
        service_path = str(category_by_id[item["category"]]["path"])
        anchor_paths = {urlsplit(href).path for href in parser.anchors()}
        if service_path not in anchor_paths:
            failures.append(f"{route}: must link back to {service_path}")


def audit_hook_coverage(dist: Path, hooks: dict[str, Any], failures: list[str]) -> None:
    html_files = [path for path in dist.rglob("*.html") if not path.relative_to(dist).as_posix().startswith("vera/")]
    if not html_files:
        failures.append(f"{dist}: no generated HTML files")
        return
    rendered_parts: list[str] = []
    for path in html_files:
        parser = parse_html(path, failures)
        if parser is not None:
            rendered_parts.append(parser.visible_text())
    rendered = " ".join(rendered_parts)
    required: list[tuple[str, str]] = []
    for family in ("cases", "labs", "markets"):
        for identity, item in hooks.get(family, {}).items():
            required.append((f"{family}:{identity}", str(item.get("summary", ""))))
    for identity, item in hooks.get("albums", {}).items():
        required.append((f"albums:{identity}", str(item.get("summary", ""))))
        for section in item.get("sections", []):
            required.append((f"albums:{identity}:heading", str(section.get("heading", ""))))
            required.append((f"albums:{identity}:body", str(section.get("body", ""))))
    for identity, summary in required:
        if not compact(summary):
            failures.append(f"rewrite hook {identity} has no publishable text")
        elif not matches_text(rendered, summary):
            failures.append(f"generated HTML omits rewrite hook {identity}")


def audit_standalone_labs(dist: Path, hooks: dict[str, Any], failures: list[str]) -> None:
    for slug in hooks.get("labs", {}):
        source = PUBLIC / "examples" / "lab" / "concepts" / slug / "index.html"
        generated = dist / "examples" / "lab" / "concepts" / slug / "index.html"
        if not source.is_file():
            failures.append(f"protected Lab source is missing: {source.relative_to(APP)}")
            continue
        if not generated.is_file():
            failures.append(f"protected Lab output is missing: {generated.relative_to(dist)}")
            continue
        if source.read_bytes() != generated.read_bytes():
            failures.append(f"protected Lab output changed bytes: /examples/lab/concepts/{slug}/")


def audit_homepage_inventory(dist: Path, failures: list[str]) -> None:
    inventory_path = dist / "homepage-inventory.json"
    try:
        inventory = json.loads(inventory_path.read_text())
    except FileNotFoundError:
        failures.append("dist/homepage-inventory.json is missing")
        return
    except json.JSONDecodeError as error:
        failures.append(f"dist/homepage-inventory.json is invalid: {error}")
        return
    visible = inventory.get("visibleTiles")
    retained = inventory.get("retainedRoutes")
    catalog_labs = json.loads((CONTENT / "labs.json").read_text())
    added_labs = max(0, len(catalog_labs) - 9) if isinstance(catalog_labs, list) else 0
    expected_total = 129 + added_labs + 1
    if inventory.get("sourceTileCount") != 106 or inventory.get("totalTileInventory") != expected_total:
        failures.append(f"homepage inventory must preserve 106 original tiles within {expected_total} retained routes")
    expected_visible = 77 + added_labs + 1
    if not isinstance(visible, list) or len(visible) != expected_visible:
        failures.append(f"homepage inventory must expose exactly {expected_visible} tiles")
    if not isinstance(retained, list) or len(retained) != expected_total:
        failures.append(f"homepage inventory must retain exactly {expected_total} tile routes")
    if not isinstance(inventory.get("groups"), list) or len(inventory["groups"]) != 19:
        failures.append("homepage inventory must retain exactly 19 consolidated groups")
    if isinstance(visible, list):
        ids = [item.get("id") for item in visible if isinstance(item, dict)]
        if len(ids) != len(set(ids)):
            failures.append("homepage visible tiles must have unique ids")
        if any(str(item.get("family", "")).casefold() == "places" for item in visible if isinstance(item, dict)):
            failures.append("homepage must not expose Places tiles")
    home = parse_html(dist / "index.html", failures)
    if home and re.search(r'data-(?:family|category)=["\']places["\']', (dist / "index.html").read_text(), re.I):
        failures.append("homepage HTML must not render Places tiles")


def audit_date_policy(dist: Path, failures: list[str]) -> None:
    """FAQPage can describe visible Q&A, but must not be sold as a rich-result tactic."""
    for path in dist.rglob("*.html"):
        if path.relative_to(dist).as_posix().startswith("vera/"):
            continue
        parser = parse_html(path, failures)
        if parser is None:
            continue
        body = normalized(parser.visible_text())
        for phrase in FAQ_RICH_RESULT_CLAIMS:
            if phrase in body:
                failures.append(f"{route_for(path, dist)}: published copy makes a retired FAQ rich-result claim: {phrase!r}")
        for phrase in ("product marketing context", "publication constraints for this build"):
            if phrase in body:
                failures.append(f"{route_for(path, dist)}: private copywriting context was published")
    if (dist / ".agents").exists():
        failures.append("Private .agents authoring context must not enter the published artifact")


def route_for(path: Path, dist: Path) -> str:
    relative = path.relative_to(dist)
    if relative.name == "index.html":
        parent = relative.parent.as_posix()
        return "/" if parent == "." else f"/{parent}/"
    return "/" + relative.as_posix()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dist", type=Path, default=APP / "dist", help="Generated artifact root (default: app/dist)")
    args = parser.parse_args()
    dist = args.dist.resolve()
    failures: list[str] = []
    answers, category_by_id, hooks = audit_source_catalog(failures)
    if not dist.is_dir():
        failures.append(f"generated artifact directory is missing: {dist}")
    elif answers and set(category_by_id) == set(CATEGORY_ROUTES) and hooks:
        for family, route in CATEGORY_ROUTES.items():
            audit_category_page(dist, family, category_by_id[family], answers, failures)
        audit_answer_routes(dist, answers, category_by_id, failures)
        audit_hook_coverage(dist, hooks, failures)
        audit_standalone_labs(dist, hooks, failures)
        audit_homepage_inventory(dist, failures)
        audit_date_policy(dist, failures)

    if failures:
        print("TILE REWRITE AUDIT FAILED")
        for failure in failures:
            print("- " + failure)
        return 1
    print("TILE REWRITE AUDIT PASSED")
    print("- 69 rewritten answers: web 18, IT 32, consulting 11, software 8")
    print("- category Q&A, FAQPage parity, service backlinks, hooks, Lab bytes, and full hub inventory verified")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
