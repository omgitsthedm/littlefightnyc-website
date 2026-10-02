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


APP = Path(__file__).resolve().parents[1]
REPO = APP.parent
CONTENT = APP / "preview-content"
PUBLIC = APP / "public"
ORIGIN = "https://littlefightnyc.com"
# This must mirror the compiler's preserved-app boundary.  A reader companion
# may be generated under /_readers/, while the public application itself keeps
# its own document, robots policy, and byte-for-byte source copy.
STANDALONE = ("/vera/", "/examples/audit/", "/examples/lab/", "/brand-kit/", "/ads/", "/myspace-demo/")
NOINDEX_PREFIXES = ("/markets/", "/photos/", "/areas/", "/answers/help/", "/_readers/")
# Dedicated VERA documents are rendered after the marketing compiler from its
# protected core and pinned public archive. Preserve their existing policy.
VERA_DOCUMENTS = ("/vera/manual/", "/vera/archive/")


class References(HTMLParser):
    """Collect only static URLs in generated HTML without executing it."""

    def __init__(self) -> None:
        super().__init__()
        self.urls: list[tuple[str, str]] = []
        self.tiles: list[str] = []
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


def compact(value: object) -> str:
    return " ".join(str(value or "").split())


def display(value: object) -> str:
    return str(value or "").replace("Hair By Rachel Charles", "Hair By Rachel").replace(
        "Hair by Rachel Charles", "Hair By Rachel"
    )


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
    for route in ("/reviews/", "/websites-for-your-business/", "/tech-audit/", "/thanks/", "/services/it-support/"):
        pages[route] = {"path": route, "id": route}
    return pages


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
    return route == "/" or route in ("/reviews/", "/websites-for-your-business/") or route.startswith("/industries/")


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
    artifact = dist / "tile-release.json"
    if not artifact.is_file():
        failures.append("dist/tile-release.json is missing; run the tile compiler")
        return failures, stats
    release_data = json.loads(artifact.read_text())
    if release_data.get("kind") != "static-production-candidate":
        failures.append("tile artifact is not marked as a static production candidate")
    if release_data.get("originalTilesPreserved") != 110 or release_data.get("tiles") != 115:
        failures.append("tile artifact does not report 110 preserved originals and 115 total tiles")

    pages = source_pages()
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

    home = dist / "index.html"
    parser = References()
    parser.feed(home.read_text())
    source_parser = References()
    source_parser.feed((CONTENT / "mosaic.html").read_text())
    if len(source_parser.tiles) != 110:
        failures.append(f"source mosaic has {len(source_parser.tiles)} original tiles, expected 110")
    normalized_original = [
        f"/photos/{href.removeprefix('/#album-')}/" if href.startswith("/#album-") else href
        for href in source_parser.tiles
    ]
    if len(parser.tiles) != 115:
        failures.append(f"generated home has {len(parser.tiles)} tiles, expected 115")
    for href in normalized_original:
        if href not in parser.tiles:
            failures.append(f"original tile destination was not preserved: {href}")
    stats["tiles"] = len(parser.tiles)

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

    # Prove that the imported page body still reaches the rendered source.  The
    # exact source text is used after the approved display-name substitution;
    # this is more useful than a count-only content check.
    for route, page in pages.items():
        blocks = page.get("contentBlocks") or []
        if not blocks or route in ("/", "/services/custom-local-websites/") or route in {x["path"] for x in json.loads((CONTENT / "pages.json").read_text())}:
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
    if stats["imported_sources"] < 68:
        failures.append(f"only {stats['imported_sources']} imported authored sources were checked; expected at least 68")

    for directory, label in (
        (PUBLIC / "vera", "VERA"),
        (PUBLIC / "examples/lab", "Labs"),
        (PUBLIC / "examples/audit", "Audit"),
        (PUBLIC / "brand-kit", "Brand kit"),
        (PUBLIC / "ads", "Ads"),
        (PUBLIC / "myspace-demo", "Myspace demo"),
    ):
        stats["standalone_files"] += public_tree_matches(directory, dist / directory.relative_to(PUBLIC), label, failures)
    native_form_ok(dist, failures)
    retired_routes_ok(dist, failures)
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
