"""Audit the generated Little Fight tile artifact before a hosted review or release.

This intentionally audits the files Netlify would receive.  It does not boot a
browser, submit a form, or make a network request.
"""

from __future__ import annotations

import argparse
from html.parser import HTMLParser
import json
from pathlib import Path
import posixpath
import re
import subprocess
import sys
from urllib.parse import unquote, urlsplit

from tile_content import filtered_legacy_blocks


APP = Path(__file__).resolve().parents[1]
REPO = APP.parent
CONTENT = APP / "preview-content"
PUBLIC = APP / "public"
ORIGIN = "https://littlefightnyc.com"
EXPECTED_TOTAL_TILE_INVENTORY = 129
EXPECTED_ORIGINAL_TILE_COUNT = 106
EXPECTED_REVIEW_TILE_COUNT = 7
EXPECTED_REVIEW_DISTRIBUTION = {
    "topic-web": 2,
    "topic-it": 2,
    "topic-consulting": 2,
    "topic-software": 1,
}
EXPECTED_ROUTE_COUNT = 400
EXPECTED_CONSOLIDATED_GROUP_COUNT = 19
NAVIGATION_AFFORDANCE = re.compile(r"[↗↘↙↖→←↑↓➜➔⤴]")
# Credits are public attribution, not imported source markup.  A malformed
# Wikimedia extraction once stored page CSS in the photographer field and
# rendered it as a 1,100px caption.  Keep the source field plain text so every
# credit remains readable while its license and original-source links stay in
# the generated figure.
UNSAFE_PHOTO_CREDIT = re.compile(r"<|>|\.mw-parser-output|@(?:media|import)|[{}]", re.I)
# This must mirror the compiler's preserved-app boundary.  A reader companion
# may be generated under /_readers/, while the public application itself keeps
# its own document, robots policy, and byte-for-byte source copy.
STANDALONE = ("/vera/", "/examples/audit/", "/examples/lab/", "/ads/", "/myspace-demo/")
NOINDEX_PREFIXES = ("/markets/", "/photos/", "/areas/", "/answers/help/", "/_readers/")
# Dedicated VERA documents are rendered after the marketing compiler from its
# protected core and pinned public archive. Preserve their existing policy.
VERA_DOCUMENTS = ("/vera/manual/", "/vera/archive/")
RETIRED_PUBLISHED_ASSETS = (
    "media/cabinetry-process-film-720-3d0d35f6.mp4",
    "media/cabinetry-process-poster-c6d59dbc.webp",
    "media/cabinetry-process-film-540-1a0bac73.mp4",
    "media/cabinetry-process-share-0a7876df.webp",
    "assets/proof/case-public-house-creative.webp",
    "assets/proof/optimized/tile-public-house-creative-480.webp",
)
RETIRED_PUBLISHED_DIRECTORIES = ("brand-kit",)
RETIRED_PUBLISHED_PATH_MARKERS = ("/brand-kit",)
FORBIDDEN_PUBLISHED_MARKERS = (
    "public house creative",
    "public-house-creative",
    "case-public-house-creative",
    "cockpit",
    "cabinetry",
)
INTERNAL_PROJECT_MARKERS = (
    "project notes",
    "project context",
    "behind the scenes",
    "private work",
    "project records",
    "build history",
    "next milestone",
    "last verified",
    "lastverified",
    "claims ledger",
    "internal notes",
    "qa notes",
    "qa status",
    "quality assurance notes",
    "bug tracker",
    "bug list",
    "known bugs",
    "approval notes",
    "approval status",
    "next milestones",
    "nextmilestone",
    "milestone status",
    "project status",
    "release checklist",
    "internal tracking",
    "upgrade log",
    "upgrade notes",
    "upgrade status",
    "client work —",
    "public work, live",
)
TEXT_ARTIFACT_SUFFIXES = {".html", ".css", ".js", ".json", ".txt", ".xml"}


class References(HTMLParser):
    """Collect only static URLs in generated HTML without executing it."""

    def __init__(self) -> None:
        super().__init__()
        self.urls: list[tuple[str, str]] = []
        self.tiles: list[str] = []
        self.tile_records: list[dict[str, str]] = []
        self.anchors: list[tuple[str, str]] = []
        self.text: list[str] = []
        self._anchor_href: str | None = None
        self._anchor_text: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        for name in ("href", "src", "poster", "action", "data-reader-src"):
            value = values.get(name)
            if value:
                self.urls.append((name, value))
        if values.get("srcset"):
            for candidate in values["srcset"].split(","):
                url = candidate.strip().split(" ", 1)[0]
                if url:
                    self.urls.append(("srcset", url))
        if tag == "a":
            classes = (values.get("class") or "").split()
            if "tile" in classes and values.get("href"):
                self.tiles.append(values["href"])
                self.tile_records.append({key: value or "" for key, value in values.items()})
            self._anchor_href = values.get("href")
            self._anchor_text = []

    def handle_data(self, data: str) -> None:
        self.text.append(data)
        if self._anchor_href is not None:
            self._anchor_text.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self._anchor_href is not None:
            self.anchors.append((self._anchor_href, " ".join("".join(self._anchor_text).split())))
            self._anchor_href = None
            self._anchor_text = []


class TopicReviewDistribution(HTMLParser):
    """Locate sourced review tiles inside the four semantic hub sections."""

    def __init__(self) -> None:
        super().__init__()
        self.sections: list[str] = []
        self._section_stack: list[str] = []
        self.reviews: dict[str, list[str]] = {topic: [] for topic in EXPECTED_REVIEW_DISTRIBUTION}
        self.outside_topic = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if tag == "section":
            identity = values.get("id") or ""
            self._section_stack.append(identity)
            if identity:
                self.sections.append(identity)
            return
        if tag != "a" or "data-review-tile" not in values:
            return
        topic = next((identity for identity in reversed(self._section_stack)
                      if identity in EXPECTED_REVIEW_DISTRIBUTION), None)
        if topic is None:
            self.outside_topic += 1
            return
        self.reviews[topic].append(values.get("data-review-id") or values.get("href") or "")

    def handle_endtag(self, tag: str) -> None:
        if tag == "section" and self._section_stack:
            self._section_stack.pop()


def compact(value: object) -> str:
    return " ".join(str(value or "").split())


def display(value: object) -> str:
    displayed = str(value or "").replace("Hair By Rachel Charles", "Hair By Rachel").replace(
        "Hair by Rachel Charles", "Hair By Rachel"
    )
    # The compiler changes navigation affordances to a plus mark. Compare the
    # authored source with that approved presentation transform while keeping
    # every surrounding paragraph and link label under audit.
    return NAVIGATION_AFFORDANCE.sub("+", displayed)


def output_file(root: Path, route: str) -> Path:
    clean = route.lstrip("/")
    if not clean:
        return root / "index.html"
    if clean.endswith("/") or "." not in Path(clean).name:
        return root / clean / "index.html"
    return root / clean


def route_for_file(root: Path, file: Path) -> str:
    relative = file.relative_to(root)
    if relative.name == "index.html":
        parent = relative.parent.as_posix()
        return "/" if parent == "." else "/" + parent + "/"
    return "/" + relative.as_posix()


def source_pages() -> dict[str, dict]:
    pages: dict[str, dict] = {}
    for name in ("live-pages.json", "answer-pages.json", "market-pages.json", "pages.json"):
        for page in json.loads((CONTENT / name).read_text()):
            pages[page["path"]] = page
    for album in json.loads((CONTENT / "albums.json").read_text()):
        route = f"/photos/{album['id'].removeprefix('album-')}/"
        pages[route] = {"path": route, "id": album["id"]}
    for tile in json.loads((CONTENT / "topic-tiles.json").read_text()):
        route = f"/answers/help/{tile['id']}/"
        pages[route] = {"path": route, "id": tile["id"], "category": tile["family"]}
    for route in ("/reviews/", "/websites-for-your-business/", "/tech-audit/", "/thanks/", "/services/it-support/"):
        pages[route] = {"path": route, "id": route}
    return pages


def homepage_inventory(dist: Path, failures: list[str]) -> dict | None:
    """Read the compiler's accounting of every original tile and route.

    Consolidation changes what is visible on the hub; it must never erase a
    destination, search entry, or reader.  This small manifest makes that
    distinction auditable without treating a shorter hub as lost content.
    """
    inventory_file = dist / "homepage-inventory.json"
    if not inventory_file.is_file():
        failures.append("dist/homepage-inventory.json is missing")
        return None
    try:
        data = json.loads(inventory_file.read_text())
    except json.JSONDecodeError as error:
        failures.append(f"homepage inventory is not valid JSON: {error}")
        return None
    if not isinstance(data, dict):
        failures.append("homepage inventory must be a JSON object")
        return None

    for field in ("visibleTiles", "retainedRoutes", "groups", "hiddenHomeIds"):
        if not isinstance(data.get(field), list):
            failures.append(f"homepage inventory {field} must be a list")
    if failures and any(message.startswith("homepage inventory") for message in failures):
        return None
    if data.get("sourceTileCount") != EXPECTED_ORIGINAL_TILE_COUNT:
        failures.append(
            f"homepage inventory has {data.get('sourceTileCount')} source tiles, "
            f"expected {EXPECTED_ORIGINAL_TILE_COUNT}"
        )
    if data.get("totalTileInventory") != EXPECTED_TOTAL_TILE_INVENTORY:
        failures.append(
            f"homepage inventory has {data.get('totalTileInventory')} total tiles, "
            f"expected {EXPECTED_TOTAL_TILE_INVENTORY}"
        )
    if len(data["groups"]) != EXPECTED_CONSOLIDATED_GROUP_COUNT:
        failures.append(
            f"homepage inventory has {len(data['groups'])} consolidated groups, "
            f"expected {EXPECTED_CONSOLIDATED_GROUP_COUNT}"
        )

    visible_ids = [item.get("id") for item in data["visibleTiles"] if isinstance(item, dict)]
    route_ids = [item.get("id") for item in data["retainedRoutes"] if isinstance(item, dict)]
    if len(visible_ids) != len(data["visibleTiles"]) or not all(isinstance(item, str) and item for item in visible_ids):
        failures.append("homepage inventory visible tiles need stable ids")
    if len(route_ids) != len(data["retainedRoutes"]) or not all(isinstance(item, str) and item for item in route_ids):
        failures.append("homepage inventory retained routes need stable ids")
    if len(set(visible_ids)) != len(visible_ids):
        failures.append("homepage inventory repeats a visible tile id")
    if len(set(route_ids)) != len(route_ids):
        failures.append("homepage inventory repeats a retained route id")
    if len(route_ids) != EXPECTED_TOTAL_TILE_INVENTORY:
        failures.append(
            f"homepage inventory retains {len(route_ids)} tile routes, "
            f"expected {EXPECTED_TOTAL_TILE_INVENTORY}"
        )

    member_ids: list[str] = []
    group_ids: list[str] = []
    for group in data["groups"]:
        if not isinstance(group, dict):
            failures.append("homepage inventory group must be an object")
            continue
        group_id = group.get("id")
        members = group.get("members")
        group_path = group.get("path")
        if not isinstance(group_id, str) or not group_id or not isinstance(group_path, str) or not group_path.startswith("/"):
            failures.append("homepage inventory group needs an id and local path")
        else:
            group_ids.append(group_id)
        if not isinstance(members, list) or not all(isinstance(member, str) and member for member in members):
            failures.append(f"homepage inventory group {group_id or '?'} needs member ids")
        else:
            member_ids.extend(members)
    if len(set(group_ids)) != len(group_ids):
        failures.append("homepage inventory repeats a consolidated group id")

    hidden_ids = data["hiddenHomeIds"]
    if not all(isinstance(item, str) and item for item in hidden_ids):
        failures.append("homepage inventory hidden home ids must be non-empty strings")
    removed_from_home = set(member_ids) | set(hidden_ids)
    if len(data["visibleTiles"]) != EXPECTED_TOTAL_TILE_INVENTORY - len(removed_from_home):
        failures.append(
            "homepage inventory visible count does not equal total inventory minus unique absorbed/hidden ids"
        )
    if set(visible_ids) & removed_from_home:
        failures.append("homepage inventory marks a visible tile as absorbed or hidden")
    if set(route_ids) != set(visible_ids) | removed_from_home:
        failures.append("homepage inventory routes do not account for visible and absorbed/hidden tile ids")
    for item in data["visibleTiles"]:
        if (not isinstance(item, dict) or not isinstance(item.get("path"), str)
                or not item["path"].startswith(("/", "http://", "https://"))):
            failures.append("homepage inventory visible tile needs a local or attributed external path")
    for item in data["retainedRoutes"]:
        if not isinstance(item, dict):
            failures.append("homepage inventory retained route must be an object")
            continue
        for field in ("path", "title", "homePath"):
            value = item.get(field)
            if not isinstance(value, str) or not value:
                failures.append(f"homepage inventory retained route {item.get('id') or '?'} lacks {field}")
        if isinstance(item.get("path"), str) and not item["path"].startswith(("/", "http://", "https://")):
            failures.append(f"homepage inventory retained route {item.get('id') or '?'} has an invalid path")
    return data


def consolidated_groups(failures: list[str]) -> list[dict]:
    """Load the authored consolidation bodies that replace compact hub cards."""
    groups: list[dict] = []
    for name in ("consolidated-web.json", "consolidated-support.json"):
        source = CONTENT / name
        if not source.is_file():
            failures.append(f"consolidated content source is missing: {name}")
            continue
        try:
            data = json.loads(source.read_text())
        except json.JSONDecodeError as error:
            failures.append(f"consolidated content source is invalid: {name}: {error}")
            continue
        if not isinstance(data.get("groups"), list):
            failures.append(f"consolidated content source has no group list: {name}")
            continue
        groups.extend(group for group in data["groups"] if isinstance(group, dict))
    ids = [group.get("id") for group in groups]
    if len(groups) != EXPECTED_CONSOLIDATED_GROUP_COUNT or len(set(ids)) != len(ids):
        failures.append(f"consolidated sources must contain {EXPECTED_CONSOLIDATED_GROUP_COUNT} distinct groups")
    from tile_rewrite import load_rewrite, prepare_groups
    prepare_groups(groups, load_rewrite(CONTENT))
    return groups


def consolidated_readers_ok(dist: Path, groups: list[dict], failures: list[str]) -> set[str]:
    """Check every compacted question still has its authored replacement story."""
    paths: set[str] = set()
    for group in groups:
        identity = compact(group.get("id")) or "unknown group"
        route = group.get("path")
        if not isinstance(route, str) or not route.startswith("/"):
            failures.append(f"consolidated group {identity} lacks a local route")
            continue
        paths.add(route)
        target = output_file(dist, route)
        if not target.is_file():
            failures.append(f"consolidated group {identity} reader is missing: {route}")
            continue
        source = target.read_text(errors="replace")
        rendered = References()
        rendered.feed(source)
        text = compact(" ".join(rendered.text))
        anchor_family = {'/services/it-support/':'it', '/services/tech-consulting/':'consulting', '/services/business-systems/':'software'}.get(route)
        if anchor_family:
            anchor = json.loads((CONTENT / 'anchor-bodies.json').read_text())[anchor_family]
            if 'data-reader-template="anchor-service"' not in source or 'anchor-story-body' not in source:
                failures.append(f"anchor {identity} is missing its full story reader")
            body = References()
            body.feed(anchor['body'])
            for value in [anchor['title'], anchor['summary'], *body.text]:
                if compact(value) and compact(display(value)) not in text:
                    failures.append(f"anchor {identity} lost authored story text: {compact(value)[:90]}")
            if source.count('data-rw-scene=') != anchor['sceneCount'] + 1:
                failures.append(f"anchor {identity} lost an authored story scene")
            continue
        if group.get("preserveReader"):
            # The Website reader remains its richer, approved bespoke story;
            # the new group adds a factual FAQ without replacing that body.
            for faq in group.get("faqs") or []:
                for value in (faq.get("question"), faq.get("answer")):
                    if compact(value) and compact(display(value)) not in text:
                        failures.append(f"consolidated group {identity} lost its added Website FAQ text")
            continue
        if 'data-reader-template="combined-story"' not in source or "group-story" not in source:
            failures.append(f"consolidated group {identity} is missing its combined reader template")
        for value in (group.get("heading"), group.get("summary")):
            if compact(value) and compact(display(value)) not in text:
                failures.append(f"consolidated group {identity} lost its reader heading or summary")
        for section in group.get("sections") or []:
            for value in [section.get("heading"), *(section.get("paragraphs") or []), *(section.get("bullets") or [])]:
                if compact(value) and compact(display(value)) not in text:
                    failures.append(f"consolidated group {identity} lost authored section text: {compact(value)[:90]}")
            anchor_pairs = set(rendered.anchors)
            for item in section.get("links") or []:
                label, href = compact(item.get("label")), item.get("href")
                if label and href and (href, label) not in anchor_pairs:
                    failures.append(f"consolidated group {identity} lost authored section link: {label}")
    return paths


def source_is_standalone(route: str) -> bool:
    return route.startswith(STANDALONE) and output_file(PUBLIC, route).is_file()


def generated_route(route: str) -> str:
    return f"/_readers{route}" if source_is_standalone(route) else route


def route_meta() -> dict[str, dict]:
    data = json.loads((APP / "src/data/route-meta.json").read_text())
    return {page["path"]: page for page in data["pages"]}


def indexable(route: str, meta: dict[str, dict]) -> bool:
    if route in ("/thanks/", "/404/") or route.startswith(NOINDEX_PREFIXES):
        return False
    existing = meta.get(route)
    if existing:
        return not existing.get("noindex", False) and existing.get("canonical", route) in (route, ORIGIN + route)
    return route == "/" or route in ("/reviews/", "/websites-for-your-business/", "/how-we-help/") or route.startswith("/industries/")


def redirect_patterns() -> list[re.Pattern[str]]:
    patterns: list[re.Pattern[str]] = []
    for raw in (PUBLIC / "_redirects").read_text().splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        source = line.split()[0]
        if not source.startswith("/"):
            continue
        escaped = re.escape(source)
        escaped = escaped.replace(r"\*", ".*")
        escaped = re.sub(r":([A-Za-z][A-Za-z0-9_]*)", r"[^/]+", escaped)
        patterns.append(re.compile("^" + escaped + "$"))
    return patterns


def route_or_redirect(root: Path, route: str, patterns: list[re.Pattern[str]]) -> bool:
    if output_file(root, route).is_file():
        return True
    return any(pattern.fullmatch(route) for pattern in patterns)


def local_url(value: str, from_route: str) -> str | None:
    if not value or value.startswith(("#", "data:", "mailto:", "tel:", "sms:", "javascript:")):
        return None
    parsed = urlsplit(value)
    if parsed.scheme in ("http", "https"):
        if parsed.hostname not in ("littlefightnyc.com", "www.littlefightnyc.com"):
            return None
        candidate = parsed.path or "/"
    elif parsed.netloc:
        return None
    else:
        candidate = parsed.path
        if not candidate:
            return None
        if not candidate.startswith("/"):
            candidate = posixpath.normpath(posixpath.join(posixpath.dirname(from_route), candidate))
            candidate = "/" + candidate.lstrip("/")
    return unquote(candidate)


def css_urls(source: str) -> list[str]:
    return [match.group(1).strip().strip("'\"") for match in re.finditer(r"url\(\s*([^)]*?)\s*\)", source, re.I)]


def public_tree_matches(source: Path, destination: Path, label: str, failures: list[str]) -> int:
    checked = 0
    for file in source.rglob("*"):
        if not file.is_file():
            continue
        checked += 1
        copied = destination / file.relative_to(source)
        if not copied.is_file():
            failures.append(f"{label}: missing preserved file {file.relative_to(source)}")
        elif file.read_bytes() != copied.read_bytes():
            failures.append(f"{label}: changed preserved file {file.relative_to(source)}")
    return checked


def public_project_boundary_ok(dist: Path, failures: list[str], marketing_routes: set[str]) -> None:
    """Prove retired project traces and source-only media cannot ship."""
    for relative in RETIRED_PUBLISHED_ASSETS:
        if (dist / relative).exists():
            failures.append(f"retired private-project media shipped: /{relative}")
    for relative in RETIRED_PUBLISHED_DIRECTORIES:
        if (dist / relative).exists():
            failures.append(f"retired private-project directory shipped: /{relative}/")
    for file in dist.rglob("*"):
        if not file.is_file() or file.suffix.lower() not in TEXT_ARTIFACT_SUFFIXES:
            continue
        source = file.read_text(errors="replace").lower()
        route = route_for_file(dist, file) if file.suffix.lower() == ".html" else "/" + file.relative_to(dist).as_posix()
        for marker in FORBIDDEN_PUBLISHED_MARKERS:
            if marker in source:
                failures.append(f"{route}: retired private-project marker shipped: {marker}")
        for marker in RETIRED_PUBLISHED_PATH_MARKERS:
            if marker in source:
                failures.append(f"{route}: omitted private-project path shipped: {marker}")
        if route in marketing_routes:
            for marker in INTERNAL_PROJECT_MARKERS:
                if marker in source:
                    failures.append(f"{route}: internal project tracking leaked: {marker}")


def native_form_ok(dist: Path, failures: list[str]) -> None:
    detector = dist / "__forms.html"
    if not detector.is_file():
        failures.append("native form detector app/dist/__forms.html is missing")
        return
    source = detector.read_text()
    required = (
        'data-internal-form-detector="true"',
        'name="tech-audit-scratch"',
        'method="POST"',
        'action="/thanks/"',
        'data-netlify="true"',
        'netlify-honeypot="bot-field"',
        'name="form-name" value="tech-audit-scratch"',
        'name="bot-field"',
        'name="name"',
        'name="business"',
        'name="contact"',
        'name="follow_up"',
        'name="message"',
    )
    for marker in required:
        if marker not in source:
            failures.append(f"native form detector is missing {marker}")


class ReaderAnatomy(HTMLParser):
    """Collect the structural signals a tile reader needs without executing it."""

    def __init__(self) -> None:
        super().__init__()
        self.classes: set[str] = set()
        self.tag_counts: dict[str, int] = {}
        self._stack: list[set[str]] = []
        self._section_text: list[list[str]] = []
        self.section_words = 0
        self.hero_visuals = 0
        self.direct_contact = False
        self.working_actions: set[str] = set()

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tag_counts[tag] = self.tag_counts.get(tag, 0) + 1
        values = dict(attrs)
        classes = set((values.get("class") or "").split())
        # Keep the visual requirement while allowing task answers to place
        # their illustration after the practical guidance instead of in the hero.
        if "rw-hero-intro" in classes or "answer-visual" in classes:
            classes.add("story-art")
        self.classes.update(classes)
        if "direct-contact-rail" in classes:
            self.direct_contact = True
        if tag == "a" and values.get("href"):
            self.working_actions.add(values["href"])
        if any("story-art" in ancestors for ancestors in self._stack) and (
            tag == "img" or "reader-context-visual" in classes or "reader-context-icon" in classes
        ):
            self.hero_visuals += 1
        if "story-section" in classes or "group-chapter" in classes:
            self._section_text.append([])
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}:
            self._stack.append(classes)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)

    def handle_data(self, data: str) -> None:
        if self._section_text:
            self._section_text[-1].append(data)

    def handle_endtag(self, tag: str) -> None:
        if (tag == "section" and self._section_text and self._stack
                and ({"story-section", "group-chapter"} & self._stack[-1])):
            self.section_words += len(compact(" ".join(self._section_text.pop())).split())
        if tag not in {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"} and self._stack:
            self._stack.pop()


def protected_reader_contract(dist: Path, tile: dict[str, str], failures: list[str]) -> bool:
    """Check a generated companion without opening or changing its protected app."""
    identity = tile.get("data-answer") or tile.get("href") or "protected tile"
    companion_route = local_url(tile.get("data-reader-src", ""), "/")
    if companion_route is None:
        failures.append(f"protected tile {identity} has an invalid companion reader target")
        return False
    target = output_file(dist, companion_route)
    if not target.is_file():
        failures.append(f"protected tile {identity} companion reader is missing: {companion_route}")
        return False
    anatomy = ReaderAnatomy()
    anatomy.feed(target.read_text(errors="replace"))
    required_classes = {"story-hero", "story-summary", "story-art", "story-contact"}
    missing = sorted(required_classes - anatomy.classes)
    if not anatomy.direct_contact:
        missing.append("direct contact rail")
    if anatomy.hero_visuals < 1:
        missing.append("contextual visual/icon")
    if anatomy.section_words < 40:
        missing.append("substantive explanation")
    public_href = tile.get("href", "")
    if public_href not in anatomy.working_actions:
        missing.append("working experience next step")
    if missing:
        failures.append(f"protected tile {identity} companion reader is missing {', '.join(missing)}")
        return False
    return True


def tile_reader_contract(dist: Path, home: References, failures: list[str]) -> None:
    """Prove each marketing tile has a full static reader, not a bare route.

    External Google-review cards are attribution links. Protected Labs and VERA
    retain their working applications, while their generated companions must
    still carry context, a visual, an explanation, and a route back into that
    working experience.
    """
    checked = 0
    exempt_external = 0
    exempt_apps = 0
    for tile in home.tile_records:
        href = tile.get("href", "")
        if href.startswith(("https://", "http://")):
            exempt_external += 1
            continue
        if tile.get("data-reader-src"):
            exempt_apps += 1
            protected_reader_contract(dist, tile, failures)
            continue
        route = local_url(href, "/")
        if route is None:
            failures.append(f"tile {tile.get('data-answer') or href} has no local reader destination")
            continue
        target = output_file(dist, route)
        if not target.is_file():
            failures.append(f"tile {tile.get('data-answer') or href} reader document is missing: {route}")
            continue
        document = target.read_text(errors="replace")
        anatomy = ReaderAnatomy()
        anatomy.feed(document)
        if tile.get("data-editorial-front") in {"web", "it", "consulting", "software", "brand"}:
            if document.count('data-rw-scene=') < 5 or 'FAQPage' not in document:
                failures.append(f"anchor {tile.get('data-answer')} needs a full static story and matching answer schema")
        checked += 1
        identity = tile.get("data-answer") or route
        if "review-collection" in anatomy.classes:
            if not anatomy.direct_contact or anatomy.tag_counts.get('h1',0) != 1 or anatomy.tag_counts.get('blockquote',0) < 6 or 'rw-review-tile' not in anatomy.classes or 'story-contact' not in anatomy.classes:
                failures.append(f"tile {identity} review collection is missing its source-linked review tiles or contact")
            continue
        if "case-opening" in anatomy.classes:
            required_classes = {"case-opening", "case-chapter", "story-contact"}
            missing = sorted(required_classes - anatomy.classes)
            if not anatomy.direct_contact:
                missing.append("direct contact rail")
            if missing or anatomy.tag_counts.get("h1", 0) < 1 or anatomy.tag_counts.get("img", 0) < 1:
                failures.append(f"tile {identity} case reader is missing context, explanation, image, or contact: {', '.join(missing) or 'h1/image'}")
            continue
        required_classes = {"story-hero", "story-title", "story-summary", "story-art", "story-contact"}
        missing = sorted(required_classes - anatomy.classes)
        if not anatomy.direct_contact:
            missing.append("direct contact rail")
        if anatomy.hero_visuals < 1:
            missing.append("contextual visual/icon")
        # A sourced review collection is a complete explanatory body in its
        # own right: it holds the rating context, excerpts, attribution, and
        # direct source links instead of a generic prose section.
        if not ({"story-section", "group-story", "story-reviews", "anchor-story-body"} & anatomy.classes):
            missing.append("story-section, combined group story, or sourced story-reviews")
        if missing or anatomy.tag_counts.get("h1", 0) < 1:
            failures.append(f"tile {identity} reader is missing full context, explanation, image/icon, or next step: {', '.join(missing) or 'h1/image'}")
    if exempt_external != EXPECTED_REVIEW_TILE_COUNT:
        failures.append(f"homepage has {exempt_external} external attribution tiles, expected {EXPECTED_REVIEW_TILE_COUNT} Google reviews")
    # The hub intentionally shows only the consolidated set. Every retained
    # route is checked separately from the complete static route inventory.
    if checked + exempt_external + exempt_apps < 1:
        failures.append("tile reader audit did not find any homepage tiles")
        failures.append("tile reader audit did not account for every homepage tile")


def retired_routes_ok(dist: Path, failures: list[str]) -> None:
    redirects = (PUBLIC / "_redirects").read_text()
    routes = ("/app", "/app/*", "/dakota.html", "/studio/dakota", "/studio/dakota/", "/studio/dakota/*")
    for route in routes:
        escaped = re.escape(route)
        if not re.search(rf"^{escaped}\s+/product-retired\.html\s+410!$", redirects, re.M):
            failures.append(f"retired route {route} does not have a forced 410")
        if output_file(dist, route).is_file():
            failures.append(f"retired route {route} has a static file that could serve 200")


def release_ready(dist: Path, failures: list[str]) -> None:
    status = subprocess.run(["git", "status", "--porcelain"], cwd=REPO, capture_output=True, text=True, check=True).stdout.strip()
    if status:
        failures.append("--release requires a clean committed worktree")
    revision = subprocess.run(["git", "rev-parse", "HEAD"], cwd=REPO, capture_output=True, text=True, check=True).stdout.strip()
    release = dist / "release.json"
    if not release.is_file():
        failures.append("--release requires dist/release.json")
        return
    data = json.loads(release.read_text())
    if data.get("revision") != revision:
        failures.append("dist/release.json revision does not match committed HEAD")
    if data.get("source_dirty") is not False:
        failures.append("dist/release.json does not prove a clean source build")


def audit(dist: Path, release: bool) -> tuple[list[str], dict[str, int]]:
    failures: list[str] = []
    stats = {"routes": 0, "tiles": 0, "references": 0, "imported_sources": 0, "standalone_files": 0}
    if not dist.is_dir():
        return [f"distribution directory does not exist: {dist}"], stats
    groups = consolidated_groups(failures)
    artifact = dist / "tile-release.json"
    if not artifact.is_file():
        failures.append("dist/tile-release.json is missing; run the tile compiler")
        return failures, stats
    release_data = json.loads(artifact.read_text())
    if release_data.get("kind") != "static-production-candidate":
        failures.append("tile artifact is not marked as a static production candidate")
    inventory = homepage_inventory(dist, failures)
    if inventory and groups:
        inventory_groups = {group.get("id"): group for group in inventory["groups"] if isinstance(group, dict)}
        for group in groups:
            identity = group.get("id")
            recorded = inventory_groups.get(identity)
            if not recorded:
                failures.append(f"homepage inventory is missing consolidated group {identity}")
                continue
            if recorded.get("path") != group.get("path") or recorded.get("members") != group.get("absorb"):
                failures.append(f"homepage inventory differs from the authored consolidation for {identity}")
    if release_data.get("originalTilesPreserved") != EXPECTED_ORIGINAL_TILE_COUNT:
        failures.append(f"tile artifact does not report {EXPECTED_ORIGINAL_TILE_COUNT} preserved originals")
    if release_data.get("totalTileInventory") != EXPECTED_TOTAL_TILE_INVENTORY:
        failures.append(f"tile artifact does not report {EXPECTED_TOTAL_TILE_INVENTORY} total inventory tiles")
    if release_data.get("consolidatedGroups") != EXPECTED_CONSOLIDATED_GROUP_COUNT:
        failures.append(f"tile artifact does not report {EXPECTED_CONSOLIDATED_GROUP_COUNT} consolidated groups")
    if inventory and release_data.get("tiles") != len(inventory["visibleTiles"]):
        failures.append(
            f"tile artifact reports {release_data.get('tiles')} visible tiles; "
            f"homepage inventory has {len(inventory['visibleTiles'])}"
        )
    if release_data.get("routes") != EXPECTED_ROUTE_COUNT:
        failures.append(f"tile artifact reports {release_data.get('routes')} routes; expected {EXPECTED_ROUTE_COUNT}")

    pages = source_pages()
    for album in json.loads((CONTENT / "albums.json").read_text()):
        for photo in album.get("photos", []):
            credit = str(photo.get("photographer", "")).strip()
            if not credit:
                failures.append(f"{album.get('id', 'album')}/{photo.get('id', 'photo')}: photo credit is missing")
            elif UNSAFE_PHOTO_CREDIT.search(credit):
                failures.append(
                    f"{album.get('id', 'album')}/{photo.get('id', 'photo')}: photo credit contains source markup"
                )
    if release_data.get("routes") != len(pages):
        failures.append(f"tile artifact reports {release_data.get('routes')} routes; source compiler expects {len(pages)}")
    meta = route_meta()
    generated: dict[str, Path] = {"/": dist / "index.html"}
    for route in pages:
        target = generated_route(route)
        generated[target] = output_file(dist, target)
    for route, file in generated.items():
        stats["routes"] += 1
        if not file.is_file():
            failures.append(f"generated route is missing: {route}")
            continue
        html = file.read_text(errors="replace")
        title = re.search(r"<title>(.*?)</title>", html, re.I | re.S)
        description = re.search(r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)', html, re.I)
        canonical = re.search(r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)', html, re.I)
        robots = re.search(r'<meta\s+name=["\']robots["\']\s+content=["\']([^"\']+)', html, re.I)
        if not title or not compact(title.group(1)):
            failures.append(f"{route}: missing title")
        if not description or not compact(description.group(1)):
            failures.append(f"{route}: missing meta description")
        # Reader companions are deliberately noindex and point canonical back
        # to the preserved public app.  All other generated routes canonicalize
        # to their own static document.
        canonical_route = route.removeprefix("/_readers") if route.startswith("/_readers/") else route
        if not canonical or canonical.group(1) != ORIGIN + canonical_route:
            failures.append(f"{route}: canonical must be {ORIGIN + canonical_route}")
        expected_robots = ("index, follow" if route in VERA_DOCUMENTS else
                           "index, follow, max-image-preview:large" if indexable(route, meta) else "noindex, follow")
        if not robots or robots.group(1) != expected_robots:
            failures.append(f"{route}: robots must be {expected_robots}")

    combined_paths = consolidated_readers_ok(dist, groups, failures)

    home = dist / "index.html"
    parser = References()
    parser.feed(home.read_text())
    source_parser = References()
    source_parser.feed((CONTENT / "mosaic.html").read_text())
    if len(source_parser.tiles) != EXPECTED_ORIGINAL_TILE_COUNT:
        failures.append(
            f"source mosaic has {len(source_parser.tiles)} original tiles, "
            f"expected {EXPECTED_ORIGINAL_TILE_COUNT}"
        )
    normalized_original = [
        urlsplit(f"/photos/{href.removeprefix('/#album-')}/" if href.startswith("/#album-") else href).path
        for href in source_parser.tiles
    ]
    if inventory and len(parser.tiles) != len(inventory["visibleTiles"]):
        failures.append(
            f"generated home has {len(parser.tiles)} tiles, expected {len(inventory['visibleTiles'])} visible tiles"
        )
    elif not inventory:
        failures.append("generated home cannot be checked without homepage inventory")
    retained_paths = {
        urlsplit(item.get("path")).path
        for item in (inventory or {}).get("retainedRoutes", [])
        if isinstance(item, dict) and isinstance(item.get("path"), str)
    }
    for href in normalized_original:
        if href not in retained_paths:
            failures.append(f"original tile destination was not retained: {href}")
    stats["tiles"] = len(parser.tiles)

    if inventory:
        search_index = dist / "search-index.json"
        if not search_index.is_file():
            failures.append("dist/search-index.json is missing")
        else:
            try:
                search_rows = json.loads(search_index.read_text())
            except json.JSONDecodeError as error:
                failures.append(f"search index is not valid JSON: {error}")
                search_rows = []
            search_paths = {row.get("path") for row in search_rows if isinstance(row, dict)}
            for item in inventory["retainedRoutes"]:
                raw_route = item.get("path")
                if not isinstance(raw_route, str):
                    continue
                parsed_route = urlsplit(raw_route)
                if parsed_route.scheme or parsed_route.netloc:
                    # Review attribution stays a direct external URL. It has
                    # no local file or search-index entry by design.
                    continue
                route = parsed_route.path
                if route.startswith("/"):
                    target = output_file(dist, route)
                    if not target.is_file() or not compact(target.read_text(errors="replace")):
                        failures.append(f"retained tile route is missing or empty: {raw_route}")
                    if route != "/" and route not in search_paths:
                        failures.append(f"retained tile route is missing from search index: {raw_route}")

    home_source = home.read_text(errors="replace")
    topic_ids = ("topic-web", "topic-it", "topic-consulting", "topic-software")
    for topic_id in topic_ids:
        if not re.search(rf'<section\b[^>]*\bid=["\']{re.escape(topic_id)}["\'][^>]*\bdata-topic=', home_source, re.I):
            failures.append(f"homepage is missing semantic topic section {topic_id}")
    review_distribution = TopicReviewDistribution()
    review_distribution.feed(home_source)
    if "topic-reviews" in review_distribution.sections:
        failures.append("homepage must not render a standalone review section")
    review_total = sum(len(items) for items in review_distribution.reviews.values())
    review_total += review_distribution.outside_topic
    if review_total != EXPECTED_REVIEW_TILE_COUNT:
        failures.append(f"homepage has {review_total} individual review tiles, expected {EXPECTED_REVIEW_TILE_COUNT}")
    if review_distribution.outside_topic:
        failures.append("homepage has review tiles outside the four semantic topic sections")
    for topic_id, expected in EXPECTED_REVIEW_DISTRIBUTION.items():
        found = len(review_distribution.reviews[topic_id])
        if found != expected:
            failures.append(f"homepage has {found} review tiles in {topic_id}, expected {expected}")
    if "Custom websites. Built nationwide." in home_source:
        failures.append("homepage still contains the removed generic nationwide website callout")
    if "Let’s build ↗" in home_source or "Let's build ↗" in home_source:
        failures.append("homepage still contains a diagonal-arrow navigation label")
    tile_reader_contract(dist, parser, failures)

    redirects = redirect_patterns()
    # Include preserved standalone applications too.  Their source is compared
    # byte-for-byte below, but this catches a stale internal relative link such
    # as the former /privacy/ reference before it reaches a deploy.
    for file in dist.rglob("*.html"):
        route = route_for_file(dist, file)
        source = file.read_text(errors="replace")
        refs = References()
        refs.feed(source)
        for kind, raw in refs.urls:
            target = local_url(raw, route)
            if target is None:
                continue
            stats["references"] += 1
            if not route_or_redirect(dist, target, redirects):
                failures.append(f"{route}: {kind} target does not resolve or redirect: {raw}")
    style = dist / "site.css"
    if style.is_file():
        for raw in css_urls(style.read_text(errors="replace")):
            target = local_url(raw, "/site.css")
            if target is None:
                continue
            stats["references"] += 1
            if not route_or_redirect(dist, target, redirects):
                failures.append(f"/site.css: asset does not resolve: {raw}")

    # The owner-authorized answer overhaul replaces these eight short imports
    # with complete guides. Prove the new authored body survives rather than
    # demanding that superseded prose appear alongside its replacement.
    guides = json.loads((CONTENT / "answer-guides.json").read_text())["guides"]
    guide_paths = {guide["path"] for guide in guides}
    expected_guide_paths = {
        "/answers/wix-vs-custom-website-reddit/",
        "/answers/website-design-for-small-business-nyc/",
        "/answers/website-form-not-working-small-business/",
        "/journal/how-to-own-your-domain-name-not-your-web-guy/",
        "/journal/migrate-off-squarespace-without-breaking-booking/",
        "/journal/how-to-stop-double-bookings-small-business/",
        "/journal/wordpress-vs-webflow-vs-custom-nyc/",
        "/journal/what-google-looks-for-business-website/",
    }
    if guide_paths != expected_guide_paths or len(guides) != 8:
        failures.append("the authored answer overhaul must preserve its eight established guide routes")
    stats["authored_guides"] = 0
    for guide in guides:
        target = output_file(dist, guide["path"])
        if not target.is_file():
            failures.append(f"authored guide is missing: {guide['path']}")
            continue
        expected_parser = References()
        expected_parser.feed(guide["bodyHtml"])
        rendered_parser = References()
        rendered_parser.feed(target.read_text(errors="replace"))
        expected_text = compact(" ".join(expected_parser.text))
        rendered_text = compact(" ".join(rendered_parser.text))
        if not expected_text or expected_text not in rendered_text:
            failures.append(f"{guide['path']}: complete authored guide body is absent from static HTML")
        if compact(guide["heading"]) not in rendered_text or compact(guide["summary"]) not in rendered_text:
            failures.append(f"{guide['path']}: authored title or immediate answer is missing")
        if any(anchor not in rendered_parser.anchors for anchor in expected_parser.anchors):
            failures.append(f"{guide['path']}: authored source or related link is missing")
        stats["authored_guides"] += 1

    # Prove that all remaining imported customer answers still reach the rendered source.
    # The shared helper excludes only the exact legacy contact/reference
    # boilerplate that the reader deliberately suppresses.  The remaining
    # source text is checked after the approved display-name substitution.
    for route, page in pages.items():
        blocks = filtered_legacy_blocks(page)
        if (not blocks or route in ("/", "/services/custom-local-websites/") or route in guide_paths
                or route in combined_paths
                or route in {x["path"] for x in json.loads((CONTENT / "pages.json").read_text())}):
            continue
        target_route = generated_route(route)
        target = output_file(dist, target_route)
        if not target.is_file():
            continue
        rendered_parser = References()
        rendered_parser.feed(target.read_text(errors="replace"))
        # Compare text nodes, rather than raw HTML, because the helper turns
        # source link labels into inline anchors without changing their words.
        rendered = compact(" ".join(rendered_parser.text))
        if "story-section--imported" not in target.read_text(errors="replace"):
            continue
        paragraph_blocks = [b for b in blocks if b.get("type") in ("p", "blockquote", "figcaption") and compact(b.get("text"))]
        if not paragraph_blocks:
            continue
        stats["imported_sources"] += 1
        for block in paragraph_blocks:
            expected = compact(display(block["text"]))
            if expected not in rendered:
                failures.append(f"{target_route}: imported paragraph was lost: {expected[:90]}")
        anchor_labels = {text for _, text in rendered_parser.anchors}
        for block in blocks:
            for item in block.get("links") or []:
                label = compact(display(item.get("text")))
                if label and label not in anchor_labels:
                    failures.append(f"{target_route}: imported inline link label was lost: {label}")
    if stats["imported_sources"] + stats["authored_guides"] < 68:
        failures.append(f"only {stats['imported_sources']} imported sources and {stats['authored_guides']} authored guides were checked; expected at least 68 in total")

    for directory, label in (
        (PUBLIC / "vera", "VERA"),
        (PUBLIC / "examples/lab", "Labs"),
        (PUBLIC / "examples/audit", "Audit"),
        (PUBLIC / "ads", "Ads"),
        (PUBLIC / "myspace-demo", "Myspace demo"),
    ):
        stats["standalone_files"] += public_tree_matches(directory, dist / directory.relative_to(PUBLIC), label, failures)
    native_form_ok(dist, failures)
    retired_routes_ok(dist, failures)
    public_project_boundary_ok(dist, failures, {route for route in generated if not route.startswith("/_readers/")})
    if release:
        release_ready(dist, failures)
    return failures, stats


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dist", type=Path, default=APP / "dist")
    parser.add_argument("--release", action="store_true")
    args = parser.parse_args()
    failures, stats = audit(args.dist.resolve(), args.release)
    if failures:
        print(f"FAIL tile-content audit ({len(failures)}):", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1
    mode = "release" if args.release else "artifact"
    print(
        f"PASS tile-content {mode}: {stats['routes']} generated routes, {stats['tiles']} tiles, "
        f"{stats['references']} local references, {stats['imported_sources']} imported sources, "
        f"and {stats['standalone_files']} preserved standalone files."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
